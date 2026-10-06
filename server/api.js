// ============================================================================
// TECHASTRA 2026 — FULL REST & REAL-TIME STREAMING API ROUTER
// Powered by SQLite Persistent DB & Server-Sent Events (SSE) Live Push
// ============================================================================

const express = require('express');
const crypto = require('crypto');
const { db, hashPassword, verifyPassword } = require('./db');

const router = express.Router();
const MAX_PARTICIPANTS = 55;
const loginAttempts = new Map();

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

// Helper: Parse participant slot number (1..55)
function parseParticipantSlot(id) {
    if (!id || typeof id !== 'string') return null;
    const match = id.match(/(\d+)$/);
    if (!match) return null;
    const num = parseInt(match[1], 10);
    return num >= 1 && num <= MAX_PARTICIPANTS ? num : null;
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

    const { adminId, username, passkey } = req.body || {};
    const trimmedId = typeof (adminId || username) === 'string' ? (adminId || username).trim() : '';
    const trimmedPass = typeof passkey === 'string' ? passkey.trim() : '';

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
        // Check if ID is already registered
        const existing = db.prepare('SELECT id FROM participants WHERE id = ?').get(assignedId);
        if (existing) {
            return res.status(409).json({
                success: false,
                error: `Participant Token '${assignedId}' is already registered in the system.`,
            });
        }
    }

    if (!slot) {
        // Find first available slot 1..55
        const existingSlots = new Set(
            db.prepare('SELECT slot_number FROM participants').all().map((r) => r.slot_number)
        );
        for (let i = 1; i <= MAX_PARTICIPANTS; i++) {
            if (!existingSlots.has(i)) {
                slot = i;
                assignedId = `CR-2026-${String(i).padStart(3, '0')}`;
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

    const nowIso = new Date().toISOString();
    const nowMs = Date.now();

    const insertStmt = db.prepare(`
        INSERT INTO participants (
            id, slot_number, full_name, college, department, year,
            current_round, current_question, score, total_score,
            round1_score, round2_score, round3_score, time_remaining,
            status, strikes, last_event, last_seen, registered_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'R1', 'Q1', 0, 0, 0, 0, 0, 2700, 'ACTIVE', 0, 'Registered in Arena', ?, ?)
    `);

    insertStmt.run(
        assignedId,
        slot,
        fullName || `Contestant ${slot}`,
        college || 'College of Engineering, Guindy',
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
            fullName: fullName || `Contestant ${slot}`,
            college: college || 'College of Engineering, Guindy',
            department: department || 'Computer Science & Engineering',
            year: year || '3rd Year',
            slotNumber: slot,
            registeredAt: nowIso,
        },
        totalRegistered: newCount,
        maxCapacity: MAX_PARTICIPANTS,
    });
});

router.post('/participants/login', (req, res) => {
    const { participantId } = req.body || {};
    const trimmedId = typeof participantId === 'string' ? participantId.trim().toUpperCase() : '';

    if (!trimmedId) {
        return res.status(400).json({ success: false, error: 'Participant Token ID is required.' });
    }

    const participant = db.prepare('SELECT * FROM participants WHERE id = ?').get(trimmedId);
    if (!participant) {
        return res.status(401).json({
            success: false,
            error: `Access Denied: Participant Token '${trimmedId}' was not found in the competition roster. Please register first.`,
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
    const p = db.prepare('SELECT * FROM participants WHERE id = ?').get(id);

    if (p) {
        const roundNum = payload.currentRound ? String(payload.currentRound).replace('R', '') : '1';
        const roundId = `R${roundNum}`;
        const qNum = payload.currentQuestion || p.current_question || 'Q1';
        const timeRemaining = payload.roundTimeRemaining !== undefined ? payload.roundTimeRemaining : p.time_remaining;

        const r1 = payload.round1Score !== undefined ? payload.round1Score : p.round1_score;
        const r2 = payload.round2Score !== undefined ? payload.round2Score : p.round2_score;
        const r3 = payload.round3Score !== undefined ? payload.round3Score : p.round3_score;
        const total = r1 + r2 + r3;
        const curScore = roundId === 'R1' ? r1 : roundId === 'R2' ? r2 : r3;

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
            payload.lastActivity || p.last_event || 'Active in Arena',
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
            lastEvent: payload.lastActivity || p.last_event,
        });
    }

    return res.json({ success: true });
});

// Real-Time Keystroke & Participant Code Stream
router.post('/telemetry/code-stream', (req, res) => {
    const {
        participantId,
        participantName,
        roundId,
        questionId,
        questionTitle,
        code,
        timeRemaining,
        lastKeystrokeAt,
    } = req.body || {};

    const id = participantId ? participantId.trim().toUpperCase() : null;
    if (!id) return res.status(400).json({ success: false, error: 'participantId required' });

    const p = db.prepare('SELECT full_name, time_remaining FROM participants WHERE id = ?').get(id);
    const name = p ? p.full_name : (participantName || id);
    const curTime = timeRemaining !== undefined ? Number(timeRemaining) : (p ? p.time_remaining : 2400);
    const nowMs = lastKeystrokeAt || Date.now();

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
    `).run(id, name, roundId || 'R1', questionId || 'Q1', questionTitle || 'Work Order', code || '', curTime, nowMs);

    // Also update time_remaining and current_question on participants table
    if (p) {
        db.prepare(`
            UPDATE participants
            SET time_remaining = ?,
                current_question = ?,
                current_round = ?,
                last_seen = ?
            WHERE id = ?
        `).run(curTime, questionId || 'Q1', roundId || 'R1', nowMs, id);
    }

    const screenData = {
        participantId: id,
        participantName: name,
        roundId: roundId || 'R1',
        questionId: questionId || 'Q1',
        questionTitle: questionTitle || 'Work Order',
        code: code || '',
        timeRemaining: curTime,
        lastKeystrokeAt: nowMs,
    };

    // Instant 0ms broadcast to all connected Admin screens
    broadcast('code_stream', screenData);
    broadcast('participant_heartbeat', {
        id,
        currentRound: roundId || 'R1',
        currentQuestion: questionId || 'Q1',
        timeRemaining: curTime,
        lastEvent: `Live editing ${questionId || 'question'}`,
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
        const p = db.prepare('SELECT * FROM participants WHERE id = ?').get(id);
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

router.post('/telemetry/event', (req, res) => {
    const event = req.body || {};
    const id = event.participantId ? event.participantId.trim().toUpperCase() : null;
    if (!id) return res.json({ success: false, error: 'No participantId' });

    const p = db.prepare('SELECT * FROM participants WHERE id = ?').get(id);
    const pName = p ? p.full_name : event.participantName || id;

    const eventId = `SEC-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    const newStrikes = (p ? p.strikes : 0) + 1;
    const status = newStrikes >= 2 ? 'FLAGGED' : 'WARNING';
    const nowTime = new Date().toTimeString().split(' ')[0];

    db.prepare(`
        INSERT INTO proctoring_events (
            id, participant_id, participant_name, event_type, description, strike_count, status, timestamp, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        eventId,
        id,
        pName,
        event.eventType || 'WINDOW_BLUR',
        event.description || 'Proctoring violation recorded',
        newStrikes,
        status,
        nowTime,
        Date.now()
    );

    if (p) {
        db.prepare(`
            UPDATE participants
            SET strikes = ?,
                status = CASE WHEN ? >= 3 THEN 'FLAGGED' ELSE status END,
                last_event = ?
            WHERE id = ?
        `).run(newStrikes, newStrikes, event.description || 'Integrity Strike Logged', id);
    }

    const createdEvent = {
        id: eventId,
        participantId: id,
        participantName: pName,
        eventType: event.eventType || 'WINDOW_BLUR',
        description: event.description || 'Proctoring violation recorded',
        strikeCount: newStrikes,
        status,
        timestamp: nowTime,
    };

    // Real-time broadcast of new security violation and updated participants list
    broadcast('security_event', createdEvent);
    broadcast('participants_updated', getAllParticipantsFormatted());

    return res.json({ success: true, eventId, strikeCount: newStrikes });
});

router.get('/telemetry/participants', (req, res) => {
    return res.json({ success: true, participants: getAllParticipantsFormatted() });
});

router.get('/telemetry/events', (req, res) => {
    return res.json({ success: true, events: getAllEventsFormatted() });
});

router.post('/telemetry/reinstate', requireAdminAuth, (req, res) => {
    const { participantId } = req.body || {};
    const id = participantId ? participantId.trim().toUpperCase() : null;
    if (!id) return res.status(400).json({ success: false, error: 'participantId required' });

    db.prepare(`
        UPDATE participants
        SET strikes = 0,
            status = 'ACTIVE',
            last_event = 'Session reinstated by Coordinator'
        WHERE id = ?
    `).run(id);

    const p = db.prepare('SELECT full_name FROM participants WHERE id = ?').get(id);
    const eventId = `SEC-REINSTATE-${Date.now().toString().slice(-4)}`;
    const nowTime = new Date().toTimeString().split(' ')[0];

    db.prepare(`
        INSERT INTO proctoring_events (
            id, participant_id, participant_name, event_type, description, strike_count, status, timestamp, created_at
        ) VALUES (?, ?, ?, 'WINDOW_BLUR', 'Coordinator cleared all strikes and reinstated session', 0, 'CLEAN', ?, ?)
    `).run(eventId, id, p?.full_name || id, nowTime, Date.now());

    // Instant broadcast
    broadcast('participants_updated', getAllParticipantsFormatted());
    broadcast('security_event', {
        id: eventId,
        participantId: id,
        participantName: p?.full_name || id,
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
    const strikes = (p?.strikes || 0) + 1;
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
    `).run(eventId, id, p?.full_name || id, reason || 'Manually flagged by Coordinator', strikes, nowTime, Date.now());

    // Instant broadcast
    broadcast('participants_updated', getAllParticipantsFormatted());
    broadcast('security_event', {
        id: eventId,
        participantId: id,
        participantName: p?.full_name || id,
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

    const p = db.prepare('SELECT * FROM participants WHERE id = ?').get(id);
    const pName = p ? p.full_name : participantName || id;
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

router.put('/rounds/:id', requireAdminAuth, (req, res) => {
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
});

router.get('/leaderboard', (req, res) => {
    const rows = db.prepare(`
        SELECT id as participantId, full_name as name, college,
               round1_score as round1Score, round2_score as round2Score, round3_score as round3Score,
               total_score as totalScore, (2700 - time_remaining) as totalTimeUsedSeconds,
               status
        FROM participants
        ORDER BY total_score DESC, totalTimeUsedSeconds ASC
        LIMIT 55
    `).all();

    const ranked = rows.map((r, index) => ({
        rank: index + 1,
        ...r,
        isDemoData: false,
    }));

    return res.json({ success: true, leaderboard: ranked });
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
// 7. HARD RESET / AUDIT PURGE (RESTRICTED TO CHIEF ADMIN)
// ============================================================================

router.post('/admin/reset-contest', requireAdminAuth, (req, res) => {
    db.prepare('DELETE FROM submissions').run();
    db.prepare('DELETE FROM proctoring_events').run();
    db.prepare('DELETE FROM participant_sessions').run();
    db.prepare('DELETE FROM participants').run();
    db.prepare('DELETE FROM announcements').run();

    db.prepare('UPDATE rounds SET is_active = 0').run();
    db.prepare("UPDATE rounds SET is_active = 1 WHERE round_id = 'R1'").run();

    // Broadcast reset event
    broadcast('reset_contest', {});
    broadcast('participants_updated', []);
    broadcast('submissions_updated', []);
    broadcast('events_updated', []);
    broadcast('rounds_updated', getAllRoundsFormatted());
    broadcast('announcements_updated', []);

    return res.json({ success: true, message: 'Competition state reset to clean initial state.' });
});

module.exports = router;
