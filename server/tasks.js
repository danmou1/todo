const { getClient } = require('./database');

const client = getClient();

async function getTasks() {
    const result = await client.query('SELECT * FROM tasks');
    return result.rows;
}

async function createTask(taskName) {
    const result = await client.query('INSERT INTO tasks (task_name) VALUES ($1) RETURNING *', [taskName]);
    return result.rows[0];
}

async function updateTask(taskId, taskName) {
    const result = await client.query('UPDATE tasks SET task_name = $1 WHERE task_id = $2 RETURNING *', [taskName, taskId]);
    return result.rows[0];
}

async function deleteTask(taskId) {
    await client.query('DELETE FROM tasks WHERE task_id = $1', [taskId]);
}

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
};