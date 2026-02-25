var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');

var app = express();

app.use(cors()); // Allow frontend to communicate with backend
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve the frontend root folder layout as static assets
const frontendDir = path.join(__dirname, '..');
app.use(express.static(frontendDir));

app.use('/api', apiRouter); // Add API routes

// Custom route to serve the extension-less URL for the honeypot
app.get('/schenectady-heritage', (req, res) => {
    res.sendFile(path.join(frontendDir, 'schenectady-heritage.html'));
});

// Custom route to serve the extension-less URL for the admin
app.get('/nathanadmin', (req, res) => {
    res.sendFile(path.join(frontendDir, 'nathanadmin.html'));
});

app.get('/debug-paths', (req, res) => {
    const fs = require('fs');
    try {
        const files = fs.readdirSync(frontendDir);
        res.json({ frontendDir, files });
    } catch (e) {
        res.json({ error: e.message, frontendDir });
    }
});

module.exports = app;
