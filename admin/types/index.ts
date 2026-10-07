// ============================================================================
// TECHASTRA 2026 — CODE RESCUE ADMIN PORTAL TYPES
// ============================================================================

export type ParticipantStatus = 'ACTIVE' | 'COMPLETED' | 'QUALIFIED' | 'ELIMINATED' | 'FLAGGED' | 'DISQUALIFIED';

export type RoundId = 'R1' | 'R2' | 'R3';

export type StrikeSeverity = 'CLEAN' | 'WARNING' | 'FLAGGED';

export interface AdminUser {
    id: string;
    username: string;
    name: string;
    role: 'ADMINISTRATOR' | 'COORDINATOR' | 'INVIGILATOR';
    token: string;
    authenticatedAt: string;
}

export interface ParticipantScore {
    round1: number;
    round2: number;
    round3: number;
    total: number;
}

export interface Participant {
    id: string; // e.g. 'CR-0001'
    name: string;
    college: string;
    department: string;
    year: string;
    currentRound: RoundId;
    currentQuestion: string;
    score: number; // Current round score
    totalScore: number;
    time: string; // Elapsed or remaining, e.g. '18:42'
    timeRemaining?: number; // Raw seconds remaining
    lastKeystrokeAt?: number;
    currentCode?: string;
    status: ParticipantStatus;
    strikes: number;
    lastEvent: string;
    scores: ParticipantScore;
    sessionActive: boolean;
    submissionsCount: number;
    securityEventsCount: number;
}

export interface LiveScreenData {
    participantId: string;
    participantName: string;
    roundId: string;
    questionId: string;
    questionTitle: string;
    code: string;
    timeRemaining: number;
    lastKeystrokeAt: number;
    college?: string;
    department?: string;
    status?: string;
    strikes?: number;
    score?: number;
    totalScore?: number;
}

export interface SecurityEvent {
    id: string;
    participantId: string;
    participantName: string;
    eventType: 'WINDOW_BLUR' | 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'KEY_COMBINATION' | 'MULTIPLE_DISPLAYS';
    description: string;
    timestamp: string;
    strikeCount: number;
    status: StrikeSeverity;
}

export interface TestCaseResult {
    testName: string;
    passed: boolean;
    input?: string;
    expected?: string;
    actual?: string;
}

export interface Submission {
    id: string;
    participantId: string;
    participantName: string;
    round: RoundId;
    question: string;
    submissionTime: string;
    result: 'PASSED' | 'FAILED' | 'SYNTAX_ERROR' | 'RUNTIME_ERROR';
    score: number;
    maxScore: number;
    code: string;
    testResults: TestCaseResult[];
    executionOutput: string;
    errorTraceback?: string;
}

export interface RoundStatus {
    roundId: RoundId;
    name: string;
    title: string;
    description: string;
    cutoff: number;
    maxScore: number;
    durationMinutes: number;
    qualifiedCount: number;
    pendingCount: number;
    eliminatedCount: number;
    isActive: boolean;
}

export interface Announcement {
    id: string;
    message: string;
    timestamp: string;
    author: string;
    roundTarget: string;
    broadcasted: boolean;
}

export interface DashboardOverviewStats {
    totalParticipants: number;
    active: number;
    completed: number;
    qualified: number;
    eliminated: number;
    flagged: number;
}
