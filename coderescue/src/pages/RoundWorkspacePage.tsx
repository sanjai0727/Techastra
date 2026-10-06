import React, { useState } from 'react';
import { useCompetition } from '../context/CompetitionContext';
import { ProblemDescription } from '../components/ProblemDescription';
import { CodeEditor } from '../components/CodeEditor';
import { Console } from '../components/Console';
import { ExecutionResult } from '../types/competition';

export const RoundWorkspacePage: React.FC = () => {
  const {
    state,
    selectQuestion,
    updateCode,
    resetQuestionCode,
    runVisibleTests,
    submitSolution,
    finalizeRound,
    devAutoSolveCurrentQuestion,
    devSkipToNextRound,
    getCurrentRoundQuestions,
  } = useCompetition();

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const questions = getCurrentRoundQuestions();
  const currentQuestion = questions.find(q => q.id === state.activeQuestionId) || questions[0];

  const currentRound = state.currentRound;
  const currentCode = state.codeBuffers[currentQuestion.id] || currentQuestion.brokenCode;
  const submissions = state.submissions;
  const currentSubmissions = submissions[currentQuestion.id] || [];
  const bestScores = state.bestScores;

  // Determine timer status
  const currentSeconds = currentRound === 1 
    ? state.timers.round1Remaining 
    : currentRound === 2 
    ? state.timers.round2Remaining 
    : state.timers.round3Remaining;
  const isTimerExpired = currentSeconds <= 0;

  const handleRunCode = async () => {
    if (isRunning || isSubmitting) return;
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
    <div className="flex flex-col h-full bg-[#c0c0c0] overflow-hidden select-none font-sans text-black text-xs">
      {/* Top Work Orders Coolbar */}
      <div className="bg-[#c0c0c0] border-b border-[#808080] px-2 py-1 flex items-center justify-between gap-2 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs font-bold mr-1 hidden sm:inline text-gray-800">
            Work Orders:
          </span>
          {questions.map((q) => {
            const isSolved = (bestScores[q.id] || 0) === q.points;
            const hasAttempts = (submissions[q.id] || []).length > 0;
            const isActive = q.id === currentQuestion.id;

            return (
              <button
                key={q.id}
                onClick={() => {
                  selectQuestion(q.id);
                  const existingSubs = submissions[q.id] || [];
                  setLastResult(existingSubs.length > 0 ? existingSubs[0].result : null);
                }}
                className={`site-button ${isActive ? 'active' : ''}`}
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  backgroundColor: isActive ? '#fbffc4' : (isSolved ? '#e6f4ea' : (hasAttempts ? '#fef7e0' : undefined)),
                  color: isSolved ? '#0d652d' : undefined,
                  fontWeight: isActive || isSolved ? 'bold' : 'normal',
                }}
                title={q.title}
              >
                <span>Q{q.number}</span>
                {isSolved ? ' ✔' : hasAttempts ? ' ⚠' : ''}
              </button>
            );
          })}
        </div>

        {/* Right Actions: Dev Controls & Finish Round */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Dev: Auto-Solve Current Question */}
          <button
            onClick={() => {
              devAutoSolveCurrentQuestion();
              const existingSubs = submissions[currentQuestion.id] || [];
              if (existingSubs.length > 0) {
                setLastResult(existingSubs[0].result);
              }
            }}
            className="site-button"
            style={{ fontSize: 11, padding: '2px 8px' }}
            title="Auto-submits correct solution for this question"
          >
            ⚡ Auto-Solve Q{currentQuestion.number}
          </button>

          {/* Dev: Skip/Complete Round */}
          <button
            onClick={() => devSkipToNextRound(true)}
            className="site-button"
            style={{ fontSize: 11, padding: '2px 8px' }}
            title="Auto-solves all remaining questions in this round"
          >
            Skip Round &gt;&gt;
          </button>

          <div className="h-4 w-px bg-[#808080] border-r border-[#ffffff] mx-0.5" />

          {/* Finish Round Normally */}
          <button
            onClick={() => setShowFinishConfirm(true)}
            className="site-button active font-bold"
            style={{ fontSize: 11, padding: '2px 10px', backgroundColor: '#d8d8d8' }}
          >
            Finish Round 🏁
          </button>
        </div>
      </div>

      {/* Main Workspace Body (Two-Pane Layout) */}
      <div className="flex-1 flex flex-row gap-1.5 p-1.5 overflow-hidden bg-[#c0c0c0] min-h-0">
        {/* Left Pane: Problem Description */}
        <div className="w-[38%] min-w-[280px] max-w-[400px] h-full overflow-hidden flex flex-col shrink-0">
          <ProblemDescription question={currentQuestion} />
        </div>

        {/* Right Pane: Code Editor + Console */}
        <div className="flex-1 h-full flex flex-col gap-1.5 overflow-hidden min-w-0">
          {/* Top Half: Monaco Code Editor */}
          <div className="flex-[55] min-h-[210px] overflow-hidden">
            <CodeEditor
              code={currentCode}
              onChange={(val) => updateCode(currentQuestion.id, val)}
              onReset={() => resetQuestionCode(currentQuestion.id)}
              onRun={handleRunCode}
              onSubmit={handleSubmitSolution}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              readOnly={false}
            />
          </div>

          {/* Bottom Half: MS-DOS Terminal Console */}
          <div className="flex-[45] min-h-[190px] overflow-hidden">
            <Console
              lastResult={lastResult}
              submissions={currentSubmissions}
              visibleTests={currentQuestion.visibleTests}
              currentCode={currentCode}
              questionTitle={currentQuestion.title}
              onRunCode={handleRunCode}
              onSubmitSolution={handleSubmitSolution}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              remainingSeconds={currentSeconds}
              score={bestScores[currentQuestion.id] || 0}
            />
          </div>
        </div>
      </div>

      {/* Windows 95 Confirmation Dialog Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="win95-dialog-frame max-w-md w-full p-1 select-none font-sans text-black"
          >
            {/* Titlebar */}
            <div className="win95-tool-title">
              <span>Finalize Round {currentRound} Confirmation</span>
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="site-button"
                style={{
                  padding: '0 4px',
                  height: 14,
                  fontSize: 10,
                  lineHeight: '12px',
                  fontWeight: 'bold',
                }}
              >
                ✕
              </button>
            </div>

            {/* Dialog Content */}
            <div className="p-3 space-y-3 text-xs bg-[#c0c0c0]">
              <div className="flex items-start gap-3 p-2 bg-white win95-sunken">
                <span className="text-2xl">❓</span>
                <div>
                  <p className="font-bold text-sm text-black">
                    Are you sure you want to finish Round {currentRound} now?
                  </p>
                  <p className="text-gray-700 text-xs mt-1">
                    Your current code submissions and scores will be audited and the qualification engine will evaluate your advancement to the next stage.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#808080]">
                <button
                  onClick={() => setShowFinishConfirm(false)}
                  className="site-button"
                  style={{ fontSize: 12, padding: '3px 14px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinishRound}
                  className="site-button active font-bold"
                  style={{ fontSize: 12, padding: '3px 16px' }}
                >
                  OK (Finalize Round)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default RoundWorkspacePage;
