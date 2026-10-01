// ============================================================================
// DEMO DATA — TECHASTRA 2026 PROCTORING & SECURITY AUDIT EVENTS
// NOTE: Realistic simulated telemetry for security inspection.
// ============================================================================

import { SecurityEvent } from '../types';

export const DEMO_PROCTORING_EVENTS: SecurityEvent[] = [
    {
        id: 'SEC-101',
        participantId: 'CR-0003',
        participantName: 'Chetan Karthik',
        eventType: 'FULLSCREEN_EXIT',
        description: 'Fullscreen exited during active Round 2 triage session',
        timestamp: '12:18:04',
        strikeCount: 2,
        status: 'FLAGGED',
    },
    {
        id: 'SEC-102',
        participantId: 'CR-0003',
        participantName: 'Chetan Karthik',
        eventType: 'TAB_SWITCH',
        description: 'Browser tab switched to background window (Duration: 14s)',
        timestamp: '12:17:42',
        strikeCount: 1,
        status: 'WARNING',
    },
    {
        id: 'SEC-103',
        participantId: 'CR-0002',
        participantName: 'Bhavani Ramesh',
        eventType: 'WINDOW_BLUR',
        description: 'Window focus lost to external application or taskbar',
        timestamp: '12:11:15',
        strikeCount: 1,
        status: 'WARNING',
    },
    {
        id: 'SEC-104',
        participantId: 'CR-0009',
        participantName: 'Imran Bashir',
        eventType: 'KEY_COMBINATION',
        description: 'Restricted shortcut (Alt+Tab) intercepted by browser guard',
        timestamp: '12:05:33',
        strikeCount: 1,
        status: 'WARNING',
    },
    {
        id: 'SEC-105',
        participantId: 'CR-0001',
        participantName: 'Aarav Sundaram',
        eventType: 'WINDOW_BLUR',
        description: 'Brief cursor departure beyond screen boundaries (Cleared: 0 strikes)',
        timestamp: '11:58:20',
        strikeCount: 0,
        status: 'CLEAN',
    },
    {
        id: 'SEC-106',
        participantId: 'CR-0008',
        participantName: 'Harini Mohan',
        eventType: 'WINDOW_BLUR',
        description: 'Routine monitor sync event (Cleared: 0 strikes)',
        timestamp: '11:45:10',
        strikeCount: 0,
        status: 'CLEAN',
    },
];
