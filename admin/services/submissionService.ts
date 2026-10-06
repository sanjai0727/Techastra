// ============================================================================
// SUBMISSION SERVICE — TECHASTRA 2026 ADMIN PORTAL
// Provides coordinator access to real participant Python code submissions,
// test results, execution logs, and tracebacks directly from SQLite database.
// Zero demo submissions — real-time persistent stream.
// ============================================================================

import { Submission } from '../types';

export class SubmissionService {
    private static submissions: Submission[] = [];
    private static listeners: Array<(submissions: Submission[]) => void> = [];
    private static isPolling: boolean = false;
    private static pollInterval: any = null;

    public static init(): void {
        if (this.isPolling) return;
        this.isPolling = true;

        this.fetchSubmissions();
        if (typeof window !== 'undefined') {
            this.pollInterval = setInterval(() => {
                this.fetchSubmissions();
            }, 4000);
        }
    }

    public static setSubmissions(list: Submission[]): void {
        if (!Array.isArray(list)) return;
        this.submissions = list;
        this.notify();
    }

    public static addSubmission(sub: Submission): void {
        if (!sub || !sub.id) return;
        const exists = this.submissions.some(s => s.id === sub.id);
        if (!exists) {
            this.submissions = [sub, ...this.submissions];
            this.notify();
        }
    }

    public static fetchSubmissions(): void {
        if (typeof fetch === 'undefined') return;

        fetch('/api/submissions')
            .then((res) => res.json())
            .then((data) => {
                if (data && Array.isArray(data.submissions)) {
                    this.submissions = data.submissions;
                    this.notify();
                }
            })
            .catch(() => {});
    }

    public static getSubmissions(): Submission[] {
        this.init();
        return [...this.submissions];
    }

    public static getSubmissionById(id: string): Submission | undefined {
        return this.submissions.find((s) => s.id === id);
    }

    public static getSubmissionsByParticipant(participantId: string): Submission[] {
        return this.submissions.filter((s) => s.participantId === participantId);
    }

    public static subscribe(listener: (submissions: Submission[]) => void): () => void {
        this.init();
        this.listeners.push(listener);
        listener([...this.submissions]);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    private static notify(): void {
        const copy = [...this.submissions];
        this.listeners.forEach((l) => l(copy));
    }
}
