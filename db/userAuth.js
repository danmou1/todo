const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { getClient } = require('./connection');
const client = getClient();

const secretKey = process.env.SECRET_KEY;

function generateToken(payload) {
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

function verifyToken(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(400).json({ error: 'Failed to authenticate token '});
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
        const sessionToken = generateToken({ userId: user.user_id, username: user.username});

        return { user, sessionToken }
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