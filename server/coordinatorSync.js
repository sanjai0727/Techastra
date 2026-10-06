/**
 * Techastra 2026 — Live Coordinator Portal Synchronization Service
 * Interfaces with official Dr. M.G.R. Educational and Research Institute
 * Symposium Registration Portal: https://techastra.drmgrdu.ac.in/coordinator
 */

const { db } = require('./db');

const PORTAL_URL = 'https://techastra.drmgrdu.ac.in';
const COORD_EMAIL = 'coderescue@techastra.drmgrdu.ac.in';
const COORD_PASS = 'TechDay26';
const EVENT_ID = 'cmuonpoxv000423pyjg18i3lk'; // Official Code Rescue Event ID

let cachedToken = null;
let tokenExpiresAt = 0;
let lastSyncTime = null;
let lastSyncStatus = 'INITIALIZING';
let liveRosterCache = [];

/**
 * Authenticate with the official Techastra Portal as Event Coordinator
 */
async function authenticateCoordinator() {
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  try {
    const res = await fetch(`${PORTAL_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Techastra-CodeRescue-Workstation/1.0'
      },
      body: JSON.stringify({
        email: COORD_EMAIL,
        password: COORD_PASS
      })
    });

    if (!res.ok) {
      throw new Error(`Login failed with HTTP status ${res.status}`);
    }

    const data = await res.json();
    if (!data.token) {
      throw new Error('No JWT token returned from portal login.');
    }

    cachedToken = data.token;
    // Tokens usually valid for 12 hours
    tokenExpiresAt = Date.now() + (10 * 60 * 60 * 1000);
    return cachedToken;
  } catch (err) {
    console.error('[Portal Sync] Authentication error:', err.message);
    throw err;
  }
}

/**
 * Fetch live registered contestants from the official Coordinator Portal
 */
async function fetchLiveRoster() {
  const token = await authenticateCoordinator();

  const res = await fetch(`${PORTAL_URL}/api/attendance/event/${EVENT_ID}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch event attendance (HTTP ${res.status})`);
  }

  const data = await res.json();
  const roster = Array.isArray(data.roster) ? data.roster : [];
  liveRosterCache = roster;
  lastSyncTime = new Date().toISOString();
  lastSyncStatus = 'SYNCED_OK';

  return roster;
}

/**
 * Synchronize live portal roster into local SQLite participants table
 */
async function syncRosterToDatabase() {
  try {
    const roster = await fetchLiveRoster();
    console.log(`[Portal Sync] Synchronizing ${roster.length} contestants from Dr. M.G.R. Portal...`);

    const nowMs = Date.now();
    const nowIso = new Date().toISOString();

    const insertOrIgnore = db.prepare(`
      INSERT INTO participants (
        id, slot_number, full_name, college, department, year,
        current_round, current_question, score, total_score,
        round1_score, round2_score, round3_score, time_remaining,
        status, strikes, last_event, last_seen, registered_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'R1', 'Q1', 0, 0, 0, 0, 0, 1200, 'ACTIVE', 0, 'Synced from Official Portal', ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        full_name = excluded.full_name,
        college = excluded.college
    `);

    let importedCount = 0;
    for (const item of roster) {
      const code = item.registrationCode || item.registrationId;
      if (!code) continue;

      // Extract slot number from code (e.g. SYM2026-0036 -> 36)
      const numMatch = code.match(/(\d+)$/);
      const slotNum = numMatch ? parseInt(numMatch[1], 10) : (importedCount + 1);

      insertOrIgnore.run(
        code.trim().toUpperCase(),
        slotNum,
        item.name || `Contestant ${code}`,
        item.college || 'Engineering College',
        'Computer Science and Engineering',
        'Senior Engineering',
        nowMs,
        nowIso
      );
      importedCount++;
    }

    console.log(`[Portal Sync] ✅ Successfully upserted ${importedCount} live contestants into SQLite.`);
    return {
      success: true,
      syncedCount: importedCount,
      roster: roster,
      lastSyncTime
    };
  } catch (err) {
    lastSyncStatus = `ERROR: ${err.message}`;
    console.error('[Portal Sync] Sync failed:', err.message);
    return {
      success: false,
      error: err.message,
      lastSyncTime
    };
  }
}

/**
 * Mark a contestant as present on the official Coordinator Portal
 */
async function markAttendanceOnPortal(registrationId) {
  try {
    const token = await authenticateCoordinator();
    const res = await fetch(`${PORTAL_URL}/api/attendance/manual`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        registrationId,
        eventId: EVENT_ID
      })
    });
    return res.ok;
  } catch (err) {
    console.error('[Portal Sync] Failed to mark attendance on portal:', err.message);
    return false;
  }
}

module.exports = {
  fetchLiveRoster,
  syncRosterToDatabase,
  markAttendanceOnPortal,
  getSyncStatus: () => ({
    status: lastSyncStatus,
    lastSyncTime,
    cachedCount: liveRosterCache.length,
    portalUrl: PORTAL_URL,
    eventId: EVENT_ID
  })
};
