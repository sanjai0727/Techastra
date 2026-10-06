// ============================================================================
// TECHASTRA 2026 — SQLite PERSISTENT DATABASE ENGINE
// Powered by Node.js native DatabaseSync (node:sqlite)
// Zero external binary dependencies, production-ready ACID persistence.
// ============================================================================

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure data directory exists
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'techastra.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for high-performance concurrent writes
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Password hashing helper using crypto PBKDF2
function hashPassword(password, salt = null) {
    if (!salt) {
        salt = crypto.randomBytes(16).toString('hex');
    }
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
    if (!storedHash || !storedHash.includes(':')) return false;
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash));
}

// Initialize Tables Schema
function initSchema() {
    db.exec(`
        -- Administrator Accounts
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'ADMINISTRATOR',
            created_at TEXT NOT NULL
        );

        -- Active Admin Sessions
        CREATE TABLE IF NOT EXISTS admin_sessions (
            token TEXT PRIMARY KEY,
            admin_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            last_active INTEGER NOT NULL,
            FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
        );

        -- Official Participants (Strict 55 Maximum Capacity)
        CREATE TABLE IF NOT EXISTS participants (
            id TEXT PRIMARY KEY,
            slot_number INTEGER UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            college TEXT NOT NULL,
            department TEXT NOT NULL,
            year TEXT NOT NULL,
            current_round TEXT NOT NULL DEFAULT 'R1',
            current_question TEXT NOT NULL DEFAULT 'Q1',
            score INTEGER NOT NULL DEFAULT 0,
            total_score INTEGER NOT NULL DEFAULT 0,
            round1_score INTEGER NOT NULL DEFAULT 0,
            round2_score INTEGER NOT NULL DEFAULT 0,
            round3_score INTEGER NOT NULL DEFAULT 0,
            time_remaining INTEGER NOT NULL DEFAULT 2700,
            status TEXT NOT NULL DEFAULT 'ACTIVE',
            strikes INTEGER NOT NULL DEFAULT 0,
            last_event TEXT NOT NULL DEFAULT 'Registered & Ready',
            last_seen INTEGER NOT NULL,
            registered_at TEXT NOT NULL
        );

        -- Participant Sessions
        CREATE TABLE IF NOT EXISTS participant_sessions (
            token TEXT PRIMARY KEY,
            participant_id TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            last_active INTEGER NOT NULL,
            FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
        );

        -- Competition Rounds Configuration
        CREATE TABLE IF NOT EXISTS rounds (
            round_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            title TEXT NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 0,
            cutoff INTEGER NOT NULL DEFAULT 50,
            max_score INTEGER NOT NULL DEFAULT 100,
            time_limit_minutes INTEGER NOT NULL DEFAULT 45,
            total_questions INTEGER NOT NULL DEFAULT 8,
            description TEXT NOT NULL
        );

        -- Real Participant Code Submissions
        CREATE TABLE IF NOT EXISTS submissions (
            id TEXT PRIMARY KEY,
            participant_id TEXT NOT NULL,
            participant_name TEXT NOT NULL,
            round_id TEXT NOT NULL,
            question_id TEXT NOT NULL,
            language TEXT NOT NULL DEFAULT 'python',
            code TEXT NOT NULL,
            test_results TEXT NOT NULL,
            passed_count INTEGER NOT NULL DEFAULT 0,
            total_tests INTEGER NOT NULL DEFAULT 0,
            result TEXT NOT NULL,
            score INTEGER NOT NULL DEFAULT 0,
            execution_time_ms INTEGER NOT NULL DEFAULT 0,
            submitted_at TEXT NOT NULL,
            FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
        );

        -- Live Proctoring & Security Audit Log
        CREATE TABLE IF NOT EXISTS proctoring_events (
            id TEXT PRIMARY KEY,
            participant_id TEXT NOT NULL,
            participant_name TEXT NOT NULL,
            event_type TEXT NOT NULL,
            description TEXT NOT NULL,
            strike_count INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'WARNING',
            timestamp TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
        );

        -- Real-Time Participant Workstation Screen & Live Code Edits
        CREATE TABLE IF NOT EXISTS live_screens (
            participant_id TEXT PRIMARY KEY,
            participant_name TEXT NOT NULL,
            round_id TEXT NOT NULL,
            question_id TEXT NOT NULL,
            question_title TEXT NOT NULL,
            code TEXT NOT NULL,
            time_remaining INTEGER NOT NULL,
            last_keystroke_at INTEGER NOT NULL,
            FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
        );

        -- Official System Announcements
        CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT NOT NULL,
            priority TEXT NOT NULL DEFAULT 'NORMAL',
            author TEXT NOT NULL DEFAULT 'SYSTEM',
            created_at TEXT NOT NULL
        );

        -- Competition Global Settings
        CREATE TABLE IF NOT EXISTS competition_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
    `);

    // Ensure event_ended flag defaults to 0 (scores hidden until event ends)
    const checkEventEnded = db.prepare("SELECT value FROM competition_settings WHERE key = 'event_ended'").get();
    if (!checkEventEnded) {
        db.prepare("INSERT INTO competition_settings (key, value) VALUES ('event_ended', '0')").run();
    }

    // Seed default Admin if not exists
    const checkAdmin = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
    if (!checkAdmin) {
        const defaultPass = process.env.ADMIN_PASSKEY || 'techastra2026';
        const defaultUser = process.env.ADMIN_ID || 'admin';
        const hashedPassword = hashPassword(defaultPass);
        db.prepare(`
            INSERT INTO admins (username, password_hash, name, role, created_at)
            VALUES (?, ?, ?, ?, ?)
        `).run(defaultUser, hashedPassword, 'Chief Event Coordinator', 'ADMINISTRATOR', new Date().toISOString());
        console.log(`[DB] Initialized default admin user: ${defaultUser}`);
    }

    // Seed Rounds configuration if not exists
    const countRounds = db.prepare('SELECT COUNT(*) as count FROM rounds').get();
    if (countRounds.count === 0) {
        const seedRounds = [
            {
                round_id: 'R1',
                name: 'Round 1',
                title: 'Syntax & Exception Triage',
                is_active: 1,
                cutoff: 50,
                max_score: 100,
                time_limit_minutes: 45,
                total_questions: 8,
                description: 'Fast-paced syntax error identification, type mismatch repair, and exception handling triage under pressure.',
            },
            {
                round_id: 'R2',
                name: 'Round 2',
                title: 'Logic & Edge Case Debugging',
                is_active: 0,
                cutoff: 50,
                max_score: 100,
                time_limit_minutes: 45,
                total_questions: 6,
                description: 'Resolving subtle off-by-one errors, recursion limits, boundary condition anomalies, and race conditions.',
            },
            {
                round_id: 'R3',
                name: 'Round 3',
                title: 'High Stakes Algorithm Repair',
                is_active: 0,
                cutoff: 0,
                max_score: 100,
                time_limit_minutes: 30,
                total_questions: 4,
                description: 'Complex algorithmic corruption repair: graph algorithms, dynamic programming optimizations, and memory leak mitigation.',
            },
        ];

        const insertRound = db.prepare(`
            INSERT INTO rounds (round_id, name, title, is_active, cutoff, max_score, time_limit_minutes, total_questions, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const r of seedRounds) {
            insertRound.run(
                r.round_id,
                r.name,
                r.title,
                r.is_active,
                r.cutoff,
                r.max_score,
                r.time_limit_minutes,
                r.total_questions,
                r.description
            );
        }
        console.log('[DB] Initialized competition rounds schema.');
    }
}

initSchema();

module.exports = {
    db,
    hashPassword,
    verifyPassword,
};
