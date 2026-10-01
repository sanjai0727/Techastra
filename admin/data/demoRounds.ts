// ============================================================================
// OFFICIAL DATA — TECHASTRA 2026 ROUND MANAGEMENT CONFIGURATION
// Final competition structure:
// Round 1 (Bug Hunt): 15 mins, 10 questions, 1 mark each = 10 marks max
// Round 2 (Logic Breaker): 20 mins, 10 questions, 2 marks each = 20 marks max
// Round 3 (Code Rescue): 25 mins, 1 question, 5 marks = 5 marks max
// Total: 60 mins, 35 marks max
// Qualification cutoffs are configurable by Admin
// ============================================================================

import { RoundStatus } from '../types';

export const DEMO_ROUNDS: RoundStatus[] = [
    {
        roundId: 'R1',
        name: 'ROUND 1',
        title: 'BUG HUNT',
        description: '10 syntax errors, missing statements, basic loops, and condition typos in short programs.',
        cutoff: 6,
        maxScore: 10,
        durationMinutes: 15,
        qualifiedCount: 6,
        pendingCount: 3,
        eliminatedCount: 1,
        isActive: true,
    },
    {
        roundId: 'R2',
        name: 'ROUND 2',
        title: 'LOGIC BREAKER',
        description: '10 algorithmic traps, edge cases, mutable defaults, and nested logic defects.',
        cutoff: 12,
        maxScore: 20,
        durationMinutes: 20,
        qualifiedCount: 3,
        pendingCount: 2,
        eliminatedCount: 0,
        isActive: false,
    },
    {
        roundId: 'R3',
        name: 'ROUND 3',
        title: 'CODE RESCUE (FINALS)',
        description: '1 comprehensive flagship broken module rescue requiring deep architectural triage.',
        cutoff: 4,
        maxScore: 5,
        durationMinutes: 25,
        qualifiedCount: 1,
        pendingCount: 1,
        eliminatedCount: 0,
        isActive: false,
    },
];
