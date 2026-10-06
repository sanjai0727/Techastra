const http = require('http');

const PORT = 8080;
const BASE = `http://localhost:${PORT}`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {};
    if (payload) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request({
      host: 'localhost',
      port: PORT,
      path,
      method,
      headers
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(raw); } catch (e) { json = raw; }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('TECHASTRA 2026 — EXHAUSTIVE BACKEND VERIFICATION SUITE');
  console.log('Testing: Code Rescue Contestant Arena & Admin Command Center');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title, condition, extra = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title} ${extra ? '-> ' + JSON.stringify(extra) : ''}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST SUITE 1: CODERESCUE CONTESTANT APPLICATION ENDPOINTS
  // -------------------------------------------------------------
  console.log('--- SUITE 1: CODERESCUE CONTESTANT FLOWS ---');

  // 1.1 Verify Token (Invalid Token)
  const v1 = await request('POST', '/api/participants/verify', { participantId: 'INVALID_TOKEN_999' });
  assert('Verify non-existent token returns 404/not verified', v1.status === 404 || v1.data.verified === false);

  // 1.2 Register New Contestant
  const reg1 = await request('POST', '/api/participants/register', {
    fullName: 'Test Contestant Automaton',
    college: 'Dr. M.G.R. Educational and Research Institute',
    department: 'CSE',
    year: 'III'
  });
  assert('Register participant endpoint', reg1.status === 200 && reg1.data.success === true && !!reg1.data.participant?.id, reg1.data);
  const testId = reg1.data.participant?.id;

  // 1.3 Verify Newly Registered Token
  const v2 = await request('POST', '/api/participants/verify', { participantId: testId });
  assert('Verify registered participant token', v2.status === 200 && v2.data.verified === true && v2.data.participant?.id === testId, v2.data);

  // 1.4 Participant Login / Session Creation
  const loginP = await request('POST', '/api/participants/login', { participantId: testId });
  assert('Participant login creates valid session token', loginP.status === 200 && !!loginP.data.token, loginP.data);
  const pToken = loginP.data?.token;

  // 1.5 Telemetry Heartbeat
  const hb = await request('POST', '/api/telemetry/heartbeat', {
    participantId: testId,
    currentRound: 'R1',
    currentQuestion: 'Q1: Syntax Repair',
    timeRemaining: 2650,
    status: 'ACTIVE'
  });
  assert('Participant telemetry heartbeat', hb.status === 200 && hb.data.success === true, hb.data);

  // 1.6 Live Screen Telemetry (streaming editor state to admin matrix)
  const ls = await request('POST', '/api/telemetry/live-screen', {
    participantId: testId,
    code: 'def fix_syntax(val):\n    return val * 2\n',
    questionTitle: 'Q1: Syntax Repair',
    round: 'R1',
    timeRemaining: 2640,
    status: 'ACTIVE'
  });
  assert('Stream live code editor screen', ls.status === 200 && ls.data.success === true, ls.data);

  // 1.7 Proctoring Security Event (Tab switch / DevTools)
  const proc = await request('POST', '/api/proctoring/event', {
    participantId: testId,
    eventType: 'TAB_SWITCH',
    details: 'User switched browser tab away from competition arena',
    severity: 'WARNING'
  });
  assert('Record proctoring violation and strike counter', proc.status === 200 && proc.data.success === true && proc.data.strikes >= 1, proc.data);

  // 1.8 Code Submission & Evaluation
  const sub = await request('POST', '/api/submissions', {
    participantId: testId,
    roundId: 'R1',
    question: 'Q1: Syntax Repair',
    code: 'def fix_syntax(val):\n    return val * 2\n',
    language: 'python',
    status: 'PASSED',
    score: 10,
    maxScore: 10
  });
  assert('Submit and evaluate triage code', sub.status === 200 && sub.data.success === true, sub.data);

  // 1.9 Fetch Tournament Rounds & Rules
  const rounds = await request('GET', '/api/rounds');
  assert('Fetch tournament rounds configuration', rounds.status === 200 && Array.isArray(rounds.data.rounds), rounds.data);

  // 1.10 Fetch Announcements Feed
  const ann = await request('GET', '/api/announcements');
  assert('Fetch system announcements feed', ann.status === 200 && Array.isArray(ann.data.announcements), ann.data);

  // 1.11 Fetch Leaderboard (Confidential/Masked state)
  const lb = await request('GET', '/api/leaderboard');
  assert('Fetch leaderboard with score privacy masking', lb.status === 200 && Array.isArray(lb.data.leaderboard), lb.data);

  // -------------------------------------------------------------
  // TEST SUITE 2: ADMIN COMMAND CENTER ENDPOINTS
  // -------------------------------------------------------------
  console.log('\n--- SUITE 2: ADMIN COMMAND CENTER FLOWS ---');

  // 2.1 Admin Login (both credentials tested)
  const adminLogin1 = await request('POST', '/api/admin/login', {
    username: 'coderescue@techastra.drmgrdu.ac.in',
    password: 'TechDay26'
  });
  assert('Admin login (coderescue@techastra.drmgrdu.ac.in)', adminLogin1.status === 200 && !!adminLogin1.data.token, adminLogin1.data);
  const adminToken = adminLogin1.data?.token;

  const adminLogin2 = await request('POST', '/api/admin/login', {
    username: 'admin',
    passkey: 'techastra2026'
  });
  assert('Admin login (admin / techastra2026)', adminLogin2.status === 200 && !!adminLogin2.data.token, adminLogin2.data);

  // 2.2 System Stats Telemetry (Admin Protected)
  const stats = await request('GET', '/api/admin/system-stats', null, adminToken);
  assert('Admin system stats telemetry', stats.status === 200 && stats.data.success === true && stats.data.stats.totalParticipants >= 1, stats.data);

  // 2.3 Live Participants Telemetry
  const parts = await request('GET', '/api/telemetry/participants');
  assert('Fetch all live participants roster', parts.status === 200 && Array.isArray(parts.data.participants), parts.data);

  // 2.4 Live Screens Matrix
  const screens = await request('GET', '/api/telemetry/live-screens');
  assert('Fetch live screens matrix', screens.status === 200 && typeof screens.data.screens === 'object', screens.data);

  // 2.5 Proctoring Security Audit Feed
  const events = await request('GET', '/api/proctoring/events');
  assert('Fetch proctoring events log', events.status === 200 && Array.isArray(events.data.events), events.data);

  // 2.6 Submissions Dossier Inspection
  const subs = await request('GET', '/api/submissions');
  assert('Fetch all code submissions', subs.status === 200 && Array.isArray(subs.data.submissions), subs.data);

  // 2.7 Master Clock Control: Adjust Timer (All Participants)
  const timerAdjAll = await request('POST', '/api/rounds/adjust-timer', {
    roundId: 'ALL',
    additionalSeconds: 300
  }, adminToken);
  assert('Master Clock: Add +5m to ALL participants', timerAdjAll.status === 200 && timerAdjAll.data.success === true, timerAdjAll.data);

  // 2.8 Master Clock Control: Adjust Specific Workstation Timer
  const timerAdjSingle = await request('POST', `/api/participants/${testId}/adjust-timer`, {
    additionalSeconds: 120
  }, adminToken);
  assert(`Workstation Control: Add +2m to ${testId}`, timerAdjSingle.status === 200 && timerAdjSingle.data.success === true, timerAdjSingle.data);

  // 2.9 Workstation Control: Pardon Strikes & Reset Session
  const resetSess = await request('POST', `/api/participants/${testId}/reset-session`, {}, adminToken);
  assert(`Workstation Control: Pardon strikes & reset session for ${testId}`, resetSess.status === 200 && resetSess.data.success === true, resetSess.data);

  // 2.10 Coordinator Flag & Reinstate
  const flagRes = await request('POST', '/api/telemetry/flag', {
    participantId: testId,
    reason: 'Automated test flag'
  }, adminToken);
  assert('Coordinator flag participant', flagRes.status === 200 && flagRes.data.success === true, flagRes.data);

  const reinstateRes = await request('POST', '/api/telemetry/reinstate', {
    participantId: testId
  }, adminToken);
  assert('Coordinator reinstate participant', reinstateRes.status === 200 && reinstateRes.data.success === true, reinstateRes.data);

  // 2.11 Round Management: Update Cutoff
  const cutoffRes = await request('POST', '/api/rounds/R1/cutoff', {
    cutoff: 7
  }, adminToken);
  assert('Round Management: Update R1 qualification cutoff', cutoffRes.status === 200 && cutoffRes.data.success === true, cutoffRes.data);

  // 2.12 Wire Broadcasts: Post System Announcement
  const annPost = await request('POST', '/api/announcements', {
    message: 'Attention all contestants: 10 minutes remaining in Round 1!',
    priority: 'HIGH'
  }, adminToken);
  assert('Post Wire Broadcast announcement', annPost.status === 200 && annPost.data.success === true, annPost.data);

  // 2.13 Score Privacy & Arena Reveal Toggle
  const revealOn = await request('POST', '/api/admin/toggle-event-ended', {
    eventEnded: true
  }, adminToken);
  assert('Score Privacy: Toggle REVEAL = true (publish standings)', revealOn.status === 200 && revealOn.data.eventEnded === true, revealOn.data);

  const lbRevealed = await request('GET', '/api/leaderboard');
  const revealedEntry = lbRevealed.data.leaderboard?.find(x => x.participantId === testId);
  assert('Verify leaderboard now exposes numerical scores when revealed', lbRevealed.data.eventEnded === true && revealedEntry && revealedEntry.round1Score !== null, revealedEntry);

  const revealOff = await request('POST', '/api/admin/toggle-event-ended', {
    eventEnded: false
  }, adminToken);
  assert('Score Privacy: Toggle CONCEAL = false (lock standings)', revealOff.status === 200 && revealOff.data.eventEnded === false, revealOff.data);

  // 2.14 Live Portal Coordinator Sync
  const syncRes = await request('POST', '/api/coordinator/sync', {});
  assert('Live Portal Coordinator Sync endpoint', syncRes.status === 200 && typeof syncRes.data.synced === 'number', syncRes.data);

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
