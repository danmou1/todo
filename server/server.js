const express = require('express');
const { initializeDatabase, runMigrations, closeDatabaseConnection } = require('./database');
const { getTasks, createTask, updateTask, deleteTask } = require('./tasks');

const app = express();
const port = 3000;

initializeDatabase()
    .then(() => runMigrations())
    .then(() => {
        app.get('/tasks', async (req, res) => {
            const tasks = await getTasks();
            res.json(tasks);
        });

        app.post('/tasks', async (req, res) => {
            const { taskName } = req.body;
            const newTask = await createTask(taskName);
            res.status(201).json(newTask);
        });

        app.put('/tasks/:taskId', async (req, res) => {
            const { taskId } = req.params;
            const { taskName } = req.body;
            const updatedTask = await updateTask(taskId, taskName);
            res.json(updatedTask);
        });

        app.delete('/tasks/:taskId', async (req, res) => {
            const { taskId } = req.params;
            const { taskName } = req.body;
            const updatedTask = await updateTask(taskId, taskName);
            res.json(updatedTask);
        });

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error('Error intializing database:', error.message);
        process.exit(1);
    })
    .finally(() => {
        process.on('SIGINT', () => {
            closeDatabaseConnection().finally(() => {
                process.exit(0);
            });
        });
    });