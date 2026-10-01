const fs = require('fs');

const pageCode = `import React, { useState } from 'react';
import { useCompetition } from '../context/CompetitionContext';
import { ProblemDescription } from '../components/ProblemDescription';
import { CodeEditor } from '../components/CodeEditor';
import { Console } from '../components/Console';
import { ExecutionResult } from '../types/competition';
import { CheckCircle2, AlertCircle, ArrowRight, Clock } from 'lucide-react';

export const RoundWorkspacePage: React.FC = () => {
  const {
    state,
    getCurrentRoundQuestions,
    selectQuestion,
    updateCode,
    resetQuestionCode,
    runVisibleTests,
    submitSolution,
    finalizeRound
  } = useCompetition();

  const { activeQuestionId, currentRound, codeBuffers, submissions, bestScores, timers } = state;
  const questions = getCurrentRoundQuestions();
  const currentQuestion = questions.find(q => q.id === activeQuestionId) || questions[0];

  // Current code in editor
  const currentCode = codeBuffers[currentQuestion.id] !== undefined
    ? codeBuffers[currentQuestion.id]
    : currentQuestion.brokenCode;

  // Question submissions and results
  const currentSubmissions = submissions[currentQuestion.id] || [];
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(
    currentSubmissions.length > 0 ? currentSubmissions[0].result : null
  );

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  // Check if round timer is expired
  const remainingSeconds = currentRound === 1
    ? timers.round1Remaining
    : (currentRound === 2 ? timers.round2Remaining : timers.round3Remaining);

  const isTimerExpired = remainingSeconds <= 0;

  const handleRunCode = async () => {
    if (isRunning || isSubmitting || isTimerExpired) return;
    setIsRunning(true);
    try {
      const result = await runVisibleTests(currentQuestion, currentCode);
      setLastResult(result);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitSolution = async () => {
    if (isRunning || isSubmitting || isTimerExpired) return;
    setIsSubmitting(true);
    try {
      const result = await submitSolution(currentQuestion, currentCode);
      setLastResult(result);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishRound = () => {
    finalizeRound(currentRound);
    setShowFinishConfirm(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-53px)] bg-[#0b0f19] overflow-hidden">
      {/* Timer Expired Warning Banner */}
      {isTimerExpired && (
        <div className="bg-rose-950/90 border-b border-rose-500/50 px-4 py-2 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2 font-semibold">
            <Clock className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>Round {currentRound} time expired (00:00). Submissions and execution are closed for this round.</span>
          </div>
          <button
            onClick={() => finalizeRound(currentRound)}
            className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
          >
            Proceed to Round Results &rarr;
          </button>
        </div>
      )}

      {/* Top Question Ribbon: Q1-Q10 for R1/R2, Q1 ONLY for R3 */}
      <div className="bg-[#0f172a] border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-3 select-none shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 hidden sm:inline font-mono">
            {currentRound === 3 ? 'Flagship Work Order:' : 'Work Orders:'}
          </span>
          {questions.map((q) => {
            const isSolved = (bestScores[q.id] || 0) === q.points;
            const hasAttempts = (submissions[q.id] || []).length > 0;
            const isActive = q.id === currentQuestion.id;

            let buttonStyle = 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700';
            if (isActive) {
              buttonStyle = 'bg-cyan-950 text-cyan-300 border-cyan-500 ring-2 ring-cyan-500/20';
            } else if (isSolved) {
              buttonStyle = 'bg-emerald-950/60 text-emerald-300 border-emerald-600/50';
            } else if (hasAttempts) {
              buttonStyle = 'bg-amber-950/60 text-amber-300 border-amber-600/50';
            }

            return (
              <button
                key={q.id}
                onClick={() => {
                  selectQuestion(q.id);
                  const existingSubs = submissions[q.id] || [];
                  setLastResult(existingSubs.length > 0 ? existingSubs[0].result : null);
                }}
                className={\`relative px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1.5 \${buttonStyle}\`}
                title={q.title}
                id={\`question-tab-\${q.number}\`}
              >
                <span>Q{q.number}</span>
                {isSolved ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : hasAttempts ? (
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Right Actions: ONLY Legitimate Participant Finish Round (Dev/Skip/AutoSolve REMOVED) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowFinishConfirm(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-xs font-semibold transition-colors"
            id="btn-finish-round"
          >
            <span>Finish Round</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Main Workspace Body (Two-Pane Layout) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-hidden">
        {/* Left Pane: Problem Description (5 cols on lg) */}
        <div className="lg:col-span-5 h-full overflow-hidden flex flex-col">
          <ProblemDescription question={currentQuestion} />
        </div>

        {/* Right Pane: Code Editor + Console (7 cols on lg) */}
        <div className="lg:col-span-7 h-full flex flex-col gap-3 overflow-hidden">
          {/* Top Half: Monaco Code Editor (60% height) */}
          <div className="flex-[6] min-h-[300px] overflow-hidden">
            <CodeEditor
              code={currentCode}
              onChange={(val) => updateCode(currentQuestion.id, val)}
              onReset={() => resetQuestionCode(currentQuestion.id)}
              onRun={handleRunCode}
              onSubmit={handleSubmitSolution}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              readOnly={isTimerExpired}
            />
          </div>

          {/* Bottom Half: Interactive Console & Test Runner (40% height) */}
          <div className="flex-[4] min-h-[220px] overflow-hidden">
            <Console
              lastResult={lastResult}
              submissions={currentSubmissions}
              visibleTests={currentQuestion.visibleTests}
            />
          </div>
        </div>
      </div>

      {/* Finish Round Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-200">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span>Finalize Round {currentRound}?</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to finish this round now? Your current score ({state.currentRound === 1 ? state.bestScores['r1-q1'] !== undefined : true}) and submissions will be submitted to the judging server.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Continue Debugging
              </button>
              <button
                onClick={handleFinishRound}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40"
              >
                Yes, Finalize Round
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
`;

fs.writeFileSync('E:/projects/techastra-coderescue/src/pages/RoundWorkspacePage.tsx', pageCode, 'utf8');
console.log('Successfully updated RoundWorkspacePage.tsx');
