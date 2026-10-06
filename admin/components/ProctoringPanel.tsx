// ============================================================================
// PROCTORING AUDIT PANEL — TECHASTRA 2026 ADMIN DASHBOARD
// Security event monitor with strikes (0=CLEAN, 1=WARNING, 2+=FLAGGED),
// with instant coordinator actions to REINSTATE SESSION or FLAG PARTICIPANT.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { SecurityEvent } from '../types';
import { ProctoringService } from '../services/proctoringService';

export const ProctoringPanel: React.FC = () => {
    const [events, setEvents] = useState<SecurityEvent[]>(ProctoringService.getEvents());
    const [selectedParticipantId, setSelectedParticipantId] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [actionNotice, setActionNotice] = useState('');

    useEffect(() => {
        const unsubscribe = ProctoringService.subscribe((updated) => setEvents(updated));
        return unsubscribe;
    }, []);

    const handleReinstate = (participantId: string) => {
        ProctoringService.reinstateSession(participantId);
        setActionNotice(`Participant ${participantId} strikes cleared and session reinstated.`);
        setTimeout(() => setActionNotice(''), 4000);
    };

    const handleFlag = (participantId: string) => {
        ProctoringService.flagParticipant(participantId, 'Manual coordinator flag');
        setActionNotice(`Participant ${participantId} flagged for invigilator review.`);
        setTimeout(() => setActionNotice(''), 4000);
    };

    const handleCustomFlag = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedParticipantId) return;
        ProctoringService.flagParticipant(selectedParticipantId, customReason || 'Manual coordinator intervention');
        setActionNotice(`Participant ${selectedParticipantId} flagged.`);
        setSelectedParticipantId('');
        setCustomReason('');
        setTimeout(() => setActionNotice(''), 4000);
    };

    return (
        <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <p style={{ margin: '0 0 12px 0', fontSize: 13 }}>
                <b>Live Proctoring &amp; Integrity Telemetry.</b> Rules:
                <b> 0 strikes = CLEAN</b> | <b>1 strike = WARNING</b> | <b>2+ strikes = FLAGGED / MALPRACTICE</b>.
            </p>

            {actionNotice && (
                <div style={{ backgroundColor: '#e6f4ea', border: '1px solid #137333', color: '#137333', padding: '6px 12px', fontSize: 12, marginBottom: 12, fontWeight: 'bold' }}>
                    ✓ {actionNotice}
                </div>
            )}

            {/* Quick Coordinator Action Bar */}
            <div className="admin-box" style={{ marginBottom: 14 }}>
                <form onSubmit={handleCustomFlag} style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 'bold' }}>COORDINATOR ACTION:</span>
                    <input
                        type="text"
                        className="admin-input"
                        placeholder="Participant ID (e.g. CR-0003)"
                        value={selectedParticipantId}
                        onChange={(e) => setSelectedParticipantId(e.target.value.toUpperCase())}
                        style={{ width: 140 }}
                    />
                    <input
                        type="text"
                        className="admin-input"
                        placeholder="Incident reason..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        style={{ flex: 1, minWidth: 160 }}
                    />
                    <button type="submit" className="admin-btn admin-btn-danger">
                        FLAG PARTICIPANT
                    </button>
                    <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        onClick={() => selectedParticipantId && handleReinstate(selectedParticipantId)}
                        disabled={!selectedParticipantId}
                    >
                        REINSTATE SESSION
                    </button>
                </form>
            </div>

            {/* Event Log Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Participant</th>
                            <th>Event Type</th>
                            <th>Description</th>
                            <th>Timestamp</th>
                            <th>Strike Count</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#555' }}>
                                    No security violations or proctoring alerts recorded. All participant workstations operating cleanly.
                                </td>
                            </tr>
                        ) : (
                            events.map((evt) => (
                                <tr key={evt.id}>
                                <td>
                                    <b>{evt.participantName}</b>
                                    <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#555' }}>{evt.participantId}</div>
                                </td>
                                <td style={{ fontWeight: 'bold' }}>{evt.eventType}</td>
                                <td>{evt.description}</td>
                                <td style={{ fontFamily: 'monospace' }}>{evt.timestamp}</td>
                                <td style={{ textAlign: 'center', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                    {evt.strikeCount}
                                </td>
                                <td>
                                    <span className={`status-badge status-badge-${evt.status}`}>
                                        {evt.strikeCount === 0 ? 'CLEAN' : evt.strikeCount === 1 ? 'WARNING' : 'FLAGGED'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: 6 }}>
                                        <button
                                            className="admin-btn"
                                            style={{ fontSize: 10, padding: '2px 6px' }}
                                            onClick={() => handleReinstate(evt.participantId)}
                                        >
                                            REINSTATE
                                        </button>
                                        <button
                                            className="admin-btn admin-btn-danger"
                                            style={{ fontSize: 10, padding: '2px 6px' }}
                                            onClick={() => handleFlag(evt.participantId)}
                                        >
                                            FLAG
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
