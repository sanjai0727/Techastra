/**
 * Techastra 2026 — SQLite Database Reset Utility
 * Clears all contestant dossiers, sessions, submissions, live screens, announcements, inquiries, and proctor logs.
 * Ensures the database starts in a pristine state where contestants only enter the database upon login or sign-up.
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
    DELETE FROM announcements;
    DELETE FROM inquiries;
    UPDATE rounds SET is_active = 0;
    UPDATE rounds SET is_active = 1 WHERE round_id = 'R1';
    UPDATE competition_settings SET value = '0' WHERE key = 'event_ended';
  `);
  console.log('[Reset] ✅ All participant dossiers, sessions, submissions, screens, and logs successfully wiped.');
  console.log('[Reset] 🔒 Database is now clean: participants will only be created when they actually log in or sign up.');
} catch (err) {
  console.error('[Reset] ❌ Database reset error:', err.message);
  process.exit(1);
}
