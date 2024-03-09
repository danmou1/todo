const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { getClient } = require('./connection');
const client = getClient();

const secretKey = process.env.SECRET_KEY;

function generateToken(payload) {
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

function verifyPassword(password, hashedPassword, salt) {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return hash === hashedPassword;
};

async function checkRole(req, res, next) {
    const userId = req.user.userId;

    try {
        const result = await client.query('SELECT role FROM users WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const role = result.rows[0].role;
        req.user.role = role;
        console.log(req.user);
        next();
    } catch (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

async function verifyToken(req, res, next) {
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
};

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

module.exports = {
    userAuth,
    verifyToken,
    checkRole,
};