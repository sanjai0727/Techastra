import { CompetitionState, QualificationConfig } from '../types/competition';

const STORAGE_KEY = 'code_rescue_contest_state_v1';

export const DEFAULT_QUALIFICATION_CONFIG: QualificationConfig = {
  round1MinScore: 5,  // 5 / 10 marks to qualify (50% cutoff)
  round2MinScore: 10  // 10 / 20 marks to qualify (50% cutoff)
};

export const INITIAL_TIMERS = {
  round1Remaining: 15 * 60, // 15 minutes (900s)
  round2Remaining: 20 * 60, // 20 minutes (1200s)
  round3Remaining: 25 * 60, // 25 minutes (1500s)
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
        // Sanitize legacy cutoffs if older 100-point scale is still saved
        const safeQual = {
          round1MinScore: (parsed.qualificationConfig?.round1MinScore > 10) ? 5 : (parsed.qualificationConfig?.round1MinScore ?? 5),
          round2MinScore: (parsed.qualificationConfig?.round2MinScore > 20) ? 10 : (parsed.qualificationConfig?.round2MinScore ?? 10)
        };
        return {
          ...parsed,
          qualificationConfig: safeQual,
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
