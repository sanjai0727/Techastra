const fs = require('fs');

// 1. Update RoundResultPage.tsx
const roundResultCode = `import React from 'react';
import { useCompetition } from '../context/CompetitionContext';
import { CheckCircle2, Clock, Trophy, Target, ArrowRight } from 'lucide-react';
import { COMPETITION_CONFIG } from '../services/storageService';

interface RoundResultPageProps {
  round: 1 | 2;
}

export const RoundResultPage: React.FC<RoundResultPageProps> = ({ round }) => {
  const { state, proceedToNextRound } = useCompetition();

  const roundResult = round === 1 ? state.roundResults.round1 : state.roundResults.round2;
  const config = COMPETITION_CONFIG.rounds[round];

  const totalScore = roundResult?.totalScore ?? 0;
  const maxScore = config.maxScore; // 10 for R1, 20 for R2
  const correctCount = roundResult?.correctCount ?? 0;
  const totalQuestions = config.questionsCount; // 10 for R1, 10 for R2
  const timeUsedSeconds = roundResult?.timeUsedSeconds ?? 0;
  const minutes = Math.floor(timeUsedSeconds / 60);
  const seconds = timeUsedSeconds % 60;
  const formattedTime = \`\${String(minutes).padStart(2, '0')}:\${String(seconds).padStart(2, '0')}\`;
  const accuracy = roundResult?.accuracy ?? (totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0);

  const nextRoundLabel = round === 1 ? 'Round 2 — Logic Breaker (20:00)' : 'Round 3 — Code Rescue (25:00)';

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-4 sm:p-8">
      <div className="bg-[#0d1322] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-1 pb-4 border-b border-slate-800">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            ROUND {round} SUMMARY
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {round === 1 ? 'BUG HUNT CONCLUDED' : 'LOGIC BREAKER CONCLUDED'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Performance audit for contestant: <span className="text-slate-200 font-semibold">{state.participant?.fullName || 'Contestant'}</span> <span className="text-cyan-400 font-mono">({state.participant?.participantId})</span>
          </p>
        </div>

        {/* Completion Status Banner */}
        <div className="p-5 rounded-xl border border-cyan-500/40 bg-cyan-950/30 text-cyan-200 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xl font-bold tracking-wide text-white">
            <CheckCircle2 className="w-6 h-6 text-cyan-400" />
            <span>Round {round} Completed — Telemetry Synced</span>
          </div>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Your solutions and test assertions have been recorded. Proceed to the next round when ready. 
            (Note: Unused time does not carry over; the next round begins with its fresh authoritative timer).
          </p>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Round Score */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400 block uppercase">Round Score</span>
            <span className="text-xl font-bold font-mono text-amber-400">
              {totalScore} <span className="text-xs text-slate-500 font-normal">/ {maxScore}</span>
            </span>
          </div>

          {/* Correct Solved */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400 block uppercase">Correct</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {correctCount} <span className="text-xs text-slate-500 font-normal">/ {totalQuestions}</span>
            </span>
          </div>

          {/* Time Taken */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400 block uppercase">Time Used</span>
            <span className="text-xl font-bold font-mono text-cyan-400">
              {formattedTime}
            </span>
          </div>

          {/* Accuracy */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <Target className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400 block uppercase">Accuracy</span>
            <span className="text-xl font-bold font-mono text-purple-400">
              {accuracy}%
            </span>
          </div>
        </div>

        {/* Action Buttons: Proceed to Next Round ONLY */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={proceedToNextRound}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-950/50 transition-all flex items-center justify-center gap-2"
            id="btn-proceed-next-round"
          >
            <span>Proceed to {nextRoundLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('E:/projects/techastra-coderescue/src/pages/RoundResultPage.tsx', roundResultCode, 'utf8');
console.log('Successfully updated RoundResultPage.tsx');

// 2. Update FinalResultPage.tsx
const finalResultCode = `import React, { useEffect } from 'react';
import { useCompetition } from '../context/CompetitionContext';
import { Trophy, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const FinalResultPage: React.FC = () => {
  const { state, getRoundScore, getTotalScore } = useCompetition();

  const r1Score = getRoundScore(1);
  const r2Score = getRoundScore(2);
  const r3Score = getRoundScore(3);
  const totalScore = getTotalScore(); // max 35
  const maxTotalScore = 35; // EXACT 35 MARKS MAXIMUM

  const totalQuestions = 21; // 10 in R1 + 10 in R2 + 1 in R3
  const totalSolved = Object.values(state.bestScores).filter(s => s > 0).length;

  const r1Time = state.roundResults.round1?.timeUsedSeconds || 0;
  const r2Time = state.roundResults.round2?.timeUsedSeconds || 0;
  const r3Time = state.roundResults.round3?.timeUsedSeconds || 0;
  const totalTimeSeconds = r1Time + r2Time + r3Time;

  const minutes = Math.floor(totalTimeSeconds / 60);
  const seconds = totalTimeSeconds % 60;
  const formattedTotalTime = \`\${minutes}m \${seconds}s\`;

  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (e) {}
  }, []);

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-4 sm:p-8">
      <div className="bg-[#0d1322] border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Title Header */}
        <div className="text-center space-y-2 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OFFICIAL COMPETITION CONCLUDED</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            CODE RESCUE COMPLETE
          </h1>

          <p className="text-slate-300 text-sm sm:text-base">
            Contestant: <span className="font-bold text-cyan-400">{state.participant?.fullName || 'Contestant'}</span>{' '}
            <span className="text-slate-400 font-mono text-xs">({state.participant?.participantId})</span>
          </p>
        </div>

        {/* Verdict Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900/60 to-slate-900 border border-amber-500/40 text-center space-y-3 relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Competition Portfolio Submitted
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-1 leading-relaxed">
              Your final score and code submissions across all 3 rounds have been submitted to the Admin Command Center for official evaluation and rank determination.
            </p>
          </div>

          {/* Grand Cumulative Score Banner: TOTAL / 35 */}
          <div className="pt-2">
            <div className="inline-block px-8 py-3 rounded-xl bg-black/60 border border-amber-500/30">
              <span className="text-xs text-slate-400 block font-sans uppercase">Cumulative Total Score</span>
              <span className="text-4xl sm:text-5xl font-black font-mono text-amber-400">
                {totalScore} <span className="text-base text-slate-500 font-normal">/ {maxTotalScore}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Round by Round Score Cards (Strictly out of 10, 20, 5) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Round 1 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
            <span className="text-xl">🐞</span>
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Round 1 (Bug Hunt)</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {r1Score} <span className="text-xs text-slate-500 font-normal">/ 10</span>
            </span>
            <span className="text-[10px] text-slate-400 block">10 Qs • 1 Mark each</span>
          </div>

          {/* Round 2 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
            <span className="text-xl">🧠</span>
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Round 2 (Logic Breaker)</span>
            <span className="text-2xl font-bold font-mono text-amber-400">
              {r2Score} <span className="text-xs text-slate-500 font-normal">/ 20</span>
            </span>
            <span className="text-[10px] text-slate-400 block">10 Qs • 2 Marks each</span>
          </div>

          {/* Round 3 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
            <span className="text-xl">🚨</span>
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Round 3 (Code Rescue)</span>
            <span className="text-2xl font-bold font-mono text-rose-400">
              {r3Score} <span className="text-xs text-slate-500 font-normal">/ 5</span>
            </span>
            <span className="text-[10px] text-slate-400 block">1 Question • 5 Marks</span>
          </div>
        </div>

        {/* Analytics Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Problems Solved</span>
            <span className="font-bold font-mono text-slate-200 text-sm">{totalSolved} / {totalQuestions}</span>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Total Time Used</span>
            <span className="font-bold font-mono text-slate-200 text-sm">{formattedTotalTime}</span>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Accuracy Rate</span>
            <span className="font-bold font-mono text-slate-200 text-sm">
              {totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0}%
            </span>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Participant ID</span>
            <span className="font-bold font-mono text-cyan-400 text-sm">{state.participant?.participantId || 'CR-0001'}</span>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
          Official competition results and winner announcements will be published by the TECHASTRA 2026 Organizing Committee.
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('E:/projects/techastra-coderescue/src/pages/FinalResultPage.tsx', finalResultCode, 'utf8');
console.log('Successfully updated FinalResultPage.tsx');
