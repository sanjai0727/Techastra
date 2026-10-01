// ============================================================================
// SUBMISSION SERVICE — TECHASTRA 2026 ADMIN PORTAL
// Provides coordinator access to participant Python code submissions,
// test results, execution logs, and tracebacks.
// ============================================================================

import { Submission } from '../types';
import { DEMO_SUBMISSIONS } from '../data/demoSubmissions';

export class SubmissionService {
    private static submissions: Submission[] = [...DEMO_SUBMISSIONS];

    public static getSubmissions(): Submission[] {
        return [...this.submissions];
    }

    public static getSubmissionById(id: string): Submission | undefined {
        return this.submissions.find(s => s.id === id);
    }

    public static getSubmissionsByParticipant(participantId: string): Submission[] {
        return this.submissions.filter(s => s.participantId === participantId);
    }
}
