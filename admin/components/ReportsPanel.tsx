// ============================================================================
// REPORTS & DATA EXPORT PANEL — TECHASTRA 2026 ADMIN DASHBOARD
// Exports participants CSV, tournament results CSV, and printable dossier reports.
// ============================================================================

import React from 'react';
import { Participant } from '../types';
import { ExportService } from '../services/exportService';

interface ReportsPanelProps {
    participants: Participant[];
}

export const ReportsPanel: React.FC<ReportsPanelProps> = ({ participants }) => {
    return (
        <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Export Action Card */}
            <div className="admin-box">
                <div className="admin-box-title">
                    OFFICIAL TOURNAMENT AUDIT &amp; DATA EXPORTS
                </div>

                <p style={{ fontSize: 12, margin: '0 0 12px 0', color: '#333' }}>
                    Generate certified symposium tournament reports for accreditation and score verification.
                </p>

                <div style={{ display: 'flex', flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => ExportService.exportParticipantsCSV(participants)}
                    >
                        📁 Export Participants CSV
                    </button>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => ExportService.exportResultsCSV(participants)}
                    >
                        📈 Export Results CSV
                    </button>
                    <button
                        className="admin-btn"
                        onClick={() => ExportService.printReport()}
                    >
                        🖨️ Print Report
                    </button>
                </div>
            </div>

            {/* Standings Summary Preview */}
            <h4 style={{ margin: '12px 0 8px 0', color: '#000080' }}>TOURNAMENT SCORECARD PREVIEW</h4>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Participant ID</th>
                            <th>Name</th>
                            <th>College</th>
                            <th>R1</th>
                            <th>R2</th>
                            <th>R3</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...participants]
                            .sort((a, b) => b.scores.total - a.scores.total)
                            .map((p, index) => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 'bold', textAlign: 'center' }}>#{index + 1}</td>
                                    <td style={{ fontFamily: 'monospace' }}>{p.id}</td>
                                    <td><b>{p.name}</b></td>
                                    <td>{p.college}</td>
                                    <td style={{ fontFamily: 'monospace' }}>{p.scores.round1}/10</td>
                                    <td style={{ fontFamily: 'monospace' }}>{p.scores.round2}/20</td>
                                    <td style={{ fontFamily: 'monospace' }}>{p.scores.round3}/5</td>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#000080' }}>
                                        {p.scores.total}/35
                                    </td>
                                    <td>
                                        <span className={`status-badge status-badge-${p.status}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
