// ============================================================================
// PROCTORING SERVICE — TECHASTRA 2026 ADMIN PORTAL
// Tracks proctoring audit events, strikes (0=CLEAN, 1=WARNING, 2+=FLAGGED),
// with coordinator actions: REINSTATE SESSION & FLAG PARTICIPANT.
// ============================================================================

import { SecurityEvent } from '../types';
import { DEMO_PROCTORING_EVENTS } from '../data/demoProctoring';
import { ParticipantService } from './participantService';

export class ProctoringService {
    private static events: SecurityEvent[] = [...DEMO_PROCTORING_EVENTS];
    private static listeners: Array<(events: SecurityEvent[]) => void> = [];

    public static getEvents(): SecurityEvent[] {
        return [...this.events];
    }

    public static logTelemetrySecurityEvent(payload: { participantId: string; eventType: string; description: string }): void {
        const participant = ParticipantService.getParticipantById(payload.participantId);
        const name = participant ? participant.name : payload.participantId;
        const mappedType: 'WINDOW_BLUR' | 'TAB_SWITCH' | 'FULLSCREEN_EXIT' =
            payload.eventType === 'tab_hidden' ? 'TAB_SWITCH' : (
                payload.eventType === 'fullscreen_exit' ? 'FULLSCREEN_EXIT' : 'WINDOW_BLUR'
            );

        const strikes = (participant?.strikes || 0);
        const newEvent: SecurityEvent = {
            id: `SEC-${Date.now().toString().slice(-4)}`,
            participantId: payload.participantId,
            participantName: name,
            eventType: mappedType,
            description: payload.description,
            timestamp: new Date().toTimeString().split(' ')[0],
            strikeCount: strikes,
            status: strikes >= 2 ? 'FLAGGED' : 'WARNING',
        };

        this.events = [newEvent, ...this.events];
        this.notify();
    }

    public static flagParticipant(participantId: string, reason?: string): void {
        const participant = ParticipantService.getParticipantById(participantId);
        const name = participant ? participant.name : participantId;

        const newEvent: SecurityEvent = {
            id: `SEC-${Date.now().toString().slice(-4)}`,
            participantId,
            participantName: name,
            eventType: 'WINDOW_BLUR',
            description: reason || 'Coordinator manually applied FLAGGED status for malpractice review',
            timestamp: new Date().toTimeString().split(' ')[0],
            strikeCount: 2,
            status: 'FLAGGED',
        };

        this.events = [newEvent, ...this.events];
        ParticipantService.flagParticipant(participantId, reason);
        this.notify();
    }

    public static reinstateSession(participantId: string): void {
        const participant = ParticipantService.getParticipantById(participantId);
        const name = participant ? participant.name : participantId;

        const newEvent: SecurityEvent = {
            id: `SEC-${Date.now().toString().slice(-4)}`,
            participantId,
            participantName: name,
            eventType: 'WINDOW_BLUR',
            description: 'Coordinator cleared strikes and reinstated session',
            timestamp: new Date().toTimeString().split(' ')[0],
            strikeCount: 0,
            status: 'CLEAN',
        };

        this.events = [newEvent, ...this.events];
        ParticipantService.reinstateSession(participantId);
        this.notify();
    }

    public static subscribe(listener: (events: SecurityEvent[]) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private static notify(): void {
        const copy = [...this.events];
        this.listeners.forEach(l => l(copy));
    }
}
