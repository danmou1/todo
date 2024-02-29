const crypto = require('crypto');
const { getClient } = require('./connection');

const client = getClient();

async function getTasks(options = {}) {
    const {
        searchParams = null,
        isCompleted = null,
        dueToday = null, 
        date = null,
    } = options;

    let query = `SELECT * FROM tasks`;
    const values = [];

    if (searchParams) {
        query += ' WHERE title ILIKE $1';
        values.push(`%${searchParams}%`);
    }

    if (isCompleted !== null) {
        query += values.length ? ' AND' : ' WHERE'; 
        query += ` completed IS ${isCompleted}`;
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
    };
}

async function createTask(taskData) {
    const { title, description, dueDate, priority } = taskData;

    return client.query(
        'INSERT INTO tasks VALUES (DEFAULT, $1, $2, $3, CURRENT_TIMESTAMP, $4) RETURNING *',
        [title, description, dueDate, priority]
    )
    .then(result => result.rows[0])
    .catch(error => {
        console.error('Error inserting task:', error);
        return Promise.reject(error);
    });
}

// overwrites all fields
async function updateTask(taskId, taskData) {
    const updates = [];
    const params = [];
    
    Object.entries(taskData).forEach(([key, value]) => {
        if (key !== 'task_id' && value !== null && value !== undefined) {
            updates.push(`${key} = $${params.length + 1}`);
            params.push(value);
        }
    });
    params.push(taskId);

    const setClause = updates.join(', ');
    
    return client.query(
        `UPDATE tasks SET ${setClause} WHERE task_id = $${params.length} RETURNING *`,
        params
    )
    .then(result => {
        console.log(`[${taskId}]: Updated task.`);
        return result.rows[0];
    })  
    .catch(error => {
        console.error('Error updating task:', error);
        return Promise.reject(error);
    });
}

async function deleteTask(taskId) {
    await client.query('DELETE FROM tasks WHERE task_id = $1', [taskId])
    .catch(error => {
        console.error('Error deleting task:', error);
        return Promise.reject(error);
    });
}

async function addUser(username, password) {
    const hash = crypto.createHash('sha256');
    hash.update(password);

    const hashedPassword = hash.digest('hex');

    return client.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, hashedPassword])
    .then(() => {
        console.log('User added successfully');
    })
    .catch(error => {
        console.error('Error adding user:', error);
        return Promise.reject(error);
    });
}

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    addUser,
};