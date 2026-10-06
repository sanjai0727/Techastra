// ============================================================================
// ROUND & MASTER CLOCK MANAGEMENT PANEL — TECHASTRA 2026 ADMIN DASHBOARD
// Complete control and monitoring over rounds, cutoffs, master clocks, and transitions.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { RoundStatus, RoundId } from '../types';
import { RoundService } from '../services/roundService';

export const RoundManagement: React.FC = () => {
    const [rounds, setRounds] = useState<RoundStatus[]>(RoundService.getRounds());
    const [editingRoundId, setEditingRoundId] = useState<RoundId | null>(null);
    const [cutoffInput, setCutoffInput] = useState<number>(50);
    const [statusMessage, setStatusMessage] = useState('');
    const [customSeconds, setCustomSeconds] = useState<number>(300);
    const [targetRoundForTimer, setTargetRoundForTimer] = useState<string>('ALL');

    useEffect(() => {
        const unsubscribe = RoundService.subscribe((updated) => setRounds(updated));
        return unsubscribe;
    }, []);

    const activeRound = rounds.find(r => r.isActive) || rounds[0];

    const startEditing = (round: RoundStatus) => {
        setEditingRoundId(round.roundId);
        setCutoffInput(round.cutoff);
    };

    const saveCutoff = (roundId: RoundId) => {
        RoundService.updateCutoff(roundId, cutoffInput);
        setEditingRoundId(null);
        setStatusMessage(`Updated cutoff for ${roundId} to ${cutoffInput} pts.`);
        setTimeout(() => setStatusMessage(''), 4000);
    };

    const activateRound = (roundId: RoundId) => {
        RoundService.setActiveRound(roundId);
        setStatusMessage(`Round ${roundId} is now globally ACTIVE.`);
        setTimeout(() => setStatusMessage(''), 4000);
    };

    const handleAdjustTimer = async (additionalSecs?: number, setSecs?: number, label?: string) => {
        const success = await RoundService.adjustRoundTimer(targetRoundForTimer, additionalSecs, setSecs);
        if (success) {
            setStatusMessage(`✓ Clock updated (${label || 'Adjusted'}) for ${targetRoundForTimer}. Broadcasted to all contestant workstations.`);
        } else {
            setStatusMessage(`⚠️ Failed to adjust timer on server.`);
        }
        setTimeout(() => setStatusMessage(''), 5000);
    };

    return (
        <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {statusMessage && (
                <div style={{ backgroundColor: '#e6f4ea', border: '1px solid #137333', color: '#137333', padding: '8px 14px', fontSize: 12, fontWeight: 'bold' }}>
                    {statusMessage}
                </div>
            )}

            {/* MASTER CLOCK & TOURNAMENT EMERGENCY CONTROLS */}
            <div className="admin-box" style={{ backgroundColor: '#f8f8f8', border: '2px solid #000080' }}>
                <div className="admin-box-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>⏱️ TOURNAMENT MASTER CLOCK &amp; BROADCAST COMMAND DESK</span>
                    <span style={{ fontSize: 11, fontWeight: 'normal', color: '#000' }}>
                        Active Round: <b style={{ color: '#000080' }}>{activeRound?.roundId} ({activeRound?.name})</b>
                    </span>
                </div>

                <div style={{ fontSize: 12, color: '#444', marginBottom: 10 }}>
                    Broadcast real-time clock adjustments to contestant workstations. Extra time or clock expiration takes effect immediately over Server-Sent Events.
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12, backgroundColor: '#ffffff', padding: 10, border: '1px solid #ccc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 'bold' }}>Target Workstations:</span>
                        <select
                            className="admin-input"
                            value={targetRoundForTimer}
                            onChange={(e) => setTargetRoundForTimer(e.target.value)}
                            style={{ padding: '3px 8px', fontWeight: 'bold' }}
                        >
                            <option value="ALL">ALL Rounds &amp; Stations</option>
                            <option value="R1">Round 1 Only (Bug Hunt)</option>
                            <option value="R2">Round 2 Only (Logic Breaker)</option>
                            <option value="R3">Round 3 Only (Code Rescue)</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                            className="admin-btn admin-btn-primary"
                            onClick={() => handleAdjustTimer(300, undefined, '+5 Minutes')}
                            style={{ fontWeight: 'bold', fontSize: 12 }}
                            title="Add 5 minutes (300 seconds) to all target workstation clocks"
                        >
                            ➕ +5 Mins Extra Time
                        </button>
                        <button
                            className="admin-btn admin-btn-primary"
                            onClick={() => handleAdjustTimer(60, undefined, '+1 Minute')}
                            style={{ fontWeight: 'bold', fontSize: 12 }}
                            title="Add 1 minute (60 seconds) quick extension"
                        >
                            ➕ +1 Min Quick Extension
                        </button>
                        <button
                            className="admin-btn"
                            onClick={() => {
                                const standardSecs = targetRoundForTimer === 'R1' ? 1200 : (targetRoundForTimer === 'R2' ? 1500 : 2400);
                                handleAdjustTimer(undefined, standardSecs, `Reset to ${Math.floor(standardSecs / 60)}m Full Duration`);
                            }}
                            style={{ fontWeight: 'bold', fontSize: 12 }}
                            title="Reset active round timer back to standard duration"
                        >
                            🔄 Reset Full Round Duration
                        </button>
                        <button
                            className="admin-btn admin-btn-danger"
                            onClick={() => {
                                if (window.confirm(`⚠️ EXPIRE CLOCK WARNING:\n\nForce expire clock (set remaining time to 00:00) for ${targetRoundForTimer}?\nThis will immediately finalize the round on contestant workstations.`)) {
                                    handleAdjustTimer(undefined, 0, 'Force Expire 00:00');
                                }
                            }}
                            style={{ fontWeight: 'bold', fontSize: 12 }}
                            title="Emergency round end: immediately expire countdown clock to 00:00"
                        >
                            🛑 Force Expire Clock (00:00)
                        </button>
                    </div>
                </div>

                {/* Custom Time Inserter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <span>Custom Clock Override:</span>
                    <input
                        type="number"
                        className="admin-input"
                        value={customSeconds}
                        onChange={(e) => setCustomSeconds(parseInt(e.target.value) || 0)}
                        style={{ width: 80, padding: '3px 6px', fontFamily: 'monospace' }}
                        min={0}
                        step={60}
                    />
                    <span>seconds ({Math.floor(customSeconds / 60)}m {customSeconds % 60}s)</span>
                    <button
                        className="admin-btn"
                        onClick={() => handleAdjustTimer(undefined, customSeconds, `Set to ${customSeconds}s`)}
                        style={{ padding: '3px 10px', fontSize: 11 }}
                    >
                        Set Exact Seconds
                    </button>
                </div>
            </div>

            {/* STAGE CARDS & CUTOFF CONTROLS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                {rounds.map((round) => (
                    <div
                        key={round.roundId}
                        className="admin-box"
                        style={{
                            justifyContent: 'space-between',
                            border: round.isActive ? '2px solid #0d652d' : '1px solid #999',
                            boxShadow: round.isActive ? '0 0 8px rgba(13, 101, 45, 0.3)' : 'none',
                        }}
                    >
                        <div>
                            {/* Round Header */}
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #808080', paddingBottom: 6, marginBottom: 8 }}>
                                <span style={{ fontWeight: 'bold', fontSize: 14, color: round.isActive ? '#0d652d' : '#000080' }}>
                                    {round.name} — {round.title}
                                </span>
                                <span
                                    className="status-badge"
                                    style={{
                                        backgroundColor: round.isActive ? '#e6f4ea' : '#f0f0f0',
                                        color: round.isActive ? '#0d652d' : '#666',
                                        borderColor: round.isActive ? '#0d652d' : '#999',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {round.isActive ? '● ACTIVE ROUND' : 'STANDBY'}
                                </span>
                            </div>

                            <p style={{ fontSize: 12, color: '#333', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                                {round.description}
                            </p>

                            {/* Metrics */}
                            <div style={{ backgroundColor: '#ffffff', border: '1px solid #ccc', padding: 8, marginBottom: 10, fontSize: 12, lineHeight: 1.6 }}>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <span>Max Points:</span>
                                    <b>{round.maxScore} pts</b>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <span>Standard Duration:</span>
                                    <b>{round.durationMinutes || (round.roundId === 'R1' ? 20 : round.roundId === 'R2' ? 25 : 40)} mins</b>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <span>Work Orders:</span>
                                    <b>{round.roundId === 'R1' ? '10 Orders' : round.roundId === 'R2' ? '5 Orders' : '1 System Order'}</b>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', color: '#0d652d' }}>
                                    <span>Qualified Contestants:</span>
                                    <b>{round.qualifiedCount || 0}</b>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', color: '#b06000' }}>
                                    <span>Pending Evaluation:</span>
                                    <b>{round.pendingCount || 0}</b>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', color: '#c5221f' }}>
                                    <span>Eliminated / Below Cutoff:</span>
                                    <b>{round.eliminatedCount || 0}</b>
                                </div>
                            </div>

                            {/* Cutoff Controls */}
                            <div style={{ padding: 8, backgroundColor: '#e8e8e8', border: '1px solid #ccc', marginBottom: 10 }}>
                                <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4, color: '#000080' }}>
                                    Qualification Cutoff Threshold:
                                </div>
                                {editingRoundId === round.roundId ? (
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                                        <input
                                            type="number"
                                            className="admin-input"
                                            value={cutoffInput}
                                            onChange={(e) => setCutoffInput(parseInt(e.target.value) || 0)}
                                            style={{ width: 65, padding: '3px 6px', fontFamily: 'monospace' }}
                                            min={0}
                                            max={round.maxScore}
                                        />
                                        <span style={{ fontSize: 12 }}>/ {round.maxScore} pts</span>
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
                                            {round.cutoff} / {round.maxScore} pts required
                                        </span>
                                        <button className="admin-btn" onClick={() => startEditing(round)}>
                                            Edit Cutoff
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Round Activation Action */}
                        <div style={{ borderTop: '1px solid #ccc', paddingTop: 8, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: '#666' }}>
                                {round.isActive ? 'Current active round' : 'Standby round'}
                            </span>
                            {!round.isActive ? (
                                <button
                                    className="admin-btn admin-btn-primary"
                                    onClick={() => {
                                        if (window.confirm(`Activate ${round.name} (${round.title}) globally for all participants?`)) {
                                            activateRound(round.roundId);
                                        }
                                    }}
                                    style={{ fontWeight: 'bold', padding: '4px 12px' }}
                                >
                                    ▶ ACTIVATE {round.roundId} GLOBALLY
                                </button>
                            ) : (
                                <span style={{ fontSize: 11, color: '#0d652d', fontWeight: 'bold' }}>
                                    ✓ LIVE IN ARENA
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
