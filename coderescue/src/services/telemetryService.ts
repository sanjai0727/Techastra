// ============================================================================
// CONTESTANT ARENA REAL-TIME TELEMETRY SERVICE
// Pushes real-time heartbeats, proctoring violations, live keystrokes, and
// test submissions to backend server and cross-tab BroadcastChannel.
// ============================================================================

export interface TelemetryHeartbeatPayload {
  participantId: string;
  fullName?: string;
  college?: string;
  department?: string;
  year?: string;
  currentRound: string; // 'R1' | 'R2' | 'R3'
  currentQuestion?: string;
  roundTimeRemaining?: number;
  score?: number;
  round1Score?: number;
  round2Score?: number;
  round3Score?: number;
  totalScore?: number;
  status: 'ACTIVE' | 'WARNING' | 'FLAGGED' | 'DISQUALIFIED' | 'COMPLETED' | 'ELIMINATED';
  strikes: number;
  lastActivity?: string;
}

export interface ProctoringEventPayload {
  participantId: string;
  participantName?: string;
  eventType: 'TAB_SWITCH' | 'WINDOW_BLUR' | 'CLIPBOARD' | 'CONTEXT_MENU' | 'KEYBOARD' | 'DISQUALIFIED';
  details: string;
  strikeCount: number;
  status: 'WARNING' | 'FLAGGED' | 'DISQUALIFIED';
}

export interface LiveScreenPayload {
  participantId: string;
  participantName?: string;
  roundId: string;
  questionId: string;
  questionTitle?: string;
  code: string;
  timeRemaining?: number;
}

export interface SubmissionPayload {
  participantId: string;
  participantName?: string;
  roundId: string;
  questionId: string;
  questionTitle?: string;
  language?: string;
  code: string;
  testResults: any[];
  passedCount: number;
  totalTests: number;
  result: 'PASSED' | 'FAILED';
  score: number;
  executionTimeMs?: number;
}

class TelemetryService {
  private broadcastChannel: BroadcastChannel | null = null;
  private screenDebounceTimer: any = null;
  private lastLiveCode: string = '';

  constructor() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('techastra_telemetry');
      }
    } catch {
      // BroadcastChannel not available in environment
    }
  }

  // 1. Live Heartbeat Dispatch
  public async sendTelemetryHeartbeat(payload: TelemetryHeartbeatPayload): Promise<{ success: boolean; reinstated?: boolean; pardoned?: boolean; timeRemaining?: number; schedule?: any }> {
    if (!payload.participantId) return { success: false };

    // Cross-tab zero latency push
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'PARTICIPANT_HEARTBEAT',
          payload: {
            ...payload,
            name: payload.fullName,
            roundScore: payload.score,
          }
        });
      }
    } catch {}

    // HTTP POST to server
    try {
      const res = await fetch('/api/telemetry/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        return data;
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    }
  }

  // Fetch official competition schedule from server
  public async fetchSchedule(): Promise<any> {
    try {
      const res = await fetch('/api/competition/schedule', {
        headers: { 'Accept': 'application/json' }
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        if (data && data.success) {
          return data.schedule;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  // Cross-tab session reset / pardon listener
  public onSessionReset(callback: (participantId?: string) => void): () => void {
    if (!this.broadcastChannel) return () => {};
    const handler = (e: MessageEvent) => {
      const data = e.data;
      if (data?.type === 'SESSION_RESET' || data?.type === 'PARTICIPANT_REINSTATED') {
        callback(data.participantId);
      }
    };
    this.broadcastChannel.addEventListener('message', handler);
    return () => this.broadcastChannel?.removeEventListener('message', handler);
  }

  // Cross-tab schedule update listener
  public onScheduleUpdate(callback: (schedule: any) => void): () => void {
    if (!this.broadcastChannel) return () => {};
    const handler = (e: MessageEvent) => {
      const data = e.data;
      if (data?.type === 'SCHEDULE_UPDATED' && data.schedule) {
        callback(data.schedule);
      }
    };
    this.broadcastChannel.addEventListener('message', handler);
    return () => this.broadcastChannel?.removeEventListener('message', handler);
  }

  // 2. Proctoring Security Event Dispatch (Instant on Tab Switch, Blur, Cut/Copy, Disqualification)
  public async sendProctoringEvent(payload: ProctoringEventPayload): Promise<void> {
    if (!payload.participantId) return;

    // Cross-tab broadcast
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'PROCTORING_SECURITY_EVENT',
          payload: {
            participantId: payload.participantId,
            eventType: payload.eventType,
            description: payload.details,
            strikeCount: payload.strikeCount,
            status: payload.status,
            timestamp: new Date().toTimeString().split(' ')[0]
          }
        });
      }
    } catch {}

    // HTTP POST to server
    try {
      await fetch('/api/proctoring/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      // Non-blocking
    }
  }

  // 3. Debounced Live Screen Streaming (Keystrokes -> Admin Matrix)
  public sendLiveScreen(payload: LiveScreenPayload): void {
    if (!payload.participantId) return;
    if (this.lastLiveCode === payload.code) return;

    if (this.screenDebounceTimer) {
      clearTimeout(this.screenDebounceTimer);
    }

    this.screenDebounceTimer = setTimeout(async () => {
      this.lastLiveCode = payload.code;
      try {
        await fetch('/api/telemetry/live-screen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            lastKeystrokeAt: Date.now()
          })
        });
      } catch {}
    }, 400);
  }

  // 4. Test Submission Dispatch
  public async sendSubmission(payload: SubmissionPayload): Promise<void> {
    if (!payload.participantId) return;

    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      // Log or retry
    }
  }
}

export const telemetryService = new TelemetryService();
