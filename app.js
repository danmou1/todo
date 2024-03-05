const express = require('express');
require('dotenv').config();

const { initializeDatabase, runMigrations, closeDatabaseConnection } = require('./db/connection');
const { getTasks, createTask, updateTask, deleteTask, addUser} = require('./db/queries');
const { userAuth, verifyToken } = require('./db/userAuth')

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
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
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

function setupRoutes() {
    app.get('/', (req, res) => {
        res.redirect('/login');
    });

    app.route('/login')
        .get((req, res) => {
            res.render('login');
        })
        .post(async (req, res) => {
            const { username, password } = req.body;
            console.log(username, password);

            const authResult = await userAuth(username, password);
            if (authResult) {
                const { sessionToken } = authResult;
                res.status(200).json({ sessionToken });
            } else {
                res.status(401).json({ error: 'Invalid credentials.' });
            }
        })

    app.route('/register')
        .get((req, res) => {
            res.render('register', { error: null });
        })
        .post(async (req, res, next) => {
            const { username, password } = req.body;
            await addUser(username, password);
        })

    app.route('/app/tasks')
        .get(async (req, res) => {
            const { q: searchParams, d: date, c: isCompleted } = req.query;
            const tasks = await getTasks(searchParams, date, isCompleted);
            res.render('layout', { pageTitle: 'Tasks', tasks });
        })
        .post(async (req, res) => {
            await createTask(req.body);
            res.redirect('/app/tasks');
        });

    app.route('/app/tasks/:taskId')
        .put(async (req, res) => {
            const { taskId } = req.params;
            await updateTask(taskId, req.body);
            res.redirect('/app/tasks');
        })
        .delete(async (req, res) => {
            const { taskId } = req.params;

            try {
                await deleteTask(taskId);
                res.status(200).send({ success: true });
            } catch (error) {
                res.status(500).send({ success: false, error: "Internal server error" });
            }
        });
            
    app.get('/app/tasks/incomplete', async (req, res) => {
        const tasks = await getTasks({ isCompleted: false });
        res.render('layout', { pageTitle: 'Incomplete Tasks', tasks });
    });
            
    app.get('/app/tasks/completed', async (req, res) => {
        const tasks = await getTasks({ isCompleted: true });
        res.render('layout', { pageTitle: 'Completed Tasks', tasks });
    });
            
    app.get('/app/tasks/today', async (req, res) => {
        const tasks = await getTasks({ dueToday: true });
        res.render('layout', { pageTitle: `Today's Tasks`, tasks });
    });

    app.use((err, req, res) => {
        console.error(err);
        if (err.code === '23505') {
            res.status(400).render('register', { error: 'Username already exists' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}


process.on('SIGINT', () => {
    closeDatabaseConnection().finally(() => {
        console.log('Shutting down server...')
        process.exit(0);
    });
});

startServer();