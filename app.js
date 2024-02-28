const express = require('express');
const bodyParser = require('body-parser');

const { initializeDatabase, runMigrations, closeDatabaseConnection } = require('./db/connection');
const { getTasks, createTask, updateTask, deleteTask, addUser} = require('./db/queries');

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
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

function setupRoutes() {
    app.get('/', (req, res) => {
        res.send('Root');
    });

    app.route('/register')
        .get((req, res) => {
            res.render('register')
        })
        .post(async (req, res) => {
            try {
                const { username, password } = req.body;
                await addUser(username, password);
                res.redirect('/login');
            } catch (error) {
                if (error.code === '23505') {
                    const errorMessage = 'Username already exists';
                    res.render('register', { error: errorMessage });
                } else {
                    handleRouteError(res, error);
                }
            }
        });

    app.route('/app/tasks')
        .get(async (req, res) => {
            try {
                const {
                    q: searchParams,
                    d: date,
                    c: isCompleted
                } = req.query;
                
                const tasks = await getTasks(searchParams, date, isCompleted);
                
                res.render('layout', { pageTitle: 'Tasks', tasks });
            } catch (error) {
                handleRouteError(res, error);
            }
        })
        .post(async (req, res) => {
            try {
                await createTask(req.body);
                res.redirect('/app/tasks');
            } catch (error) {
                handleRouteError(res, error);
            }
        });

    app.route('/app/tasks/:taskId')
        .put(async (req, res) => {
            const { taskId } = req.params;

            try {
                await updateTask(taskId, req.body);
                res.redirect('app/tasks');
            } catch (error) {
                handleRouteError(res, error);
            }
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
        try {
            const tasks = await getTasks({ isCompleted: false });
            res.render('layout', { pageTitle: 'Incomplete Tasks', tasks });
        } catch (error) {
            handleRouteError(res, error);
        }
    });
            
    app.get('/app/tasks/completed', async (req, res) => {
        try {
            const tasks = await getTasks({ isCompleted: true });
            res.render('layout', { pageTitle: 'Completed Tasks', tasks });
        } catch (error) {
            handleRouteError(res, error);
        }
    });
            
    app.get('/app/tasks/today', async (req ,res) => {
        try {
            const tasks = await getTasks({ dueToday: true });
            res.render('layout', { pageTitle: `Today's Tasks`, tasks });
        } catch (error) {
            handleRouteError(res, error);
        }
    });
}

function handleRouteError(res, error) {
    console.error('Route Error:', error);
    res.status(500).json({ error: 'Internal server error' });
}

process.on('SIGINT', () => {
    closeDatabaseConnection().finally(() => {
        process.exit(0);
    });
});

startServer();