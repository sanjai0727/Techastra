import { CompetitionState, QualificationConfig } from '../types/competition';

const STORAGE_KEY = 'code_rescue_contest_state_v1';

export const DEFAULT_QUALIFICATION_CONFIG: QualificationConfig = {
  round1MinScore: 50, // 50 / 100 to qualify
  round2MinScore: 50  // 50 / 100 to qualify
};

export const INITIAL_TIMERS = {
  round1Remaining: 20 * 60, // 20 minutes (1200s)
  round2Remaining: 25 * 60, // 25 minutes (1500s)
  round3Remaining: 40 * 60, // 40 minutes (2400s)
  round1Active: false,
  round2Active: false,
  round3Active: false
};

export const DEFAULT_SECURITY_STATE = {
  tabSwitchCount: 0,
  isDisqualified: false,
  showTabSwitchWarning: false,
  clipboardWarning: null,
  violationLogs: [],
  graceExpiresAt: null
};

export const getInitialState = (): CompetitionState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate essentials
      if (parsed && parsed.currentView) {
        return {
          ...parsed,
          securityState: {
            ...DEFAULT_SECURITY_STATE,
            ...(parsed.securityState || {})
          }
        };
      }
    }
  } catch (e) {
    console.error('Failed to parse saved state from localStorage', e);
  }

  return {
    currentView: 'welcome',
    participant: null,
    currentRound: 1,
    activeQuestionId: 'r1-q1',
    qualificationConfig: { ...DEFAULT_QUALIFICATION_CONFIG },
    timers: { ...INITIAL_TIMERS },
    codeBuffers: {},
    submissions: {},
    bestScores: {},
    roundResults: {},
    isCompetitionComplete: false,
    competitionModeActive: true,
    organizerModeOpen: false,
    securityState: { ...DEFAULT_SECURITY_STATE }
  };
};

export const saveState = (state: CompetitionState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
};

export const clearState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear state', e);
  }
};
