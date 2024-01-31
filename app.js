const express = require('express');
const bodyParser = require('body-parser');

const { initializeDatabase, runMigrations, closeDatabaseConnection } = require('./db/connection');
const { getTasks, createTask, updateTask, deleteTask } = require('./db/queries');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
            await createTask(req.body);
            res.redirect('/app/tasks');
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