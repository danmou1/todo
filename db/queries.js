const { getClient } = require('./connection');

const client = getClient();

async function getTasks(options = {}) {
    // todo: implement search by multiple parameters

    const {
        searchParams = null,
        isCompleted = null,
        dueToday = null, 
    } = options;

    let query = `
        SELECT
            *,
            to_char(due_date, 'DD-MM-YYYY') AS due_date
        FROM tasks
    `;

    console.log(isCompleted);

    const values = [];

    if (searchParams) {
        query += 'WHERE title ILIKE $1';
        values.push(`%${searchParams}%`);
    }

    if (isCompleted !== null) {
        query +=  `WHERE completed IS ${isCompleted}`;
    }

    if (dueToday) {
        query += `WHERE due_date = CURRENT_DATE`;
    }

    const result = await client.query(query, values);
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
    createTask,
    updateTask,
    deleteTask,
};