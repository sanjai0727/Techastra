// ============================================================================
// PARTICIPANT SERVICE — TECHASTRA 2026 ADMIN PORTAL
// Connects Admin Portal to Live Participant Arena Telemetry & Heartbeat System
// ============================================================================

import { Participant, ParticipantStatus, RoundId } from '../types';
import { DEMO_PARTICIPANTS } from '../data/demoParticipants';
import { ProctoringService } from './proctoringService';

export class ParticipantService {
    private static participants: Participant[] = [...DEMO_PARTICIPANTS];
    private static listeners: Array<(participants: Participant[]) => void> = [];
    private static isTelemetryListening: boolean = false;
    private static pollInterval: any = null;

    public static initTelemetryListener(): void {
        if (this.isTelemetryListening) return;
        this.isTelemetryListening = true;

        // 1. BroadcastChannel for sibling tabs / iframe
        try {
            if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
                const channel = new BroadcastChannel('techastra_telemetry');
                channel.onmessage = (e) => {
                    const data = e.data;
                    if (data?.type === 'PARTICIPANT_HEARTBEAT') {
                        this.handleTelemetryPayload(data.payload);
                    } else if (data?.type === 'PROCTORING_SECURITY_EVENT') {
                        this.handleSecurityEvent(data.payload);
                    }
                };
            }
        } catch (err) {
            console.warn('Admin BroadcastChannel not available', err);
        }

        // 2. Window postMessage listener (for iframe embedding in OS)
        if (typeof window !== 'undefined') {
            window.addEventListener('message', (e) => {
                const data = e.data;
                if (data?.type === 'TECHASTRA_TELEMETRY') {
                    this.handleTelemetryPayload(data.payload);
                } else if (data?.type === 'TECHASTRA_SECURITY_EVENT') {
                    this.handleSecurityEvent(data.payload);
                }
            });
        }

        // 3. Periodic API Polling from Backend
        this.pollServerTelemetry();
        if (typeof window !== 'undefined') {
            this.pollInterval = setInterval(() => {
                this.pollServerTelemetry();
            }, 4000);
        }
    }

    private static pollServerTelemetry(): void {
        if (typeof fetch === 'undefined') return;

        fetch('/api/telemetry/participants')
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data.participants)) {
                    data.participants.forEach((p: any) => {
                        this.handleTelemetryPayload(p);
                    });
                }
            })
            .catch(() => {});
    }

    private static handleTelemetryPayload(payload: any): void {
        if (!payload || !payload.participantId) return;

        const id = payload.participantId;
        const roundNum = payload.currentRound ? payload.currentRound.replace('R', '') : '1';
        const roundId = (`R${roundNum}`) as RoundId;
        const qNum = payload.currentQuestion || 'Q1';

        const minutes = Math.floor((payload.roundTimeRemaining || 0) / 60);
        const seconds = (payload.roundTimeRemaining || 0) % 60;
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        const roundScore = payload.roundScore !== undefined ? payload.roundScore : (
            roundId === 'R1' ? (payload.round1Score || 0) : (
                roundId === 'R2' ? (payload.round2Score || 0) : (payload.round3Score || 0)
            )
        );

        const totalScore = payload.totalScore !== undefined
            ? Math.min(35, payload.totalScore)
            : Math.min(35, (payload.round1Score || 0) + (payload.round2Score || 0) + (payload.round3Score || 0));

        let existingIndex = this.participants.findIndex(p => p.id === id);

        const updatedRecord: Participant = {
            id,
            name: payload.name || 'Participant',
            college: payload.college || 'Institution',
            department: payload.department || 'Engineering',
            year: payload.year || 'III',
            currentRound: roundId,
            currentQuestion: roundId === 'R3' ? 'Q1' : qNum,
            score: roundScore,
            totalScore,
            time: formattedTime,
            status: payload.status || 'ACTIVE',
            strikes: payload.strikes || 0,
            lastEvent: payload.lastActivity || 'Live in Arena',
            scores: {
                round1: payload.round1Score || 0,
                round2: payload.round2Score || 0,
                round3: payload.round3Score || 0,
                total: totalScore,
            },
            sessionActive: payload.status !== 'COMPLETED' && payload.status !== 'ELIMINATED',
            submissionsCount: existingIndex !== -1 ? this.participants[existingIndex].submissionsCount : 1,
            securityEventsCount: payload.strikes || 0,
        };

        if (existingIndex !== -1) {
            this.participants[existingIndex] = {
                ...this.participants[existingIndex],
                ...updatedRecord,
                submissionsCount: Math.max(this.participants[existingIndex].submissionsCount, updatedRecord.submissionsCount)
            };
        } else {
            // New live participant from Arena - place at the top of the table!
            this.participants = [updatedRecord, ...this.participants];
        }

        this.notify();
    }

    private static handleSecurityEvent(event: any): void {
        if (!event || !event.participantId) return;
        ProctoringService.logTelemetrySecurityEvent({
            participantId: event.participantId,
            eventType: event.eventType,
            description: event.description || 'Proctoring violation recorded'
        });
    }

    public static getParticipants(): Participant[] {
        this.initTelemetryListener();
        return [...this.participants];
    }

    public static getParticipantById(id: string): Participant | undefined {
        return this.participants.find(p => p.id === id);
    }

    public static flagParticipant(id: string, reason?: string): boolean {
        let changed = false;
        this.participants = this.participants.map(p => {
            if (p.id === id) {
                changed = true;
                const newStrikes = Math.max(p.strikes + 1, 2);
                return {
                    ...p,
                    status: 'FLAGGED' as ParticipantStatus,
                    strikes: newStrikes,
                    sessionActive: false,
                    lastEvent: reason || `Coordinator flagged participant (Strikes: ${newStrikes})`,
                };
            }
            return p;
        });
        if (changed) this.notify();
        return changed;
    }

    public static reinstateSession(id: string): boolean {
        let changed = false;
        this.participants = this.participants.map(p => {
            if (p.id === id) {
                changed = true;
                return {
                    ...p,
                    status: 'ACTIVE' as ParticipantStatus,
                    strikes: 0,
                    sessionActive: true,
                    lastEvent: 'Session reinstated by Coordinator',
                };
            }
            return p;
        });
        if (changed) this.notify();
        return changed;
    }

    public static subscribe(listener: (participants: Participant[]) => void): () => void {
        this.initTelemetryListener();
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private static notify(): void {
        const copy = [...this.participants];
        this.listeners.forEach(l => l(copy));
    }
}
