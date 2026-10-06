// ============================================================================
// PARTICIPANT SERVICE — TECHASTRA 2026 ADMIN PORTAL
// Connects Admin Portal to Live Database & Real-Time Arena Telemetry System
// Zero mock/demo data — strictly real contestants loaded from backend DB.
// ============================================================================

import { Participant, ParticipantStatus, RoundId } from '../types';
import { ProctoringService } from './proctoringService';
import { AdminAuthService } from './adminAuthService';

export class ParticipantService {
    private static participants: Participant[] = [];
    private static listeners: Array<(participants: Participant[]) => void> = [];
    private static isTelemetryListening: boolean = false;
    private static pollInterval: any = null;
    private static clockInterval: any = null;

    public static initTelemetryListener(): void {
        if (this.isTelemetryListening) return;
        this.isTelemetryListening = true;

        // 1. Cross-tab BroadcastChannel
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

        // 2. Real-Time 1-Second Countdown Ticker (Ticking every second for live timers)
        if (typeof window !== 'undefined' && !this.clockInterval) {
            this.clockInterval = setInterval(() => {
                let changed = false;
                this.participants = this.participants.map(p => {
                    if (p.status === 'ACTIVE' && p.timeRemaining !== undefined && p.timeRemaining > 0) {
                        const rem = p.timeRemaining - 1;
                        const mm = Math.floor(rem / 60);
                        const ss = rem % 60;
                        changed = true;
                        return {
                            ...p,
                            timeRemaining: rem,
                            time: `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`,
                        };
                    }
                    return p;
                });
                if (changed) {
                    this.notify();
                }
            }, 1000);
        }

        // 3. Initial fetch & background sync interval (resilience fallback)
        this.pollServerTelemetry();
        if (typeof window !== 'undefined') {
            this.pollInterval = setInterval(() => {
                this.pollServerTelemetry();
            }, 4000);
        }
    }

    public static setParticipants(list: Participant[]): void {
        if (!Array.isArray(list)) return;
        this.participants = list.map(item => {
            let rem = item.timeRemaining;
            if (rem === undefined && item.time && item.time.includes(':')) {
                const [m, s] = item.time.split(':').map(Number);
                if (!isNaN(m) && !isNaN(s)) rem = m * 60 + s;
            }
            return {
                ...item,
                timeRemaining: rem !== undefined ? rem : 2400,
            };
        });
        this.notify();
    }

    public static updateParticipantLiveState(update: any): void {
        if (!update || !update.id) return;
        const idx = this.participants.findIndex(p => p.id === update.id);
        if (idx !== -1) {
            const cur = this.participants[idx];
            let rem = update.timeRemaining !== undefined ? Number(update.timeRemaining) : cur.timeRemaining;
            let formattedTime = cur.time;
            if (rem !== undefined && !isNaN(rem)) {
                const mm = Math.floor(Math.max(0, rem) / 60);
                const ss = Math.max(0, rem) % 60;
                formattedTime = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
            }
            this.participants[idx] = {
                ...cur,
                ...update,
                timeRemaining: rem,
                time: formattedTime,
            };
            this.notify();
        }
    }

    public static pollServerTelemetry(): void {
        if (typeof fetch === 'undefined') return;

        fetch('/api/telemetry/participants')
            .then((res) => res.json())
            .then((data) => {
                if (data && Array.isArray(data.participants)) {
                    this.participants = data.participants;
                    this.notify();
                }
            })
            .catch(() => {});
    }

    private static handleTelemetryPayload(payload: any): void {
        if (!payload || !payload.participantId) return;

        const id = payload.participantId;
        const roundNum = payload.currentRound ? String(payload.currentRound).replace('R', '') : '1';
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
            ? payload.totalScore
            : (payload.round1Score || 0) + (payload.round2Score || 0) + (payload.round3Score || 0);

        let existingIndex = this.participants.findIndex((p) => p.id === id);

        const updatedRecord: Participant = {
            id,
            name: payload.name || payload.fullName || 'Participant',
            college: payload.college || 'Institution',
            department: payload.department || 'Engineering',
            year: payload.year || '3rd Year',
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
            sessionActive: payload.status !== 'COMPLETED' && payload.status !== 'ELIMINATED' && payload.status !== 'DISQUALIFIED',
            submissionsCount: existingIndex !== -1 ? this.participants[existingIndex].submissionsCount : 1,
            securityEventsCount: payload.strikes || 0,
        };

        if (existingIndex !== -1) {
            this.participants[existingIndex] = {
                ...this.participants[existingIndex],
                ...updatedRecord,
                submissionsCount: Math.max(this.participants[existingIndex].submissionsCount, updatedRecord.submissionsCount),
            };
        } else {
            this.participants = [updatedRecord, ...this.participants];
        }

        this.notify();
    }

    private static handleSecurityEvent(event: any): void {
        if (!event || !event.participantId) return;
        ProctoringService.logTelemetrySecurityEvent({
            participantId: event.participantId,
            eventType: event.eventType,
            description: event.description || 'Proctoring violation recorded',
        });
    }

    public static getParticipants(): Participant[] {
        this.initTelemetryListener();
        return [...this.participants];
    }

    public static getParticipantById(id: string): Participant | undefined {
        return this.participants.find((p) => p.id === id);
    }

    public static flagParticipant(id: string, reason?: string): boolean {
        let changed = false;
        this.participants = this.participants.map((p) => {
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

        // Persist flag action directly to backend database
        fetch('/api/telemetry/flag', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...AdminAuthService.getAuthHeader(),
            },
            body: JSON.stringify({ participantId: id, reason: reason || 'Coordinator manual flag' }),
        }).catch(() => {});

        return changed;
    }

    public static reinstateSession(id: string): boolean {
        let changed = false;
        this.participants = this.participants.map((p) => {
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

        // Persist reinstate action directly to backend database
        fetch('/api/telemetry/reinstate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...AdminAuthService.getAuthHeader(),
            },
            body: JSON.stringify({ participantId: id }),
        }).catch(() => {});

        return changed;
    }

    public static subscribe(listener: (participants: Participant[]) => void): () => void {
        this.initTelemetryListener();
        this.listeners.push(listener);
        listener([...this.participants]);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    private static notify(): void {
        const copy = [...this.participants];
        this.listeners.forEach((l) => l(copy));
    }
}
