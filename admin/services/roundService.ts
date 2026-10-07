// ============================================================================
// ROUND MANAGEMENT SERVICE — TECHASTRA 2026 ADMIN PORTAL
// Manages round state, qualification cutoff thresholds, active round toggles,
// and participant readiness metrics directly through SQLite database.
// Zero demo data — persistent state with live SSE sync.
// ============================================================================

import { RoundId, RoundStatus, CompetitionSchedule } from '../types';
import { AdminAuthService } from './adminAuthService';

export class RoundService {
    private static rounds: RoundStatus[] = [
        {
            roundId: 'R1',
            name: 'Round 1',
            title: 'Bug Hunt',
            isActive: true,
            cutoff: 5,
            maxScore: 10,
            participantsCount: 0,
            qualifiedCount: 0,
            timeLimitMinutes: 15,
            totalQuestions: 10,
            description: 'Syntax & lexical triage: Missing colons, bracket mismatches, tab vs space indentation faults, and misspelled identifiers.',
        },
        {
            roundId: 'R2',
            name: 'Round 2',
            title: 'Logic Breaker',
            isActive: false,
            cutoff: 10,
            maxScore: 20,
            participantsCount: 0,
            qualifiedCount: 0,
            timeLimitMinutes: 20,
            totalQuestions: 10,
            description: 'Insidious logical hazards: Off-by-one loops, zero-division hazards, mutable default argument traps, and boundary cases.',
        },
        {
            roundId: 'R3',
            name: 'Round 3',
            title: 'Code Rescue',
            isActive: false,
            cutoff: 0,
            maxScore: 5,
            participantsCount: 0,
            qualifiedCount: 0,
            timeLimitMinutes: 25,
            totalQuestions: 1,
            description: 'System disaster recovery: Complex interconnected legacy codebase triage with cascaded failures across ingestion, computation, and output.',
        },
    ];
    private static listeners: Array<(rounds: RoundStatus[]) => void> = [];
    private static isPolling: boolean = false;
    private static pollInterval: any = null;

    public static init(): void {
        if (this.isPolling) return;
        this.isPolling = true;

        this.fetchRounds();
        if (typeof window !== 'undefined') {
            this.pollInterval = setInterval(() => {
                this.fetchRounds();
            }, 5000);
        }
    }

    public static setRounds(list: RoundStatus[]): void {
        if (!Array.isArray(list) || list.length === 0) return;
        this.rounds = list;
        this.notify();
    }

    public static fetchRounds(): void {
        if (typeof fetch === 'undefined') return;

        fetch('/api/rounds')
            .then((res) => res.json())
            .then((data) => {
                if (data && Array.isArray(data.rounds) && data.rounds.length > 0) {
                    this.rounds = data.rounds;
                    this.notify();
                }
            })
            .catch(() => {});
    }

    public static getRounds(): RoundStatus[] {
        this.init();
        return [...this.rounds];
    }

    public static updateCutoff(roundId: RoundId, newCutoff: number): boolean {
        let changed = false;
        this.rounds = this.rounds.map((r) => {
            if (r.roundId === roundId) {
                changed = true;
                return { ...r, cutoff: Math.max(0, Math.min(r.maxScore, newCutoff)) };
            }
            return r;
        });

        if (changed) this.notify();

        // Persist to backend database
        fetch(`/api/rounds/${roundId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...AdminAuthService.getAuthHeader(),
            },
            body: JSON.stringify({ cutoff: newCutoff }),
        }).catch(() => {});

        return changed;
    }

    public static setActiveRound(roundId: RoundId): void {
        this.rounds = this.rounds.map((r) => ({
            ...r,
            isActive: r.roundId === roundId,
        }));
        this.notify();

        // Persist to backend database
        fetch(`/api/rounds/${roundId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...AdminAuthService.getAuthHeader(),
            },
            body: JSON.stringify({ isActive: true }),
        }).catch(() => {});
    }

    public static async adjustRoundTimer(roundId: string, additionalSeconds?: number, setSeconds?: number): Promise<boolean> {
        try {
            const res = await fetch('/api/rounds/adjust-timer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...AdminAuthService.getAuthHeader(),
                },
                body: JSON.stringify({ roundId, additionalSeconds, setSeconds }),
            });
            const data = await res.json();
            return !!data.success;
        } catch {
            return false;
        }
    }

    public static async getSchedule(): Promise<CompetitionSchedule | null> {
        try {
            const res = await fetch('/api/competition/schedule');
            const data = await res.json();
            if (data && data.success && data.schedule) {
                return data.schedule as CompetitionSchedule;
            }
            return null;
        } catch {
            return null;
        }
    }

    public static async updateSchedule(payload: { startTime?: string; endTime?: string; eventEnded?: boolean }): Promise<{ success: boolean; schedule?: CompetitionSchedule; error?: string }> {
        try {
            const res = await fetch('/api/admin/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...AdminAuthService.getAuthHeader(),
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data && data.success) {
                return { success: true, schedule: data.schedule };
            }
            return { success: false, error: data?.error || 'Failed to update schedule' };
        } catch (e: any) {
            return { success: false, error: e?.message || 'Network error updating schedule' };
        }
    }

    public static subscribe(listener: (rounds: RoundStatus[]) => void): () => void {
        this.init();
        this.listeners.push(listener);
        listener([...this.rounds]);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    private static notify(): void {
        const copy = [...this.rounds];
        this.listeners.forEach((l) => l(copy));
    }
}
