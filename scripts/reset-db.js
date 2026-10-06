/**
 * Techastra 2026 — SQLite Database Reset Utility
 * Clears all contestant dossiers, sessions, submissions, live screens, and proctor logs.
 */

const { db } = require('../server/db');

console.log('[Reset] Resetting Techastra contest database...');

try {
  db.exec(`
    DELETE FROM participants;
    DELETE FROM participant_sessions;
    DELETE FROM submissions;
    DELETE FROM proctoring_events;
    DELETE FROM live_screens;
  `);
  console.log('[Reset] ✅ All participant dossiers, submissions, live screens, and logs successfully wiped.');
} catch (err) {
  console.error('[Reset] ❌ Database reset error:', err.message);
  process.exit(1);
}
