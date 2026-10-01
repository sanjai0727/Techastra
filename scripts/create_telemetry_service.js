const fs = require('fs');

const telemetryServiceCode = `// ============================================================================
// TECHASTRA 2026 — CODE RESCUE PARTICIPANT TELEMETRY & PROCTORING SERVICE
// Authoritative reporting service connecting Participant Arena to Admin Portal
// ============================================================================

import { Participant } from '../types/competition';

export interface ParticipantTelemetryState {
  participantId: string;
  name: string;
  college: string;
  department: string;
  year: string;
  currentRound: string; // 'R1' | 'R2' | 'R3'
  currentQuestion: string; // 'Q1' .. 'Q10'
  round1Score: number;
  round2Score: number;
  round3Score: number;
  roundScore: number;
  totalScore: number;
  roundTimeRemaining: number;
  totalElapsedTime: number;
  status: 'ACTIVE' | 'FLAGGED' | 'COMPLETED' | 'DISQUALIFIED';
  strikes: number;
  lastActivity: string;
  timestamp: number;
}

export interface ProctoringEvent {
  participantId: string;
  eventType: 'window_blur' | 'tab_hidden' | 'fullscreen_exit';
  description: string;
  timestamp: number;
}

class TelemetryService {
  private participant: Participant | null = null;
  private getStateFn: (() => Partial<ParticipantTelemetryState>) | null = null;
  private heartbeatInterval: any = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private strikes: number = 0;
  private isInitialized: boolean = false;

  constructor() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('techastra_telemetry');
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment');
    }
  }

  public init(participant: Participant, getStateFn: () => Partial<ParticipantTelemetryState>) {
    this.participant = participant;
    this.getStateFn = getStateFn;

    if (!this.isInitialized) {
      this.attachProctoringListeners();
      this.isInitialized = true;
    }

    this.startHeartbeat();
  }

  public updateParticipant(participant: Participant) {
    this.participant = participant;
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Immediate initial sync
    this.sendHeartbeat();

    // Heartbeat every 5 seconds
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 5000);
  }

  public sendHeartbeat() {
    if (!this.participant || !this.getStateFn) return;

    try {
      const extraState = this.getStateFn();
      const payload: ParticipantTelemetryState = {
        participantId: this.participant.participantId,
        name: this.participant.fullName,
        college: this.participant.college,
        department: this.participant.department,
        year: this.participant.year,
        currentRound: extraState.currentRound || 'R1',
        currentQuestion: extraState.currentQuestion || 'Q1',
        round1Score: Math.min(10, extraState.round1Score ?? 0),
        round2Score: Math.min(20, extraState.round2Score ?? 0),
        round3Score: Math.min(5, extraState.round3Score ?? 0),
        roundScore: extraState.roundScore ?? 0,
        totalScore: Math.min(35, extraState.totalScore ?? 0),
        roundTimeRemaining: extraState.roundTimeRemaining ?? 0,
        totalElapsedTime: extraState.totalElapsedTime ?? 0,
        status: (this.strikes >= 3 ? 'FLAGGED' : (extraState.status || 'ACTIVE')),
        strikes: this.strikes,
        lastActivity: extraState.lastActivity || 'Solving in Arena',
        timestamp: Date.now()
      };

      // 1. Post to BroadcastChannel for local Admin tabs
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'PARTICIPANT_HEARTBEAT',
          payload
        });
      }

      // 2. Post to parent window (if embedded in OS iframe)
      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'TECHASTRA_TELEMETRY',
          payload
        }, '*');
      }

      // 3. Post to backend server API
      fetch('/api/telemetry/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {
        // Silently ignore if offline / dev-mode
      });
    } catch (e) {
      console.error('Error during telemetry heartbeat', e);
    }
  }

  public reportSecurityEvent(eventType: 'window_blur' | 'tab_hidden' | 'fullscreen_exit', description: string) {
    if (!this.participant) return;

    this.strikes += 1;

    const eventPayload: ProctoringEvent = {
      participantId: this.participant.participantId,
      eventType,
      description: \`\${description} (Incident #\${this.strikes})\`,
      timestamp: Date.now()
    };

    // Broadcast locally
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'PROCTORING_SECURITY_EVENT',
        payload: eventPayload
      });
    }

    // Post to parent
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'TECHASTRA_SECURITY_EVENT',
        payload: eventPayload
      }, '*');
    }

    // Post to backend
    fetch('/api/telemetry/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload)
    }).catch(() => {});

    // Send updated heartbeat with new strikes
    this.sendHeartbeat();
  }

  private attachProctoringListeners() {
    if (typeof window === 'undefined') return;

    // Window blur (focus lost)
    window.addEventListener('blur', () => {
      this.reportSecurityEvent('window_blur', 'Window focus lost / Participant switched away from Arena');
    });

    // Tab visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.reportSecurityEvent('tab_hidden', 'Browser tab minimized or backgrounded');
      }
    });

    // Fullscreen exit
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        this.reportSecurityEvent('fullscreen_exit', 'Participant exited fullscreen mode');
      }
    });
  }

  public destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

export const telemetryService = new TelemetryService();
`;

fs.writeFileSync('E:/projects/techastra-coderescue/src/services/telemetryService.ts', telemetryServiceCode, 'utf8');
console.log('Successfully created telemetryService.ts');
