const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const compression = require('compression');
const fs = require('fs');
const apiRouter = require('./api');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(compression());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../public')));
app.use(express.static(path.resolve(__dirname, '../static')));

// Handle email contact form
app.post('/api/send-email', (req, res) => {
    const { name, company, email, message } = req.body;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.FOLIO_EMAIL,
            pass: process.env.FOLIO_PASSWORD,
        },
    });

    transporter
        .verify()
        .then(() => {
            transporter
                .sendMail({
                    from: `"${name}" <henryheffernan.folio@gmail.com>`,
                    to: 'henryheffernan@gmail.com, henryheffernan.folio@gmail.com',
                    subject: `${name} <${email}> ${
                        company ? `from ${company}` : ''
                    } submitted a contact form`,
                    text: `${message}`,
                })
                .then((info) => {
                    console.log({ info });
                    res.json({ message: 'success' });
                })
                .catch((e) => {
                    console.error(e);
                    res.status(500).send(e);
                });
        })
        .catch((e) => {
            console.error(e);
            res.status(500).send(e);
        });
});

// Mount full persistent SQLite database REST API
app.use('/api', apiRouter);

// Admin static assets
app.use(['/admin', '/static/admin'], express.static(path.resolve(__dirname, '../public/admin')));
app.use(['/admin', '/static/admin'], express.static(path.resolve(__dirname, '../static/admin')));
app.get(['/admin.bundle.js', '/static/admin/admin.bundle.js'], (req, res) => {
    res.type('application/javascript').sendFile(path.resolve(__dirname, '../static/admin/admin.bundle.js'));
});

// Admin portal route handler
app.get(['/admin', '/admin/', '/static/admin', '/static/admin/', '/static/admin/index.html'], (req, res) => {
    const publicAdminPath = path.resolve(__dirname, '../public/admin/index.html');
    const staticAdminPath = path.resolve(__dirname, '../static/admin/index.html');
    if (fs.existsSync(publicAdminPath)) {
        res.sendFile(publicAdminPath);
    } else if (fs.existsSync(staticAdminPath)) {
        res.sendFile(staticAdminPath);
    } else {
        res.redirect('/os/');
    }
});

// Trailing slash redirects for coderescue and os
app.get(['/coderescue', '/os/coderescue'], (req, res, next) => {
    if (!req.path.endsWith('/')) {
        return res.redirect(req.path + '/');
    }
    next();
});

// Fallback to os/index.html or root
app.get(['/os', '/os/'], (req, res) => {
    const osHtml = path.resolve(__dirname, '../static/os/index.html');
    if (fs.existsSync(osHtml)) {
        res.sendFile(osHtml);
    } else {
        res.sendFile(path.resolve(__dirname, '../public/index.html'));
    }
});

// Listen to app
app.listen(port, () => {
    console.log(`[Server] Techastra 2026 Production Server is listening on port ${port}`);
});
