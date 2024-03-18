const express = require('express');
require('dotenv').config();

const { initializeDatabase, runMigrations, closeDatabaseConnection } = require('./db/connection');
const { getTasks, createTask, updateTask, deleteTask, addUser, getUsers} = require('./db/queries');
const { userAuth, verifyToken, authRole } = require('./db/userAuth')

const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

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

app.use((req, res, next) => {
    if (req.originalUrl === '/login' || req.originalUrl === '/register') {
        return next();
    }

    verifyToken(req, res, next);
});

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
            const authResult = await userAuth(username, password);

            if (authResult) {
                const { token, user } = authResult;

                res.cookie('token', token, { maxAge: 1000*60*60, httpOnly: true});

                let redirectUrl = '/app/tasks';
                if (user.role === 'admin') {
                    redirectUrl = '/app/admin';
                }

                res.redirect(redirectUrl);
            } else {
                res.status(401).json({ error: 'Invalid credentials.' });
            }
        });

    app.route('/register')
        .get((req, res) => {
            res.render('register', { error: null });
        })
        .post(async (req, res) => {
            const { username, password } = req.body;
            addUser(username, password)
                .then(() => res.status(200).send({ success: true }))
                .catch(err => {
                    switch (err.code) {
                        case '23505':
                            res.status(401).json({ error: 'User already exists.'});
                            break;
                    };
                });
        });

    app.route('/app/tasks')
        .get(async (req, res) => {
            let { q: searchParams, d: date, c: isCompleted, t: dueToday } = req.query;

            const tasks = await getTasks({ searchParams, date, isCompleted, dueToday }, req.user);
            const options = {
                pageTitle: 'Dashboard',
                tasks,
                endpoint: req.originalUrl
            }

            res.render('dashboard', options);
        })
        .post(async (req, res) => {
            console.log(req.body, req.user);
            await createTask(req.body, req.user);
            res.redirect('/app/tasks');
        })
        .put(async (req, res) => {
            console.log('PUT Called');
            await updateTask(req.body, req.user);
            res.redirect('/app/tasks');
        })
        .delete(async (req, res) => {
            const { taskId } = req.body;

            try {
                await deleteTask(taskId, req.user);
                res.status(200).send({ success: true });
            } catch (error) {
                res.status(500).send({ success: false, error: "Internal server error" });
            }
        });

    app.route('/app/admin')
        .get(authRole('admin', async (req, res) => {
            let { q: searchParams, d: date, c: isCompleted, t: dueToday } = req.query;
            const tasks = await getTasks({ searchParams, date, isCompleted, dueToday }, req.user);

            const options = {
                pageTitle: 'Admin Panel',
                tasks,
                endpoint: req.originalUrl
            };
            options.users = await getUsers();

            res.render('dashboard', options);
        }))
        .post(authRole('admin', async (req, res) => {
            await createTask(req.body, req.user);
            res.redirect('/app/tasks');
        }))
        .put(authRole('admin', async (req, res) => {
            await updateTask(req.body, req.user);
            res.redirect('/app/tasks');
        }))
        .delete(authRole('admin', async (req, res) => {
            const { taskId } = req.body;

            try {
                await deleteTask(taskId, req.user);
                res.status(200).send({ success: true });
            } catch (error) {
                res.status(500).send({ success: false, error: "Internal server error" });
            }
        }));
    app.use((err, req, res, next) => {
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