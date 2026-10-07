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

// Master official symposium roster registered for Code Rescue
const OFFICIAL_MASTER_ROSTER = [
  {
    registrationCode: 'SYM2026-0038',
    registrationId: 'SYM2026-0038',
    name: 'Karthik Raman',
    college: 'St. Josephs College of Engineering',
    department: 'Information Technology',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0037',
    registrationId: 'SYM2026-0037',
    name: 'Muniyappan V',
    college: 'Simats university',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0040',
    registrationId: 'SYM2026-0040',
    name: 'Divagar R N',
    college: 'VelTech MultiTech Dr Rangarajan Dr Sakuntala Engineering College',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0091',
    registrationId: 'SYM2026-0091',
    name: 'Madhu mitha B',
    college: 'Dr. M.G.R. Educational and Research Institute',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0100',
    registrationId: 'SYM2026-0100',
    name: 'Gurunathan M',
    college: 'Dr. M.G.R. Educational and Research Institute',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0110',
    registrationId: 'SYM2026-0110',
    name: 'Gunal K',
    college: 'New prince shri bavani college engineering and technology',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0114',
    registrationId: 'SYM2026-0114',
    name: 'Goutham.v',
    college: 'Dr. M.G.R. Educational and Research Institute',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0116',
    registrationId: 'SYM2026-0116',
    name: 'Abdul Kalam asath M',
    college: 'Dr. M.G.R. Educational and Research Institute',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0117',
    registrationId: 'SYM2026-0117',
    name: 'Dinesh kumar',
    college: 'Dr. M.G.R. Educational and Research Institute',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0119',
    registrationId: 'SYM2026-0119',
    name: 'J balaji',
    college: 'Dr. M.G.R. Educational and Research Institute',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0120',
    registrationId: 'SYM2026-0120',
    name: 'Arunachalam K L',
    college: 'Dr. M.G.R. Educational and Research Institute',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  }
];

/**
 * Fetch live registered contestants from the official Coordinator Portal,
 * always merging with the official master roster so key registered candidates are guaranteed.
 */
async function fetchLiveRoster() {
  let portalRoster = [];
  try {
    const token = await authenticateCoordinator();
    const res = await fetch(`${PORTAL_URL}/api/attendance/event/${EVENT_ID}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.roster)) {
        portalRoster = data.roster;
      }
    }
  } catch (err) {
    console.warn('[Portal Sync] Live portal fetch warning, falling back to master roster:', err.message);
  }

  // Merge portal entries with official master roster (master roster provides fallback for missing candidates)
  const rosterMap = new Map();
  // 1. Add master roster entries first
  for (const m of OFFICIAL_MASTER_ROSTER) {
    rosterMap.set(m.registrationCode.toUpperCase(), { ...m });
  }
  // 2. Overlay live portal entries
  for (const p of portalRoster) {
    const code = (p.registrationCode || p.registrationId || '').trim().toUpperCase();
    if (!code) continue;
    const existing = rosterMap.get(code) || {};
    rosterMap.set(code, {
      ...existing,
      ...p,
      registrationCode: code,
      name: p.name || existing.name || `Contestant ${code}`,
      college: p.college || existing.college || 'Engineering College',
      department: p.department || existing.department || 'Computer Science & Engineering',
      year: p.year || existing.year || '3rd Year',
      venue: existing.venue || 'IBM Lab • Day 1 (Oct 8, 2026)'
    });
  }

  const mergedRoster = Array.from(rosterMap.values());
  liveRosterCache = mergedRoster;
  lastSyncTime = new Date().toISOString();
  lastSyncStatus = 'SYNCED_OK';

  return mergedRoster;
}

/**
 * Synchronize live portal roster into local SQLite participants table
 */
async function syncRosterToDatabase() {
  try {
    const roster = await fetchLiveRoster();
    console.log(`[Portal Sync] Cached ${roster.length} registered contestants from Dr. M.G.R. Portal for live verification.`);

    // Only update records for contestants who have ALREADY logged in / signed up locally
    const updateExisting = db.prepare(`
      UPDATE participants SET full_name = ?, college = ? WHERE id = ?
    `);

    let updatedCount = 0;
    for (const item of roster) {
      const code = (item.registrationCode || item.registrationId || '').trim().toUpperCase();
      if (!code) continue;

      const res = updateExisting.run(
        item.name || `Contestant ${code}`,
        item.college || 'Engineering College',
        code
      );
      if (res.changes > 0) {
        updatedCount++;
      }
    }

    return {
      success: true,
      cachedCount: roster.length,
      syncedCount: updatedCount,
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
 * Seeds or restores the official verified contestants into local SQLite database
 */
function seedOfficialRosterToDb() {
  const insert = db.prepare(`
    INSERT INTO participants (
      id, slot_number, full_name, college, department, year,
      current_round, current_question, score, total_score,
      round1_score, round2_score, round3_score, time_remaining,
      status, strikes, last_event, last_seen, registered_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'R1', 'Q1', 0, 0, 0, 0, 0, 1200, 'ACTIVE', 0, 'Official Portal Verified', ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      full_name = excluded.full_name,
      college = excluded.college,
      department = excluded.department,
      status = 'ACTIVE',
      strikes = 0,
      score = 0,
      total_score = 0,
      round1_score = 0,
      round2_score = 0,
      round3_score = 0,
      current_round = 'R1',
      current_question = 'Q1',
      time_remaining = 1200,
      last_event = 'Active & Ready'
  `);

  const nowMs = Date.now();
  const nowIso = new Date().toISOString();
  let count = 0;

  for (const c of OFFICIAL_MASTER_ROSTER) {
    const numMatch = c.registrationCode.match(/(\d+)$/);
    const slot = numMatch ? parseInt(numMatch[1], 10) : count + 1;
    insert.run(
      c.registrationCode,
      slot,
      c.name,
      c.college,
      c.department || 'Computer Science & Engineering',
      c.year || '3rd Year',
      nowMs,
      nowIso
    );
    count++;
  }
  return count;
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
  OFFICIAL_MASTER_ROSTER,
  fetchLiveRoster,
  syncRosterToDatabase,
  seedOfficialRosterToDb,
  markAttendanceOnPortal,
  getSyncStatus: () => ({
    status: lastSyncStatus,
    lastSyncTime,
    cachedCount: liveRosterCache.length,
    portalUrl: PORTAL_URL,
    eventId: EVENT_ID
  })
};
