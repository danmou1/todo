const { getClient } = require('./connection');
const crypto = require('crypto');
const userAuth = require('./userAuth');
const { builtinModules } = require('module');

const client = getClient();

function scrypt (password, salt, keylen) {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, keylen, (err, derivedKey) => {
            if (err) reject(err);
            else resolve(derivedKey.toString('hex'));
        });
    });
};

async function getTasks(options = {}, user) {
    const {
        search = null,
        completed = null,
        today = null, 
        date = null,
    } = options;

    const {
        userId = null,
        role = null,
    } = user;
    
    let query = 'SELECT * FROM tasks';
    const values = [];

    if (role === 'user') {
        query += ' WHERE user_id = $1';
        values.push(userId);
    }

    // normal querying
    if (search) {
        query += values.length ? ' AND' : ' WHERE';
        query += ` title ILIKE $${values.length + 1}`;
        values.push(`%${search}%`);
    }

    if (completed !== null) {
        query += values.length ? ' AND' : ' WHERE'; 
        query += ` completed = $${values.length + 1}`;
        values.push(completed);
    }

    if (today) {
        query += values.length ? ' AND' : ' WHERE';
        query += ` due_date = CURRENT_DATE`;
    }

    try {
        const result = await client.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
};

async function addTask(body, user) {
    try {
        const { title, description, dueDate, priority, taskUserId } = body;
        let { userId } = user;

        if (user.role === 'admin' && taskUserId) {
            userId = taskUserId;
        }

        let query = 'INSERT INTO tasks (title, description, due_date, created_at, priority, user_id) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5)'
        const values = [title, description, dueDate, priority, userId];

        return client.query(query, values);
    } catch (err) {
        console.error('Error inserting task:', err);
    }
};

async function updateTask(body, user) {
    const { 
        role = null,
        userId = null,
    } = user;

    const { taskId:task_id } = body
    delete body.taskId

    if (role === 'user') {
        const getOwner = await client.query('SELECT user_id FROM tasks WHERE task_id = $1', [task_id]);
        const ownerId = getOwner.rows[0].user_id;
        if (ownerId !== userId) {
            throw new Error('Forbidden');
        }
    }

    const filteredBody = Object.fromEntries(
        Object.entries(body)
          .filter(([key, value]) => value === false || value)
    );
        
    const updates = [];
    const params = [];
    
    Object.entries(filteredBody).forEach(([key, value], index) => {
        if (value === false || value) {
            updates.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${index + 1}`);
            params.push(value);
        }
    });
    
    const query = `UPDATE tasks SET ${updates.join(', ')} WHERE task_id = $${params.length + 1}`;

    try {
        await client.query(query, [...params, task_id]);
        console.log(`[${task_id}: Updated task.]`);
    } catch (err) {
        console.error('Error updating task:', err);
    }
};

async function deleteTask(body, user) {
    const {
        role,
        userId,
    } = user;

    const { taskId } = body

    if (role === 'user') {
        const getOwner = await client.query(
            'SELECT user_id FROM tasks WHERE task_id = $1', [taskId]
        );
        const ownerId = getOwner.rows[0].user_id;

        if (ownerId !== userId) {
            throw new Error('Forbidden');
        }
    }

    await client.query('DELETE FROM tasks WHERE task_id = $1', [taskId])
    .catch(error => {
        console.error('Error deleting task:', error);
        return Promise.reject(error);
    });
};

async function getUsers() {
    const result = await client.query('SELECT * FROM users');
    return result.rows;
}

async function addUser(body) {
    try {
        const { username, password } = body;

        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await scrypt(password, salt, 64)

        return client.query('INSERT INTO users (username, password_hash, salt) VALUES ($1, $2, $3)', [username, hashedPassword, salt])
    } catch (err) {
        console.error('Error adding user:', err);
    }
};

// untested queries below
async function updateUser(body) {
    const { userId, newUserId, ...data } = body;

    const params = [];
    const updates = [];

    Object.entries(data).forEach(([key, value], index) => {
        if (value) {
            updates.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${index + 1}`);
            params.push(value);
        }
    });

    if (newUserId) {
        updates.push(`user_id = $${params.length + 1}`);
        params.push(newUserId);
    }

    const query = `UPDATE users SET ${updates.join(', ')} WHERE user_id = $${params.length + 1}`;
    console.log(query);
    try {
        console.log(`[U${userId}] Updated:`)
        updates.forEach((update, index) => {
            const truncatedUpdate = update.slice(0, -5);
            console.log(`[${truncatedUpdate}, ${params[index]}]`);
        });

        await client.query(query, [...params, userId]);
    } catch (err) {
        console.error('Error updating user:', err);
    }
};

async function deleteUser(body) {
    const { userId } = body;
    return client.query('DELETE FROM users WHERE user_id = $1', [userId])
};

module.exports = {
    getTasks,
    addTask,
    updateTask,
    deleteTask,
    getUsers,
    addUser,
    updateUser,
    deleteUser,
};