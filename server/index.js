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
const crypto = require('crypto');
const activeSessions = new Map();
const loginAttempts = new Map();

function getClientIp(req) {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
}

function timingSafeEqualStr(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

app.post('/api/admin/login', async (req, res) => {
    const ip = getClientIp(req);
    const now = Date.now();

    // Check brute-force lockout
    const attempt = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
    if (attempt.lockedUntil > now) {
        const waitSec = Math.ceil((attempt.lockedUntil - now) / 1000);
        return res.status(429).json({
            success: false,
            error: `Security Lockout: Too many failed login attempts. Try again in ${waitSec} seconds.`
        });
    }

    const { adminId, passkey } = req.body || {};
    const expectedId = process.env.ADMIN_ID || 'admin';
    const expectedPasskey = process.env.ADMIN_PASSKEY || 'techastra2026';

    const trimmedId = typeof adminId === 'string' ? adminId.trim() : '';
    const trimmedPass = typeof passkey === 'string' ? passkey.trim() : '';

    const isIdValid = timingSafeEqualStr(trimmedId.toLowerCase(), expectedId.toLowerCase());
    const isPassValid = timingSafeEqualStr(trimmedPass, expectedPasskey);

    if (isIdValid && isPassValid) {
        loginAttempts.delete(ip); // Reset on success

        const token = `adm_${crypto.randomBytes(32).toString('base64url')}`;
        activeSessions.set(token, {
            id: trimmedId,
            createdAt: now,
            lastActive: now,
        });

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

    // Security penalty delay and attempt tracking
    await new Promise(r => setTimeout(r, 400));
    attempt.count += 1;
    if (attempt.count >= 5) {
        attempt.lockedUntil = now + (5 * 60 * 1000); // 5 min lockout
    }
    loginAttempts.set(ip, attempt);

    return res.status(401).json({
        success: false,
        error: attempt.count >= 5
            ? 'Security Lockout: 5 failed attempts reached. Temporarily locked for 5 minutes.'
            : 'Access Denied: Invalid Administrator ID or Passkey'
    });
});

app.post('/api/admin/verify', (req, res) => {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '') || (req.body && req.body.token);

    if (!token || !activeSessions.has(token)) {
        return res.status(401).json({ valid: false, error: 'Session expired or invalid' });
    }

    const session = activeSessions.get(token);
    const now = Date.now();

    // Max 2-hour session or 60-min inactivity timeout
    if (now - session.createdAt > 2 * 60 * 60 * 1000 || now - session.lastActive > 60 * 60 * 1000) {
        activeSessions.delete(token);
        return res.status(401).json({ valid: false, error: 'Session expired' });
    }

    session.lastActive = now;
    return res.json({ valid: true, adminId: session.id });
});

app.post('/api/admin/logout', (req, res) => {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '') || (req.body && req.body.token);
    if (token) {
        activeSessions.delete(token);
    }
    return res.json({ success: true });
});

// Telemetry & Proctoring In-Memory State (Capacity Limit: Exactly 55 Participants)
const MAX_PARTICIPANTS = 55;
const registeredParticipants = new Map();
const liveParticipants = new Map();
const proctoringEvents = [];

// Helper to validate participant token ID (CR-0001 to CR-0055 or CR-2026-001 to CR-2026-055)
function parseParticipantSlot(id) {
    if (!id || typeof id !== 'string') return null;
    const match = id.match(/(\d+)$/);
    if (!match) return null;
    const num = parseInt(match[1], 10);
    return (num >= 1 && num <= MAX_PARTICIPANTS) ? num : null;
}

app.get('/api/participants/stats', (req, res) => {
    return res.json({
        totalRegistered: registeredParticipants.size,
        maxCapacity: MAX_PARTICIPANTS,
        availableSlots: Math.max(0, MAX_PARTICIPANTS - registeredParticipants.size),
        isRegistrationClosed: registeredParticipants.size >= MAX_PARTICIPANTS,
    });
});

app.post('/api/participants/register', (req, res) => {
    const { fullName, college, department, year, participantId } = req.body || {};
    
    if (registeredParticipants.size >= MAX_PARTICIPANTS) {
        return res.status(403).json({
            success: false,
            error: `Registration capacity reached (${MAX_PARTICIPANTS}/${MAX_PARTICIPANTS} participants enrolled). No further registrations allowed.`,
        });
    }

    let slot = parseParticipantSlot(participantId);
    let assignedId = participantId;

    if (!slot) {
        // Find next open slot between 1 and 55
        for (let i = 1; i <= MAX_PARTICIPANTS; i++) {
            const candidate = `CR-2026-${String(i).padStart(3, '0')}`;
            if (!registeredParticipants.has(candidate)) {
                slot = i;
                assignedId = candidate;
                break;
            }
        }
    }

    if (!slot || slot > MAX_PARTICIPANTS) {
        return res.status(400).json({
            success: false,
            error: `Invalid Token ID: Must be an authorized participant slot between 1 and ${MAX_PARTICIPANTS}.`,
        });
    }

    const participantData = {
        participantId: assignedId,
        fullName: fullName || `Contestant ${slot}`,
        college: college || 'College of Engineering, Guindy',
        department: department || 'CSE',
        year: year || '3rd Year',
        slotNumber: slot,
        registeredAt: new Date().toISOString(),
    };

    registeredParticipants.set(assignedId, participantData);
    return res.json({
        success: true,
        participant: participantData,
        slotNumber: slot,
        totalRegistered: registeredParticipants.size,
        maxCapacity: MAX_PARTICIPANTS,
    });
});

app.post('/api/participants/login', (req, res) => {
    const { participantId } = req.body || {};
    const slot = parseParticipantSlot(participantId);

    if (!slot || slot > MAX_PARTICIPANTS) {
        return res.status(401).json({
            success: false,
            error: `Access Denied: Participant Token '${participantId}' is not authorized. Contest is strictly limited to 55 participants (Slots 01-55).`,
        });
    }

    return res.json({
        success: true,
        authorized: true,
        slotNumber: slot,
        participantId,
    });
});

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


// Admin static assets
app.use('/admin', express.static(path.resolve(__dirname, '../public/admin')));
app.use('/admin', express.static(path.resolve(__dirname, '../static/admin')));
app.get('/admin.bundle.js', (req, res) => {
    res.type('application/javascript').sendFile(path.resolve(__dirname, '../static/admin/admin.bundle.js'));
});

// Admin portal route handler
app.get(['/admin', '/admin/'], (req, res) => {
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
