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

function authRole(role, callback) {
    return (req, res) => {
        if (req.user.role !== role) {
            res.status(401);
            return res.send('Not Allowed');
        }
        callback(req, res);
    }
};

async function verifyToken(req, res, next) {
    jwt.verify(req.cookies.token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden: Invalid token'});
        }
        req.user = decoded;
        next();
    });
};

//checks if user is in database, then give him a token containing basic auth information
async function userAuth(username, password) {
    try {
        const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user || !verifyPassword(password, user.password_hash, user.salt)) {
            return null;
        }    
        const token = generateToken({ userId: user.user_id, username: user.username, role: user.role });

        return { user, token }
    } catch (err) {
        console.error('uAuth error:', err);
        throw err;
    }
};

module.exports = {
    userAuth,
    verifyToken,
    authRole,
};