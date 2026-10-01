// ============================================================================
// ROUND MANAGEMENT PANEL — TECHASTRA 2026 ADMIN DASHBOARD
// Displays round states, participants qualified, pending, and allows editing cutoffs.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { RoundStatus, RoundId } from '../types';
import { RoundService } from '../services/roundService';

export const RoundManagement: React.FC = () => {
    const [rounds, setRounds] = useState<RoundStatus[]>(RoundService.getRounds());
    const [editingRoundId, setEditingRoundId] = useState<RoundId | null>(null);
    const [cutoffInput, setCutoffInput] = useState<number>(50);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        const unsubscribe = RoundService.subscribe((updated) => setRounds(updated));
        return unsubscribe;
    }, []);

    const startEditing = (round: RoundStatus) => {
        setEditingRoundId(round.roundId);
        setCutoffInput(round.cutoff);
    };

    const saveCutoff = (roundId: RoundId) => {
        RoundService.updateCutoff(roundId, cutoffInput);
        setEditingRoundId(null);
        setStatusMessage(`Updated cutoff for ${roundId} to ${cutoffInput} / 100.`);
        setTimeout(() => setStatusMessage(''), 4000);
    };

    const activateRound = (roundId: RoundId) => {
        RoundService.setActiveRound(roundId);
        setStatusMessage(`Round ${roundId} is now set as ACTIVE.`);
        setTimeout(() => setStatusMessage(''), 4000);
    };

    return (
        <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {statusMessage && (
                <div style={{ backgroundColor: '#e6f4ea', border: '1px solid #137333', color: '#137333', padding: '6px 12px', fontSize: 12, marginBottom: 14, fontWeight: 'bold' }}>
                    ✓ {statusMessage}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                {rounds.map((round) => (
                    <div key={round.roundId} className="admin-box" style={{ justifyContent: 'space-between' }}>
                        <div>
                            {/* Round Header */}
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #808080', paddingBottom: 4, marginBottom: 8 }}>
                                <span style={{ fontWeight: 'bold', fontSize: 13, color: '#000080' }}>
                                    {round.name} — {round.title}
                                </span>
                                <span
                                    className="status-badge"
                                    style={{
                                        backgroundColor: round.isActive ? '#e6f4ea' : '#f0f0f0',
                                        color: round.isActive ? '#0d652d' : '#666',
                                        borderColor: round.isActive ? '#0d652d' : '#999',
                                    }}
                                >
                                    {round.isActive ? 'ACTIVE' : 'STANDBY'}
                                </span>
                            </div>

                            <p style={{ fontSize: 12, color: '#333', margin: '0 0 10px 0' }}>
                                {round.description}
                            </p>

                            {/* Metrics */}
                            <div style={{ backgroundColor: '#ffffff', border: '1px solid #ccc', padding: 8, marginBottom: 10, fontSize: 12, lineHeight: 1.6 }}>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <span>Max Score:</span>
                                    <b>{round.maxScore} pts</b>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <span>Duration:</span>
                                    <b>{round.durationMinutes} mins</b>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', color: '#0d652d' }}>
                                    <span>Qualified:</span>
                                    <b>{round.qualifiedCount}</b>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', color: '#b06000' }}>
                                    <span>Pending:</span>
                                    <b>{round.pendingCount}</b>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', color: '#c5221f' }}>
                                    <span>Eliminated:</span>
                                    <b>{round.eliminatedCount}</b>
                                </div>
                            </div>

                            {/* Cutoff Controls */}
                            <div style={{ padding: 6, backgroundColor: '#e8e8e8', border: '1px solid #ccc', marginBottom: 10 }}>
                                <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>
                                    Qualification Cutoff:
                                </div>
                                {editingRoundId === round.roundId ? (
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                                        <input
                                            type="number"
                                            className="admin-input"
                                            value={cutoffInput}
                                            onChange={(e) => setCutoffInput(parseInt(e.target.value) || 0)}
                                            style={{ width: 60, padding: '2px 4px' }}
                                            min={0}
                                            max={round.maxScore}
                                        />
                                        <span style={{ fontSize: 12 }}>/ {round.maxScore}</span>
                                        <button className="admin-btn admin-btn-primary" onClick={() => saveCutoff(round.roundId)}>
                                            Save
                                        </button>
                                        <button className="admin-btn" onClick={() => setEditingRoundId(null)}>
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#000080', fontFamily: 'monospace' }}>
                                            {round.cutoff} / {round.maxScore} pts
                                        </span>
                                        <button className="admin-btn" onClick={() => startEditing(round)}>
                                            Edit Cutoff
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Round Activation */}
                        <div style={{ borderTop: '1px solid #ccc', paddingTop: 8, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                            {!round.isActive && (
                                <button className="admin-btn admin-btn-primary" onClick={() => activateRound(round.roundId)}>
                                    SET AS ACTIVE ROUND
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
