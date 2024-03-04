const { getClient } = require('../connection');
const crypto = require('crypto');

const client = getClient();

async function userAuth(username, password) {
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user || !verifyPassword(password, user.password_hash, user.salt)) {
        return null;
    }

    const sessionToken = generateSessionToken();

    return { user, sessionToken }
    .catch(error => {
        console.error('Error during user authentication:', error);
        throw error;
    })
};

function verifyPassword(password, hashedPassword, salt) {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return hash === hashedPassword;
};

function generateSessionToken() {

};

module.exports = userAuth;