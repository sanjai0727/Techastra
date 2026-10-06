// ============================================================================
// PROCTORING SERVICE — TECHASTRA 2026 ADMIN PORTAL
// Tracks live proctoring audit events and strikes directly from SQLite DB.
// Zero demo proctoring events — instant real-time security alerts.
// ============================================================================

import { SecurityEvent } from '../types';
import { ParticipantService } from './participantService';

export class ProctoringService {
    private static events: SecurityEvent[] = [];
    private static listeners: Array<(events: SecurityEvent[]) => void> = [];
    private static isPolling: boolean = false;
    private static pollInterval: any = null;

    public static init(): void {
        if (this.isPolling) return;
        this.isPolling = true;

        this.fetchEvents();
        if (typeof window !== 'undefined') {
            this.pollInterval = setInterval(() => {
                this.fetchEvents();
            }, 4000);
        }
    }

    public static setEvents(list: SecurityEvent[]): void {
        if (!Array.isArray(list)) return;
        this.events = list;
        this.notify();
    }

    public static addEvent(event: SecurityEvent): void {
        if (!event || !event.id) return;
        const exists = this.events.some(e => e.id === event.id);
        if (!exists) {
            this.events = [event, ...this.events];
            this.notify();
        }
    }

    public static fetchEvents(): void {
        if (typeof fetch === 'undefined') return;

        fetch('/api/telemetry/events')
            .then((res) => res.json())
            .then((data) => {
                if (data && Array.isArray(data.events)) {
                    this.events = data.events;
                    this.notify();
                }
            })
            .catch(() => {});
    }

    public static getEvents(): SecurityEvent[] {
        this.init();
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
        ParticipantService.flagParticipant(participantId, reason);
        setTimeout(() => this.fetchEvents(), 300);
    }

    public static reinstateSession(participantId: string): void {
        ParticipantService.reinstateSession(participantId);
        setTimeout(() => this.fetchEvents(), 300);
    }

    public static subscribe(listener: (events: SecurityEvent[]) => void): () => void {
        this.init();
        this.listeners.push(listener);
        listener([...this.events]);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    private static notify(): void {
        const copy = [...this.events];
        this.listeners.forEach((l) => l(copy));
    }
}
