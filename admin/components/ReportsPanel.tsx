// ============================================================================
// REPORTS & DATA EXPORT PANEL — TECHASTRA 2026 ADMIN DASHBOARD
// Exports participants CSV, tournament results CSV, submissions CSV, complete JSON dump,
// printable dossier reports, and master Score Privacy / Reveal controls.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Participant } from '../types';
import { ExportService } from '../services/exportService';
import { SubmissionService } from '../services/submissionService';
import { AdminAuthService } from '../services/adminAuthService';

interface ReportsPanelProps {
    participants: Participant[];
}

export const ReportsPanel: React.FC<ReportsPanelProps> = ({ participants }) => {
    const [eventEnded, setEventEnded] = useState<boolean>(false);
    const [togglingScore, setTogglingScore] = useState<boolean>(false);
    const submissions = SubmissionService.getAllSubmissions();

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

    return (
        <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Master Score Reveal Control Box */}
            <div className="admin-box" style={{
                marginBottom: 14,
                backgroundColor: eventEnded ? '#e6f4ea' : '#fef7e0',
                borderColor: eventEnded ? '#137333' : '#b06000',
            }}>
                <div className="admin-box-title" style={{
                    backgroundColor: eventEnded ? '#137333' : '#7a5200',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <span>🏆 TOURNAMENT SCORE PRIVACY &amp; ARENA REVEAL CONTROL</span>
                    <span style={{ fontSize: 11, fontWeight: 'bold' }}>
                        STATUS: {eventEnded ? '🔓 PUBLICLY REVEALED' : '🔒 CONCEALED (PRIVATE)'}
                    </span>
                </div>

                <div style={{ padding: 4 }}>
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
            <div className="admin-box">
                <div className="admin-box-title">
                    📁 OFFICIAL AUDIT REPORTS, ARCHIVES &amp; CERTIFICATION EXPORTS
                </div>

                <p style={{ fontSize: 12, margin: '0 0 12px 0', color: '#333' }}>
                    Generate certified symposium tournament reports for accreditation, committee review, and score audit verification.
                </p>

                <div style={{ display: 'flex', flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => ExportService.exportParticipantsCSV(participants)}
                        title="Download roster CSV with enrolled contestants and their details"
                    >
                        👥 Export Participants CSV
                    </button>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => ExportService.exportResultsCSV(participants)}
                        title="Download official scorecard CSV with R1, R2, R3 marks"
                    >
                        📈 Export Results CSV
                    </button>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => ExportService.exportSubmissionsCSV(submissions)}
                        title="Download all code submissions and triage scores"
                    >
                        💾 Export Submissions CSV
                    </button>
                    <button
                        className="admin-btn"
                        onClick={() => ExportService.exportFullDumpJSON(participants, undefined, submissions)}
                        title="Download complete JSON telemetry data snapshot"
                    >
                        📦 Export Full State (JSON)
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

            {/* Standings Summary Preview */}
            <h4 style={{ margin: '14px 0 8px 0', color: '#000080', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>TOURNAMENT SCORECARD &amp; RANKINGS PREVIEW</span>
                <span style={{ fontSize: 11, fontWeight: 'normal', color: '#555' }}>
                    Total Evaluated: <b>{participants.length}</b> &bull; Qualified: <b>{participants.filter(p => p.status === 'QUALIFIED').length}</b>
                </span>
            </h4>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Participant ID</th>
                            <th>Name</th>
                            <th>College</th>
                            <th>R1 (Bug Hunter)</th>
                            <th>R2 (Logic Repair)</th>
                            <th>R3 (Crisis Rescue)</th>
                            <th>Total Score</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participants.length === 0 ? (
                            <tr>
                                <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: '#555' }}>
                                    No participant data available for ranking preview.
                                </td>
                            </tr>
                        ) : (
                            [...participants]
                                .sort((a, b) => (b.scores?.total ?? b.totalScore ?? 0) - (a.scores?.total ?? a.totalScore ?? 0))
                                .map((p, index) => {
                                    const total = p.scores?.total ?? p.totalScore ?? 0;
                                    const r1 = p.scores?.round1 ?? 0;
                                    const r2 = p.scores?.round2 ?? 0;
                                    const r3 = p.scores?.round3 ?? 0;
                                    return (
                                        <tr key={p.id}>
                                            <td style={{ fontWeight: 'bold', textAlign: 'center' }}>#{index + 1}</td>
                                            <td style={{ fontFamily: 'monospace' }}>{p.id}</td>
                                            <td><b>{p.name}</b></td>
                                            <td>{p.college}</td>
                                            <td style={{ fontFamily: 'monospace' }}>{r1}/10</td>
                                            <td style={{ fontFamily: 'monospace' }}>{r2}/20</td>
                                            <td style={{ fontFamily: 'monospace' }}>{r3}/5</td>
                                            <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#000080' }}>
                                                {total}/35
                                            </td>
                                            <td>
                                                <span className={`status-badge status-badge-${p.status}`}>
                                                    {p.status}
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
