import React from 'react';
import { useCompetition } from '../context/CompetitionContext';

export const DisqualifiedPage: React.FC = () => {
  const { state, setView, resetSecurityState, resetCompetition } = useCompetition();
  const participant = state.participant;
  const reason = state.securityState?.disqualificationReason || 'Multiple unauthorized tab switches detected during active round.';
  const violations = state.securityState?.violationLogs || [];

  return (
    <div className="h-full w-full bg-[#000080] text-white font-mono flex flex-col select-none overflow-hidden">
      {/* Scrollable Main Report Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-3">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Institution Header */}
          <div className="flex items-center justify-between bg-white/95 px-3 py-1.5 border border-white/50 text-black mb-1">
            <img
              src="./mgr_university_logo.png"
              alt="Dr. M.G.R. Educational and Research Institute University"
              className="h-8 object-contain"
            />
            <div className="text-right text-[10px] text-gray-800 hidden sm:block">
              <span className="font-bold text-[#000080]">Dr. M.G.R. EDUCATIONAL &amp; RESEARCH INSTITUTE</span> • DEPT OF CSE
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
              Department of Computer Science & Engineering • Techastra 2026 Code Rescue Championship
            </p>
          </div>

          {/* Lockout Details Card */}
          <div className="bg-[#000055] p-3 border border-white/30 space-y-2.5 text-xs leading-relaxed">
            <p className="text-red-400 font-bold text-xs">
              [FATAL INFRACTION] The proctoring subsystem has permanently revoked your workstation access.
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
                <b className="text-yellow-300">{participant?.participantId || 'CR-UNKNOWN'}</b>
              </div>
              <div>
                <span className="text-gray-400">Institution:</span>{' '}
                <span className="text-white">{participant?.college || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400">Stage Interrupted:</span>{' '}
                <span className="text-red-300">
                  {state.currentRound === 1 ? 'Round 1 (Bug Hunt)' : state.currentRound === 2 ? 'Round 2 (Logic Breaker)' : 'Round 3 (Code Rescue)'}
                </span>
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

          {/* Advisory Notes */}
          <div className="text-[11px] text-white/70 space-y-0.5">
            <p>
              * All code submissions and pending tests for this session have been frozen and finalized with Disqualified status.
            </p>
            <p>
              * If you believe this incident was triggered by an unavoidable OS system error, immediately alert the Faculty Coordinators (Dr. G. Senthil Velan, Ms. Anu) or Student Coordinators (Yashvinthan M, Kavitha G, Sanjai P.A.).
            </p>
          </div>
        </div>
      </div>

      {/* Permanently Pinned Action Bar at Bottom */}
      <div className="shrink-0 bg-[#000044] border-t-2 border-white/50 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-lg">
        <div className="text-xs text-yellow-300 font-bold flex items-center gap-1.5">
          <span>⚠️</span>
          <span>Status: DISQUALIFIED // Incident Archived to Ledger</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Proctor Override: Reinstate contestant session, clear all security strikes, and resume round?')) {
                resetSecurityState();
              }
            }}
            className="site-button"
            style={{
              padding: '5px 12px',
              fontSize: 11,
              fontWeight: 'bold',
              background: '#006400',
              color: '#ffffff',
              border: '2px solid #00ff66',
              cursor: 'pointer',
            }}
          >
            🛡️ Proctor Override
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
            onClick={() => resetCompetition()}
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
            ← Return to Welcome Screen
          </button>
        </div>
      </div>
    </div>
  );
};
export default DisqualifiedPage;
