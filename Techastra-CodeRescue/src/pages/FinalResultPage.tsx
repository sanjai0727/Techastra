import React, { useEffect } from 'react';
import { useCompetition } from '../context/CompetitionContext';
import confetti from 'canvas-confetti';

export const FinalResultPage: React.FC = () => {
  const { state, setView, resetCompetition } = useCompetition();

  const r1Score = Object.values(state.bestScores).slice(0, 10).reduce((a, b) => a + b, 0);
  const r2Score = Object.values(state.bestScores).slice(10, 15).reduce((a, b) => a + b, 0);
  const r3Score = Object.values(state.bestScores).slice(15, 16).reduce((a, b) => a + b, 0);
  const totalScore = r1Score + r2Score + r3Score;
  const maxTotalScore = 300;

  useEffect(() => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'CODE_RESCUE_EXIT_FULLSCREEN' }, '*');
      }
    } catch (e) {}
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 }
      });
    } catch (e) {}
  }, []);

  return (
    <div className="max-w-3xl mx-auto my-3 select-none font-sans text-black text-xs">
      <div className="win95-dialog-frame">
        {/* Titlebar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
          <div className="flex items-center gap-1.5">
            <span>🏅</span>
            <span>Grand Championship Verdict — Final Arbitration Dossier</span>
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
          <div className="p-2 bg-[#c0c0c0] border-b border-[#808080] text-center space-y-1">
            <span className="win95-badge cyber-pill-green font-mono font-bold">
              COMPETITION TRIAGE CONCLUDED
            </span>
            <div className="text-lg sm:text-xl font-bold text-black font-sans">
              CODE RESCUE FINALE COMPLETE
            </div>
            <div className="text-[11px] text-gray-700 font-mono">
              Candidate: <b>{state.participant?.fullName || 'Contestant'}</b> ({state.participant?.college}) • Token: {state.participant?.participantId}
            </div>
          </div>

          {/* Verdict Box */}
          <div className="win95-sunken p-3 text-center bg-[#ffffdf] space-y-2">
            <span className="win95-badge cyber-pill-amber font-mono font-bold">
              CHAMPIONSHIP VERDICT
            </span>
            <div className="text-base font-bold text-black font-sans">
              🏆 Qualified for Podium Evaluation
            </div>
            <p className="text-xs text-gray-800 max-w-lg mx-auto">
              Candidate multi-stage code triage records have been finalized and committed to the arbitration database for podium tie-breaker ranking.
            </p>

            {/* Grand Cumulative Score Banner */}
            <div className="inline-block px-6 py-2 bg-white win95-sunken">
              <span className="text-[11px] text-gray-600 block uppercase font-bold">Cumulative Grand Score</span>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-black">
                {totalScore} <span className="text-xs text-gray-600 font-normal">/ {maxTotalScore} Pts</span>
              </span>
            </div>
          </div>

          {/* Round by Round Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <fieldset className="win95-fieldset" style={{ margin: 0, padding: '8px', textAlign: 'center' }}>
              <legend className="win95-legend font-bold text-[11px]">
                Round 1 (Bug Hunt)
              </legend>
              <div className="win95-sunken p-2 bg-white">
                <span className="text-xl font-bold font-mono text-black block">{r1Score}</span>
                <span className="text-[11px] text-gray-600 font-mono">/ 100 Pts</span>
              </div>
            </fieldset>

            <fieldset className="win95-fieldset" style={{ margin: 0, padding: '8px', textAlign: 'center' }}>
              <legend className="win95-legend font-bold text-[11px]">
                Round 2 (Logic Breaker)
              </legend>
              <div className="win95-sunken p-2 bg-white">
                <span className="text-xl font-bold font-mono text-black block">{r2Score}</span>
                <span className="text-[11px] text-gray-600 font-mono">/ 100 Pts</span>
              </div>
            </fieldset>

            <fieldset className="win95-fieldset" style={{ margin: 0, padding: '8px', textAlign: 'center' }}>
              <legend className="win95-legend font-bold text-[11px]">
                Round 3 (Code Rescue)
              </legend>
              <div className="win95-sunken p-2 bg-white">
                <span className="text-xl font-bold font-mono text-black block">{r3Score}</span>
                <span className="text-[11px] text-gray-600 font-mono">/ 100 Pts</span>
              </div>
            </fieldset>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-[#808080]">
            <button
              onClick={() => {
                if (window.confirm('Reset all competition state and return to setup?')) {
                  resetCompetition();
                }
              }}
              className="site-button"
              style={{ fontSize: 11, padding: '3px 12px' }}
            >
              Reset Championship Data
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('welcome')}
                className="site-button"
                style={{ fontSize: 12, padding: '4px 14px' }}
              >
                Return to Home
              </button>

              <button
                onClick={() => setView('leaderboard')}
                className="site-button active font-bold"
                style={{ fontSize: 12, padding: '4px 18px' }}
              >
                View Official Standings &gt;&gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FinalResultPage;
