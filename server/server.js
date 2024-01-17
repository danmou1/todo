const express = require('express');
const app = express();
const port = 3000;

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.send('hello world');
});

app.get('/task', (req, res) => {
    res.send("GET /task");
});

app.post('/task', (req, res) => {
    res.send("POST /task");
});

app.put('/task', (req, res) => {
    res.send("PUT /task");
});

app.delete('/task', (req, res) => {
    res.send("DELETE /task");
});