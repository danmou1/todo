const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { getClient } = require('./connection');
const client = getClient();

const secretKey = process.env.SECRET_KEY;

function generateToken(payload) {
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded;
    } catch (error) {
        throw new Error('Invalid token');
    }
}

async function userAuth(username, password) {
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user || !verifyPassword(password, user.password_hash, user.salt)) {
        return null;
    }

    const sessionToken = generateToken({ userId: user.user_id, username: user.username});

    return { user, sessionToken }
    .catch(error => {
        console.error('uAuth error:', error);
        throw error;
    })
};

function verifyPassword(password, hashedPassword, salt) {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return hash === hashedPassword;
};

module.exports = {
    userAuth,
    verifyToken,
};