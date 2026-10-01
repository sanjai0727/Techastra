// ============================================================================
// ROUND MANAGEMENT SERVICE — TECHASTRA 2026 ADMIN PORTAL
// Manages round state, qualification cutoff thresholds (R1=50, R2=50),
// active round toggles, and participant readiness metrics.
// ============================================================================

import { RoundId, RoundStatus } from '../types';
import { DEMO_ROUNDS } from '../data/demoRounds';

export class RoundService {
    private static rounds: RoundStatus[] = [...DEMO_ROUNDS];
    private static listeners: Array<(rounds: RoundStatus[]) => void> = [];

    public static getRounds(): RoundStatus[] {
        return [...this.rounds];
    }

    public static updateCutoff(roundId: RoundId, newCutoff: number): boolean {
        let changed = false;
        this.rounds = this.rounds.map(r => {
            if (r.roundId === roundId) {
                changed = true;
                return { ...r, cutoff: Math.max(0, Math.min(r.maxScore, newCutoff)) };
            }
            return r;
        });
        if (changed) this.notify();
        return changed;
    }

    public static setActiveRound(roundId: RoundId): void {
        this.rounds = this.rounds.map(r => ({
            ...r,
            isActive: r.roundId === roundId,
        }));
        this.notify();
    }

    public static subscribe(listener: (rounds: RoundStatus[]) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private static notify(): void {
        const copy = [...this.rounds];
        this.listeners.forEach(l => l(copy));
    }
}
