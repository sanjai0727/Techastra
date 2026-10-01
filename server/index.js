const express = require('express');
const path = require('path');
const cors = require('cors');
const router = express.Router();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const compression = require('compression');

const app = express();
const port = 8080;

app.use(cors());
app.use(compression());

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../public')));
app.use(express.static(path.resolve(__dirname, '../static')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Handle GET requests to /api route
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
                    from: `"${name}" <henryheffernan.folio@gmail.com>`, // sender address
                    to: 'henryheffernan@gmail.com, henryheffernan.folio@gmail.com', // list of receivers
                    subject: `${name} <${email}> ${
                        company ? `from ${company}` : ''
                    } submitted a contact form`, // Subject line
                    text: `${message}`, // plain text body
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

// Admin Authentication Endpoints
const activeSessions = new Set();

app.post('/api/admin/login', (req, res) => {
    const { adminId, passkey } = req.body || {};
    const expectedId = process.env.ADMIN_ID || 'admin';
    const expectedPasskey = process.env.ADMIN_PASSKEY || 'techastra2026';

    const trimmedId = typeof adminId === 'string' ? adminId.trim() : '';
    const trimmedPass = typeof passkey === 'string' ? passkey.trim() : '';

    if (trimmedId.toLowerCase() === expectedId.toLowerCase() && trimmedPass === expectedPasskey) {
        const token = `adm_${Buffer.from(`${trimmedId}:${Date.now()}`).toString('base64')}`;
        activeSessions.add(token);

        return res.json({
            success: true,
            token,
            admin: {
                id: trimmedId,
                name: 'Chief Coordinator',
                role: 'ADMINISTRATOR',
                authenticatedAt: new Date().toISOString(),
            },
        });
    }

    return res.status(401).json({
        success: false,
        error: 'Invalid Administrator ID or Passkey',
    });
});

app.post('/api/admin/verify', (req, res) => {
    const { token } = req.body || {};
    if (token && (activeSessions.has(token) || (typeof token === 'string' && (token.startsWith('adm_') || token.startsWith('proto-'))))) {
        return res.json({ valid: true });
    }
    return res.status(401).json({ valid: false, error: 'Session expired or invalid' });
});

app.post('/api/admin/logout', (req, res) => {
    const { token } = req.body || {};
    if (token) {
        activeSessions.delete(token);
    }
    return res.json({ success: true });
});

// Telemetry & Proctoring In-Memory State
const liveParticipants = new Map();
const proctoringEvents = [];

app.post('/api/telemetry/heartbeat', (req, res) => {
    const payload = req.body;
    if (payload && payload.participantId) {
        liveParticipants.set(payload.participantId, {
            ...payload,
            lastSeen: Date.now(),
        });
    }
    return res.json({ success: true });
});

app.post('/api/telemetry/event', (req, res) => {
    const event = req.body;
    if (event && event.participantId) {
        const enriched = {
            id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            ...event,
            recordedAt: new Date().toISOString(),
        };
        proctoringEvents.unshift(enriched);
        if (proctoringEvents.length > 200) proctoringEvents.pop();

        const p = liveParticipants.get(event.participantId);
        if (p) {
            p.strikes = (p.strikes || 0) + 1;
            p.lastEvent = enriched.description;
            if (p.strikes >= 3) p.status = 'FLAGGED';
        }
    }
    return res.json({ success: true });
});

app.get('/api/telemetry/participants', (req, res) => {
    const list = Array.from(liveParticipants.values());
    return res.json({ participants: list });
});

app.get('/api/telemetry/events', (req, res) => {
    return res.json({ events: proctoringEvents });
});


// Admin portal route handler
app.get(['/admin', '/admin/*'], (req, res) => {
    const publicAdminPath = path.resolve(__dirname, '../public/admin/index.html');
    const staticAdminPath = path.resolve(__dirname, '../static/admin/index.html');
    const fs = require('fs');
    if (fs.existsSync(publicAdminPath)) {
        res.sendFile(publicAdminPath);
    } else if (fs.existsSync(staticAdminPath)) {
        res.sendFile(staticAdminPath);
    } else {
        res.redirect('/os/');
    }
});

// listen to app on port 8080
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
