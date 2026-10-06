// ============================================================================
// REAL-TIME STREAMING SERVICE — TECHASTRA 2026 ADMIN PORTAL
// Connects to Backend Server-Sent Events (/api/stream) for 0ms Live Updates
// ============================================================================

import { ParticipantService } from './participantService';
import { SubmissionService } from './submissionService';
import { ProctoringService } from './proctoringService';
import { RoundService } from './roundService';
import { AnnouncementService } from './announcementService';
import { LiveScreenService } from './liveScreenService';

export type StreamConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'OFFLINE';

export class RealtimeService {
    private static eventSource: EventSource | null = null;
    private static isInitialized = false;
    private static connectionStatus: StreamConnectionStatus = 'CONNECTING';
    private static statusListeners: Array<(status: StreamConnectionStatus) => void> = [];
    private static reconnectTimeout: any = null;

    public static init(): void {
        if (this.isInitialized) return;
        this.isInitialized = true;
        this.connect();
    }

    public static getStatus(): StreamConnectionStatus {
        return this.connectionStatus;
    }

    public static subscribeStatus(listener: (status: StreamConnectionStatus) => void): () => void {
        this.statusListeners.push(listener);
        listener(this.connectionStatus);
        return () => {
            this.statusListeners = this.statusListeners.filter((l) => l !== listener);
        };
    }

    private static setStatus(status: StreamConnectionStatus): void {
        if (this.connectionStatus === status) return;
        this.connectionStatus = status;
        this.statusListeners.forEach((l) => l(status));
    }

    private static connect(): void {
        if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

        if (this.eventSource) {
            try {
                this.eventSource.close();
            } catch {}
            this.eventSource = null;
        }

        this.setStatus('CONNECTING');

        try {
            const es = new EventSource('/api/stream');
            this.eventSource = es;

            es.onopen = () => {
                this.setStatus('CONNECTED');
                if (this.reconnectTimeout) {
                    clearTimeout(this.reconnectTimeout);
                    this.reconnectTimeout = null;
                }
            };

            es.onerror = () => {
                this.setStatus('OFFLINE');
                es.close();
                this.eventSource = null;

                // Auto reconnect after 2 seconds
                if (!this.reconnectTimeout) {
                    this.reconnectTimeout = setTimeout(() => {
                        this.reconnectTimeout = null;
                        this.connect();
                    }, 2000);
                }
            };

            // 1. Initial Snapshot on Connect
            es.addEventListener('snapshot', (e: MessageEvent) => {
                try {
                    const data = JSON.parse(e.data);
                    if (data.participants) ParticipantService.setParticipants(data.participants);
                    if (data.submissions) SubmissionService.setSubmissions(data.submissions);
                    if (data.events) ProctoringService.setEvents(data.events);
                    if (data.rounds) RoundService.setRounds(data.rounds);
                    if (data.announcements) AnnouncementService.setAnnouncements(data.announcements);
                } catch (err) {
                    console.error('[RealtimeService] Failed to parse snapshot:', err);
                }
            });

            // 2. Live Participants Updates
            es.addEventListener('participants_updated', (e: MessageEvent) => {
                try {
                    const participants = JSON.parse(e.data);
                    ParticipantService.setParticipants(participants);
                } catch {}
            });

            es.addEventListener('participant_heartbeat', (e: MessageEvent) => {
                try {
                    const payload = JSON.parse(e.data);
                    ParticipantService.updateParticipantLiveState(payload);
                    LiveScreenService.handleLiveScreenUpdate({
                        participantId: payload.id,
                        roundId: payload.currentRound,
                        questionId: payload.currentQuestion,
                        timeRemaining: payload.timeRemaining,
                    });
                } catch {}
            });

            // 2.5 Real-Time Keystroke & Code Edit Stream
            es.addEventListener('code_stream', (e: MessageEvent) => {
                try {
                    const payload = JSON.parse(e.data);
                    LiveScreenService.handleLiveScreenUpdate(payload);
                    ParticipantService.updateParticipantLiveState({
                        id: payload.participantId,
                        currentRound: payload.roundId,
                        currentQuestion: payload.questionId,
                        timeRemaining: payload.timeRemaining,
                        currentCode: payload.code,
                        lastKeystrokeAt: payload.lastKeystrokeAt,
                        lastEvent: `Editing ${payload.questionId}: ${payload.questionTitle}`,
                    });
                } catch {}
            });

            // 3. Live Code Submission
            es.addEventListener('submission_created', (e: MessageEvent) => {
                try {
                    const submission = JSON.parse(e.data);
                    SubmissionService.addSubmission(submission);
                } catch {}
            });

            // 4. Live Security & Proctoring Violation
            es.addEventListener('security_event', (e: MessageEvent) => {
                try {
                    const secEvent = JSON.parse(e.data);
                    ProctoringService.addEvent(secEvent);
                } catch {}
            });

            // 5. Live Round Config Updates
            es.addEventListener('rounds_updated', (e: MessageEvent) => {
                try {
                    const rounds = JSON.parse(e.data);
                    RoundService.setRounds(rounds);
                } catch {}
            });

            // 6. Live Announcements
            es.addEventListener('announcement_created', (e: MessageEvent) => {
                try {
                    const announcement = JSON.parse(e.data);
                    AnnouncementService.addAnnouncement(announcement);
                } catch {}
            });
        } catch (e) {
            this.setStatus('OFFLINE');
        }
    }
}
