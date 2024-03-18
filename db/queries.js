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

async function getUsers() {
    const result = await client.query('SELECT * FROM users');
    return result.rows;
}

async function createTask(body, user) {
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

    console.log(body);

    const updates = [];
    const params = [];
    
    if (role === 'user') {
        const getOwner = await client.query(
            'SELECT user_id FROM tasks WHERE task_id = $1', [task_id]
        );
        const ownerId = getOwner.rows[0].user_id;

        if (ownerId !== userId) {
            throw new Error('Forbidden');
        }
    }

    Object.entries(body).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            updates.push(`${key} = $${params.length + 1}`);
            params.push(value);
        }
    });

    const setClause = updates.join(', ');
    
    console.log(setClause, params.length, params);
    try {
        await client.query(
            `UPDATE tasks SET ${setClause} WHERE task_id = $${params.taskId} RETURNING *`,
            params
        );

        console.log(`[${task_id}: Updated task.]`);
    } catch (err) {
        console.error('Error updating task:', err);
    }
};

async function deleteTask(taskId, user) {
    const {
        role,
        userId,
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