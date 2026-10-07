// ============================================================================
// REPORTS & DATA EXPORT PANEL — TECHASTRA 2026 ADMIN DASHBOARD
// Exports participants CSV, tournament results CSV, submissions CSV, security audit CSV,
// complete JSON telemetry snapshot, printable dossier reports, and master Score Privacy / Reveal controls.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Participant, Submission, SecurityEvent } from '../types';
import { ExportService } from '../services/exportService';
import { SubmissionService } from '../services/submissionService';
import { ProctoringService } from '../services/proctoringService';
import { ParticipantService } from '../services/participantService';
import { AdminAuthService } from '../services/adminAuthService';

interface ReportsPanelProps {
    participants?: Participant[];
}

export const ReportsPanel: React.FC<ReportsPanelProps> = ({ participants: initialParticipants = [] }) => {
    const [participants, setParticipants] = useState<Participant[]>(
        Array.isArray(initialParticipants) && initialParticipants.length > 0
            ? initialParticipants
            : ParticipantService.getParticipants()
    );
    const [submissions, setSubmissions] = useState<Submission[]>(SubmissionService.getSubmissions());
    const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(ProctoringService.getEvents());
    const [eventEnded, setEventEnded] = useState<boolean>(false);
    const [togglingScore, setTogglingScore] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // Subscribe to live data streams
    useEffect(() => {
        const unsubParticipants = ParticipantService.subscribe((list) => {
            if (Array.isArray(list)) setParticipants(list);
        });

        const unsubSubmissions = SubmissionService.subscribe((list) => {
            if (Array.isArray(list)) setSubmissions(list);
        });

        const unsubEvents = ProctoringService.subscribe((list) => {
            if (Array.isArray(list)) setSecurityEvents(list);
        });

        return () => {
            unsubParticipants();
            unsubSubmissions();
            unsubEvents();
        };
    }, []);

    const fetchScoreStatus = async () => {
        try {
            const res = await fetch('/api/leaderboard');
            const data = await res.json();
            if (data && typeof data.eventEnded === 'boolean') {
                setEventEnded(data.eventEnded);
            }
        } catch {}
    };

    useEffect(() => {
        fetchScoreStatus();
    }, []);

    const handleToggleScorePrivacy = async () => {
        const nextState = !eventEnded;
        const msg = nextState
            ? '⚠️ REVEAL ALL SCORES & FINAL STANDINGS?\n\nThis will publish final marks and reveal complete leaderboards across all contestant terminals and arena display screens.\n\nProceed to REVEAL?'
            : '🔒 CONCEAL SCORES & LEADERBOARDS?\n\nThis will re-mask scores on contestant screens to keep competition results confidential.\n\nProceed to CONCEAL?';

        if (!window.confirm(msg)) return;

        setTogglingScore(true);
        try {
            const res = await fetch('/api/admin/toggle-event-ended', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...AdminAuthService.getAuthHeader(),
                },
                body: JSON.stringify({ eventEnded: nextState }),
            });
            const data = await res.json();
            if (data.success) {
                setEventEnded(data.eventEnded);
                alert(data.eventEnded
                    ? '✓ Official tournament scores and standings are now REVEALED publicly!'
                    : '✓ Scores are now CONCEALED on contestant screens.');
            } else {
                alert(`Error: ${data.error || 'Unauthorized'}`);
            }
        } catch (e: any) {
            alert(`Failed to update score status: ${e.message}`);
        } finally {
            setTogglingScore(false);
        }
    };

    const safeParticipants = Array.isArray(participants) ? participants : [];

    const filteredParticipants = safeParticipants.filter((p) => {
        if (!p) return false;
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery =
            !query ||
            (p.id && p.id.toLowerCase().includes(query)) ||
            (p.name && p.name.toLowerCase().includes(query)) ||
            (p.college && p.college.toLowerCase().includes(query)) ||
            (p.department && p.department.toLowerCase().includes(query));

        const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
        return matchesQuery && matchesStatus;
    });

    const sortedParticipants = [...filteredParticipants].sort((a, b) => {
        const totalA = a.scores?.total ?? a.totalScore ?? 0;
        const totalB = b.scores?.total ?? b.totalScore ?? 0;
        return totalB - totalA;
    });

    return (
        <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Master Score Reveal Control Box */}
            <div
                className="admin-box"
                style={{
                    marginBottom: 14,
                    backgroundColor: eventEnded ? '#e6f4ea' : '#fef7e0',
                    borderColor: eventEnded ? '#137333' : '#b06000',
                }}
            >
                <div
                    className="admin-box-title"
                    style={{
                        backgroundColor: eventEnded ? '#137333' : '#7a5200',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <span>🏆 TOURNAMENT SCORE PRIVACY &amp; ARENA REVEAL CONTROL</span>
                    <span style={{ fontSize: 11, fontWeight: 'bold' }}>
                        STATUS: {eventEnded ? '🔓 PUBLICLY REVEALED' : '🔒 CONCEALED (PRIVATE)'}
                    </span>
                </div>

                <div style={{ padding: 6 }}>
                    <p style={{ fontSize: 12, margin: '0 0 10px 0', color: '#333', lineHeight: 1.4 }}>
                        {eventEnded ? (
                            <span>
                                <b>Standings are LIVE:</b> Contestant scores, rankings, and final evaluation results are currently unlocked and visible to participants on their terminals.
                            </span>
                        ) : (
                            <span>
                                <b>Standings are CONCEALED:</b> During live rounds, numerical scores remain private to prevent contestant bias or premature celebration. When ready for the valedictory award ceremony, click below to reveal final rankings to all screens.
                            </span>
                        )}
                    </p>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                            className="admin-btn"
                            disabled={togglingScore}
                            onClick={handleToggleScorePrivacy}
                            style={{
                                backgroundColor: eventEnded ? '#c5221f' : '#2e7d32',
                                color: '#ffffff',
                                fontWeight: 'bold',
                                padding: '6px 14px',
                                fontSize: 12,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                cursor: togglingScore ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {togglingScore ? 'Updating State...' : eventEnded ? '🔒 Conceal Scores (Lock Leaderboard)' : '🔓 Reveal Scores & Final Standings to All Terminals'}
                        </button>
                        <span style={{ fontSize: 11, color: '#666', fontStyle: 'italic' }}>
                            Broadcasts state update instantly to all connected workstations via SSE stream.
                        </span>
                    </div>
                </div>
            </div>

            {/* Official Export Actions */}
            <div className="admin-box" style={{ marginBottom: 14 }}>
                <div className="admin-box-title">
                    📁 OFFICIAL AUDIT REPORTS, ARCHIVES &amp; CERTIFICATION EXPORTS
                </div>

                <div style={{ padding: 6 }}>
                    <p style={{ fontSize: 12, margin: '0 0 12px 0', color: '#333' }}>
                        Generate certified symposium tournament reports for accreditation, committee review, and score audit verification.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                        <button
                            className="admin-btn admin-btn-primary"
                            onClick={() => ExportService.exportParticipantsCSV(safeParticipants)}
                            title="Download roster CSV with enrolled contestants and their details"
                        >
                            👥 Export Participants CSV ({safeParticipants.length})
                        </button>
                        <button
                            className="admin-btn admin-btn-primary"
                            onClick={() => ExportService.exportResultsCSV(safeParticipants)}
                            title="Download official scorecard CSV with R1, R2, R3 marks"
                        >
                            📈 Export Results CSV ({safeParticipants.length})
                        </button>
                        <button
                            className="admin-btn admin-btn-primary"
                            onClick={() => ExportService.exportSubmissionsCSV(submissions)}
                            title="Download all code submissions and triage scores"
                        >
                            💾 Export Submissions CSV ({submissions.length})
                        </button>
                        <button
                            className="admin-btn admin-btn-primary"
                            onClick={() => ExportService.exportProctoringEventsCSV(securityEvents)}
                            title="Download proctoring violations and security audit trail"
                        >
                            🚨 Export Security Audit CSV ({securityEvents.length})
                        </button>
                        <button
                            className="admin-btn"
                            onClick={() => ExportService.exportFullDumpJSON(safeParticipants, undefined, submissions, securityEvents)}
                            title="Download complete JSON telemetry data snapshot"
                        >
                            📦 Export Full Tournament State (JSON)
                        </button>
                        <button
                            className="admin-btn"
                            onClick={() => ExportService.printReport()}
                            title="Open browser print dialog for paper report / PDF archive"
                        >
                            🖨️ Print / Save Dossier PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Standings Summary Header & Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <h4 style={{ margin: 0, color: '#000080' }}>
                    TOURNAMENT SCORECARD &amp; RANKINGS PREVIEW
                </h4>
                <span style={{ fontSize: 11, color: '#555' }}>
                    Total Enrolled: <b>{safeParticipants.length}</b> &bull; Qualified: <b>{safeParticipants.filter(p => p.status === 'QUALIFIED').length}</b> &bull; Flagged: <b>{safeParticipants.filter(p => p.status === 'FLAGGED' || p.status === 'DISQUALIFIED').length}</b>
                </span>
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    type="text"
                    className="admin-input"
                    placeholder="Search by ID, name, or college..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1, minWidth: 200 }}
                />
                <select
                    className="admin-input"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '4px 8px' }}
                >
                    <option value="ALL">ALL STATUSES</option>
                    <option value="ACTIVE">ACTIVE ONLY</option>
                    <option value="QUALIFIED">QUALIFIED ONLY</option>
                    <option value="FLAGGED">FLAGGED ONLY</option>
                    <option value="DISQUALIFIED">DISQUALIFIED ONLY</option>
                </select>
                {(searchQuery || statusFilter !== 'ALL') && (
                    <button
                        className="admin-btn"
                        onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('ALL');
                        }}
                    >
                        Clear Filter
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: 60, textAlign: 'center' }}>Rank</th>
                            <th style={{ width: 140 }}>Participant ID</th>
                            <th>Name</th>
                            <th>College</th>
                            <th style={{ width: 110 }}>R1 (Bug Hunt)</th>
                            <th style={{ width: 120 }}>R2 (Logic Break)</th>
                            <th style={{ width: 110 }}>R3 (Rescue)</th>
                            <th style={{ width: 100 }}>Total Score</th>
                            <th style={{ width: 120 }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedParticipants.length === 0 ? (
                            <tr>
                                <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: '#555' }}>
                                    No participant records found matching criteria.
                                </td>
                            </tr>
                        ) : (
                            sortedParticipants.map((p, index) => {
                                const total = p.scores?.total ?? p.totalScore ?? 0;
                                const r1 = p.scores?.round1 ?? 0;
                                const r2 = p.scores?.round2 ?? 0;
                                const r3 = p.scores?.round3 ?? 0;
                                return (
                                    <tr key={p.id || index}>
                                        <td style={{ fontWeight: 'bold', textAlign: 'center' }}>#{index + 1}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{p.id}</td>
                                        <td><b>{p.name || p.id}</b></td>
                                        <td>{p.college || 'N/A'}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{r1}/10</td>
                                        <td style={{ fontFamily: 'monospace' }}>{r2}/20</td>
                                        <td style={{ fontFamily: 'monospace' }}>{r3}/5</td>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#000080' }}>
                                            {total}/35
                                        </td>
                                        <td>
                                            <span className={`status-badge status-badge-${p.status || 'ACTIVE'}`}>
                                                {p.status || 'ACTIVE'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default ReportsPanel;
