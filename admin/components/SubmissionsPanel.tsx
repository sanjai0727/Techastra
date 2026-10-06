// ============================================================================
// SUBMISSIONS INSPECTION PANEL — TECHASTRA 2026 ADMIN DASHBOARD
// Allows coordinator to review participant Python code submissions,
// test results, terminal execution output, and error tracebacks.
// Real persistent data loaded from SQLite backend database.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Submission } from '../types';
import { SubmissionService } from '../services/submissionService';

interface SubmissionsPanelProps {
    initialSelected?: Submission | null;
}

export const SubmissionsPanel: React.FC<SubmissionsPanelProps> = ({ initialSelected }) => {
    const [submissions, setSubmissions] = useState<Submission[]>(SubmissionService.getSubmissions());
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(
        initialSelected || (submissions.length > 0 ? submissions[0] : null)
    );

    useEffect(() => {
        const unsubscribe = SubmissionService.subscribe((list) => {
            setSubmissions(list);
            setSelectedSubmission((prev) => {
                if (prev) {
                    const found = list.find((s) => s.id === prev.id);
                    return found || prev;
                }
                return list.length > 0 ? list[0] : null;
            });
        });
        return unsubscribe;
    }, []);

    return (
        <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h4 style={{ margin: 0, color: '#000080' }}>TRIAGE SUBMISSION AUDIT LOG</h4>
                <button
                    className="admin-btn"
                    style={{ fontSize: 11, padding: '3px 8px' }}
                    onClick={() => SubmissionService.fetchSubmissions()}
                >
                    ↻ Refresh
                </button>
            </div>

            {submissions.length === 0 ? (
                <div className="admin-box" style={{ padding: '24px', textAlign: 'center', color: '#555' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
                    <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 4 }}>No Submissions Logged Yet</div>
                    <div style={{ fontSize: 12 }}>
                        Participant Python code submissions from the Code Rescue Arena will appear here in real time.
                    </div>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Participant</th>
                                <th>Round</th>
                                <th>Question</th>
                                <th>Time</th>
                                <th>Result</th>
                                <th>Score</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((sub) => {
                                const isSelected = selectedSubmission?.id === sub.id;
                                return (
                                    <tr
                                        key={sub.id}
                                        onClick={() => setSelectedSubmission(sub)}
                                        style={isSelected ? { backgroundColor: '#000080', color: '#ffffff' } : {}}
                                    >
                                        <td>
                                            <b>{sub.participantName}</b>
                                            <div style={{ fontSize: 11, fontFamily: 'monospace' }}>{sub.participantId}</div>
                                        </td>
                                        <td><b>{sub.round}</b></td>
                                        <td>{sub.question.split(':')[0]}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{sub.submissionTime}</td>
                                        <td>
                                            <span
                                                className="status-badge"
                                                style={{
                                                    backgroundColor: sub.result === 'PASSED' ? '#e6f4ea' : '#fce8e6',
                                                    color: sub.result === 'PASSED' ? '#0d652d' : '#c5221f',
                                                }}
                                            >
                                                {sub.result}
                                            </span>
                                        </td>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                            {sub.score}/{sub.maxScore || 10}
                                        </td>
                                        <td>
                                            <button className="admin-btn" style={{ fontSize: 10, padding: '2px 6px' }}>
                                                Inspect
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Submission Inspection Detail */}
            {selectedSubmission && (
                <div className="admin-box" style={{ marginTop: 12 }}>
                    <div className="admin-box-title" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>SUBMISSION INSPECTION — {selectedSubmission.id} ({selectedSubmission.participantName})</span>
                        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#333' }}>{selectedSubmission.submissionTime}</span>
                    </div>

                    <p style={{ margin: '0 0 10px 0', fontSize: 12 }}>
                        <b>Question:</b> {selectedSubmission.question} &bull; <b>Round:</b> {selectedSubmission.round} &bull;{' '}
                        <b>Score:</b> {selectedSubmission.score}/{selectedSubmission.maxScore || 10} pts &bull;{' '}
                        <b>Result:</b>{' '}
                        <span style={{ fontWeight: 'bold', color: selectedSubmission.result === 'PASSED' ? '#0d652d' : '#c5221f' }}>
                            {selectedSubmission.result}
                        </span>
                    </p>

                    {/* Python Code Block */}
                    <div style={{ marginBottom: 10 }}>
                        <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block', marginBottom: 2 }}>
                            SUBMITTED PYTHON CODE:
                        </label>
                        <div className="admin-code-block">
                            {selectedSubmission.code || selectedSubmission.submittedCode || '# No code content'}
                        </div>
                    </div>

                    {/* Test Results */}
                    {selectedSubmission.testResults && selectedSubmission.testResults.length > 0 && (
                        <div style={{ marginBottom: 10 }}>
                            <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block', marginBottom: 2 }}>
                                AUTOMATED TEST SUITE:
                            </label>
                            <div style={{ backgroundColor: '#ffffff', border: '1px solid #ccc', padding: 8, maxHeight: 100, overflowY: 'auto' }}>
                                {selectedSubmission.testResults.map((t: any, i: number) => (
                                    <div key={i} style={{ fontSize: 12, padding: '2px 0', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <span>{t.passed ? '✅' : '❌'} {t.testName || `Test Case #${i + 1}`}</span>
                                        <span style={{ fontWeight: 'bold', color: t.passed ? '#0d652d' : '#c5221f' }}>
                                            {t.passed ? 'PASSED' : 'FAILED'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Terminal Output */}
                    <div style={{ marginBottom: 10 }}>
                        <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block', marginBottom: 2 }}>
                            EXECUTION OUTPUT LOG:
                        </label>
                        <div className="admin-terminal-block">
                            {selectedSubmission.terminalOutput || selectedSubmission.executionOutput || '[Completed execution]'}
                        </div>
                    </div>

                    {/* Error Traceback (if any) */}
                    {selectedSubmission.errorTraceback && (
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block', marginBottom: 2, color: '#990000' }}>
                                ERROR TRACEBACK:
                            </label>
                            <div className="admin-terminal-block" style={{ color: '#ff6666' }}>
                                {selectedSubmission.errorTraceback}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
