import React, { useState } from 'react';
import { useCompetition } from '../context/CompetitionContext';

export const DisqualifiedPage: React.FC = () => {
  const {
    state,
    setView,
    readmitContestant,
    restartCurrentRound,
    restartCompetitionWithParticipant,
    resetCompetition
  } = useCompetition();

  const participant = state.participant;
  const reason = state.securityState?.disqualificationReason || 'Multiple unauthorized tab switches detected during active round.';
  const violations = state.securityState?.violationLogs || [];

  // Proctor Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'OVERRIDE' | 'RESET'>('OVERRIDE');
  const [proctorPin, setProctorPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeRoundName = state.currentRound === 1
    ? 'Round 1 (Bug Hunt)'
    : state.currentRound === 2
    ? 'Round 2 (Logic Breaker)'
    : 'Round 3 (Code Rescue)';

  const handleResumeRound = () => {
    if (!proctorPin.trim()) {
      setFeedback({ type: 'error', message: 'Please enter the Proctor Authorization PIN.' });
      return;
    }
    const res = readmitContestant(proctorPin);
    if (!res.success) {
      setFeedback({ type: 'error', message: res.message });
    } else {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => setShowModal(false), 600);
    }
  };

  const handleRestartRound = () => {
    if (!proctorPin.trim()) {
      setFeedback({ type: 'error', message: 'Please enter the Proctor Authorization PIN.' });
      return;
    }
    const res = restartCurrentRound(proctorPin);
    if (!res.success) {
      setFeedback({ type: 'error', message: res.message });
    } else {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => setShowModal(false), 600);
    }
  };

  const handleResetWithParticipant = () => {
    if (!proctorPin.trim()) {
      setFeedback({ type: 'error', message: 'Please enter the Proctor Authorization PIN.' });
      return;
    }
    const res = restartCompetitionWithParticipant(proctorPin);
    if (!res.success) {
      setFeedback({ type: 'error', message: res.message });
    } else {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setShowModal(false);
        setView('rules');
      }, 600);
    }
  };

  const handleFullWipe = () => {
    if (window.confirm('Are you sure you want to completely erase all data and start from Registration?')) {
      resetCompetition();
      setShowModal(false);
    }
  };

  return (
    <div className="h-full w-full bg-[#000080] text-white font-mono flex flex-col select-none overflow-hidden relative">
      {/* Scrollable Main Report Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-3">
        <div className="w-full max-w-5xl mx-auto space-y-3.5">
          {/* Institution Header */}
          <div className="flex items-center justify-between bg-white/95 px-3 py-1.5 border border-white/50 text-black mb-1">
            <img
              src="./mgr_university_logo.png"
              alt="Dr. M.G.R. Educational and Research Institute University"
              className="h-8 object-contain"
            />
            <div className="text-right text-xs text-gray-800 hidden sm:block">
              <span className="font-bold text-[#000080]">Dr. M.G.R. EDUCATIONAL &amp; RESEARCH INSTITUTE</span> • DEPT OF CSE &bull; DEPT OF CYBER SECURITY
            </div>
          </div>

          {/* Top BSOD Header */}
          <div className="text-center pb-2 border-b border-white/40">
            <span className="bg-[#a00000] text-white px-3 py-0.5 font-bold text-xs tracking-wider inline-block">
              *** SECURITY LOCKOUT: 0x000000FF (CONTEST_INTEGRITY_BREACH) ***
            </span>
            <h1 className="text-lg sm:text-xl font-bold mt-2 text-yellow-300">
              WORKSTATION SESSION TERMINATED — AUTO-DISQUALIFIED
            </h1>
            <p className="text-[11px] text-white/80 mt-0.5">
              Department of Computer Science & Engineering • Department of Cyber Security • Techastra 2026 Code Rescue Championship
            </p>
          </div>

          {/* Lockout Details Card */}
          <div className="bg-[#000055] p-3 border border-white/30 space-y-2.5 text-xs leading-relaxed">
            <p className="text-red-400 font-bold text-xs">
              [FATAL INFRACTION] The proctoring subsystem has locked your workstation access.
            </p>
            <p className="text-white/90 text-xs">
              A violation of <b>Section 4: Strictly Prohibited Activities (Zero Tolerance)</b> was registered on Station Node <b>TECHASTRA-CR-26</b>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-black/40 border border-white/20 text-xs">
              <div>
                <span className="text-gray-400">Contestant:</span>{' '}
                <b className="text-white">{participant?.fullName || 'Anonymous Candidate'}</b>
              </div>
              <div>
                <span className="text-gray-400">Token ID:</span>{' '}
                <b className="text-yellow-300">{participant?.participantId || 'SYM2026-UNKNOWN'}</b>
              </div>
              <div>
                <span className="text-gray-400">Institution:</span>{' '}
                <span className="text-white">{participant?.college || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400">Stage Interrupted:</span>{' '}
                <span className="text-yellow-300 font-bold">{activeRoundName}</span>
              </div>
            </div>

            <div>
              <div className="text-yellow-300 font-bold mb-1 text-xs">PROCTOR REASON:</div>
              <div className="p-2 bg-[#400000] border border-red-500 text-red-200 font-bold text-xs">
                {reason}
              </div>
            </div>

            {/* Violation Audit Log */}
            {violations.length > 0 && (
              <div>
                <div className="text-yellow-300 font-bold mb-1 text-xs">PROCTOR AUDIT TRAIL:</div>
                <div className="bg-black/60 p-2 border border-white/20 max-h-28 overflow-y-auto space-y-1 text-[11px]">
                  {violations.map((log, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-gray-400 shrink-0">
                        [{new Date(log.timestamp).toLocaleTimeString()}]
                      </span>
                      <span className="text-red-300">[{log.type}]</span>
                      <span className="text-white/90">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Emergency Proctor Recovery Panel */}
          <div className="bg-[#003366] border-2 border-yellow-400 p-3.5 space-y-3 text-xs shadow-lg">
            <div className="flex items-center justify-between border-b border-yellow-400/40 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛠️</span>
                <span className="font-bold text-yellow-300 text-sm tracking-wide">
                  PROCTOR RESOLUTION &amp; RECOVERY DESK
                </span>
              </div>
              <span className="bg-yellow-400 text-black px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider">
                Authorized Access Only
              </span>
            </div>

            <p className="text-white/95 leading-relaxed text-xs">
              If this disqualification occurred due to an <b>accidental trackpad gesture, Windows background pop-up, browser crash, or OS notification</b>, do not panic! An event invigilator can authorize re-admission without losing your typed code, or restart the test.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setModalMode('OVERRIDE');
                  setShowModal(true);
                  setFeedback(null);
                  setProctorPin('');
                }}
                className="site-button active cursor-pointer flex items-center gap-1.5"
                style={{
                  padding: '7px 18px',
                  fontSize: 12,
                  fontWeight: 'bold',
                  background: '#008080',
                  color: '#ffffff',
                  border: '2px solid #00ffff',
                  boxShadow: '2px 2px 0px #000000',
                }}
              >
                <span>🔓</span>
                <span>Proctor Override / Re-Admit Contestant</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalMode('RESET');
                  setShowModal(true);
                  setFeedback(null);
                  setProctorPin('');
                }}
                className="site-button cursor-pointer flex items-center gap-1.5"
                style={{
                  padding: '7px 16px',
                  fontSize: 12,
                  fontWeight: 'bold',
                  background: '#c0c0c0',
                  color: '#800000',
                  border: '2px solid #ffffff',
                  boxShadow: '2px 2px 0px #000000',
                }}
              >
                <span>🔄</span>
                <span>Reset Test / Start Fresh</span>
              </button>
            </div>

            <div className="text-[11px] text-white/70 bg-black/40 p-2 border border-white/20">
              <p>
                <b>Coordinator Contacts:</b> Faculty: Dr. G. Senthilvelan (+91 98404 66300), Mr. P. Sudarsan (+91 97907 80562) • Student Leads: Mr. Sanjai P A (+91 94878 26286), Ms. Kavitha G (+91 63824 01242), Mr. Yashvinthan M (+91 97899 21988)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Permanently Pinned Action Bar at Bottom */}
      <div className="shrink-0 bg-[#000044] border-t-2 border-white/50 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-lg z-10">
        <div className="text-xs text-yellow-300 font-bold flex items-center gap-1.5">
          <span>⚠️</span>
          <span>Status: LOCKED // Proctor PIN required to resume or reset</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setModalMode('OVERRIDE');
              setShowModal(true);
              setFeedback(null);
              setProctorPin('');
            }}
            className="site-button active"
            style={{
              padding: '5px 16px',
              fontSize: 11,
              fontWeight: 'bold',
              background: '#008080',
              color: '#ffffff',
              border: '2px solid #00ffff',
              cursor: 'pointer',
            }}
          >
            🔓 Unlock Workstation
          </button>
          <button
            type="button"
            onClick={() => setView('leaderboard')}
            className="site-button"
            style={{
              padding: '5px 14px',
              fontSize: 11,
              fontWeight: 'bold',
              background: '#c0c0c0',
              color: '#000000',
              cursor: 'pointer',
            }}
          >
            View Live Standings
          </button>
          <button
            type="button"
            onClick={() => setView('welcome')}
            className="site-button"
            style={{
              padding: '5px 14px',
              fontSize: 11,
              fontWeight: 'bold',
              background: '#c0c0c0',
              color: '#000000',
              cursor: 'pointer',
            }}
          >
            Welcome Screen
          </button>
        </div>
      </div>

      {/* Proctor Authorization & Reset Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 p-3 select-none font-sans text-xs text-black">
          <div
            className="win95-dialog-frame max-w-lg w-full p-1"
            style={{
              boxShadow: '0 0 25px rgba(0, 255, 255, 0.5), 3px 3px 0 #000000',
            }}
          >
            {/* Titlebar */}
            <div className="bg-[#000080] text-white px-2.5 py-1 flex items-center justify-between font-bold text-xs">
              <div className="flex items-center gap-1.5">
                <span>🛡️</span>
                <span>PROCTOR AUTHENTICATION &amp; WORKSTATION RECOVERY</span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="site-button"
                style={{ padding: '0 5px', height: 18, fontSize: 10, lineHeight: '14px', background: '#c0c0c0' }}
              >
                ✕
              </button>
            </div>

            {/* Dialog Client Area */}
            <div className="p-3.5 space-y-3.5 bg-[#c0c0c0]">
              <div className="win95-sunken bg-white p-2.5 space-y-1 text-xs">
                <p className="font-bold text-[#000080]">
                  Contestant: {participant?.fullName || 'Anonymous'} ({participant?.participantId || 'N/A'})
                </p>
                <p className="text-gray-700">
                  Target Stage: <b>{activeRoundName}</b>
                </p>
                <p className="text-red-700 text-[11px]">
                  Requires authorization from an official Faculty Coordinator or Student Lead.
                </p>
              </div>

              {/* PIN Entry Field */}
              <div className="space-y-1.5">
                <label className="block font-bold text-xs text-black">
                  Enter Proctor Authorization PIN:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={proctorPin}
                    onChange={(e) => setProctorPin(e.target.value)}
                    placeholder="e.g. TECHASTRA26"
                    className="win95-input flex-1 px-2.5 py-1 font-mono text-sm tracking-wider bg-white text-black border-2 border-[#808080]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (modalMode === 'OVERRIDE') {
                          handleResumeRound();
                        } else {
                          handleResetWithParticipant();
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="site-button"
                    style={{ padding: '4px 8px', fontSize: 11 }}
                    title={showPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPin ? '🙈 Hide' : '👁️ Show'}
                  </button>
                </div>
                <div className="text-[10px] text-gray-600 flex justify-between items-center px-0.5">
                  <span>Authorized Keys: TECHASTRA26 • MGR2026 • 9487</span>
                  <span className="font-mono text-gray-500">(Case-insensitive)</span>
                </div>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`p-2 border text-xs font-bold ${
                    feedback.type === 'success'
                      ? 'bg-green-100 border-green-600 text-green-900'
                      : 'bg-red-100 border-red-600 text-red-900'
                  }`}
                >
                  {feedback.type === 'success' ? '✔ ' : '✖ '}
                  {feedback.message}
                </div>
              )}

              {/* Action Buttons depending on Mode */}
              <div className="space-y-2 pt-1 border-t border-[#808080]">
                <div className="text-xs font-bold text-[#000080] uppercase tracking-wide">
                  Choose Recovery Action:
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {/* Action 1: Resume Session */}
                  <button
                    type="button"
                    onClick={handleResumeRound}
                    className="site-button active text-left p-2 cursor-pointer flex items-start gap-2"
                    style={{
                      background: '#008080',
                      color: '#ffffff',
                      border: '2px solid #00ffff',
                    }}
                  >
                    <span className="text-base leading-none">🟢</span>
                    <div>
                      <div className="font-bold text-xs">Resume Active Round (Keep All Code &amp; Scores)</div>
                      <div className="text-[11px] text-cyan-200">
                        Unlocks workstation instantly. Contestant returns to {activeRoundName} with zero lost work!
                      </div>
                    </div>
                  </button>

                  {/* Action 2: Restart Current Round */}
                  <button
                    type="button"
                    onClick={handleRestartRound}
                    className="site-button text-left p-2 cursor-pointer flex items-start gap-2"
                    style={{
                      background: '#ffffff',
                      color: '#000080',
                      border: '2px solid #808080',
                    }}
                  >
                    <span className="text-base leading-none">⚡</span>
                    <div>
                      <div className="font-bold text-xs">Restart Current Round Fresh (Full Timer)</div>
                      <div className="text-[11px] text-gray-600">
                        Resets {activeRoundName} timer to full (15m/20m/25m) and clears this round's questions.
                      </div>
                    </div>
                  </button>

                  {/* Action 3: Restart Entire Competition (Keep Participant) */}
                  <button
                    type="button"
                    onClick={handleResetWithParticipant}
                    className="site-button text-left p-2 cursor-pointer flex items-start gap-2"
                    style={{
                      background: '#fff2e6',
                      color: '#993d00',
                      border: '2px solid #cc6600',
                    }}
                  >
                    <span className="text-base leading-none">🔄</span>
                    <div>
                      <div className="font-bold text-xs">Restart Test from Round 1 (Keep Name &amp; Token)</div>
                      <div className="text-[11px] text-orange-800">
                        Wipes all 3 rounds and resets timers. Candidate starts over from Round 1 without re-entering info.
                      </div>
                    </div>
                  </button>

                  {/* Action 4: Complete Session Wipe */}
                  <button
                    type="button"
                    onClick={handleFullWipe}
                    className="site-button text-left p-2 cursor-pointer flex items-start gap-2"
                    style={{
                      background: '#ffe6e6',
                      color: '#800000',
                      border: '2px solid #ff4d4d',
                    }}
                  >
                    <span className="text-base leading-none">🗑️</span>
                    <div>
                      <div className="font-bold text-xs">Complete Factory Reset (New Contestant Registration)</div>
                      <div className="text-[11px] text-red-700">
                        Wipes all data and clears storage. Workstation returns to fresh Registration screen.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Close / Cancel Bar */}
              <div className="flex justify-end pt-2 border-t border-[#808080]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="site-button"
                  style={{ padding: '5px 18px', fontSize: 11, fontWeight: 'bold' }}
                >
                  Cancel / Return to Lock Screen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisqualifiedPage;
