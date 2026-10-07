import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
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
import { telemetryService } from '../services/telemetryService';
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
  autoSubmitCurrentRound: (roundNum?: 1 | 2 | 3) => Promise<void>;
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
  pardonStrikesAndRestoreSession: () => void;
}

const CompetitionContext = createContext<CompetitionContextType | null>(null);

export const CompetitionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CompetitionState>(getInitialState);
  const autoSubmitRef = useRef<(roundNum?: 1 | 2 | 3) => Promise<void>>(async () => {});
  const startRoundRef = useRef<(round: 1 | 2 | 3) => void>(() => {});

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

  // Live Timer, Schedule Monitoring & Auto-Submit Tick Effect
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      setState(prev => {
        let scheduleChanged = false;
        let newIsStarted = prev.schedule.isStarted;
        let newIsEnded = prev.schedule.isEnded;

        if (prev.schedule.startTime) {
          const startMs = new Date(prev.schedule.startTime).getTime();
          if (!isNaN(startMs)) {
            const started = now >= startMs;
            if (started !== newIsStarted) {
              newIsStarted = started;
              scheduleChanged = true;
            }
          }
        }

        if (prev.schedule.endTime) {
          const endMs = new Date(prev.schedule.endTime).getTime();
          if (!isNaN(endMs)) {
            const ended = now >= endMs;
            if (ended !== newIsEnded) {
              newIsEnded = ended;
              scheduleChanged = true;
            }
          }
        }

        // If event just transitioned to ended, auto-submit active workspace!
        if (newIsEnded && prev.currentView.includes('workspace') && !prev.isAutoSubmitting) {
          setTimeout(() => {
            if (autoSubmitRef.current) {
              autoSubmitRef.current(prev.currentRound);
            }
          }, 10);
        }

        // If event just started and contestant is on waiting room, enter Round 1!
        if (newIsStarted && !newIsEnded && prev.currentView === 'waiting_room') {
          setTimeout(() => {
            if (startRoundRef.current) {
              startRoundRef.current(1);
            }
          }, 10);
        }

        // Timer ticks only if event is actively running
        let timersChanged = false;
        const newTimers = { ...prev.timers };

        if (!newIsEnded && (newIsStarted || !prev.schedule.startTime)) {
          if (newTimers.round1Active && newTimers.round1Remaining > 0) {
            newTimers.round1Remaining -= 1;
            timersChanged = true;
            if (newTimers.round1Remaining <= 0) {
              newTimers.round1Active = false;
              setTimeout(() => {
                if (autoSubmitRef.current) autoSubmitRef.current(1);
              }, 10);
            }
          }

          if (newTimers.round2Active && newTimers.round2Remaining > 0) {
            newTimers.round2Remaining -= 1;
            timersChanged = true;
            if (newTimers.round2Remaining <= 0) {
              newTimers.round2Active = false;
              setTimeout(() => {
                if (autoSubmitRef.current) autoSubmitRef.current(2);
              }, 10);
            }
          }

          if (newTimers.round3Active && newTimers.round3Remaining > 0) {
            newTimers.round3Remaining -= 1;
            timersChanged = true;
            if (newTimers.round3Remaining <= 0) {
              newTimers.round3Active = false;
              setTimeout(() => {
                if (autoSubmitRef.current) autoSubmitRef.current(3);
              }, 10);
            }
          }
        }

        if (!scheduleChanged && !timersChanged) return prev;

        return {
          ...prev,
          timers: newTimers,
          schedule: scheduleChanged ? {
            ...prev.schedule,
            isStarted: newIsStarted,
            isEnded: newIsEnded,
            status: !newIsStarted ? 'WAITING_TO_START' : (newIsEnded ? 'ENDED' : 'IN_PROGRESS')
          } : prev.schedule
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Session reinstatement & strike pardon handler (triggered by Admin broadcast or heartbeat response)
  const pardonStrikesAndRestoreSession = useCallback(() => {
    setState(prev => {
      // Determine what view to return to:
      // If contestant was disqualified, return them to their current round workspace
      let nextView: ActiveView = prev.currentView;
      if (prev.currentView === 'disqualified') {
        if (prev.currentRound === 1) nextView = 'round1_workspace';
        else if (prev.currentRound === 2) nextView = 'round2_workspace';
        else if (prev.currentRound === 3) nextView = 'round3_workspace';
        else nextView = 'welcome';
      }

      // Restore active timer for the current round if time remaining > 0
      const newTimers = { ...prev.timers };
      if (prev.currentRound === 1 && newTimers.round1Remaining > 0) {
        newTimers.round1Active = true;
      } else if (prev.currentRound === 2 && newTimers.round2Remaining > 0) {
        newTimers.round2Active = true;
      } else if (prev.currentRound === 3 && newTimers.round3Remaining > 0) {
        newTimers.round3Active = true;
      }

      // Re-enter fullscreen if parent is listening
      try {
        if (window.parent && window.parent !== window && nextView.includes('workspace')) {
          window.parent.postMessage({ type: 'CODE_RESCUE_ENTER_FULLSCREEN' }, '*');
        }
      } catch (e) {}

      return {
        ...prev,
        currentView: nextView,
        timers: newTimers,
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
              type: 'PARDON',
              message: 'Session strikes pardoned & reinstated by Coordinator/Administrator',
              timestamp: Date.now()
            }
          ]
        }
      };
    });
  }, []);

  // Listen for real-time broadcast session resets / pardons from Admin
  useEffect(() => {
    if (!state.participant) return;
    const unsub = telemetryService.onSessionReset((targetId) => {
      if (!targetId || targetId.toUpperCase() === state.participant?.participantId?.toUpperCase()) {
        pardonStrikesAndRestoreSession();
      }
    });
    return () => unsub();
  }, [state.participant, pardonStrikesAndRestoreSession]);

  // Real-Time Telemetry Heartbeat Effect to Admin & Backend Server
  useEffect(() => {
    if (!state.participant) return;

    const roundNum = state.currentRound;
    const remainingSeconds = roundNum === 1
      ? state.timers.round1Remaining
      : (roundNum === 2 ? state.timers.round2Remaining : state.timers.round3Remaining);

    const r1 = round1Questions.reduce((sum, q) => sum + (state.bestScores[q.id] || 0), 0);
    const r2 = round2Questions.reduce((sum, q) => sum + (state.bestScores[q.id] || 0), 0);
    const r3 = state.bestScores[round3Question.id] || 0;
    const curRoundScore = roundNum === 1 ? r1 : (roundNum === 2 ? r2 : r3);
    const total = r1 + r2 + r3;

    let status: 'ACTIVE' | 'WARNING' | 'FLAGGED' | 'DISQUALIFIED' = 'ACTIVE';
    if (state.securityState?.isDisqualified) {
      status = 'DISQUALIFIED';
    } else if ((state.securityState?.tabSwitchCount || 0) >= 2) {
      status = 'FLAGGED';
    } else if ((state.securityState?.tabSwitchCount || 0) === 1) {
      status = 'WARNING';
    }

    const curQuestion = [...round1Questions, ...round2Questions, round3Question].find(q => q.id === state.activeQuestionId);
    const qTitle = curQuestion ? `Q${curQuestion.number}: ${curQuestion.title}` : state.activeQuestionId;

    const sendHeartbeatNow = async () => {
      const resp = await telemetryService.sendTelemetryHeartbeat({
        participantId: state.participant!.participantId,
        fullName: state.participant!.fullName,
        college: state.participant!.college,
        department: state.participant!.department,
        year: state.participant!.year,
        currentRound: `R${roundNum}`,
        currentQuestion: qTitle,
        roundTimeRemaining: remainingSeconds,
        score: curRoundScore,
        round1Score: r1,
        round2Score: r2,
        round3Score: r3,
        totalScore: total,
        status,
        strikes: state.securityState?.tabSwitchCount || 0,
        lastActivity: state.securityState?.isDisqualified
          ? `DISQUALIFIED: ${state.securityState?.disqualificationReason || 'Integrity Violation'}`
          : `Active in Round ${roundNum} (${qTitle})`,
      });

      if (resp?.reinstated || resp?.pardoned) {
        pardonStrikesAndRestoreSession();
      }

      if (resp?.schedule) {
        setState(prev => {
          if (
            prev.schedule?.startTime !== resp.schedule.startTime ||
            prev.schedule?.endTime !== resp.schedule.endTime ||
            prev.schedule?.isStarted !== resp.schedule.isStarted ||
            prev.schedule?.isEnded !== resp.schedule.isEnded
          ) {
            return {
              ...prev,
              schedule: resp.schedule
            };
          }
          return prev;
        });
      }

      if (resp?.timeRemaining !== undefined && Math.abs(resp.timeRemaining - remainingSeconds) > 3) {
        setState(prev => {
          const key = roundNum === 1 ? 'round1Remaining' : (roundNum === 2 ? 'round2Remaining' : 'round3Remaining');
          return {
            ...prev,
            timers: {
              ...prev.timers,
              [key]: resp.timeRemaining!
            }
          };
        });
      }
    };

    // Send immediately on state update
    sendHeartbeatNow();

    // Repeat every 3 seconds
    const interval = setInterval(sendHeartbeatNow, 3000);
    return () => clearInterval(interval);
  }, [
    state.participant,
    state.currentRound,
    state.activeQuestionId,
    state.timers.round1Remaining,
    state.timers.round2Remaining,
    state.timers.round3Remaining,
    state.securityState?.isDisqualified,
    state.securityState?.tabSwitchCount,
    state.securityState?.disqualificationReason,
    state.bestScores,
    pardonStrikesAndRestoreSession
  ]);

  const setView = (view: ActiveView) => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'CODE_RESCUE_ENTER_FULLSCREEN' }, '*');
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

    // Gating check: if event has not started yet, route to waiting_room
    if (state.schedule?.startTime && !state.schedule?.isStarted) {
      setState(prev => ({
        ...prev,
        currentRound: round,
        currentView: 'waiting_room'
      }));
      return;
    }

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

  startRoundRef.current = startRound;

  // Initial schedule sync and SSE / BroadcastChannel subscription
  useEffect(() => {
    telemetryService.fetchSchedule().then((sch) => {
      if (sch) {
        setState(prev => ({
          ...prev,
          schedule: {
            ...prev.schedule,
            ...sch
          }
        }));
      }
    });

    const unsubsReset = telemetryService.onSessionReset((id) => {
      if (!id || id === state.participant?.participantId) {
        pardonStrikesAndRestoreSession();
      }
    });

    const unsubsSchedule = telemetryService.onScheduleUpdate((sch) => {
      if (sch) {
        setState(prev => ({
          ...prev,
          schedule: {
            ...prev.schedule,
            ...sch
          }
        }));
      }
    });

    return () => {
      unsubsReset();
      unsubsSchedule();
    };
  }, [pardonStrikesAndRestoreSession, state.participant?.participantId]);

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

    if (state.participant) {
      const allQ = [...round1Questions, ...round2Questions, round3Question];
      const q = allQ.find(item => item.id === questionId);
      const remainingSeconds = state.currentRound === 1
        ? state.timers.round1Remaining
        : (state.currentRound === 2 ? state.timers.round2Remaining : state.timers.round3Remaining);

      telemetryService.sendLiveScreen({
        participantId: state.participant.participantId,
        participantName: state.participant.fullName,
        roundId: `R${state.currentRound}`,
        questionId: q ? `Q${q.number}` : questionId,
        questionTitle: q?.title || questionId,
        code,
        timeRemaining: remainingSeconds,
      });
    }
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

    if (state.participant) {
      const remainingSeconds = state.currentRound === 1
        ? state.timers.round1Remaining
        : (state.currentRound === 2 ? state.timers.round2Remaining : state.timers.round3Remaining);

      telemetryService.sendLiveScreen({
        participantId: state.participant.participantId,
        participantName: state.participant.fullName,
        roundId: `R${state.currentRound}`,
        questionId: q ? `Q${q.number}` : questionId,
        questionTitle: q?.title || questionId,
        code: original,
        timeRemaining: remainingSeconds,
      });
    }
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

    if (state.participant) {
      telemetryService.sendSubmission({
        participantId: state.participant.participantId,
        participantName: state.participant.fullName,
        roundId: `R${question.round}`,
        questionId: `Q${question.number}`,
        questionTitle: question.title,
        language: 'python',
        code,
        testResults: result.testResults,
        passedCount: result.visiblePassed + result.hiddenPassed,
        totalTests: result.visibleTotal + result.hiddenTotal,
        result: isAccepted ? 'PASSED' : 'FAILED',
        score: scoreEarned,
        executionTimeMs: result.executionTimeMs,
      });
    }

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

  // Automatic submission of all buffered work when time expires or event ends
  const autoSubmitCurrentRound = useCallback(async (roundNum?: 1 | 2 | 3) => {
    const targetRound = roundNum || state.currentRound;
    setState(prev => ({ ...prev, isAutoSubmitting: true }));

    try {
      const questions = targetRound === 1 ? round1Questions : (targetRound === 2 ? round2Questions : [round3Question]);
      for (const q of questions) {
        const userCode = state.codeBuffers[q.id];
        if (userCode && userCode.trim() && userCode !== q.brokenCode) {
          const prevSubs = state.submissions[q.id] || [];
          const alreadySubmitted = prevSubs.some(s => s.code === userCode);
          if (!alreadySubmitted) {
            await submitSolution(q, userCode);
          }
        }
      }
    } catch (e) {
      console.error('Error during auto-submission:', e);
    } finally {
      setState(prev => ({ ...prev, isAutoSubmitting: false }));
      finalizeRound(targetRound);
    }
  }, [state.currentRound, state.codeBuffers, state.submissions, finalizeRound]);

  autoSubmitRef.current = autoSubmitCurrentRound;

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

        if (prev.participant) {
          telemetryService.sendProctoringEvent({
            participantId: prev.participant.participantId,
            participantName: prev.participant.fullName,
            eventType: 'TAB_SWITCH',
            details: logEntry.message,
            strikeCount: nextCount,
            status: 'DISQUALIFIED'
          });
          telemetryService.sendTelemetryHeartbeat({
            participantId: prev.participant.participantId,
            fullName: prev.participant.fullName,
            college: prev.participant.college,
            department: prev.participant.department,
            year: prev.participant.year,
            currentRound: `R${prev.currentRound}`,
            status: 'DISQUALIFIED',
            strikes: nextCount,
            lastActivity: logEntry.message
          });
        }

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

      if (prev.participant) {
        telemetryService.sendProctoringEvent({
          participantId: prev.participant.participantId,
          participantName: prev.participant.fullName,
          eventType: 'TAB_SWITCH',
          details: logEntry.message,
          strikeCount: nextCount,
          status: nextCount >= 2 ? 'FLAGGED' : 'WARNING'
        });
      }

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
    setState(prev => {
      if (prev.participant) {
        telemetryService.sendProctoringEvent({
          participantId: prev.participant.participantId,
          participantName: prev.participant.fullName,
          eventType: 'CLIPBOARD',
          details: message,
          strikeCount: prev.securityState?.tabSwitchCount || 0,
          status: (prev.securityState?.tabSwitchCount || 0) >= 2 ? 'FLAGGED' : 'WARNING'
        });
      }
      return {
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
      };
    });
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
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'CODE_RESCUE_ENTER_FULLSCREEN' }, '*');
      }
    } catch (e) {}

    setState(prev => {
      const strikeCount = Math.max(3, (prev.securityState?.tabSwitchCount || 0) + 1);
      if (prev.participant) {
        telemetryService.sendProctoringEvent({
          participantId: prev.participant.participantId,
          participantName: prev.participant.fullName,
          eventType: 'DISQUALIFIED',
          details: `DISQUALIFIED: ${reason}`,
          strikeCount,
          status: 'DISQUALIFIED'
        });
        telemetryService.sendTelemetryHeartbeat({
          participantId: prev.participant.participantId,
          fullName: prev.participant.fullName,
          college: prev.participant.college,
          department: prev.participant.department,
          year: prev.participant.year,
          currentRound: `R${prev.currentRound}`,
          status: 'DISQUALIFIED',
          strikes: strikeCount,
          lastActivity: `DISQUALIFIED: ${reason}`
        });
      }

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
          isDisqualified: true,
          disqualificationReason: reason,
          showTabSwitchWarning: false,
          tabSwitchCount: strikeCount,
          violationLogs: [
            ...(prev.securityState?.violationLogs || []),
            {
              type: 'TAB_SWITCH',
              message: `DISQUALIFIED: ${reason}`,
              timestamp: Date.now()
            }
          ]
        }
      };
    });
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
        autoSubmitCurrentRound,
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
        pardonStrikesAndRestoreSession
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
