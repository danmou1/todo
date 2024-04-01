const express = require('express');
require('dotenv').config();

const { initializeDatabase, runMigrations, closeDatabaseConnection } = require('./db/connection');
const { getTasks, addTask, updateTask, deleteTask, getUsers, addUser, updateUser, dele} = require('./db/queries');
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

                let redirectUrl = '/app';
                if (user.role === 'admin') {
                    redirectUrl = '/admin';
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
            addUser(req.body)
            .then(() => res.status(200).send({ success: true }))
            .catch(err => {
                    switch (err.code) {
                        case '23505':
                            res.status(401).json({ error: 'User already exists.'});
                            break;
                    };
                });
            });
    app.get('/app', async (req, res) => {
        let {
            search,
            date,
            completed,
            today 
        } = req.query;

        const tasks = await getTasks({ search, date, completed, today }, req.user);
        const options = {
            pageTitle: 'Dashboard',
            tasks,
            endpoint: req.originalUrl
        }

        res.render('dashboard', options);
    });
    app.get('/admin', authRole('admin', async (req, res) => {
        let { q: searchParams, d: date, c: isCompleted, t: dueToday } = req.query;
        const tasks = await getTasks({ searchParams, date, isCompleted, dueToday }, req.user);

        const options = {
            pageTitle: 'Admin Panel',
            tasks,
            endpoint: req.originalUrl
        };
        options.users = await getUsers();

        res.render('dashboard', options);
    }));
    app.route('/api/v1/users')
        .post(authRole('admin', async (req, res) => {
            await addUser(req.body)
            res.send();
        }))
        .put(authRole('admin', async (req, res) => {
            console.log(req.body);
            await updateUser(req.body);
            res.send();
        }))
        .delete(authRole('admin', async (req, res) => {
            await deleteUser(req.body);
            res.send();
        }));
    app.route('/api/v1/tasks')
        .post(async (req, res) => {
            await addTask(req.body, req.user);
            res.send(); 
        })
        .put(async (req, res) => {
            await updateTask(req.body, req.user);
            res.send();
        })
        .delete(async (req, res) => {
            await deleteTask(req.body, req.user);
            res.send();
        });
    app.use((err, req, res, next) => {
        console.error(err);
        if (err.code === '23505') {
            res.status(400).render('register', { error: 'Username already exists' });
        } else {j
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