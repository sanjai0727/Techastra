const fs = require('fs');

const storageServiceCode = `import { CompetitionState, QualificationConfig } from '../types/competition';

const STORAGE_KEY = 'code_rescue_contest_state_v2';

export interface RoundConfig {
  round: 1 | 2 | 3;
  name: string;
  title: string;
  durationSeconds: number;
  durationMinutes: number;
  questionsCount: number;
  pointsPerQuestion: number;
  maxScore: number;
}

export interface CompetitionConfig {
  totalDurationMinutes: number;
  totalDurationSeconds: number;
  totalMaxScore: number;
  rounds: {
    1: RoundConfig;
    2: RoundConfig;
    3: RoundConfig;
  };
}

export const COMPETITION_CONFIG: CompetitionConfig = {
  totalDurationMinutes: 60,
  totalDurationSeconds: 60 * 60,
  totalMaxScore: 35,
  rounds: {
    1: {
      round: 1,
      name: 'ROUND 1',
      title: 'BUG HUNT',
      durationSeconds: 15 * 60, // 15:00
      durationMinutes: 15,
      questionsCount: 10,
      pointsPerQuestion: 1,
      maxScore: 10
    },
    2: {
      round: 2,
      name: 'ROUND 2',
      title: 'LOGIC BREAKER',
      durationSeconds: 20 * 60, // 20:00
      durationMinutes: 20,
      questionsCount: 10,
      pointsPerQuestion: 2,
      maxScore: 20
    },
    3: {
      round: 3,
      name: 'ROUND 3',
      title: 'CODE RESCUE',
      durationSeconds: 25 * 60, // 25:00
      durationMinutes: 25,
      questionsCount: 1,
      pointsPerQuestion: 5,
      maxScore: 5
    }
  }
};

export const DEFAULT_QUALIFICATION_CONFIG: QualificationConfig = {
  round1MinScore: 0, // Cutoff threshold managed by event organizers
  round2MinScore: 0
};

export const INITIAL_TIMERS = {
  round1Remaining: COMPETITION_CONFIG.rounds[1].durationSeconds, // 15:00 (900s)
  round2Remaining: COMPETITION_CONFIG.rounds[2].durationSeconds, // 20:00 (1200s)
  round3Remaining: COMPETITION_CONFIG.rounds[3].durationSeconds, // 25:00 (1500s)
  round1Active: false,
  round2Active: false,
  round3Active: false
};

export const getInitialState = (): CompetitionState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.currentView) {
        return parsed;
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
    organizerModeOpen: false
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
`;

fs.writeFileSync('E:/projects/techastra-coderescue/src/services/storageService.ts', storageServiceCode, 'utf8');
console.log('Successfully updated storageService.ts');
