const { getClient } = require('./connection');

const client = getClient();

async function getTasks() {
    const result = await client.query('SELECT * FROM tasks');
    return result.rows;
}

async function getIncompleteTasks() {
    const result = await client.query('SELECT * FROM tasks WHERE completed IS FALSE');
    return result.rows;
}

async function getCompleteTasks() {
    const result = await client.query('SELECT * FROM tasks WHERE completed IS TRUE');
    return result.rows;
}

async function createTask(taskData) {
    const { title, description, dueDate, priority } = taskData;

    try {
        const result = await client.query(
            'INSERT INTO tasks VALUES (DEFAULT, $1, $2, $3, CURRENT_TIMESTAMP, $4) RETURNING *',
            [title, description, dueDate, priority]
        );

        return result.rows[0];
    } catch (error) {
        console.error('Error inserting task:', error);
    }
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

    try {
        const result = await client.query(
            `UPDATE tasks SET ${setClause} WHERE task_id = $${params.length} RETURNING *`,
            params
        );
        
        console.log(`[${taskId}]: Updated task.`);
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
    getIncompleteTasks,
    getCompleteTasks,
    createTask,
    updateTask,
    deleteTask,
};