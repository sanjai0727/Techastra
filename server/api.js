// ============================================================================
// TECHASTRA 2026 — FULL REST & REAL-TIME STREAMING API ROUTER
// Powered by SQLite Persistent DB & Server-Sent Events (SSE) Live Push
// ============================================================================

const express = require('express');
const crypto = require('crypto');
const { db, hashPassword, verifyPassword } = require('./db');

const router = express.Router();
const MAX_PARTICIPANTS = 1000;
const loginAttempts = new Map();

const {
    fetchLiveRoster,
    syncRosterToDatabase,
    seedOfficialRosterToDb,
    OFFICIAL_MASTER_ROSTER,
    markAttendanceOnPortal,
    getSyncStatus,
} = require('./coordinatorSync');

// Automatically sync with Dr. M.G.R. Techastra Portal on boot and periodically
syncRosterToDatabase().catch((err) => console.error('[Portal Sync] Boot sync warning:', err.message));
setInterval(() => {
    syncRosterToDatabase().catch(() => {});
}, 2 * 60 * 1000);

// Real-Time SSE Connected Clients Pool
const sseClients = new Set();

// Broadcast helper: sends instant event to all connected admin and monitor screens
function broadcast(eventType, payload) {
    if (sseClients.size === 0) return;
    const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of sseClients) {
        try {
            client.write(message);
        } catch {
            sseClients.delete(client);
        }
    }
}

// Helper: Client IP extraction
function getClientIp(req) {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
}

// Helper: Parse participant slot number (e.g. SYM2026-0036 -> 36)
function parseParticipantSlot(id) {
    if (!id || typeof id !== 'string') return null;
    const match = id.match(/(\d+)$/);
    if (!match) return null;
    const num = parseInt(match[1], 10);
    return num >= 1 && num <= MAX_PARTICIPANTS ? num : null;
}

function getNextAvailableSlot() {
    const existingSlots = new Set(
        db.prepare('SELECT slot_number FROM participants').all().map((r) => r.slot_number)
    );
    for (let i = 1; i <= MAX_PARTICIPANTS; i++) {
        if (!existingSlots.has(i)) {
            return i;
        }
    }
    return 1;
}

function ensureParticipant(id, meta = {}) {
    if (!id || typeof id !== 'string') return null;
    const cleanId = id.trim().toUpperCase();
    let p = db.prepare('SELECT * FROM participants WHERE id = ?').get(cleanId);
    if (p) return p;

    let slot = null;
    const numMatch = cleanId.match(/(\d+)$/);
    if (numMatch) {
        const potentialSlot = parseInt(numMatch[1], 10);
        const existingSlot = db.prepare('SELECT id FROM participants WHERE slot_number = ?').get(potentialSlot);
        if (!existingSlot) {
            slot = potentialSlot;
        }
    }
    if (!slot) {
        slot = getNextAvailableSlot();
    }

    const nowMs = Date.now();
    const nowIso = new Date().toISOString();
    const pName = meta.participantName || meta.fullName || meta.name || `Contestant ${cleanId}`;
    const pCollege = meta.college || 'Engineering College';
    const pDept = meta.department || 'Computer Science & Engineering';
    const pYear = meta.year || '3rd Year';
    const pStatus = meta.status || 'ACTIVE';
    const pStrikes = meta.strikes !== undefined ? Number(meta.strikes) : 0;
    const pTime = meta.timeRemaining !== undefined ? Number(meta.timeRemaining) : 1200;

    try {
        db.prepare(`
            INSERT INTO participants (
                id, slot_number, full_name, college, department, year,
                current_round, current_question, score, total_score,
                round1_score, round2_score, round3_score, time_remaining,
                status, strikes, last_event, last_seen, registered_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO NOTHING
        `).run(
            cleanId,
            slot,
            pName,
            pCollege,
            pDept,
            pYear,
            meta.currentRound || 'R1',
            meta.currentQuestion || 'Q1',
            meta.score || 0,
            meta.totalScore || 0,
            meta.round1Score || 0,
            meta.round2Score || 0,
            meta.round3Score || 0,
            pTime,
            pStatus,
            pStrikes,
            meta.lastEvent || meta.lastActivity || 'Connected to Arena',
            nowMs,
            nowIso
        );
    } catch (err) {
        console.error('[ensureParticipant] Insert error:', err.message);
    }

    return db.prepare('SELECT * FROM participants WHERE id = ?').get(cleanId);
}

// Helper: Format participant records for client API
function getAllParticipantsFormatted() {
    const rows = db.prepare(`
        SELECT p.*,
               (SELECT COUNT(*) FROM submissions s WHERE s.participant_id = p.id) as submissions_count
        FROM participants p
        ORDER BY p.total_score DESC, p.slot_number ASC
    `).all();

    return rows.map((p) => {
        const minutes = Math.floor((p.time_remaining || 0) / 60);
        const seconds = (p.time_remaining || 0) % 60;
        return {
            id: p.id,
            name: p.full_name,
            college: p.college,
            department: p.department,
            year: p.year,
            currentRound: p.current_round,
            currentQuestion: p.current_question,
            score: p.score,
            totalScore: p.total_score,
            time: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
            status: p.status,
            strikes: p.strikes,
            lastEvent: p.last_event,
            scores: {
                round1: p.round1_score,
                round2: p.round2_score,
                round3: p.round3_score,
                total: p.total_score,
            },
            sessionActive: p.status !== 'COMPLETED' && p.status !== 'ELIMINATED' && p.status !== 'DISQUALIFIED',
            submissionsCount: p.submissions_count || 0,
            securityEventsCount: p.strikes || 0,
        };
    });
}

function getAllSubmissionsFormatted() {
    const rows = db.prepare('SELECT * FROM submissions ORDER BY submitted_at DESC LIMIT 200').all();
    return rows.map((s) => {
        let testList = [];
        try {
            testList = JSON.parse(s.test_results);
        } catch {
            testList = [];
        }

        const dateObj = new Date(s.submitted_at);
        const timeStr = !isNaN(dateObj.getTime()) ? dateObj.toTimeString().split(' ')[0] : 'Just now';

        return {
            id: s.id,
            participantId: s.participant_id,
            participantName: s.participant_name,
            round: s.round_id,
            question: s.question_id,
            submittedCode: s.code,
            code: s.code,
            result: s.result,
            score: s.score,
            maxScore: 10,
            executionTime: `${s.execution_time_ms}ms`,
            submissionTime: timeStr,
            testResults: testList,
            terminalOutput: `[TechAstra Python Runtime v3.11.2]\nExecuted test suite: ${s.passed_count}/${s.total_tests} passed.\nStatus: ${s.result} (score: +${s.score})\nFinished in ${s.execution_time_ms}ms.`,
        };
    });
}

function getAllEventsFormatted() {
    return db.prepare(`
        SELECT id, participant_id as participantId, participant_name as participantName,
               event_type as eventType, description, strike_count as strikeCount,
               status, timestamp
        FROM proctoring_events
        ORDER BY created_at DESC
        LIMIT 250
    `).all();
}

function getAllRoundsFormatted() {
    const rows = db.prepare('SELECT * FROM rounds ORDER BY round_id ASC').all();
    return rows.map((r) => {
        const participantCount = db.prepare('SELECT COUNT(*) as c FROM participants WHERE current_round = ?').get(r.round_id).c;
        const qualifiedCount = db.prepare(`
            SELECT COUNT(*) as c FROM participants
            WHERE (CASE WHEN ? = 'R1' THEN round1_score WHEN ? = 'R2' THEN round2_score ELSE round3_score END) >= ?
        `).get(r.round_id, r.round_id, r.cutoff).c;

        return {
            roundId: r.round_id,
            name: r.name,
            title: r.title,
            isActive: Boolean(r.is_active),
            cutoff: r.cutoff,
            maxScore: r.max_score,
            participantsCount: participantCount,
            qualifiedCount,
            timeLimitMinutes: r.time_limit_minutes,
            totalQuestions: r.total_questions,
            description: r.description,
        };
    });
}

function getAllAnnouncementsFormatted() {
    return db.prepare('SELECT id, message, author, priority, created_at FROM announcements ORDER BY id DESC LIMIT 50').all().map(a => ({
        id: `ANN-${a.id}`,
        message: a.message,
        timestamp: new Date(a.created_at).toTimeString().split(' ')[0],
        author: a.author || 'Chief Coordinator',
        roundTarget: a.priority === 'HIGH' ? 'R1' : 'ALL',
        broadcasted: true,
    }));
}

function getCompetitionSchedule() {
    let startTime = '';
    let endTime = '';
    let eventEnded = false;
    try {
        const sRow = db.prepare("SELECT value FROM competition_settings WHERE key = 'event_start_time'").get();
        if (sRow && sRow.value) startTime = sRow.value;
        const eRow = db.prepare("SELECT value FROM competition_settings WHERE key = 'event_end_time'").get();
        if (eRow && eRow.value) endTime = eRow.value;
        const endRow = db.prepare("SELECT value FROM competition_settings WHERE key = 'event_ended'").get();
        eventEnded = endRow ? endRow.value === '1' : false;
    } catch (e) {
        console.error('Error fetching competition schedule:', e);
    }

    const now = Date.now();
    let isStarted = true;
    let isEnded = eventEnded;

    if (startTime) {
        const startMs = Date.parse(startTime);
        if (!isNaN(startMs)) {
            isStarted = now >= startMs;
        }
    }

    if (endTime) {
        const endMs = Date.parse(endTime);
        if (!isNaN(endMs)) {
            if (now >= endMs) {
                isEnded = true;
            }
        }
    }

    let status = 'IN_PROGRESS';
    if (!isStarted) {
        status = 'WAITING_TO_START';
    } else if (isEnded) {
        status = 'ENDED';
    }

    return {
        startTime,
        endTime,
        serverTime: new Date().toISOString(),
        isStarted,
        isEnded,
        eventEnded: isEnded,
        status,
    };
}

// Middleware: Authenticate Admin Session
function requireAdminAuth(req, res, next) {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '') || req.query.token || req.body?.token;

    if (!token) {
        return res.status(401).json({ success: false, error: 'Authorization token required' });
    }

    const session = db.prepare('SELECT * FROM admin_sessions WHERE token = ?').get(token);
    if (!session) {
        return res.status(401).json({ success: false, error: 'Invalid or expired admin session' });
    }

    const now = Date.now();
    // 2-hour hard session limit or 60-min inactivity timeout
    if (now - session.created_at > 2 * 60 * 60 * 1000 || now - session.last_active > 60 * 60 * 1000) {
        db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
        return res.status(401).json({ success: false, error: 'Admin session expired' });
    }

    // Refresh last active
    db.prepare('UPDATE admin_sessions SET last_active = ? WHERE token = ?').run(now, token);
    req.admin = session;
    next();
}

// ============================================================================
// 0. REAL-TIME SERVER-SENT EVENTS (SSE) STREAM
// ============================================================================

router.get('/stream', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'X-Accel-Buffering': 'no',
    });
    if (res.flushHeaders) res.flushHeaders();

    sseClients.add(res);

    // Send initial snapshot on connect
    const initialSnapshot = {
        participants: getAllParticipantsFormatted(),
        submissions: getAllSubmissionsFormatted(),
        events: getAllEventsFormatted(),
        rounds: getAllRoundsFormatted(),
        announcements: getAllAnnouncementsFormatted(),
    };
    res.write(`event: snapshot\ndata: ${JSON.stringify(initialSnapshot)}\n\n`);

    // Keep-alive ping interval
    const keepAlive = setInterval(() => {
        res.write(': keepalive\n\n');
    }, 15000);

    req.on('close', () => {
        clearInterval(keepAlive);
        sseClients.delete(res);
    });
});

// ============================================================================
// 1. ADMIN AUTHENTICATION
// ============================================================================

router.post('/admin/login', async (req, res) => {
    const ip = getClientIp(req);
    const now = Date.now();

    // Check brute-force lockout
    const attempt = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
    if (attempt.lockedUntil > now) {
        const waitSec = Math.ceil((attempt.lockedUntil - now) / 1000);
        return res.status(429).json({
            success: false,
            error: `Security Lockout: Too many failed login attempts. Try again in ${waitSec} seconds.`,
        });
    }

    const { adminId, username, passkey, password } = req.body || {};
    const trimmedId = typeof (adminId || username) === 'string' ? (adminId || username).trim() : '';
    const trimmedPass = typeof (passkey || password) === 'string' ? (passkey || password).trim() : '';

    if (!trimmedId || !trimmedPass) {
        return res.status(400).json({ success: false, error: 'Administrator ID and Passkey are required.' });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE LOWER(username) = LOWER(?)').get(trimmedId);

    if (admin && verifyPassword(trimmedPass, admin.password_hash)) {
        loginAttempts.delete(ip);

        const token = `adm_${crypto.randomBytes(32).toString('base64url')}`;
        db.prepare(`
            INSERT INTO admin_sessions (token, admin_id, username, created_at, last_active)
            VALUES (?, ?, ?, ?, ?)
        `).run(token, admin.id, admin.username, now, now);

        return res.json({
            success: true,
            token,
            admin: {
                id: admin.username,
                name: admin.name,
                role: admin.role,
                authenticatedAt: new Date().toISOString(),
            },
        });
    }

    // Security delay & tracking
    await new Promise((r) => setTimeout(r, 400));
    attempt.count += 1;
    if (attempt.count >= 5) {
        attempt.lockedUntil = now + 5 * 60 * 1000;
    }
    loginAttempts.set(ip, attempt);

    return res.status(401).json({
        success: false,
        error: attempt.count >= 5
            ? 'Security Lockout: 5 failed attempts reached. Temporarily locked for 5 minutes.'
            : 'Access Denied: Invalid Administrator ID or Passkey',
    });
});

router.post('/admin/verify', (req, res) => {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '') || req.body?.token;

    if (!token) {
        return res.status(401).json({ valid: false, error: 'Missing token' });
    }

    const session = db.prepare('SELECT * FROM admin_sessions WHERE token = ?').get(token);
    if (!session) {
        return res.status(401).json({ valid: false, error: 'Invalid or expired session' });
    }

    const now = Date.now();
    if (now - session.created_at > 2 * 60 * 60 * 1000 || now - session.last_active > 60 * 60 * 1000) {
        db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
        return res.status(401).json({ valid: false, error: 'Session expired' });
    }

    db.prepare('UPDATE admin_sessions SET last_active = ? WHERE token = ?').run(now, token);
    return res.json({ valid: true, adminId: session.username });
});

router.post('/admin/logout', (req, res) => {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '') || req.body?.token;
    if (token) {
        db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
    }
    return res.json({ success: true });
});

router.get('/admin/me', requireAdminAuth, (req, res) => {
    const admin = db.prepare('SELECT id, username, name, role, created_at FROM admins WHERE id = ?').get(req.admin.admin_id);
    return res.json({ success: true, admin });
});

router.post('/admin/reset-contest', requireAdminAuth, (req, res) => {
    try {
        const { hardReset } = req.body || {};

        // 1. Clear all submissions
        db.prepare('DELETE FROM submissions').run();

        // 2. Clear all proctoring security events
        db.prepare('DELETE FROM proctoring_events').run();

        // 3. Reset participant scores and progress to initial state
        db.prepare(`
            UPDATE participants
            SET score = 0,
                total_score = 0,
                round1_score = 0,
                round2_score = 0,
                round3_score = 0,
                current_round = 'R1',
                current_question = 'Q1',
                strikes = 0,
                status = 'ACTIVE',
                time_remaining = 1200,
                last_event = 'Contest reset by Event Coordinator'
        `).run();

        // 4. Reset rounds
        db.prepare(`
            UPDATE rounds
            SET is_active = CASE WHEN round_id = 'R1' THEN 1 ELSE 0 END
        `).run();

        // 5. Broadcast real-time SSE telemetry updates to all screens
        broadcast('participants_updated', getAllParticipantsFormatted());
        broadcast('submissions_updated', getAllSubmissionsFormatted());
        broadcast('events_updated', getAllEventsFormatted());
        broadcast('rounds_updated', getAllRoundsFormatted());

        console.log(`[Admin Security] Contest data successfully reset by coordinator: ${req.admin.username}`);

        return res.json({
            success: true,
            message: 'Championship contest state successfully reset by administrator.',
            resetBy: req.admin.username,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error('[Admin Security] Error executing contest reset:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================================
// 2. PARTICIPANT REGISTRATION & AUTHENTICATION
// ============================================================================

router.get('/participants/stats', (req, res) => {
    const countRow = db.prepare('SELECT COUNT(*) as count FROM participants').get();
    const count = countRow.count;
    return res.json({
        totalRegistered: count,
        maxCapacity: MAX_PARTICIPANTS,
        availableSlots: Math.max(0, MAX_PARTICIPANTS - count),
        isRegistrationClosed: count >= MAX_PARTICIPANTS,
    });
});

router.post('/participants/register', (req, res) => {
    const { fullName, college, department, year, participantId } = req.body || {};

    const countRow = db.prepare('SELECT COUNT(*) as count FROM participants').get();
    if (countRow.count >= MAX_PARTICIPANTS) {
        return res.status(403).json({
            success: false,
            error: `Registration capacity reached (${MAX_PARTICIPANTS}/${MAX_PARTICIPANTS} participants enrolled). No further registrations allowed.`,
        });
    }

    let slot = parseParticipantSlot(participantId);
    let assignedId = participantId ? participantId.trim().toUpperCase() : '';

    if (assignedId) {
        // Ensure standard format if provided as pure number or partial
        if (/^\d+$/.test(assignedId)) {
            assignedId = `SYM2026-${String(assignedId).padStart(4, '0')}`;
            slot = parseInt(assignedId, 10);
        }
        // Check if ID is already registered
        const existing = db.prepare('SELECT id FROM participants WHERE id = ?').get(assignedId);
        if (existing) {
            return res.status(409).json({
                success: false,
                error: `Participant Token '${assignedId}' is already registered in the system.`,
            });
        }
    }

    if (!slot || !assignedId) {
        // Find first available slot (start from 1, format as SYM2026-0001, etc.)
        const existingSlots = new Set(
            db.prepare('SELECT slot_number FROM participants').all().map((r) => r.slot_number)
        );
        for (let i = 1; i <= MAX_PARTICIPANTS; i++) {
            if (!existingSlots.has(i)) {
                slot = i;
                assignedId = `SYM2026-${String(i).padStart(4, '0')}`;
                break;
            }
        }
    }

    const nowIso = new Date().toISOString();
    const nowMs = Date.now();

    const insertStmt = db.prepare(`
        INSERT INTO participants (
            id, slot_number, full_name, college, department, year,
            current_round, current_question, score, total_score,
            round1_score, round2_score, round3_score, time_remaining,
            status, strikes, last_event, last_seen, registered_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'R1', 'Q1', 0, 0, 0, 0, 0, 1200, 'ACTIVE', 0, 'Registered in Arena', ?, ?)
    `);

    insertStmt.run(
        assignedId,
        slot || 1,
        fullName || `Contestant ${assignedId}`,
        college || 'Engineering College',
        department || 'Computer Science & Engineering',
        year || '3rd Year',
        nowMs,
        nowIso
    );

    // Create participant session token
    const token = `usr_${crypto.randomBytes(24).toString('base64url')}`;
    db.prepare(`
        INSERT INTO participant_sessions (token, participant_id, created_at, last_active)
        VALUES (?, ?, ?, ?)
    `).run(token, assignedId, nowMs, nowMs);

    const newCount = db.prepare('SELECT COUNT(*) as count FROM participants').get().count;

    // Real-time broadcast to all connected Admin dashboards
    broadcast('participants_updated', getAllParticipantsFormatted());

    return res.json({
        success: true,
        participantId: assignedId,
        slotNumber: slot,
        token,
        participant: {
            id: assignedId,
            fullName: fullName || `Contestant ${assignedId}`,
            college: college || 'Engineering College',
            department: department || 'Computer Science & Engineering',
            year: year || '3rd Year',
            slotNumber: slot,
            registeredAt: nowIso,
        },
        totalRegistered: newCount,
        maxCapacity: MAX_PARTICIPANTS,
    });
});

router.post('/participants/verify', async (req, res) => {
    const { participantId } = req.body || {};
    let trimmedId = typeof participantId === 'string' ? participantId.trim().toUpperCase() : '';

    if (!trimmedId) {
        return res.status(400).json({ success: false, verified: false, error: 'Participant Token ID is required.' });
    }

    if (/^\d+$/.test(trimmedId)) {
        trimmedId = `SYM2026-${String(trimmedId).padStart(4, '0')}`;
    }

    // 1. Check local DB (already logged in or signed up)
    const local = db.prepare('SELECT * FROM participants WHERE id = ?').get(trimmedId);
    if (local) {
        return res.json({
            success: true,
            verified: true,
            participant: {
                id: local.id,
                slotNumber: local.slot_number,
                name: local.full_name,
                college: local.college,
                department: local.department,
                year: local.year,
                currentRound: local.current_round,
                status: local.status,
                strikes: local.strikes,
            }
        });
    }

    // 2. Check live portal roster (without inserting into DB yet)
    try {
        const roster = await fetchLiveRoster();
        const match = roster.find(
            (r) =>
                (r.registrationCode && r.registrationCode.toUpperCase() === trimmedId) ||
                (r.registrationId && r.registrationId.toUpperCase() === trimmedId)
        );
        if (match) {
            const code = match.registrationCode || trimmedId;
            const numMatch = code.match(/(\d+)$/);
            const slotNum = numMatch ? parseInt(numMatch[1], 10) : 1;

            return res.json({
                success: true,
                verified: true,
                participant: {
                    id: code,
                    slotNumber: slotNum,
                    name: match.name || `Contestant ${code}`,
                    college: match.college || 'Engineering College',
                    department: 'Computer Science and Engineering',
                    year: 'Senior Engineering',
                    currentRound: 'R1',
                    status: 'ACTIVE',
                    strikes: 0,
                }
            });
        }
    } catch (err) {}

    return res.status(404).json({
        success: false,
        verified: false,
        error: `Participant Token '${trimmedId}' was not found in the official Techastra roster. Please verify your token or register below.`,
    });
});

router.post('/participants/login', async (req, res) => {
    const { participantId } = req.body || {};
    let trimmedId = typeof participantId === 'string' ? participantId.trim().toUpperCase() : '';

    if (!trimmedId) {
        return res.status(400).json({ success: false, error: 'Participant Token ID is required.' });
    }

    // Auto-normalize if user enters 36 -> SYM2026-0036
    if (/^\d+$/.test(trimmedId)) {
        trimmedId = `SYM2026-${String(trimmedId).padStart(4, '0')}`;
    }

    let participant = db.prepare('SELECT * FROM participants WHERE id = ?').get(trimmedId);

    // If not found in local DB, attempt live lookup against official Techastra Coordinator Portal
    if (!participant) {
        try {
            const roster = await fetchLiveRoster();
            const match = roster.find(
                (r) =>
                    (r.registrationCode && r.registrationCode.toUpperCase() === trimmedId) ||
                    (r.registrationId && r.registrationId.toUpperCase() === trimmedId)
            );

            if (match) {
                const code = match.registrationCode || trimmedId;
                const numMatch = code.match(/(\d+)$/);
                const slotNum = numMatch ? parseInt(numMatch[1], 10) : 1;
                const nowMs = Date.now();
                const nowIso = new Date().toISOString();

                db.prepare(`
                    INSERT INTO participants (
                        id, slot_number, full_name, college, department, year,
                        current_round, current_question, score, total_score,
                        round1_score, round2_score, round3_score, time_remaining,
                        status, strikes, last_event, last_seen, registered_at
                    ) VALUES (?, ?, ?, ?, ?, ?, 'R1', 'Q1', 0, 0, 0, 0, 0, 1200, 'ACTIVE', 0, 'Verified on Official Portal', ?, ?)
                    ON CONFLICT(id) DO UPDATE SET full_name = excluded.full_name, college = excluded.college
                `).run(
                    code,
                    slotNum,
                    match.name || `Contestant ${code}`,
                    match.college || 'Engineering College',
                    'Computer Science and Engineering',
                    'Senior Engineering',
                    nowMs,
                    nowIso
                );

                participant = db.prepare('SELECT * FROM participants WHERE id = ?').get(code);
                broadcast('participants_updated', getAllParticipantsFormatted());
            }
        } catch (err) {
            console.error('[Portal Live Lookup] Error checking portal:', err.message);
        }
    }

    if (!participant) {
        return res.status(401).json({
            success: false,
            error: `Access Denied: Participant Token '${trimmedId}' was not found in the official Techastra roster. Please verify your token or register below.`,
        });
    }

    if (participant.status === 'ELIMINATED' || participant.status === 'DISQUALIFIED') {
        return res.status(403).json({
            success: false,
            error: `Access Denied: Participant session is ${participant.status} due to proctoring policy or cutoff elimination.`,
        });
    }

    const token = `usr_${crypto.randomBytes(24).toString('base64url')}`;
    const now = Date.now();
    db.prepare(`
        INSERT INTO participant_sessions (token, participant_id, created_at, last_active)
        VALUES (?, ?, ?, ?)
    `).run(token, participant.id, now, now);

    return res.json({
        success: true,
        token,
        participant: {
            id: participant.id,
            slotNumber: participant.slot_number,
            fullName: participant.full_name,
            college: participant.college,
            department: participant.department,
            year: participant.year,
            currentRound: participant.current_round,
            currentQuestion: participant.current_question,
            score: participant.score,
            totalScore: participant.total_score,
            status: participant.status,
            strikes: participant.strikes,
        },
    });
});

// Coordinator Portal Live Synchronization Endpoints
router.get('/coordinator/status', (req, res) => {
    return res.json({ success: true, ...getSyncStatus() });
});

router.post('/coordinator/sync', async (req, res) => {
    try {
        const result = await syncRosterToDatabase();
        broadcast('participants_updated', getAllParticipantsFormatted());
        return res.json({
            ...result,
            synced: result.syncedCount,
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/coordinator/roster', async (req, res) => {
    try {
        const roster = await fetchLiveRoster();
        return res.json({ success: true, count: roster.length, roster });
    } catch (err) {
        // Fallback to SQLite cached participants
        const local = db.prepare('SELECT id as registrationCode, full_name as name, college FROM participants').all();
        return res.json({ success: true, count: local.length, roster: local, fallback: true });
    }
});

router.get('/coordinator/lookup/:code', async (req, res) => {
    let rawCode = req.params.code ? req.params.code.trim().toUpperCase() : '';
    // Normalize e.g. "38" -> "SYM2026-0038", "SYM2026-38" -> "SYM2026-0038"
    if (/^\d+$/.test(rawCode)) {
        rawCode = `SYM2026-${String(rawCode).padStart(4, '0')}`;
    } else {
        const numMatch = rawCode.match(/^SYM2026-(\d+)$/i);
        if (numMatch) {
            rawCode = `SYM2026-${String(numMatch[1]).padStart(4, '0')}`;
        }
    }
    const code = rawCode;

    // 1. Check local DB
    const local = db.prepare('SELECT * FROM participants WHERE id = ?').get(code);
    if (local) {
        return res.json({
            success: true,
            found: true,
            participant: {
                id: local.id,
                name: local.full_name,
                college: local.college,
                department: local.department || 'Computer Science & Engineering',
                year: local.year || '3rd Year',
                venue: 'IBM Lab • Day 1 (Oct 8, 2026)',
            },
        });
    }

    // 2. Check live / master portal roster
    try {
        const roster = await fetchLiveRoster();
        const match = roster.find(
            (r) =>
                (r.registrationCode && r.registrationCode.toUpperCase() === code) ||
                (r.registrationId && r.registrationId.toUpperCase() === code)
        );
        if (match) {
            return res.json({
                success: true,
                found: true,
                participant: {
                    id: match.registrationCode || code,
                    name: match.name,
                    college: match.college,
                    department: match.department || 'Computer Science & Engineering',
                    year: match.year || '3rd Year',
                    venue: match.venue || 'IBM Lab • Day 1 (Oct 8, 2026)',
                },
            });
        }
    } catch (e) {}

    return res.json({ success: true, found: false });
});

router.get('/participants', (req, res) => {
    return res.json({ success: true, participants: getAllParticipantsFormatted() });
});

router.get('/participants/:id', (req, res) => {
    const id = req.params.id.toUpperCase();
    const p = db.prepare('SELECT * FROM participants WHERE id = ?').get(id);
    if (!p) {
        return res.status(404).json({ success: false, error: 'Participant not found' });
    }
    const submissions = db.prepare('SELECT * FROM submissions WHERE participant_id = ? ORDER BY submitted_at DESC').all(id);
    const events = db.prepare('SELECT * FROM proctoring_events WHERE participant_id = ? ORDER BY created_at DESC').all(id);

    return res.json({
        success: true,
        participant: p,
        submissions,
        events,
    });
});

// ============================================================================
// 3. TELEMETRY & PROCTORING (HEARTBEAT & SECURITY AUDIT)
// ============================================================================

router.post('/telemetry/heartbeat', (req, res) => {
    const payload = req.body || {};
    const id = payload.participantId ? payload.participantId.trim().toUpperCase() : null;
    if (!id) return res.json({ success: false, error: 'No participantId' });

    const now = Date.now();
    let p = ensureParticipant(id, payload);

    if (p) {
        const roundNum = payload.currentRound ? String(payload.currentRound).replace('R', '') : (p.current_round ? String(p.current_round).replace('R', '') : '1');
        const roundId = `R${roundNum}`;
        const qNum = payload.currentQuestion || p.current_question || 'Q1';
        const timeRemaining = payload.roundTimeRemaining !== undefined ? Number(payload.roundTimeRemaining) : (payload.timeRemaining !== undefined ? Number(payload.timeRemaining) : p.time_remaining);

        const r1 = payload.round1Score !== undefined ? Number(payload.round1Score) : p.round1_score;
        const r2 = payload.round2Score !== undefined ? Number(payload.round2Score) : p.round2_score;
        const r3 = payload.round3Score !== undefined ? Number(payload.round3Score) : p.round3_score;
        const total = payload.totalScore !== undefined ? Number(payload.totalScore) : (r1 + r2 + r3);
        const curScore = payload.score !== undefined ? Number(payload.score) : (roundId === 'R1' ? r1 : roundId === 'R2' ? r2 : r3);

        const strikes = payload.strikes !== undefined ? Number(payload.strikes) : p.strikes;
        let status = payload.status || p.status;

        // If participant was pardoned or reinstated by admin on the server,
        // but the client is still sending DISQUALIFIED from prior local state:
        if (p.status === 'ACTIVE' && p.strikes === 0 && (payload.status === 'DISQUALIFIED' || Number(payload.strikes) > 0)) {
            return res.json({
                success: true,
                reinstated: true,
                pardoned: true,
                status: 'ACTIVE',
                strikes: 0,
                timeRemaining: p.time_remaining,
                schedule: getCompetitionSchedule()
            });
        }

        if (strikes >= 3 || status === 'DISQUALIFIED') {
            status = 'DISQUALIFIED';
        } else if (strikes >= 2 && status !== 'DISQUALIFIED') {
            status = 'FLAGGED';
        }

        const lastActivity = payload.lastActivity || payload.lastEvent || p.last_event || 'Active in Arena';

        db.prepare(`
            UPDATE participants
            SET current_round = ?,
                current_question = ?,
                score = ?,
                total_score = ?,
                round1_score = ?,
                round2_score = ?,
                round3_score = ?,
                time_remaining = ?,
                status = ?,
                strikes = ?,
                last_event = ?,
                last_seen = ?
            WHERE id = ?
        `).run(
            roundId,
            qNum,
            curScore,
            total,
            r1,
            r2,
            r3,
            timeRemaining,
            status,
            strikes,
            lastActivity,
            now,
            id
        );

        // Real-time broadcast
        broadcast('participant_heartbeat', {
            id,
            currentRound: roundId,
            currentQuestion: qNum,
            score: curScore,
            totalScore: total,
            timeRemaining,
            status,
            strikes,
            lastEvent: lastActivity,
        });

        // Broadcast roster updates when status or strikes change
        if (status !== p.status || strikes !== p.strikes) {
            broadcast('participants_updated', getAllParticipantsFormatted());
        }

        return res.json({
            success: true,
            status,
            strikes,
            timeRemaining,
            reinstated: status === 'ACTIVE' && strikes === 0,
            pardoned: strikes === 0,
            schedule: getCompetitionSchedule()
        });
    }

    return res.json({ success: true, schedule: getCompetitionSchedule() });
});

// Real-Time Keystroke & Participant Code Stream
router.post(['/telemetry/code-stream', '/telemetry/live-screen'], (req, res) => {
    const {
        participantId,
        participantName,
        roundId,
        round,
        questionId,
        question,
        questionTitle,
        code,
        timeRemaining,
        lastKeystrokeAt,
    } = req.body || {};

    const id = participantId ? participantId.trim().toUpperCase() : null;
    if (!id) return res.status(400).json({ success: false, error: 'participantId required' });

    let p = ensureParticipant(id, { participantName, roundId, questionId, timeRemaining });
    const name = p ? p.full_name : (participantName || id);
    const curTime = timeRemaining !== undefined ? Number(timeRemaining) : (p ? p.time_remaining : 2400);
    const nowMs = lastKeystrokeAt || Date.now();
    const effectiveRound = roundId || round || 'R1';
    const effectiveQuestion = questionId || question || 'Q1';
    const effectiveTitle = questionTitle || effectiveQuestion;

    // Upsert into live_screens
    db.prepare(`
        INSERT INTO live_screens (
            participant_id, participant_name, round_id, question_id, question_title, code, time_remaining, last_keystroke_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(participant_id) DO UPDATE SET
            round_id = excluded.round_id,
            question_id = excluded.question_id,
            question_title = excluded.question_title,
            code = excluded.code,
            time_remaining = excluded.time_remaining,
            last_keystroke_at = excluded.last_keystroke_at
    `).run(id, name, effectiveRound, effectiveQuestion, effectiveTitle, code || '', curTime, nowMs);

    // Also update time_remaining and current_question on participants table
    if (p) {
        db.prepare(`
            UPDATE participants
            SET time_remaining = ?,
                current_question = ?,
                current_round = ?,
                last_seen = ?
            WHERE id = ?
        `).run(curTime, effectiveQuestion, effectiveRound, nowMs, id);
    }

    const screenData = {
        participantId: id,
        participantName: name,
        roundId: effectiveRound,
        questionId: effectiveQuestion,
        questionTitle: effectiveTitle,
        code: code || '',
        timeRemaining: curTime,
        lastKeystrokeAt: nowMs,
    };

    // Instant 0ms broadcast to all connected Admin screens
    broadcast('code_stream', screenData);
    broadcast('participant_heartbeat', {
        id,
        currentRound: effectiveRound,
        currentQuestion: effectiveQuestion,
        timeRemaining: curTime,
        lastEvent: `Live editing ${effectiveQuestion}`,
    });

    return res.json({ success: true });
});

router.get('/telemetry/live-screens', (req, res) => {
    const rows = db.prepare(`
        SELECT ls.*, p.college, p.department, p.status, p.strikes, p.score, p.total_score
        FROM live_screens ls
        JOIN participants p ON p.id = ls.participant_id
        ORDER BY ls.last_keystroke_at DESC
    `).all();
    return res.json({ success: true, screens: rows });
});

router.get('/telemetry/live-screen/:id', (req, res) => {
    const id = req.params.id.toUpperCase();
    const screen = db.prepare(`
        SELECT ls.*, p.college, p.department, p.status, p.strikes, p.score, p.total_score
        FROM live_screens ls
        JOIN participants p ON p.id = ls.participant_id
        WHERE ls.participant_id = ?
    `).get(id);

    if (!screen) {
        // Return blank shell if not yet typing
        const p = ensureParticipant(id);
        if (!p) return res.status(404).json({ success: false, error: 'Participant not found' });
        return res.json({
            success: true,
            screen: {
                participant_id: p.id,
                participant_name: p.full_name,
                round_id: p.current_round,
                question_id: p.current_question,
                question_title: 'Active Work Order',
                code: '# Contestant has not begun typing yet...',
                time_remaining: p.time_remaining,
                last_keystroke_at: p.last_seen,
                status: p.status,
                strikes: p.strikes,
                score: p.score,
                total_score: p.total_score,
            }
        });
    }

    return res.json({ success: true, screen });
});

router.post(['/telemetry/event', '/proctoring/event'], (req, res) => {
    const event = req.body || {};
    const id = event.participantId ? event.participantId.trim().toUpperCase() : null;
    if (!id) return res.status(400).json({ success: false, error: 'No participantId' });

    let p = ensureParticipant(id, event);
    const pName = p ? p.full_name : (event.participantName || id);

    const eventId = `SEC-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    const newStrikes = event.strikeCount !== undefined ? Number(event.strikeCount) : ((p ? p.strikes : 0) + 1);
    
    // Status resolution: if strike 3 or explicit DISQUALIFIED, mark as DISQUALIFIED
    let status = 'WARNING';
    if (newStrikes >= 3 || event.status === 'DISQUALIFIED' || event.eventType === 'DISQUALIFIED') {
        status = 'DISQUALIFIED';
    } else if (newStrikes >= 2 || event.status === 'FLAGGED') {
        status = 'FLAGGED';
    }

    const nowTime = new Date().toTimeString().split(' ')[0];
    const details = event.details || event.description || 'Proctoring violation recorded';

    db.prepare(`
        INSERT INTO proctoring_events (
            id, participant_id, participant_name, event_type, description, strike_count, status, timestamp, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        eventId,
        id,
        pName,
        event.eventType || 'WINDOW_BLUR',
        details,
        newStrikes,
        status,
        nowTime,
        Date.now()
    );

    db.prepare(`
        UPDATE participants
        SET strikes = ?,
            status = ?,
            last_event = ?,
            last_seen = ?
        WHERE id = ?
    `).run(newStrikes, status, details, Date.now(), id);

    const createdEvent = {
        id: eventId,
        participantId: id,
        participantName: pName,
        eventType: event.eventType || 'WINDOW_BLUR',
        description: details,
        strikeCount: newStrikes,
        strikes: newStrikes,
        status,
        timestamp: nowTime,
    };

    // Real-time broadcast of new security violation and updated participants list
    broadcast('security_event', createdEvent);
    broadcast('participants_updated', getAllParticipantsFormatted());

    return res.json({ success: true, eventId, strikes: newStrikes, strikeCount: newStrikes, status });
});

router.get('/telemetry/participants', (req, res) => {
    return res.json({ success: true, participants: getAllParticipantsFormatted() });
});

router.get(['/telemetry/events', '/proctoring/events'], (req, res) => {
    return res.json({ success: true, events: getAllEventsFormatted() });
});

router.post('/telemetry/reinstate', requireAdminAuth, (req, res) => {
    const { participantId } = req.body || {};
    const id = participantId ? participantId.trim().toUpperCase() : null;
    if (!id) return res.status(400).json({ success: false, error: 'participantId required' });

    const p = db.prepare('SELECT full_name FROM participants WHERE id = ?').get(id);
    if (!p) return res.status(404).json({ success: false, error: 'Participant not found' });

    db.prepare(`
        UPDATE participants
        SET strikes = 0,
            status = 'ACTIVE',
            last_event = 'Session reinstated by Coordinator'
        WHERE id = ?
    `).run(id);

    const eventId = `SEC-REINSTATE-${Date.now().toString().slice(-4)}`;
    const nowTime = new Date().toTimeString().split(' ')[0];

    db.prepare(`
        INSERT INTO proctoring_events (
            id, participant_id, participant_name, event_type, description, strike_count, status, timestamp, created_at
        ) VALUES (?, ?, ?, 'WINDOW_BLUR', 'Coordinator cleared all strikes and reinstated session', 0, 'CLEAN', ?, ?)
    `).run(eventId, id, p.full_name || id, nowTime, Date.now());

    // Instant broadcast
    broadcast('participants_updated', getAllParticipantsFormatted());
    broadcast('session_reset', { participantId: id });
    broadcast('participant_reinstated', { participantId: id });
    broadcast('events_updated', getAllEventsFormatted());
    broadcast('security_event', {
        id: eventId,
        participantId: id,
        participantName: p.full_name || id,
        eventType: 'WINDOW_BLUR',
        description: 'Coordinator cleared all strikes and reinstated session',
        strikeCount: 0,
        status: 'CLEAN',
        timestamp: nowTime,
    });

    return res.json({ success: true, message: `Participant ${id} reinstated.` });
});

router.post('/telemetry/flag', requireAdminAuth, (req, res) => {
    const { participantId, reason } = req.body || {};
    const id = participantId ? participantId.trim().toUpperCase() : null;
    if (!id) return res.status(400).json({ success: false, error: 'participantId required' });

    const p = db.prepare('SELECT full_name, strikes FROM participants WHERE id = ?').get(id);
    if (!p) return res.status(404).json({ success: false, error: 'Participant not found' });

    const strikes = (p.strikes || 0) + 1;
    const nowTime = new Date().toTimeString().split(' ')[0];

    db.prepare(`
        UPDATE participants
        SET status = 'FLAGGED',
            strikes = ?,
            last_event = ?
        WHERE id = ?
    `).run(strikes, reason || 'Manually flagged by Coordinator', id);

    const eventId = `SEC-FLAG-${Date.now().toString().slice(-4)}`;
    db.prepare(`
        INSERT INTO proctoring_events (
            id, participant_id, participant_name, event_type, description, strike_count, status, timestamp, created_at
        ) VALUES (?, ?, ?, 'WINDOW_BLUR', ?, ?, 'FLAGGED', ?, ?)
    `).run(eventId, id, p.full_name || id, reason || 'Manually flagged by Coordinator', strikes, nowTime, Date.now());

    // Instant broadcast
    broadcast('participants_updated', getAllParticipantsFormatted());
    broadcast('security_event', {
        id: eventId,
        participantId: id,
        participantName: p.full_name || id,
        eventType: 'WINDOW_BLUR',
        description: reason || 'Manually flagged by Coordinator',
        strikeCount: strikes,
        status: 'FLAGGED',
        timestamp: nowTime,
    });

    return res.json({ success: true, message: `Participant ${id} flagged.` });
});

// ============================================================================
// 4. SUBMISSIONS & PYTHON CODE EVALUATION RECORDS
// ============================================================================

router.post('/submissions', (req, res) => {
    const {
        participantId,
        participantName,
        roundId,
        questionId,
        questionTitle,
        language,
        code,
        testResults,
        passedCount,
        totalTests,
        result,
        score,
        executionTimeMs,
    } = req.body || {};

    const id = participantId ? participantId.trim().toUpperCase() : null;
    if (!id) return res.status(400).json({ success: false, error: 'participantId required' });

    let p = ensureParticipant(id, { participantName, roundId, questionId });
    if (!p) return res.status(404).json({ success: false, error: 'Participant not found' });
    const pName = p ? p.full_name : (participantName || id);
    const subId = `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const nowIso = new Date().toISOString();

    const normalizedResult = result || (passedCount === totalTests ? 'PASSED' : 'FAILED');
    const awardedScore = Number(score) || (normalizedResult === 'PASSED' ? 10 : Math.round(((passedCount || 0) / (totalTests || 1)) * 10));

    db.prepare(`
        INSERT INTO submissions (
            id, participant_id, participant_name, round_id, question_id,
            language, code, test_results, passed_count, total_tests,
            result, score, execution_time_ms, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        subId,
        id,
        pName,
        roundId || 'R1',
        questionId || questionTitle || 'Q1',
        language || 'python',
        code || '',
        typeof testResults === 'string' ? testResults : JSON.stringify(testResults || []),
        passedCount || 0,
        totalTests || 0,
        normalizedResult,
        awardedScore,
        executionTimeMs || 0,
        nowIso
    );

    // Update participant score in DB
    if (p) {
        const roundField = (roundId || 'R1') === 'R1' ? 'round1_score' : (roundId === 'R2' ? 'round2_score' : 'round3_score');
        const newRoundScore = Math.min(100, (p[roundField] || 0) + awardedScore);
        const r1 = roundField === 'round1_score' ? newRoundScore : p.round1_score;
        const r2 = roundField === 'round2_score' ? newRoundScore : p.round2_score;
        const r3 = roundField === 'round3_score' ? newRoundScore : p.round3_score;
        const total = r1 + r2 + r3;

        db.prepare(`
            UPDATE participants
            SET ${roundField} = ?,
                score = ?,
                total_score = ?,
                last_event = ?
            WHERE id = ?
        `).run(newRoundScore, newRoundScore, total, `Submitted ${questionId || 'question'} (${normalizedResult})`, id);
    }

    const createdSubmission = {
        id: subId,
        participantId: id,
        participantName: pName,
        round: roundId || 'R1',
        question: questionId || questionTitle || 'Q1',
        submittedCode: code || '',
        code: code || '',
        result: normalizedResult,
        score: awardedScore,
        maxScore: 10,
        executionTime: `${executionTimeMs || 45}ms`,
        submissionTime: new Date(nowIso).toTimeString().split(' ')[0],
        testResults: typeof testResults === 'string' ? JSON.parse(testResults) : (testResults || []),
        terminalOutput: `[TechAstra Python Runtime v3.11.2]\nExecuted test suite: ${passedCount || 0}/${totalTests || 0} passed.\nStatus: ${normalizedResult} (score: +${awardedScore})\nFinished in ${executionTimeMs || 45}ms.`,
    };

    // Instant real-time broadcast to Admin Submissions log & Participant scores
    broadcast('submission_created', createdSubmission);
    broadcast('participants_updated', getAllParticipantsFormatted());

    return res.json({
        success: true,
        submissionId: subId,
        result: normalizedResult,
        score: awardedScore,
    });
});

router.get('/submissions', (req, res) => {
    return res.json({ success: true, submissions: getAllSubmissionsFormatted() });
});

router.get('/submissions/:id', (req, res) => {
    const s = db.prepare('SELECT * FROM submissions WHERE id = ?').get(req.params.id);
    if (!s) return res.status(404).json({ success: false, error: 'Submission not found' });
    return res.json({ success: true, submission: s });
});

// ============================================================================
// 5. ROUNDS CONFIGURATION & LEADERBOARD
// ============================================================================

router.get('/rounds', (req, res) => {
    return res.json({ success: true, rounds: getAllRoundsFormatted() });
});

const handleRoundUpdate = (req, res) => {
    const roundId = req.params.id.toUpperCase();
    const { cutoff, isActive } = req.body || {};

    const existing = db.prepare('SELECT * FROM rounds WHERE round_id = ?').get(roundId);
    if (!existing) return res.status(404).json({ success: false, error: 'Round not found' });

    if (cutoff !== undefined) {
        const validatedCutoff = Math.max(0, Math.min(existing.max_score, Number(cutoff)));
        db.prepare('UPDATE rounds SET cutoff = ? WHERE round_id = ?').run(validatedCutoff, roundId);
    }

    if (isActive !== undefined) {
        if (isActive) {
            db.prepare('UPDATE rounds SET is_active = 0').run();
            db.prepare('UPDATE rounds SET is_active = 1 WHERE round_id = ?').run(roundId);
        } else {
            db.prepare('UPDATE rounds SET is_active = 0 WHERE round_id = ?').run(roundId);
        }
    }

    // Real-time broadcast
    broadcast('rounds_updated', getAllRoundsFormatted());

    return res.json({ success: true, message: `Round ${roundId} updated.` });
};

// Master Clock Adjustment (Rounds or Global)
router.post('/rounds/adjust-timer', requireAdminAuth, (req, res) => {
    const { roundId, additionalSeconds, setSeconds } = req.body || {};
    const rId = (roundId || 'ALL').toUpperCase();

    if (setSeconds !== undefined) {
        const secs = Math.max(0, Number(setSeconds));
        if (rId === 'ALL') {
            db.prepare('UPDATE participants SET time_remaining = ?').run(secs);
        } else {
            db.prepare('UPDATE participants SET time_remaining = ? WHERE current_round = ?').run(secs, rId);
        }
        broadcast('round_timer_adjusted', { roundId: rId, setSeconds: secs });
    } else if (additionalSeconds !== undefined) {
        const delta = Number(additionalSeconds);
        if (rId === 'ALL') {
            db.prepare('UPDATE participants SET time_remaining = MAX(0, time_remaining + ?)').run(delta);
        } else {
            db.prepare('UPDATE participants SET time_remaining = MAX(0, time_remaining + ?) WHERE current_round = ?').run(delta, rId);
        }
        broadcast('round_timer_adjusted', { roundId: rId, additionalSeconds: delta });
    }

    broadcast('participants_updated', getAllParticipantsFormatted());
    return res.json({ success: true, message: `Timer adjusted for ${rId}.` });
});

router.put('/rounds/:id', requireAdminAuth, handleRoundUpdate);
router.post('/rounds/:id', requireAdminAuth, handleRoundUpdate);
router.put('/rounds/:id/cutoff', requireAdminAuth, handleRoundUpdate);
router.post('/rounds/:id/cutoff', requireAdminAuth, handleRoundUpdate);

// Individual Participant Timer Adjustment
router.post('/participants/:id/adjust-timer', requireAdminAuth, (req, res) => {
    const id = req.params.id ? req.params.id.trim().toUpperCase() : '';
    const { additionalSeconds, setSeconds } = req.body || {};
    const p = db.prepare('SELECT time_remaining FROM participants WHERE id = ?').get(id);
    if (!p) return res.status(404).json({ success: false, error: 'Participant not found' });

    let newTime = p.time_remaining;
    if (setSeconds !== undefined) {
        newTime = Math.max(0, Number(setSeconds));
    } else if (additionalSeconds !== undefined) {
        newTime = Math.max(0, p.time_remaining + Number(additionalSeconds));
    }

    db.prepare('UPDATE participants SET time_remaining = ? WHERE id = ?').run(newTime, id);
    broadcast('participant_timer_adjusted', { participantId: id, timeRemaining: newTime });
    broadcast('participants_updated', getAllParticipantsFormatted());
    return res.json({ success: true, timeRemaining: newTime });
});

// Reset Individual Participant Session (Pardon strikes, restore active status)
router.post('/participants/:id/reset-session', requireAdminAuth, (req, res) => {
    const id = req.params.id ? req.params.id.trim().toUpperCase() : '';
    const p = db.prepare('SELECT * FROM participants WHERE id = ?').get(id);
    if (!p) return res.status(404).json({ success: false, error: 'Participant not found' });

    db.prepare("UPDATE participants SET strikes = 0, status = 'ACTIVE', last_event = 'Session Restored by Admin' WHERE id = ?").run(id);
    db.prepare('DELETE FROM proctoring_events WHERE participant_id = ?').run(id);

    broadcast('session_reset', { participantId: id });
    broadcast('participant_reinstated', { participantId: id });
    broadcast('participants_updated', getAllParticipantsFormatted());
    broadcast('events_updated', getAllEventsFormatted());
    return res.json({ success: true, message: `Session reset for ${id}. Strikes cleared.` });
});

// Comprehensive System & Tournament Telemetry
router.get('/admin/system-stats', requireAdminAuth, (req, res) => {
    const totalParticipants = db.prepare('SELECT COUNT(*) as c FROM participants').get().c;
    const activeParticipants = db.prepare("SELECT COUNT(*) as c FROM participants WHERE status = 'ACTIVE'").get().c;
    const qualifiedParticipants = db.prepare("SELECT COUNT(*) as c FROM participants WHERE status = 'QUALIFIED'").get().c;
    const flaggedParticipants = db.prepare("SELECT COUNT(*) as c FROM participants WHERE status = 'FLAGGED' OR status = 'DISQUALIFIED' OR strikes >= 2").get().c;
    const totalSubmissions = db.prepare('SELECT COUNT(*) as c FROM submissions').get().c;
    const totalEvents = db.prepare('SELECT COUNT(*) as c FROM proctoring_events').get().c;

    const schedule = getCompetitionSchedule();

    return res.json({
        success: true,
        stats: {
            totalParticipants,
            activeParticipants,
            qualifiedParticipants,
            flaggedParticipants,
            totalSubmissions,
            totalEvents,
            sseClients: sseClients.size,
            eventEnded: schedule.isEnded,
            schedule,
            uptimeSeconds: Math.floor(process.uptime()),
            serverTime: new Date().toISOString()
        }
    });
});

router.get('/leaderboard', (req, res) => {
    let eventEnded = false;
    try {
        const configRow = db.prepare("SELECT value FROM competition_settings WHERE key = 'event_ended'").get();
        eventEnded = configRow ? configRow.value === '1' : false;
    } catch {}

    const rows = db.prepare(`
        SELECT id as participantId, full_name as name, college,
               round1_score as round1Score, round2_score as round2Score, round3_score as round3Score,
               total_score as totalScore, (2700 - time_remaining) as totalTimeUsedSeconds,
               status
        FROM participants
        ORDER BY total_score DESC, totalTimeUsedSeconds ASC
        LIMIT 55
    `).all();

    const ranked = rows.map((r, index) => {
        const isRevealed = r.status === 'COMPLETED' || eventEnded;
        return {
            rank: index + 1,
            participantId: r.participantId,
            name: r.name,
            college: r.college,
            round1Score: isRevealed ? r.round1Score : null,
            round2Score: isRevealed ? r.round2Score : null,
            round3Score: isRevealed ? r.round3Score : null,
            totalScore: isRevealed ? r.totalScore : null,
            totalTimeUsedSeconds: r.totalTimeUsedSeconds,
            status: r.status,
            isDemoData: false,
            eventEnded: isRevealed,
        };
    });

    return res.json({ success: true, leaderboard: ranked, eventEnded });
});

// Toggle Event Ended status (reveals / hides scores) (STRICTLY ADMIN AUTHENTICATED)
router.post('/admin/toggle-event-ended', requireAdminAuth, (req, res) => {
    const { eventEnded } = req.body || {};
    const val = eventEnded ? '1' : '0';
    db.prepare("INSERT OR REPLACE INTO competition_settings (key, value) VALUES ('event_ended', ?)").run(val);
    const schedule = getCompetitionSchedule();
    broadcast('event_ended_updated', { eventEnded: Boolean(eventEnded) });
    broadcast('schedule_updated', schedule);
    return res.json({ success: true, eventEnded: Boolean(eventEnded), schedule });
});

// Competition Schedule (Public view for contestants & arena terminals)
router.get('/competition/schedule', (req, res) => {
    return res.json({ success: true, schedule: getCompetitionSchedule() });
});

// Admin Update Competition Schedule (Strictly Admin Authenticated)
router.post('/admin/schedule', requireAdminAuth, (req, res) => {
    const { startTime, endTime, eventEnded } = req.body || {};
    if (startTime !== undefined) {
        db.prepare("INSERT OR REPLACE INTO competition_settings (key, value) VALUES ('event_start_time', ?)").run(String(startTime || ''));
    }
    if (endTime !== undefined) {
        db.prepare("INSERT OR REPLACE INTO competition_settings (key, value) VALUES ('event_end_time', ?)").run(String(endTime || ''));
    }
    if (eventEnded !== undefined) {
        db.prepare("INSERT OR REPLACE INTO competition_settings (key, value) VALUES ('event_ended', ?)").run(eventEnded ? '1' : '0');
    }
    const schedule = getCompetitionSchedule();
    broadcast('schedule_updated', schedule);
    return res.json({ success: true, message: 'Competition schedule updated successfully.', schedule });
});

// ============================================================================
// 6. ANNOUNCEMENTS
// ============================================================================

router.get('/announcements', (req, res) => {
    return res.json({ success: true, announcements: getAllAnnouncementsFormatted() });
});

router.post('/announcements', requireAdminAuth, (req, res) => {
    const { message, priority, targetRound } = req.body || {};
    if (!message || !message.trim()) return res.status(400).json({ success: false, error: 'Message is required' });

    const author = req.admin?.username || 'Chief Coordinator';
    const nowIso = new Date().toISOString();

    const runRes = db.prepare(`
        INSERT INTO announcements (message, priority, author, created_at)
        VALUES (?, ?, ?, ?)
    `).run(message.trim(), priority || 'NORMAL', author, nowIso);

    const createdAnnouncement = {
        id: `ANN-${runRes.lastInsertRowid}`,
        message: message.trim(),
        timestamp: new Date().toTimeString().split(' ')[0],
        author,
        roundTarget: targetRound || 'ALL',
        broadcasted: true,
    };

    // Instant real-time broadcast
    broadcast('announcement_created', createdAnnouncement);

    return res.json({ success: true, announcement: createdAnnouncement });
});

// ============================================================================
// 7. COMPREHENSIVE DATABASE RESET / AUDIT PURGE (COORDINATOR ACCESS)
// ============================================================================

router.get('/admin/database-stats', requireAdminAuth, (req, res) => {
    try {
        const participantsCount = db.prepare('SELECT COUNT(*) as c FROM participants').get().c;
        const activeParticipants = db.prepare("SELECT COUNT(*) as c FROM participants WHERE status = 'ACTIVE'").get().c;
        const submissionsCount = db.prepare('SELECT COUNT(*) as c FROM submissions').get().c;
        const proctoringEventsCount = db.prepare('SELECT COUNT(*) as c FROM proctoring_events').get().c;
        const sessionsCount = db.prepare('SELECT COUNT(*) as c FROM participant_sessions').get().c;
        let liveScreensCount = 0;
        try { liveScreensCount = db.prepare('SELECT COUNT(*) as c FROM live_screens').get().c; } catch (e) {}
        const announcementsCount = db.prepare('SELECT COUNT(*) as c FROM announcements').get().c;

        return res.json({
            success: true,
            stats: {
                participantsCount,
                activeParticipants,
                submissionsCount,
                proctoringEventsCount,
                sessionsCount,
                liveScreensCount,
                announcementsCount,
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

function executeDatabaseReset(options = {}) {
    const mode = options.mode || 'full'; // 'full' | 'sessions_only' | 'clean_slate' | 'seed_only'
    const seedRoster = options.seedRoster !== false;

    if (mode === 'seed_only') {
        const seeded = seedOfficialRosterToDb();
        return {
            mode,
            message: `Successfully seeded/restored ${seeded} official contestants into the database.`,
            seededCount: seeded
        };
    }

    if (mode === 'sessions_only') {
        // Soft reset: Keep enrolled contestants, wipe telemetry & active test sessions
        db.prepare('DELETE FROM submissions').run();
        db.prepare('DELETE FROM proctoring_events').run();
        db.prepare('DELETE FROM participant_sessions').run();
        try { db.prepare('DELETE FROM live_screens').run(); } catch (e) {}

        // Reset participant scores and strikes
        db.prepare(`
            UPDATE participants SET
                score = 0,
                total_score = 0,
                round1_score = 0,
                round2_score = 0,
                round3_score = 0,
                strikes = 0,
                status = 'ACTIVE',
                current_round = 'R1',
                current_question = 'Q1',
                time_remaining = 1200,
                last_event = 'Session reset by coordinator'
        `).run();

        db.prepare('UPDATE rounds SET is_active = 0').run();
        db.prepare("UPDATE rounds SET is_active = 1 WHERE round_id = 'R1'").run();

        return {
            mode,
            message: 'All participant submissions, strikes, sessions, and screens have been reset to Round 1 (0 points). Roster retained.'
        };
    }

    // Default 'full' or 'clean_slate':
    db.prepare('DELETE FROM submissions').run();
    db.prepare('DELETE FROM proctoring_events').run();
    db.prepare('DELETE FROM participant_sessions').run();
    db.prepare('DELETE FROM announcements').run();
    try { db.prepare('DELETE FROM live_screens').run(); } catch (e) {}
    try { db.prepare('DELETE FROM inquiries').run(); } catch (e) {}

    db.prepare('UPDATE rounds SET is_active = 0').run();
    db.prepare("UPDATE rounds SET is_active = 1 WHERE round_id = 'R1'").run();
    try {
        db.prepare("UPDATE competition_settings SET value = '0' WHERE key = 'event_ended'").run();
    } catch (e) {}

    let seededCount = 0;
    if (mode === 'clean_slate') {
        // Pristine empty state — contestants only enter upon login/signup
        db.prepare('DELETE FROM participants').run();
    } else {
        // Full reset with official seed roster
        db.prepare('DELETE FROM participants').run();
        if (seedRoster) {
            seededCount = seedOfficialRosterToDb();
        }
    }

    return {
        mode,
        message: mode === 'clean_slate'
            ? 'Database completely wiped to clean slate. Contestants will enter database upon login or sign-up.'
            : `Full database reset complete! Seeded ${seededCount} official verified contestants (including SYM2026-0038 Karthik Raman).`,
        seededCount
    };
}

router.post('/admin/reset-database', requireAdminAuth, (req, res) => {
    try {
        const result = executeDatabaseReset(req.body);

        // Broadcast reset events via SSE
        broadcast('reset_contest', {});
        broadcast('participants_updated', getAllParticipantsFormatted());
        broadcast('submissions_updated', []);
        broadcast('events_updated', []);
        broadcast('rounds_updated', getAllRoundsFormatted());
        broadcast('announcements_updated', []);

        console.log(`[Admin Security] Database reset executed by coordinator (${result.mode})`);
        return res.json({ success: true, ...result });
    } catch (err) {
        console.error('[Admin Security] Database reset failed:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/admin/reset-contest', requireAdminAuth, (req, res) => {
    try {
        const mode = req.body?.mode || (req.body?.hardReset ? 'clean_slate' : 'full');
        const result = executeDatabaseReset({ mode, seedRoster: true });

        broadcast('reset_contest', {});
        broadcast('participants_updated', getAllParticipantsFormatted());
        broadcast('submissions_updated', []);
        broadcast('events_updated', []);
        broadcast('rounds_updated', getAllRoundsFormatted());
        broadcast('announcements_updated', []);

        return res.json({ success: true, ...result });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
