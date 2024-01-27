const { getClient } = require('./database');

const client = getClient();

async function getTasks() {
    const result = await client.query('SELECT * FROM tasks');
    return result.rows;
}

async function createTask(taskData) {
    const { title, description, due_date, completed, priority } = taskData;

    try {
        const result = await client.query(
            'INSERT INTO tasks VALUES (DEFAULT, $1, $2, $3, CURRENT_TIMESTAMP, $4, $5) RETURNING *',
            [title, description, due_date, completed, priority]
        );

        return result.rows[0];
    } catch (error) {
        console.error('Error inserting task:', error);
    }
}

// destructive writing, just get data in the front end before letting the user change anything.
async function updateTask(taskId, taskData) {
    const { title, description, due_date, completed, priority } = taskData;

    try {
        const result = await client.query(
            'UPDATE tasks SET title = $1, description = $2, due_date = $3, completed = $4, priority = $5 ' +
            'WHERE task_id = $6 RETURNING *',
            [title, description, due_date, completed, priority, taskId]
        );

        return result.rows[0];
    } catch (error) {
        console.error('Error updating task:', error);
    }
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