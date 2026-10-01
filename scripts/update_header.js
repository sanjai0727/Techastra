const fs = require('fs');

const headerCode = `import React, { useState } from 'react';
import { useCompetition } from '../context/CompetitionContext';
import { Bug, Clock, ShieldCheck, Trophy, FileText, CheckCircle2, User, ChevronDown, X, ShieldAlert, Award } from 'lucide-react';
import { competitionRules, prohibitedAiTools } from '../data/rulesData';

export const Header: React.FC = () => {
  const {
    state,
    getCurrentRoundQuestions,
    getCurrentRoundScore,
    getTotalScore,
    getRoundMaxScore
  } = useCompetition();

  const { currentView, participant, currentRound, timers } = state;
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Determine if we are inside an active round workspace
  const isWorkspace = currentView === 'round1_workspace' || currentView === 'round2_workspace' || currentView === 'round3_workspace';

  // Calculate timer values for the current round
  const remainingSeconds = currentRound === 1 
    ? timers.round1Remaining 
    : (currentRound === 2 ? timers.round2Remaining : timers.round3Remaining);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = \`\${String(minutes).padStart(2, '0')}:\${String(seconds).padStart(2, '0')}\`;

  // Timer warning style
  let timerBadgeColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-950/30';
  if (remainingSeconds <= 60) {
    timerBadgeColor = 'text-rose-400 border-rose-500/50 bg-rose-950/50 animate-pulse';
  } else if (remainingSeconds <= 180) {
    timerBadgeColor = 'text-amber-400 border-amber-500/40 bg-amber-950/40';
  }

  // Scores
  const roundScore = getCurrentRoundScore();
  const roundMax = getRoundMaxScore(currentRound);
  const totalScore = getTotalScore();

  const getRoundLabel = () => {
    if (currentRound === 1) return { title: 'ROUND 1 — BUG HUNT', badge: '15 MIN' };
    if (currentRound === 2) return { title: 'ROUND 2 — LOGIC BREAKER', badge: '20 MIN' };
    return { title: 'ROUND 3 — CODE RESCUE', badge: '25 MIN' };
  };

  const roundInfo = getRoundLabel();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0d1322]/95 backdrop-blur-md px-3 sm:px-4 py-2 flex items-center justify-between text-xs sm:text-sm select-none">
        {/* Left: Brand & File / Rules Navigation ONLY */}
        <div className="flex items-center gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2 font-bold tracking-wider text-slate-100">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Bug className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-sm tracking-tight text-white">CODE RESCUE</span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">ARENA</span>
              </div>
            </div>
          </div>

          {/* Participant Navigation Lockdown: ONLY File | Rules */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
            {/* File Menu */}
            <div className="relative">
              <button
                onClick={() => setShowFileMenu(!showFileMenu)}
                className="px-2.5 py-1 rounded text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
                id="participant-nav-file"
              >
                <span>File</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showFileMenu && (
                <div
                  className="absolute left-0 top-full mt-1.5 w-64 rounded-xl bg-[#0f172a] border border-slate-700 shadow-2xl p-3 z-50 text-xs text-slate-200"
                  onMouseLeave={() => setShowFileMenu(false)}
                >
                  <div className="font-bold text-slate-300 pb-2 mb-2 border-b border-slate-800 flex items-center justify-between">
                    <span>Contestant Dossier</span>
                    <span className="text-[10px] text-cyan-400 font-mono">CR-2026</span>
                  </div>
                  {participant ? (
                    <div className="space-y-1.5 text-[11px]">
                      <div><span className="text-slate-500">Name:</span> <b className="text-slate-200">{participant.fullName}</b></div>
                      <div><span className="text-slate-500">ID:</span> <span className="font-mono text-cyan-400">{participant.participantId}</span></div>
                      <div><span className="text-slate-500">College:</span> <span className="text-slate-300">{participant.college}</span></div>
                      <div><span className="text-slate-500">Dept:</span> <span className="text-slate-300">{participant.department}</span></div>
                      <div><span className="text-slate-500">Year:</span> <span className="text-slate-300">{participant.year}</span></div>
                      <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-emerald-400 font-mono text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Telemetry Connected</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-[11px]">No active registration</div>
                  )}
                </div>
              )}
            </div>

            <span className="text-slate-600">|</span>

            {/* Rules Menu Item */}
            <button
              onClick={() => setShowRulesModal(true)}
              className="px-2.5 py-1 rounded text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
              id="participant-nav-rules"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rules</span>
            </button>
          </div>

          {/* Current Round Tag */}
          {isWorkspace && (
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800/80 border border-slate-700 text-slate-200 flex items-center gap-1.5">
                <span className="font-mono text-cyan-400">{roundInfo.title}</span>
                <span className="text-[10px] text-slate-400">({roundInfo.badge})</span>
              </span>
            </div>
          )}
        </div>

        {/* Middle: Timer & Score Display */}
        {isWorkspace && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Timer Display */}
            <div className={\`flex items-center gap-1.5 px-3 py-1 rounded-md font-mono font-bold text-xs sm:text-sm border \${timerBadgeColor} transition-colors\`}>
              <Clock className="w-3.5 h-3.5" />
              <span>TIME: {formattedTime}</span>
            </div>

            {/* Score Display (Round Score & Cumulative Total) */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-md border border-slate-800 text-xs">
              <div className="flex items-center gap-1 text-slate-300">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>SCORE:</span>
                <span className="font-bold text-amber-400 font-mono">{roundScore}/{roundMax}</span>
              </div>
              <div className="h-3 w-px bg-slate-700 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-1 text-slate-300">
                <span>TOTAL:</span>
                <span className="font-bold text-cyan-400 font-mono">{totalScore}/35</span>
              </div>
            </div>
          </div>
        )}

        {/* Right: Participant Identity & Competition Mode */}
        <div className="flex items-center gap-2">
          {/* Security Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-[11px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Proctored</span>
          </div>

          {/* Participant Badge */}
          {participant ? (
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-md text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" />
              <span className="font-medium text-slate-200 truncate max-w-[100px] sm:max-w-[140px]">
                {participant.fullName}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">({participant.participantId})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <User className="w-3.5 h-3.5" />
              <span>Guest</span>
            </div>
          )}
        </div>
      </header>

      {/* Rules Modal Overlay (accessible anytime via Rules nav item without leaving workspace) */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-cyan-500/40 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative text-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0b0f19]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <div>
                  <h2 className="font-bold text-sm text-white">Official Competition Rules & Guidelines</h2>
                  <p className="text-[11px] text-slate-400">TECHASTRA 2026 — Code Rescue</p>
                </div>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Competition Structure Summary */}
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                <h3 className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">
                  Official 3-Round Format (Total: 60 Minutes | 35 Marks Max)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <b className="text-white block">ROUND 1: BUG HUNT</b>
                    <span className="text-slate-400">15 Mins • 10 Qs</span>
                    <span className="text-cyan-400 block font-bold">1 Mark each = 10 Max</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <b className="text-white block">ROUND 2: LOGIC BREAKER</b>
                    <span className="text-slate-400">20 Mins • 10 Qs</span>
                    <span className="text-cyan-400 block font-bold">2 Marks each = 20 Max</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <b className="text-white block">ROUND 3: CODE RESCUE</b>
                    <span className="text-slate-400">25 Mins • 1 Question</span>
                    <span className="text-cyan-400 block font-bold">5 Marks = 5 Max</span>
                  </div>
                </div>
              </div>

              {/* Zero Tolerance AI Policy */}
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Prohibited Tools & Zero Tolerance</span>
                </div>
                <p className="text-rose-200/90 text-[11px] leading-relaxed">
                  Use of AI assistants, ChatGPT, Copilot, Cursor, external code-sharing, switching tabs, or tampering with session telemetry will be flagged and logged automatically.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {prohibitedAiTools.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded bg-rose-900/60 border border-rose-700/60 text-rose-200 text-[10px] font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rules List */}
              <div className="space-y-3">
                {competitionRules.map((sec, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <h4 className="font-bold text-slate-200 mb-1">{sec.title}</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                      {sec.points.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-[#0b0f19] flex justify-end">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors"
              >
                Close & Return to Arena
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
`;

fs.writeFileSync('E:/projects/techastra-coderescue/src/components/Header.tsx', headerCode, 'utf8');
console.log('Successfully updated Header.tsx');
