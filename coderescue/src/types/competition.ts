export type BugType = 
  | 'Syntax Error'
  | 'Logical Error'
  | 'Runtime Error'
  | 'Edge Case'
  | 'Off-by-one Error'
  | 'Scope Error'
  | 'Type Error'
  | 'Multiple Issues';

export interface Participant {
  fullName: string;
  college: string;
  department: string;
  year: string;
  participantId: string;
  registeredAt: number;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description?: string;
  isHidden?: boolean;
}

export interface TestResult {
  testId: string;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string;
  isHidden: boolean;
  description?: string;
}

export interface ExecutionResult {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR' | 'TIME_LIMIT_EXCEEDED';
  visiblePassed: number;
  visibleTotal: number;
  hiddenPassed: number;
  hiddenTotal: number;
  output: string;
  error?: string;
  executionTimeMs: number;
  testResults: TestResult[];
}

export interface Question {
  id: string;
  round: 1 | 2 | 3;
  number: number;
  title: string;
  description: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  language: 'python';
  bugType: BugType;
  brokenCode: string;
  solutionCode: string;
  expectedBehavior: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string[];
  hints?: string;
  points: number;
  visibleTests: TestCase[];
  hiddenTests: TestCase[];
}

export interface Submission {
  id: string;
  questionId: string;
  round: 1 | 2 | 3;
  code: string;
  timestamp: number;
  attemptNumber: number;
  result: ExecutionResult;
  scoreEarned: number;
}

export interface RoundResult {
  round: 1 | 2 | 3;
  totalScore: number;
  maxScore: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  timeUsedSeconds: number;
  totalAllowedSeconds: number;
  accuracy: number;
  isQualified: boolean;
  completedAt: number;
}

export interface LeaderboardEntry {
  rank: number;
  participantId: string;
  name: string;
  college: string;
  round1Score: number;
  round2Score: number;
  round3Score: number;
  totalScore: number;
  totalTimeUsedSeconds: number;
  status: 'QUALIFIED' | 'WINNER_EVALUATION' | 'ELIMINATED' | 'IN_PROGRESS' | 'DISQUALIFIED';
  isCurrentParticipant?: boolean;
  isDemoData: boolean;
}

export interface QualificationConfig {
  round1MinScore: number;
  round2MinScore: number;
}

export type ActiveView = 
  | 'welcome'
  | 'registration'
  | 'rules'
  | 'round1_workspace'
  | 'round1_result'
  | 'round2_workspace'
  | 'round2_result'
  | 'round3_workspace'
  | 'final_result'
  | 'leaderboard'
  | 'admin_dashboard'
  | 'disqualified';

export interface SecurityViolationLog {
  type: 'TAB_SWITCH' | 'BLUR' | 'CLIPBOARD' | 'CONTEXT_MENU' | 'KEYBOARD';
  message: string;
  timestamp: number;
}

export interface SecurityState {
  tabSwitchCount: number;
  isDisqualified: boolean;
  disqualificationReason?: string;
  showTabSwitchWarning: boolean;
  clipboardWarning?: string | null;
  violationLogs: SecurityViolationLog[];
  graceExpiresAt?: number | null;
}

export interface CompetitionState {
  currentView: ActiveView;
  participant: Participant | null;
  currentRound: 1 | 2 | 3;
  activeQuestionId: string;
  qualificationConfig: QualificationConfig;
  timers: {
    round1Remaining: number;
    round2Remaining: number;
    round3Remaining: number;
    round1Active: boolean;
    round2Active: boolean;
    round3Active: boolean;
  };
  codeBuffers: Record<string, string>; // questionId -> user code
  submissions: Record<string, Submission[]>; // questionId -> list of submissions
  bestScores: Record<string, number>; // questionId -> highest score achieved
  roundResults: {
    round1?: RoundResult;
    round2?: RoundResult;
    round3?: RoundResult;
  };
  isCompetitionComplete: boolean;
  competitionModeActive: boolean;
  organizerModeOpen: boolean;
  securityState: SecurityState;
}
