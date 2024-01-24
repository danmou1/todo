const express = require('express');
const path = require('path');

const { initializeDatabase, runMigrations, closeDatabaseConnection } = require('./database');
const { getTasks, createTask, updateTask, deleteTask } = require('./tasks');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('/public'));
app.use(express.json());

async function startServer() {
    try {
        await initializeDatabase();
        await runMigrations();

        setupRoutes();

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Error initializing database:', error.message);
        process.exit(1);
    }
}

function setupRoutes() {
    app.get('/', (req, res) => {
        res.send('Root');
    });

    app.get('/app/tasks', async (req, res) => {
        try {
            const tasks = await getTasks();
            res.render('tasks', { pageTitle: 'Tasks', tasks });
        } catch (error) {
            handleRouteError(res, error)
        }
    });

    app.post('/app/tasks', async (req, res) => {
        try {
            const taskData = await createTask(req.body);
            res.status(201).json(taskData);
        } catch (error) {
            handleRouteError(res, error);
        }
    });

    app.put('/app/tasks/:taskId', async (req, res) => {
        const { taskId } = req.params;

        try {
            const updatedTask = await updateTask(taskId, req.body);
            res.json(updatedTask);
        } catch (error) {
            handleRouteError(res, error);
        }
    });

    app.delete('/app/tasks/:taskId', async (req, res) => {
        const { taskId } = req.params;

        try {
            await deleteTask(taskId);
            res.status(204).send();
        } catch (error) {
            handleRouteError(res, error);
        }
    });
}

function handleRouteError(res, error) {
    console.error('Route Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
}

process.on('SIGINT', () => {
    closeDatabaseConnection().finally(() => {
        process.exit(0);
    });
});

startServer();