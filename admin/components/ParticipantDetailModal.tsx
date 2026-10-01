// ============================================================================
// PARTICIPANT DETAILS DOSSIER DRAWER — TECHASTRA 2026 ADMIN DASHBOARD
// Full breakdown of scores, submissions, security audit, and coordinator actions.
// ============================================================================

import React from 'react';
import { Participant, Submission } from '../types';
import { SubmissionService } from '../services/submissionService';

interface ParticipantDetailModalProps {
    participant: Participant;
    onClose: () => void;
    onFlag: (id: string) => void;
    onReinstate: (id: string) => void;
    onViewSubmission: (submission: Submission) => void;
}

export const ParticipantDetailModal: React.FC<ParticipantDetailModalProps> = ({
    participant,
    onClose,
    onFlag,
    onReinstate,
    onViewSubmission,
}) => {
    const submissions = SubmissionService.getSubmissionsByParticipant(participant.id);

    return (
        <div className="admin-box" style={{ marginTop: 16, backgroundColor: '#f0f0f0' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #808080', paddingBottom: 6, marginBottom: 12 }}>
                <span style={{ fontWeight: 'bold', fontSize: 14, color: '#000080' }}>
                    PARTICIPANT DOSSIER — {participant.id}: {participant.name}
                </span>
                <button className="admin-btn" onClick={onClose} style={{ padding: '2px 8px', fontSize: 11 }}>
                    ✕ Close Dossier
                </button>
            </div>

            {/* Header Summary */}
            <div style={{ marginBottom: 12 }}>
                <p style={{ margin: '0 0 4px 0', fontSize: 13 }}>
                    <b>College:</b> {participant.college} &bull; <b>Dept:</b> {participant.department} (Year {participant.year}) &bull;{' '}
                    <b>Status:</b>{' '}
                    <span className={`status-badge status-badge-${participant.status}`}>
                        {participant.status}
                    </span>
                </p>
            </div>

            {/* Status & Scores */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 14 }}>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #ccc', padding: 10 }}>
                    <div style={{ fontWeight: 'bold', fontSize: 12, color: '#000080', marginBottom: 6 }}>CURRENT SESSION</div>
                    <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                        <div><b>Round:</b> {participant.currentRound} ({participant.currentQuestion})</div>
                        <div><b>Current Score:</b> {participant.score}/{participant.currentRound === 'R1' ? 10 : (participant.currentRound === 'R2' ? 20 : 5)}</div>
                        <div><b>Elapsed Time:</b> {participant.time}</div>
                        <div><b>Connection:</b> {participant.sessionActive ? '🟢 Connected' : '🔴 Inactive / Blocked'}</div>
                    </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #ccc', padding: 10 }}>
                    <div style={{ fontWeight: 'bold', fontSize: 12, color: '#000080', marginBottom: 6 }}>SCORE MATRIX</div>
                    <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                        <div>Round 1 (Bug Hunt): <b>{participant.scores.round1}/10</b></div>
                        <div>Round 2 (Logic Breaker): <b>{participant.scores.round2}/20</b></div>
                        <div>Round 3 (Code Rescue): <b>{participant.scores.round3}/5</b></div>
                        <div style={{ borderTop: '1px solid #ddd', marginTop: 4, paddingTop: 2, fontWeight: 'bold', color: '#000080' }}>
                            TOTAL SCORE: {participant.scores.total} / 35 marks
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Audit */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #ccc', padding: 10, marginBottom: 14 }}>
                <div style={{ fontWeight: 'bold', fontSize: 12, color: '#000080', marginBottom: 4 }}>
                    SECURITY &amp; PROCTORING TELEMETRY (Strikes: {participant.strikes})
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                    {participant.strikes === 0 ? (
                        <>
                            <div style={{ color: '#0d652d' }}>✓ Fullscreen maintained throughout workstation session</div>
                            <div style={{ color: '#0d652d' }}>✓ No tab switch detected</div>
                            <div style={{ color: '#0d652d' }}>✓ Window focus continuous</div>
                        </>
                    ) : participant.strikes === 1 ? (
                        <>
                            <div style={{ color: '#b06000' }}>⚠ Window blur detected ({participant.lastEvent})</div>
                            <div style={{ color: '#0d652d' }}>✓ Fullscreen maintained</div>
                        </>
                    ) : (
                        <>
                            <div style={{ color: '#c5221f', fontWeight: 'bold' }}>🚨 Malpractice Flag: Multiple strike events logged</div>
                            <div style={{ color: '#c5221f' }}>⚠ Incident: {participant.lastEvent}</div>
                        </>
                    )}
                </div>
            </div>

            {/* Submissions */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #ccc', padding: 10, marginBottom: 14 }}>
                <div style={{ fontWeight: 'bold', fontSize: 12, color: '#000080', marginBottom: 6 }}>
                    SUBMISSION HISTORY ({submissions.length})
                </div>
                {submissions.length === 0 ? (
                    <div style={{ fontSize: 12, color: '#666' }}>No code triage submissions recorded yet.</div>
                ) : (
                    <div style={{ maxHeight: 120, overflowY: 'auto' }}>
                        {submissions.map((s) => (
                            <div key={s.id} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #eee', fontSize: 12 }}>
                                <div>
                                    <b>{s.question}</b> &bull; {s.submissionTime}
                                    <span style={{ marginLeft: 8, color: s.result === 'PASSED' ? '#0d652d' : '#c5221f', fontWeight: 'bold' }}>
                                        [{s.result}] {s.score}/{s.maxScore} pts
                                    </span>
                                </div>
                                <button className="admin-btn" onClick={() => onViewSubmission(s)}>
                                    VIEW SUBMISSION
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                {submissions.length > 0 && (
                    <button className="admin-btn" onClick={() => onViewSubmission(submissions[0])}>
                        VIEW SUBMISSION
                    </button>
                )}
                <button className="admin-btn admin-btn-danger" onClick={() => onFlag(participant.id)}>
                    FLAG PARTICIPANT
                </button>
                <button className="admin-btn admin-btn-primary" onClick={() => onReinstate(participant.id)}>
                    REINSTATE SESSION
                </button>
                <button className="admin-btn" onClick={onClose}>
                    CLOSE
                </button>
            </div>
        </div>
    );
};
