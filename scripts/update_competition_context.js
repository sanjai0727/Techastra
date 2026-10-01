const fs = require('fs');

const contextCode = `import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  CompetitionState,
  Participant,
  Question,
  Submission,
  ExecutionResult,
  ActiveView,
  RoundResult,
  QualificationConfig
} from '../types/competition';
import {
  getInitialState,
  saveState,
  clearState,
  COMPETITION_CONFIG,
  DEFAULT_QUALIFICATION_CONFIG
} from '../services/storageService';
import { round1Questions } from '../data/round1Questions';
import { round2Questions } from '../data/round2Questions';
import { round3Question } from '../data/round3Questions';
import { runCodeSimulation } from '../services/executionEngine';
import { telemetryService, ParticipantTelemetryState } from '../services/telemetryService';
import confetti from 'canvas-confetti';

interface CompetitionContextType {
  state: CompetitionState;
  setView: (view: ActiveView) => void;
  registerParticipant: (participant: Participant) => void;
  startRound: (round: 1 | 2 | 3) => void;
  selectQuestion: (questionId: string) => void;
  updateCode: (questionId: string, code: string) => void;
  resetQuestionCode: (questionId: string) => void;
  runVisibleTests: (question: Question, code: string) => Promise<ExecutionResult>;
  submitSolution: (question: Question, code: string) => Promise<ExecutionResult>;
  finalizeRound: (round: 1 | 2 | 3) => void;
  proceedToNextRound: () => void;
  resetCompetition: () => void;
  getCurrentRoundQuestions: () => Question[];
  getCurrentRoundScore: () => number;
  getTotalScore: () => number;
  getRoundScore: (round: 1 | 2 | 3) => number;
  getRoundMaxScore: (round: 1 | 2 | 3) => number;
}

const CompetitionContext = createContext<CompetitionContextType | null>(null);

export const CompetitionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CompetitionState>(getInitialState);

  // Sync state to LocalStorage
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Active round questions helper
  const getCurrentRoundQuestions = useCallback((): Question[] => {
    if (state.currentRound === 1) return round1Questions;
    if (state.currentRound === 2) return round2Questions;
    return [round3Question];
  }, [state.currentRound]);

  // Round scores
  const getRoundScore = useCallback((round: 1 | 2 | 3): number => {
    let questions: Question[] = [];
    if (round === 1) questions = round1Questions;
    else if (round === 2) questions = round2Questions;
    else questions = [round3Question];

    const sum = questions.reduce((acc, q) => acc + (state.bestScores[q.id] || 0), 0);
    const maxAllowed = COMPETITION_CONFIG.rounds[round].maxScore;
    return Math.min(sum, maxAllowed);
  }, [state.bestScores]);

  const getRoundMaxScore = useCallback((round: 1 | 2 | 3): number => {
    return COMPETITION_CONFIG.rounds[round].maxScore;
  }, []);

  const getCurrentRoundScore = useCallback((): number => {
    return getRoundScore(state.currentRound);
  }, [getRoundScore, state.currentRound]);

  const getTotalScore = useCallback((): number => {
    const r1 = getRoundScore(1);
    const r2 = getRoundScore(2);
    const r3 = getRoundScore(3);
    return Math.min(35, r1 + r2 + r3);
  }, [getRoundScore]);

  // Telemetry registration & syncing
  useEffect(() => {
    if (state.participant) {
      telemetryService.init(state.participant, () => {
        const questions = getCurrentRoundQuestions();
        const activeQ = questions.find(q => q.id === state.activeQuestionId) || questions[0];
        const r1 = getRoundScore(1);
        const r2 = getRoundScore(2);
        const r3 = getRoundScore(3);
        const currentRoundTimerKey = state.currentRound === 1 ? 'round1Remaining' : (state.currentRound === 2 ? 'round2Remaining' : 'round3Remaining');
        const remaining = state.timers[currentRoundTimerKey];
        const allowed = COMPETITION_CONFIG.rounds[state.currentRound].durationSeconds;
        const elapsed = Math.max(0, allowed - remaining);

        return {
          currentRound: \`R\${state.currentRound}\`,
          currentQuestion: activeQ ? \`Q\${activeQ.number}\` : 'Q1',
          round1Score: r1,
          round2Score: r2,
          round3Score: r3,
          roundScore: state.currentRound === 1 ? r1 : (state.currentRound === 2 ? r2 : r3),
          totalScore: Math.min(35, r1 + r2 + r3),
          roundTimeRemaining: remaining,
          totalElapsedTime: elapsed,
          status: state.isCompetitionComplete ? 'COMPLETED' : 'ACTIVE',
          lastActivity: activeQ ? \`Attempting R\${state.currentRound} Q\${activeQ.number}: \${activeQ.title}\` : 'Arena Active'
        };
      });
    }
  }, [state.participant, state.currentRound, state.activeQuestionId, state.bestScores, state.timers, state.isCompetitionComplete, getCurrentRoundQuestions, getRoundScore]);

  // Finalize round logic
  const finalizeRound = useCallback((round: 1 | 2 | 3) => {
    setState(prev => {
      let questions: Question[] = [];
      let totalAllowed = COMPETITION_CONFIG.rounds[round].durationSeconds;
      let remainingKey: 'round1Remaining' | 'round2Remaining' | 'round3Remaining' = 'round1Remaining';
      let activeKey: 'round1Active' | 'round2Active' | 'round3Active' = 'round1Active';
      let nextView: ActiveView = 'round1_result';

      if (round === 1) {
        questions = round1Questions;
        remainingKey = 'round1Remaining';
        activeKey = 'round1Active';
        nextView = 'round1_result';
      } else if (round === 2) {
        questions = round2Questions;
        remainingKey = 'round2Remaining';
        activeKey = 'round2Active';
        nextView = 'round2_result';
      } else {
        questions = [round3Question];
        remainingKey = 'round3Remaining';
        activeKey = 'round3Active';
        nextView = 'final_result';
      }

      const totalScore = Math.min(
        COMPETITION_CONFIG.rounds[round].maxScore,
        questions.reduce((sum, q) => sum + (prev.bestScores[q.id] || 0), 0)
      );

      const maxScore = COMPETITION_CONFIG.rounds[round].maxScore;
      const correctCount = questions.filter(q => (prev.bestScores[q.id] || 0) === q.points).length;
      const wrongCount = questions.length - correctCount;
      const timeUsedSeconds = Math.max(0, totalAllowed - prev.timers[remainingKey]);
      const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

      // Note: No invented qualification cutoff. Official qualification is managed by Admin Portal.
      const isQualified = true;

      const roundResult: RoundResult = {
        round,
        totalScore,
        maxScore,
        correctCount,
        wrongCount,
        totalQuestions: questions.length,
        timeUsedSeconds,
        totalAllowedSeconds: totalAllowed,
        accuracy,
        isQualified,
        completedAt: Date.now()
      };

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      return {
        ...prev,
        currentView: nextView,
        timers: {
          ...prev.timers,
          [activeKey]: false
        },
        roundResults: {
          ...prev.roundResults,
          [\`round\${round}\`]: roundResult
        },
        isCompetitionComplete: round === 3
      };
    });
  }, []);

  // Live Timer Tick Effect - Authoritative per-round countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        let changed = false;
        const newTimers = { ...prev.timers };

        if (newTimers.round1Active && newTimers.round1Remaining > 0) {
          newTimers.round1Remaining -= 1;
          changed = true;
          if (newTimers.round1Remaining <= 0) {
            newTimers.round1Active = false;
            setTimeout(() => finalizeRound(1), 50);
          }
        }

        if (newTimers.round2Active && newTimers.round2Remaining > 0) {
          newTimers.round2Remaining -= 1;
          changed = true;
          if (newTimers.round2Remaining <= 0) {
            newTimers.round2Active = false;
            setTimeout(() => finalizeRound(2), 50);
          }
        }

        if (newTimers.round3Active && newTimers.round3Remaining > 0) {
          newTimers.round3Remaining -= 1;
          changed = true;
          if (newTimers.round3Remaining <= 0) {
            newTimers.round3Active = false;
            setTimeout(() => finalizeRound(3), 50);
          }
        }

        if (!changed) return prev;
        return { ...prev, timers: newTimers };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [finalizeRound]);

  const setView = (view: ActiveView) => {
    setState(prev => ({ ...prev, currentView: view }));
  };

  const registerParticipant = (participant: Participant) => {
    setState(prev => ({
      ...prev,
      participant,
      currentView: 'rules'
    }));
  };

  /**
   * Starts a specific round.
   * CRITICAL REQUIREMENT:
   * Round timers are strictly authoritative.
   * Round 1 = 15:00
   * Round 2 = 20:00 (NEVER carries over unused time from Round 1)
   * Round 3 = 25:00 (NEVER carries over unused time from Round 2)
   */
  const startRound = (round: 1 | 2 | 3) => {
    setState(prev => {
      const firstQId = round === 1 ? 'r1-q1' : (round === 2 ? 'r2-q1' : 'r3-q1');
      const view: ActiveView = round === 1 ? 'round1_workspace' : (round === 2 ? 'round2_workspace' : 'round3_workspace');

      // Set authoritative duration for this round
      const updatedTimers = {
        ...prev.timers,
        round1Active: round === 1,
        round2Active: round === 2,
        round3Active: round === 3
      };

      if (round === 1) {
        updatedTimers.round1Remaining = COMPETITION_CONFIG.rounds[1].durationSeconds; // 15:00
      } else if (round === 2) {
        updatedTimers.round2Remaining = COMPETITION_CONFIG.rounds[2].durationSeconds; // 20:00 - Fresh timer!
      } else if (round === 3) {
        updatedTimers.round3Remaining = COMPETITION_CONFIG.rounds[3].durationSeconds; // 25:00 - Fresh timer!
      }

      return {
        ...prev,
        currentRound: round,
        activeQuestionId: firstQId,
        currentView: view,
        timers: updatedTimers
      };
    });
  };

  const selectQuestion = (questionId: string) => {
    setState(prev => ({ ...prev, activeQuestionId: questionId }));
  };

  const updateCode = (questionId: string, code: string) => {
    setState(prev => ({
      ...prev,
      codeBuffers: {
        ...prev.codeBuffers,
        [questionId]: code
      }
    }));
  };

  const resetQuestionCode = (questionId: string) => {
    let original = '';
    const all = [...round1Questions, ...round2Questions, round3Question];
    const q = all.find(item => item.id === questionId);
    if (q) original = q.brokenCode;

    setState(prev => ({
      ...prev,
      codeBuffers: {
        ...prev.codeBuffers,
        [questionId]: original
      }
    }));
  };

  const runVisibleTests = async (question: Question, code: string): Promise<ExecutionResult> => {
    return await runCodeSimulation(question, code, 'run');
  };

  const submitSolution = async (question: Question, code: string): Promise<ExecutionResult> => {
    const result = await runCodeSimulation(question, code, 'submit');
    const isAccepted = result.status === 'ACCEPTED';
    const scoreEarned = isAccepted ? question.points : 0;

    const submission: Submission = {
      id: \`sub-\${Date.now()}\`,
      questionId: question.id,
      round: question.round,
      code,
      timestamp: Date.now(),
      attemptNumber: (state.submissions[question.id]?.length || 0) + 1,
      result,
      scoreEarned
    };

    setState(prev => {
      const prevSubs = prev.submissions[question.id] || [];
      const prevBest = prev.bestScores[question.id] || 0;
      const newBest = Math.max(prevBest, scoreEarned);

      return {
        ...prev,
        submissions: {
          ...prev.submissions,
          [question.id]: [submission, ...prevSubs]
        },
        bestScores: {
          ...prev.bestScores,
          [question.id]: newBest
        }
      };
    });

    if (isAccepted) {
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }

    // Trigger instant telemetry heartbeat
    setTimeout(() => {
      telemetryService.sendHeartbeat();
    }, 100);

    return result;
  };

  const proceedToNextRound = () => {
    if (state.currentRound === 1) {
      startRound(2);
    } else if (state.currentRound === 2) {
      startRound(3);
    } else {
      setView('final_result');
    }
  };

  const resetCompetition = () => {
    clearState();
    setState(getInitialState());
  };

  return (
    <CompetitionContext.Provider
      value={{
        state,
        setView,
        registerParticipant,
        startRound,
        selectQuestion,
        updateCode,
        resetQuestionCode,
        runVisibleTests,
        submitSolution,
        finalizeRound,
        proceedToNextRound,
        resetCompetition,
        getCurrentRoundQuestions,
        getCurrentRoundScore,
        getTotalScore,
        getRoundScore,
        getRoundMaxScore
      }}
    >
      {children}
    </CompetitionContext.Provider>
  );
};

export const useCompetition = (): CompetitionContextType => {
  const context = useContext(CompetitionContext);
  if (!context) {
    throw new Error('useCompetition must be used within a CompetitionProvider');
  }
  return context;
};
`;

fs.writeFileSync('E:/projects/techastra-coderescue/src/context/CompetitionContext.tsx', contextCode, 'utf8');
console.log('Successfully updated CompetitionContext.tsx');
