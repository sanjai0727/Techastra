import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  CompetitionState,
  Participant,
  Question,
  Submission,
  ExecutionResult,
  ActiveView,
  RoundResult,
  QualificationConfig,
  SecurityViolationLog
} from '../types/competition';
import { getInitialState, saveState, clearState, INITIAL_TIMERS, DEFAULT_QUALIFICATION_CONFIG } from '../services/storageService';
import { round1Questions } from '../data/round1Questions';
import { round2Questions } from '../data/round2Questions';
import { round3Question } from '../data/round3Questions';
import { runCodeSimulation } from '../services/executionEngine';
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
  updateQualificationConfig: (config: Partial<QualificationConfig>) => void;
  getCurrentRoundQuestions: () => Question[];
  getCurrentRoundScore: () => number;
  getTotalScore: () => number;
  recordTabSwitch: () => void;
  dismissTabSwitchWarning: () => void;
  triggerClipboardWarning: (message: string) => void;
  clearClipboardWarning: () => void;
  disqualifyContestant: (reason: string) => void;
  readmitContestant: (proctorPin: string) => { success: boolean; message: string };
  restartCurrentRound: (proctorPin: string) => { success: boolean; message: string };
  restartCompetitionWithParticipant: (proctorPin?: string) => { success: boolean; message: string };
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
  const getCurrentRoundScore = useCallback((): number => {
    const questions = getCurrentRoundQuestions();
    return questions.reduce((sum, q) => sum + (state.bestScores[q.id] || 0), 0);
  }, [getCurrentRoundQuestions, state.bestScores]);

  const getTotalScore = useCallback((): number => {
    return Object.values(state.bestScores).reduce((a, b) => a + b, 0);
  }, [state.bestScores]);

  // Finalize round logic
  const finalizeRound = useCallback((round: 1 | 2 | 3) => {
    setState(prev => {
      let questions: Question[] = [];
      let totalAllowed = 15 * 60;
      let remainingKey: 'round1Remaining' | 'round2Remaining' | 'round3Remaining' = 'round1Remaining';
      let activeKey: 'round1Active' | 'round2Active' | 'round3Active' = 'round1Active';
      let nextView: ActiveView = 'round1_result';

      if (round === 1) {
        questions = round1Questions;
        totalAllowed = 15 * 60;
        remainingKey = 'round1Remaining';
        activeKey = 'round1Active';
        nextView = 'round1_result';
      } else if (round === 2) {
        questions = round2Questions;
        totalAllowed = 20 * 60;
        remainingKey = 'round2Remaining';
        activeKey = 'round2Active';
        nextView = 'round2_result';
      } else {
        questions = [round3Question];
        totalAllowed = 25 * 60;
        remainingKey = 'round3Remaining';
        activeKey = 'round3Active';
        nextView = 'final_result';
      }

      const totalScore = questions.reduce((sum, q) => sum + (prev.bestScores[q.id] || 0), 0);
      const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
      const correctCount = questions.filter(q => (prev.bestScores[q.id] || 0) === q.points).length;
      const wrongCount = questions.length - correctCount;
      const timeUsedSeconds = Math.max(0, totalAllowed - prev.timers[remainingKey]);
      const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

      const minScore = round === 1 
        ? prev.qualificationConfig.round1MinScore 
        : (round === 2 ? prev.qualificationConfig.round2MinScore : 0);

      const isQualified = round === 3 ? (totalScore > 0) : (totalScore >= minScore);

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

      if (isQualified) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // Ignore confetti errors if not supported
        }
      }

      return {
        ...prev,
        currentView: nextView,
        timers: {
          ...prev.timers,
          [activeKey]: false
        },
        roundResults: {
          ...prev.roundResults,
          [`round${round}`]: roundResult
        },
        isCompetitionComplete: round === 3
      };
    });
  }, []);

  // Live Timer Tick Effect
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
            setTimeout(() => finalizeRound(1), 10);
          }
        }

        if (newTimers.round2Active && newTimers.round2Remaining > 0) {
          newTimers.round2Remaining -= 1;
          changed = true;
          if (newTimers.round2Remaining <= 0) {
            newTimers.round2Active = false;
            setTimeout(() => finalizeRound(2), 10);
          }
        }

        if (newTimers.round3Active && newTimers.round3Remaining > 0) {
          newTimers.round3Remaining -= 1;
          changed = true;
          if (newTimers.round3Remaining <= 0) {
            newTimers.round3Active = false;
            setTimeout(() => finalizeRound(3), 10);
          }
        }

        if (!changed) return prev;
        return { ...prev, timers: newTimers };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [finalizeRound]);

  const setView = (view: ActiveView) => {
    const isWorkspace = view.includes('workspace');
    try {
      if (window.parent && window.parent !== window) {
        if (isWorkspace) {
          window.parent.postMessage({ type: 'CODE_RESCUE_ENTER_FULLSCREEN' }, '*');
        } else {
          window.parent.postMessage({ type: 'CODE_RESCUE_EXIT_FULLSCREEN' }, '*');
        }
      }
    } catch (e) {}
    setState(prev => ({ ...prev, currentView: view }));
  };

  const registerParticipant = (participant: Participant) => {
    setState(prev => ({
      ...prev,
      participant,
      currentView: 'rules'
    }));
  };

  const startRound = (round: 1 | 2 | 3) => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'CODE_RESCUE_ENTER_FULLSCREEN' }, '*');
      }
    } catch (e) {}
    setState(prev => {
      const activeKey = round === 1 ? 'round1Active' : (round === 2 ? 'round2Active' : 'round3Active');
      const remainingKey = round === 1 ? 'round1Remaining' : (round === 2 ? 'round2Remaining' : 'round3Remaining');
      const defaultDuration = round === 1 ? 15 * 60 : (round === 2 ? 20 * 60 : 25 * 60);
      const firstQId = round === 1 ? 'r1-q1' : (round === 2 ? 'r2-q1' : 'r3-q1');
      const view: ActiveView = round === 1 ? 'round1_workspace' : (round === 2 ? 'round2_workspace' : 'round3_workspace');

      return {
        ...prev,
        currentRound: round,
        activeQuestionId: firstQId,
        currentView: view,
        timers: {
          ...prev.timers,
          [activeKey]: true,
          [remainingKey]: prev.timers[remainingKey] <= 0 ? defaultDuration : prev.timers[remainingKey]
        }
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
      id: `sub-${Date.now()}`,
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
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }

    return result;
  };

  const proceedToNextRound = () => {
    if (state.currentRound === 1) {
      startRound(2);
    } else if (state.currentRound === 2) {
      startRound(3);
    } else {
      setView('leaderboard');
    }
  };

  const resetCompetition = () => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'CODE_RESCUE_EXIT_FULLSCREEN' }, '*');
      }
    } catch (e) {}
    clearState();
    setState(getInitialState());
  };

  const updateQualificationConfig = (config: Partial<QualificationConfig>) => {
    setState(prev => ({
      ...prev,
      qualificationConfig: {
        ...prev.qualificationConfig,
        ...config
      }
    }));
  };

  const recordTabSwitch = useCallback(() => {
    setState(prev => {
      if (prev.securityState?.isDisqualified || !prev.currentView.includes('workspace')) {
        return prev;
      }

      // If warning modal is already actively showing with a timer, don't restart the countdown
      if (prev.securityState?.showTabSwitchWarning) {
        return prev;
      }

      const nextCount = (prev.securityState?.tabSwitchCount || 0) + 1;
      const graceExpiresAt = Date.now() + 30 * 1000; // 30 seconds return window

      // Strike 3: Contestant is misusing the grace returns!
      if (nextCount > 2) {
        const disqualificationReason = 'Automated proctoring disqualification: Contestant repeatedly misused the fullscreen grace period (Threshold of allowed fullscreen exits exceeded).';
        const logEntry: SecurityViolationLog = {
          type: 'TAB_SWITCH',
          message: `AUTO-DISQUALIFIED: Repeated misuse of fullscreen grace period (Infraction #${nextCount}). Session terminated.`,
          timestamp: Date.now()
        };
        return {
          ...prev,
          currentView: 'disqualified',
          timers: {
            ...prev.timers,
            round1Active: false,
            round2Active: false,
            round3Active: false
          },
          securityState: {
            ...prev.securityState,
            tabSwitchCount: nextCount,
            isDisqualified: true,
            disqualificationReason,
            showTabSwitchWarning: false,
            graceExpiresAt: null,
            violationLogs: [
              ...(prev.securityState?.violationLogs || []),
              logEntry
            ]
          }
        };
      }

      // Strike 1 or 2: Start 30-second return grace timer
      const logEntry: SecurityViolationLog = {
        type: 'TAB_SWITCH',
        message: `Fullscreen lost / window focus lost (Infraction #${nextCount}/2). 30-second grace timer started.`,
        timestamp: Date.now()
      };

      return {
        ...prev,
        securityState: {
          ...prev.securityState,
          tabSwitchCount: nextCount,
          showTabSwitchWarning: true,
          graceExpiresAt,
          violationLogs: [
            ...(prev.securityState?.violationLogs || []),
            logEntry
          ]
        }
      };
    });
  }, []);

  const dismissTabSwitchWarning = useCallback(() => {
    setState(prev => {
      const strikeNum = prev.securityState?.tabSwitchCount || 1;
      const logEntry: SecurityViolationLog = {
        type: 'TAB_SWITCH',
        message: `Contestant restored fullscreen within grace window (Strike #${strikeNum} registered).`,
        timestamp: Date.now()
      };
      return {
        ...prev,
        securityState: {
          ...prev.securityState,
          showTabSwitchWarning: false,
          graceExpiresAt: null,
          violationLogs: [
            ...(prev.securityState?.violationLogs || []),
            logEntry
          ]
        }
      };
    });
  }, []);

  const triggerClipboardWarning = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      securityState: {
        ...prev.securityState,
        clipboardWarning: message,
        violationLogs: [
          ...(prev.securityState?.violationLogs || []),
          {
            type: 'CLIPBOARD',
            message,
            timestamp: Date.now()
          }
        ]
      }
    }));
  }, []);

  const clearClipboardWarning = useCallback(() => {
    setState(prev => ({
      ...prev,
      securityState: {
        ...prev.securityState,
        clipboardWarning: null
      }
    }));
  }, []);

  const disqualifyContestant = useCallback((reason: string) => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'CODE_RESCUE_EXIT_FULLSCREEN' }, '*');
      }
    } catch (e) {}
    setState(prev => ({
      ...prev,
      currentView: 'disqualified',
      timers: {
        ...prev.timers,
        round1Active: false,
        round2Active: false,
        round3Active: false
      },
      securityState: {
        ...prev.securityState,
        isDisqualified: true,
        disqualificationReason: reason,
        showTabSwitchWarning: false,
        violationLogs: [
          ...(prev.securityState?.violationLogs || []),
          {
            type: 'TAB_SWITCH',
            message: `DISQUALIFIED: ${reason}`,
            timestamp: Date.now()
          }
        ]
      }
    }));
  }, []);

  const readmitContestant = useCallback((pin: string): { success: boolean; message: string } => {
    const validPins = ['TECHASTRA26', 'RESCUE26', 'MGR2026', 'ADMIN2026', '9487'];
    const normalized = pin.trim().toUpperCase();
    if (!validPins.includes(normalized)) {
      return { success: false, message: 'Invalid Proctor Authorization PIN. Please check with an event coordinator.' };
    }

    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'CODE_RESCUE_ENTER_FULLSCREEN' }, '*');
      }
    } catch (e) {}

    setState(prev => {
      const activeRound = prev.currentRound || 1;
      const targetView: ActiveView = activeRound === 1
        ? 'round1_workspace'
        : (activeRound === 2 ? 'round2_workspace' : 'round3_workspace');

      const timerKey = activeRound === 1
        ? 'round1Active'
        : (activeRound === 2 ? 'round2Active' : 'round3Active');

      const remainingKey = activeRound === 1
        ? 'round1Remaining'
        : (activeRound === 2 ? 'round2Remaining' : 'round3Remaining');

      // Guarantee at least 180s if candidate was down to last minute when glitch occurred
      const currentRemaining = prev.timers[remainingKey];
      const safeRemaining = currentRemaining <= 60 ? 180 : currentRemaining;

      return {
        ...prev,
        currentView: targetView,
        timers: {
          ...prev.timers,
          [timerKey]: true,
          [remainingKey]: safeRemaining
        },
        securityState: {
          ...prev.securityState,
          isDisqualified: false,
          disqualificationReason: undefined,
          showTabSwitchWarning: false,
          tabSwitchCount: 0,
          graceExpiresAt: null,
          violationLogs: [
            ...(prev.securityState?.violationLogs || []),
            {
              type: 'TAB_SWITCH',
              message: `[PROCTOR_OVERRIDE] Workstation unlocked and re-admitted to Round ${activeRound} by Proctor (${normalized}).`,
              timestamp: Date.now()
            }
          ]
        }
      };
    });

    return { success: true, message: 'Workstation unlocked! Returning contestant to active workspace.' };
  }, []);

  const restartCurrentRound = useCallback((pin: string): { success: boolean; message: string } => {
    const validPins = ['TECHASTRA26', 'RESCUE26', 'MGR2026', 'ADMIN2026', '9487'];
    const normalized = pin.trim().toUpperCase();
    if (!validPins.includes(normalized)) {
      return { success: false, message: 'Invalid Proctor Authorization PIN. Please check with an event coordinator.' };
    }

    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'CODE_RESCUE_ENTER_FULLSCREEN' }, '*');
      }
    } catch (e) {}

    setState(prev => {
      const activeRound = prev.currentRound || 1;
      const defaultDuration = activeRound === 1 ? 15 * 60 : (activeRound === 2 ? 20 * 60 : 25 * 60);
      const targetView: ActiveView = activeRound === 1
        ? 'round1_workspace'
        : (activeRound === 2 ? 'round2_workspace' : 'round3_workspace');
      const firstQId = activeRound === 1 ? 'r1-q1' : (activeRound === 2 ? 'r2-q1' : 'r3-q1');
      const timerActiveKey = activeRound === 1 ? 'round1Active' : (activeRound === 2 ? 'round2Active' : 'round3Active');
      const timerRemainingKey = activeRound === 1 ? 'round1Remaining' : (activeRound === 2 ? 'round2Remaining' : 'round3Remaining');

      // Reset code buffers for current round questions
      const questionsToReset = activeRound === 1
        ? round1Questions
        : (activeRound === 2 ? round2Questions : [round3Question]);

      const newCodeBuffers = { ...prev.codeBuffers };
      const newBestScores = { ...prev.bestScores };
      questionsToReset.forEach(q => {
        newCodeBuffers[q.id] = q.initialCode;
        delete newBestScores[q.id];
      });

      const roundScoreKey = activeRound === 1 ? 'round1' : (activeRound === 2 ? 'round2' : 'round3');
      const newScores = {
        ...prev.scores,
        [roundScoreKey]: 0
      };

      return {
        ...prev,
        currentView: targetView,
        activeQuestionId: firstQId,
        codeBuffers: newCodeBuffers,
        bestScores: newBestScores,
        scores: newScores,
        timers: {
          ...prev.timers,
          [timerActiveKey]: true,
          [timerRemainingKey]: defaultDuration
        },
        securityState: {
          ...prev.securityState,
          isDisqualified: false,
          disqualificationReason: undefined,
          showTabSwitchWarning: false,
          tabSwitchCount: 0,
          graceExpiresAt: null,
          violationLogs: [
            ...(prev.securityState?.violationLogs || []),
            {
              type: 'TAB_SWITCH',
              message: `[PROCTOR_OVERRIDE] Round ${activeRound} restarted fresh by Proctor (${normalized}). Full duration granted (${defaultDuration / 60}m).`,
              timestamp: Date.now()
            }
          ]
        }
      };
    });

    return { success: true, message: 'Round successfully restarted! Full time granted.' };
  }, []);

  const restartCompetitionWithParticipant = useCallback((pin?: string): { success: boolean; message: string } => {
    if (pin) {
      const validPins = ['TECHASTRA26', 'RESCUE26', 'MGR2026', 'ADMIN2026', '9487'];
      const normalized = pin.trim().toUpperCase();
      if (!validPins.includes(normalized)) {
        return { success: false, message: 'Invalid Proctor Authorization PIN.' };
      }
    }

    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'CODE_RESCUE_EXIT_FULLSCREEN' }, '*');
      }
    } catch (e) {}

    setState(prev => ({
      ...getInitialState(),
      participant: prev.participant,
      currentView: 'rules'
    }));

    return { success: true, message: 'Competition reset for participant. Navigating to briefing rules.' };
  }, []);

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
        updateQualificationConfig,
        getCurrentRoundQuestions,
        getCurrentRoundScore,
        getTotalScore,
        recordTabSwitch,
        dismissTabSwitchWarning,
        triggerClipboardWarning,
        clearClipboardWarning,
        disqualifyContestant,
        readmitContestant,
        restartCurrentRound,
        restartCompetitionWithParticipant
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
