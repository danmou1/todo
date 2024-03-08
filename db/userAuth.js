const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { getClient } = require('./connection');
const client = getClient();

const secretKey = process.env.SECRET_KEY;

function generateToken(payload) {
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

function verifyToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden: Invalid token'});
        }
        req.user = decoded;
        next();
    });
}

async function userAuth(username, password) {
    try {
        const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user || !verifyPassword(password, user.password_hash, user.salt)) {
            return null;
        }    
        const token = generateToken({ userId: user.user_id, username: user.username});

        return { user, token }
    } catch (err) {
        console.error('uAuth error:', error);
        throw err;
    }
};

function verifyPassword(password, hashedPassword, salt) {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return hash === hashedPassword;
};

module.exports = {
    userAuth,
    verifyToken,
};