import React from 'react';
import { useCompetition } from '../context/CompetitionContext';
import { round1Questions } from '../data/round1Questions';
import { round2Questions } from '../data/round2Questions';
import { Question } from '../types/competition';

interface RoundResultProps {
  round: 1 | 2;
}

export const RoundResultPage: React.FC<RoundResultProps> = ({ round }) => {
  const { state, startRound, setView } = useCompetition();

  const questions: Question[] = round === 1 ? round1Questions : round2Questions;
  const maxScore = questions.reduce((a, b) => a + b.points, 0);

  // Compute total score for this round
  const questionIds = questions.map(q => q.id);
  const totalScore = questionIds.reduce((sum, qId) => sum + (state.bestScores[qId] || 0), 0);

  // Cutoff rule
  const minCutoff = round === 1 ? state.qualificationConfig.round1MinScore : state.qualificationConfig.round2MinScore;
  const isQualified = totalScore >= minCutoff;

  const solvedCount = questionIds.filter(qId => (state.bestScores[qId] || 0) === questions.find(q => q.id === qId)?.points).length;

  const roundDuration = round === 1 ? 20 * 60 : 25 * 60;
  const remaining = round === 1 ? state.timers.round1Remaining : state.timers.round2Remaining;
  const elapsedSeconds = Math.max(0, roundDuration - remaining);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const elapsedSec = elapsedSeconds % 60;
  const formattedElapsed = `${String(elapsedMinutes).padStart(2, '0')}:${String(elapsedSec).padStart(2, '0')}`;

  const nextRoundLabel = round === 1 ? 'Round 2 — Logic Breaker' : 'Round 3 — Code Rescue';

  return (
    <div className="max-w-3xl mx-auto my-3 select-none font-sans text-black text-xs">
      <div className="win95-dialog-frame">
        {/* Titlebar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
          <div className="flex items-center gap-1.5">
            <span>📊</span>
            <span>Stage Audit Scorecard — Round {round} Evaluation Verdict</span>
          </div>
          <button
            onClick={() => setView('welcome')}
            className="site-button"
            style={{ padding: '0 4px', height: 16, fontSize: 10, lineHeight: '12px' }}
          >
            ✕
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-3 space-y-3 bg-[#c0c0c0]">
          {/* Header */}
          <div className="p-2 bg-[#c0c0c0] border-b border-[#808080] flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-black font-sans">
                {round === 1 ? 'Round 1: Bug Hunt Stage Audit' : 'Round 2: Logic Breaker Stage Audit'}
              </div>
              <div className="text-[11px] text-gray-700 font-mono">
                Candidate: <b>{state.participant?.fullName || 'Contestant'}</b> ({state.participant?.participantId})
              </div>
            </div>
            <span className="win95-badge cyber-pill-cyan font-mono font-bold">
              STAGE {round} OF 3
            </span>
          </div>

          {/* Qualification Status Banner */}
          <div
            className="win95-sunken p-3 text-center"
            style={{
              backgroundColor: isQualified ? '#e6f4ea' : '#fce8e6',
            }}
          >
            <div className="text-base font-bold" style={{ color: isQualified ? '#0d652d' : '#c5221f' }}>
              {isQualified ? '✔ QUALIFIED FOR ADVANCEMENT' : '✗ ELIMINATED FROM COMPETITION'}
            </div>
            <p className="text-xs text-gray-800 mt-1 max-w-md mx-auto">
              {isQualified
                ? `Candidate attained ${totalScore} pts, satisfying the official qualification cutoff of ${minCutoff} pts.`
                : `Candidate score of ${totalScore} pts did not satisfy the qualification cutoff of ${minCutoff} pts.`}
            </p>
          </div>

          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Total Score */}
            <div className="win95-sunken p-2 text-center bg-white">
              <span className="text-[10px] font-bold block text-gray-600 uppercase">Score Earned</span>
              <span className="text-xl font-bold font-mono text-black">
                {totalScore} <span className="text-xs text-gray-600 font-normal">/ {maxScore}</span>
              </span>
            </div>

            {/* Correct Solved */}
            <div className="win95-sunken p-2 text-center bg-white">
              <span className="text-[10px] font-bold block text-gray-600 uppercase">Work Orders Solved</span>
              <span className="text-xl font-bold font-mono text-black">
                {solvedCount} <span className="text-xs text-gray-600 font-normal">/ {questions.length}</span>
              </span>
            </div>

            {/* Time Elapsed */}
            <div className="win95-sunken p-2 text-center bg-white">
              <span className="text-[10px] font-bold block text-gray-600 uppercase">Time Elapsed</span>
              <span className="text-xl font-bold font-mono text-black">
                {formattedElapsed}
              </span>
            </div>

            {/* Accuracy Rate */}
            <div className="win95-sunken p-2 text-center bg-white">
              <span className="text-[10px] font-bold block text-gray-600 uppercase">Diagnosis Rate</span>
              <span className="text-xl font-bold font-mono text-black">
                {questions.length > 0 ? Math.round((solvedCount / questions.length) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Detailed Question Tally Table */}
          <fieldset className="win95-fieldset">
            <legend className="win95-legend font-bold">Round {round} Detailed Work Order Tally</legend>
            <div className="win95-sunken p-1 bg-white overflow-x-auto">
              <table className="retro-table text-xs">
                <thead>
                  <tr>
                    <th style={{ width: 45 }}>Order</th>
                    <th>Work Order Title</th>
                    <th>Defect Classification</th>
                    <th style={{ width: 65, textAlign: 'center' }}>Points</th>
                    <th style={{ width: 85, textAlign: 'center' }}>Audit Status</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => {
                    const earned = state.bestScores[q.id] || 0;
                    const isSolved = earned === q.points;
                    const subs = state.submissions[q.id] || [];

                    return (
                      <tr key={q.id}>
                        <td className="font-bold">Q{q.number}</td>
                        <td>{q.title}</td>
                        <td className="text-gray-700 font-mono text-[11px]">{q.bugType}</td>
                        <td style={{ textAlign: 'center' }} className="font-mono">{earned}/{q.points}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`win95-badge ${isSolved ? 'cyber-pill-green' : subs.length > 0 ? 'cyber-pill-amber' : 'cyber-pill-red'} font-bold`}>
                            {isSolved ? '✔ RESOLVED' : subs.length > 0 ? '⚠ ATTEMPTED' : 'UNTOUCHED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </fieldset>

          {/* Action Navigation */}
          <div className="flex items-center justify-between pt-2 border-t border-[#808080]">
            <button
              onClick={() => setView('leaderboard')}
              className="site-button"
              style={{ fontSize: 12, padding: '4px 14px' }}
            >
              View Standings...
            </button>

            {isQualified ? (
              <button
                onClick={() => {
                  try {
                    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                      document.documentElement.requestFullscreen().catch(() => {});
                    }
                  } catch (e) {}
                  startRound((round + 1) as 2 | 3);
                }}
                className="site-button active font-bold"
                style={{ fontSize: 13, padding: '5px 22px' }}
              >
                Proceed to {nextRoundLabel} &gt;&gt;
              </button>
            ) : (
              <button
                onClick={() => setView('welcome')}
                className="site-button"
                style={{ fontSize: 12, padding: '4px 16px' }}
              >
                Return to Command Desk
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default RoundResultPage;
