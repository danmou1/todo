const { getClient } = require('./connection');
const crypto = require('crypto');
const userAuth = require('./userAuth');

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
        searchParams = null,
        isCompleted = null,
        dueToday = null, 
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
    if (searchParams) {
        query += values.length ? ' AND' : ' WHERE';
        query += ` title ILIKE $${values.length + 1}`;
        values.push(`%${searchParams}%`);
    }

    if (isCompleted !== null) {
        query += values.length ? ' AND' : ' WHERE'; 
        query += ` completed = $${values.length + 1}`;
        values.push(isCompleted);
    }

    if (dueToday) {
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

async function getUsers(user) {
    if (user.role === 'admin') {
        const result = await client.query('SELECT * FROM users');
        return result.rows;
    }

    throw new Error('Forbidden');
};

async function createTask(body, user) {
    try {
        console.log(body, user);
        const { title, description, dueDate, priority } = body;
        const { userId } = user;

        return client.query(
            'INSERT INTO tasks (title, description, due_date, created_at, priority, user_id) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5) RETURNING *',
            [title, description, dueDate, priority, userId]
        );

    } catch (err) {
        console.error('Error inserting task:', err);
    }
};

async function updateTask(taskId, taskData, user) {
    const updates = [];
    const params = [];

    const { 
        role = null,
        userId = null,
    } = user;

    if (role === 'user') {
        const getOwner = await client.query(
            'SELECT user_id FROM tasks WHERE task_id = $1', [taskId]
        );
        const ownerId = getOwner.rows[0].user_id;

        if (ownerId !== userId) {
            throw new Error('Forbidden');
        }
    }

    Object.entries(taskData).forEach(([key, value]) => {
        if (key !== 'task_id' && value !== null && value !== undefined) {
            updates.push(`${key} = $${params.length + 1}`);
            params.push(value);
        }
    });
    params.push(taskId);

    const setClause = updates.join(', ');
    
    try {
        const result = client.query(
            `UPDATE tasks SET ${setClause} WHERE task_id = $${params.length} RETURNING *`,
            params
        )

        console.log(`[${taskId}: Updated task.]`);
        return result.rows[0];
    } catch (err) {
        console.error('Error updating task:', err);
    }
};

async function deleteTask(taskId, user) {
    const {
        role = null,
        userId = null,
    } = user;

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

async function addUser(username, password) {
    try {
        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await scrypt(password, salt, 64)

        return client.query('INSERT INTO users (username, password_hash, salt) VALUES ($1, $2, $3)', [username, hashedPassword, salt])
    } catch (err) {
        console.error('Error adding user:', err);
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    addUser,
    getUsers,
};