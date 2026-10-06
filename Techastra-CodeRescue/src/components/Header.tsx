import React, { useState } from 'react';
import { useCompetition } from '../context/CompetitionContext';
import { ActiveView } from '../types/competition';

export const Header: React.FC = () => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingTargetView, setPendingTargetView] = useState<ActiveView | null>(null);

  const {
    state,
    setView,
    setOrganizerMode,
    organizerSetTimer,
    getCurrentRoundScore,
    getCurrentRoundQuestions,
    disqualifyContestant
  } = useCompetition();

  const { currentView, currentRound, participant, timers } = state;
  const isWorkspace = currentView.includes('workspace');

  // Format countdown timer
  const getSecondsRemaining = () => {
    if (currentRound === 1) return timers.round1Remaining;
    if (currentRound === 2) return timers.round2Remaining;
    return timers.round3Remaining;
  };

  const seconds = getSecondsRemaining();
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

  const isTimerCritical = seconds < 180 && seconds > 0;
  const isTimerExpired = seconds <= 0;

  const questions = getCurrentRoundQuestions();
  const roundScore = getCurrentRoundScore();
  const maxRoundScore = questions.reduce((a, b) => a + b.points, 0);

  const getRoundLabel = () => {
    if (currentRound === 1) return 'R1: BUG HUNT';
    if (currentRound === 2) return 'R2: LOGIC BREAKER';
    return 'R3: CODE RESCUE';
  };

  const handleNavClick = (target: ActiveView) => {
    if (isWorkspace && !state.securityState?.isDisqualified) {
      setPendingTargetView(target);
      setShowExitConfirm(true);
      return;
    }
    setView(target);
  };

  return (
    <header className="w-full bg-[#c0c0c0] select-none text-xs border-b border-[#808080]">
      {/* Unified Windows 95 Software Menu Bar & Telemetry */}
      <div className="win95-menubar flex items-center justify-between px-1 py-0.5">
        {/* Left: Standard Win32 Menu Items */}
        <div className="flex items-center gap-0.5">
          <span
            onClick={() => handleNavClick('welcome')}
            className={`win95-menu-item ${currentView === 'welcome' ? 'active' : ''}`}
            title="Return to Welcome Screen"
          >
            <u>F</u>ile
          </span>
          <span
            onClick={() => handleNavClick('rules')}
            className={`win95-menu-item ${currentView === 'rules' ? 'active' : ''}`}
            title="Rules & Engagement Directives"
          >
            <u>R</u>ules
          </span>
          <span
            onClick={() => handleNavClick('leaderboard')}
            className={`win95-menu-item ${currentView === 'leaderboard' ? 'active' : ''}`}
            title="Championship Standings"
          >
            <u>S</u>tandings
          </span>
          <span
            onClick={() => handleNavClick('admin_dashboard')}
            className={`win95-menu-item ${currentView === 'admin_dashboard' ? 'active' : ''}`}
            title="Coordinator Command Desk"
          >
            <u>C</u>oordinator
          </span>
          <span
            onClick={() => setOrganizerMode(true)}
            className="win95-menu-item"
            title="Testing & Jump Tools"
          >
            <u>T</u>ools
          </span>

          {isWorkspace && (
            <span className="win95-badge cyber-pill-cyan font-bold ml-2">
              {getRoundLabel()}
            </span>
          )}
        </div>

        {/* Right: Telemetry & Controls on the SAME single bar */}
        <div className="flex items-center gap-1.5 py-0.5">
          {isWorkspace && (
            <>
              {/* Sunken LCD Timer */}
              <div
                onClick={() => {
                  if (isTimerExpired) {
                    const dur = (currentRound === 1 ? 20 : currentRound === 2 ? 25 : 40) * 60;
                    organizerSetTimer(currentRound, dur);
                  }
                }}
                className={`win95-status-panel font-mono font-bold ${isTimerExpired ? 'cursor-pointer hover:underline' : ''}`}
                style={{
                  backgroundColor: '#000000',
                  color: isTimerExpired ? '#ff3333' : isTimerCritical ? '#ffcc00' : '#00ff66',
                  fontSize: 11,
                  padding: '1px 6px'
                }}
                title={isTimerExpired ? "Timer Expired! Click to Reset to full round duration" : "Countdown Timer"}
              >
                ⏱ {isTimerExpired ? 'EXPIRED (Click Reset)' : formattedTime}
              </div>

              {/* Sunken Score Panel */}
              <div className="win95-status-panel font-mono font-bold bg-[#ffffff] text-[#000000] text-[11px] py-0.5 px-1.5" title="Official scores will be evaluated and revealed after the event concludes">
                SCORES REVEALED AFTER EVENT
              </div>
            </>
          )}

          {participant && (
            <div className="win95-status-panel font-mono truncate max-w-[150px] text-[11px] py-0.5 px-1.5 hidden md:block">
              {participant.fullName}
            </div>
          )}

          <button
            onClick={() => setOrganizerMode(true)}
            className="site-button"
            style={{ fontSize: 11, padding: '1px 8px', height: 20 }}
            title="Fast-Track Jump & Testing Tools"
          >
            🛠 Tools
          </button>
        </div>
      </div>

      {/* Round Exit Confirmation & Disqualification Warning Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 select-none font-sans text-xs text-black">
          <div
            className="win95-dialog-frame max-w-md w-full p-1"
            style={{
              boxShadow: '0 0 20px rgba(160, 0, 0, 0.6), 3px 3px 0 #000000',
            }}
          >
            {/* Titlebar */}
            <div className="bg-[#a00000] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
              <div className="flex items-center gap-1.5">
                <span>⚠️</span>
                <span>CONFIRM ROUND EXIT — DISQUALIFICATION NOTICE</span>
              </div>
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="site-button"
                style={{ padding: '0 4px', height: 16, fontSize: 10, lineHeight: '12px' }}
              >
                ✕
              </button>
            </div>

            {/* Dialog Body */}
            <div className="p-3 bg-[#c0c0c0] space-y-3">
              <div className="flex items-start gap-3 p-3 bg-[#fff0f0] border border-[#a00000] win95-sunken">
                <div className="text-3xl select-none">🚨</div>
                <div className="space-y-1.5">
                  <div className="font-bold text-sm text-red-900 font-sans">
                    Are you sure you want to exit the competition round?
                  </div>
                  <p className="text-xs text-gray-900 leading-relaxed font-sans">
                    You are currently competing in an active round (<b>{getRoundLabel()}</b>).
                  </p>
                  <p className="text-xs text-red-900 font-bold leading-relaxed font-sans">
                    WARNING: If you exit or navigate to {pendingTargetView?.toUpperCase()} now, you will be IMMEDIATELY AUTO-DISQUALIFIED pursuant to Section 4 (Zero-Tolerance Policy). All scores for this session will be permanently forfeited.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#808080]">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="site-button active font-bold py-1.5 px-4"
                  style={{
                    backgroundColor: '#c0c0c0',
                    color: '#000000',
                    fontSize: 12,
                  }}
                >
                  &lt; Cancel &amp; Stay in Exam
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    disqualifyContestant(`Contestant voluntarily exited the active examination environment via navigation (${pendingTargetView?.toUpperCase()}).`);
                  }}
                  className="site-button font-bold py-1.5 px-4"
                  style={{
                    backgroundColor: '#a00000',
                    color: '#ffffff',
                    border: '2px solid #500000',
                    fontSize: 12,
                  }}
                >
                  Yes, Exit &amp; Disqualify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
