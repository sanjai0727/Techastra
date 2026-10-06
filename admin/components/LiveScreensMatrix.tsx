// ============================================================================
// LIVE SCREENS SURVEILLANCE MATRIX — TECHASTRA 2026 ADMIN PORTAL
// Multi-workstation surveillance grid with live keystroke code streaming,
// real-time countdown timer synchronization, and full inspector modal.
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { LiveScreenData, Participant } from '../types';
import { LiveScreenService } from '../services/liveScreenService';
import { ParticipantService } from '../services/participantService';

interface LiveScreensMatrixProps {
    onSelectParticipant?: (participant: Participant) => void;
}

export const LiveScreensMatrix: React.FC<LiveScreensMatrixProps> = ({ onSelectParticipant }) => {
    const [screens, setScreens] = useState<LiveScreenData[]>(LiveScreenService.getScreens());
    const [participants, setParticipants] = useState<Participant[]>(ParticipantService.getParticipants());
    const [searchQuery, setSearchQuery] = useState('');
    const [roundFilter, setRoundFilter] = useState<'ALL' | 'R1' | 'R2' | 'R3'>('ALL');
    const [inspectedScreen, setInspectedScreen] = useState<LiveScreenData | null>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    useEffect(() => {
        const unsubScreens = LiveScreenService.subscribe((updatedScreens) => {
            setScreens(updatedScreens);
            if (inspectedScreen) {
                const refreshed = updatedScreens.find(s => s.participantId === inspectedScreen.participantId);
                if (refreshed) setInspectedScreen(refreshed);
            }
        });

        const unsubParticipants = ParticipantService.subscribe((updatedParticipants) => {
            setParticipants(updatedParticipants);
        });

        return () => {
            unsubScreens();
            unsubParticipants();
        };
    }, [inspectedScreen]);

    // Format seconds into MM:SS
    const formatTime = (seconds: number) => {
        const s = Math.max(0, seconds);
        const mm = Math.floor(s / 60);
        const ss = s % 60;
        return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    };

    // Calculate time elapsed since last keystroke
    const getKeystrokeStatus = (lastMs: number) => {
        const diffMs = Date.now() - lastMs;
        if (diffMs < 3000) {
            return { text: '🟢 TYPING LIVE', className: 'pulse-typing', isTyping: true };
        } else if (diffMs < 15000) {
            return { text: `Active ${Math.round(diffMs / 1000)}s ago`, className: '', isTyping: false };
        } else {
            return { text: `Idle ${Math.round(diffMs / 1000)}s`, className: '', isTyping: false };
        }
    };

    // Merge participant metadata with live screen data
    const mergedScreens = useMemo(() => {
        // Collect all participant IDs from both sources
        const pMap = new Map<string, Participant>();
        participants.forEach(p => pMap.set(p.id.toUpperCase(), p));

        const screenMap = new Map<string, LiveScreenData>();
        screens.forEach(s => screenMap.set(s.participantId.toUpperCase(), s));

        // Create unified list
        const allIds = new Set([...Array.from(pMap.keys()), ...Array.from(screenMap.keys())]);
        const results: LiveScreenData[] = [];

        allIds.forEach(id => {
            const sc = screenMap.get(id);
            const p = pMap.get(id);
            if (sc) {
                results.push({
                    ...sc,
                    college: sc.college || (p ? p.college : 'Institution'),
                    department: sc.department || (p ? p.department : 'Engineering'),
                    status: sc.status || (p ? p.status : 'ACTIVE'),
                    strikes: sc.strikes !== undefined ? sc.strikes : (p ? p.strikes : 0),
                    score: sc.score !== undefined ? sc.score : (p ? p.score : 0),
                    totalScore: sc.totalScore !== undefined ? sc.totalScore : (p ? p.totalScore : 0),
                });
            } else if (p) {
                // Participant registered but hasn't emitted code-stream yet
                results.push({
                    participantId: p.id,
                    participantName: p.name,
                    roundId: p.currentRound || 'R1',
                    questionId: p.currentQuestion || 'Q1',
                    questionTitle: 'Awaiting first keystroke...',
                    code: p.currentCode || '# Participant has joined session.\n# Real-time code stream will appear here once editing commences.\n',
                    timeRemaining: p.timeRemaining !== undefined ? p.timeRemaining : 2400,
                    lastKeystrokeAt: p.lastKeystrokeAt || Date.now() - 30000,
                    college: p.college,
                    department: p.department,
                    status: p.status,
                    strikes: p.strikes,
                    score: p.score,
                    totalScore: p.totalScore,
                });
            }
        });

        // Filter and sort by latest activity
        return results
            .filter(item => {
                const q = searchQuery.toLowerCase().trim();
                const matchesQuery =
                    !q ||
                    item.participantId.toLowerCase().includes(q) ||
                    item.participantName.toLowerCase().includes(q) ||
                    (item.college && item.college.toLowerCase().includes(q));

                const matchesRound = roundFilter === 'ALL' || item.roundId === roundFilter;

                return matchesQuery && matchesRound;
            })
            .sort((a, b) => b.lastKeystrokeAt - a.lastKeystrokeAt);
    }, [screens, participants, searchQuery, roundFilter]);

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Header Control Panel */}
            <div className="admin-box" style={{ padding: '8px 12px', backgroundColor: '#e8e8e8', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 'bold', color: '#000080' }}>
                        🖥️ PARTICIPANT WORKSTATION SURVEILLANCE
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 'bold', padding: '2px 8px', backgroundColor: '#e6f4ea', color: '#0d652d', border: '1px solid #137333' }}>
                        ● {mergedScreens.length} MONITORED STATIONS
                    </span>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        className="admin-input"
                        placeholder="Search Station, Name, College..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: 220, fontSize: 11, padding: '3px 8px' }}
                    />
                    <select
                        className="admin-input"
                        value={roundFilter}
                        onChange={(e) => setRoundFilter(e.target.value as any)}
                        style={{ fontSize: 11, padding: '3px 8px' }}
                    >
                        <option value="ALL">All Rounds</option>
                        <option value="R1">Round 1 (Bug Hunt)</option>
                        <option value="R2">Round 2 (Logic Breaker)</option>
                        <option value="R3">Round 3 (Code Rescue)</option>
                    </select>
                    <button
                        className="admin-btn"
                        onClick={() => LiveScreenService.refreshScreens()}
                        style={{ fontSize: 11, padding: '3px 10px' }}
                        title="Force sync live screens from backend"
                    >
                        🔄 Sync Screens
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {mergedScreens.length === 0 ? (
                <div className="admin-box" style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#ffffff' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📡</div>
                    <div style={{ fontSize: 14, fontWeight: 'bold', color: '#000080', marginBottom: 6 }}>
                        No Active Participant Screens Connected
                    </div>
                    <div style={{ fontSize: 12, color: '#666', maxWidth: 480, margin: '0 auto' }}>
                        Workstation screens and live code keystrokes stream directly to this surveillance matrix with 0ms latency as soon as participants log in and begin editing.
                    </div>
                </div>
            ) : (
                /* Surveillance Matrix Grid */
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                    gap: 12,
                }}>
                    {mergedScreens.map((screen) => {
                        const keystrokeStatus = getKeystrokeStatus(screen.lastKeystrokeAt);
                        const linesCount = screen.code ? screen.code.split('\n').length : 0;
                        const charsCount = screen.code ? screen.code.length : 0;
                        const timerUrgent = screen.timeRemaining <= 120;
                        const timerWarning = screen.timeRemaining <= 300 && screen.timeRemaining > 120;

                        return (
                            <div
                                key={screen.participantId}
                                className="admin-box"
                                style={{
                                    margin: 0,
                                    padding: 0,
                                    backgroundColor: '#ffffff',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: '2px solid #808080',
                                    boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px grey, inset 2px 2px #fff',
                                }}
                            >
                                {/* Workstation Title Bar */}
                                <div style={{
                                    backgroundColor: '#000080',
                                    color: '#ffffff',
                                    padding: '4px 8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontWeight: 'bold',
                                    fontSize: 11,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{
                                            display: 'inline-block',
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            backgroundColor: keystrokeStatus.isTyping ? '#00ff66' : '#ffff00',
                                            boxShadow: keystrokeStatus.isTyping ? '0 0 6px #00ff66' : 'none',
                                        }} />
                                        <span>STATION {screen.participantId}: {screen.participantName}</span>
                                    </div>
                                    <button
                                        className="admin-btn"
                                        onClick={() => setInspectedScreen(screen)}
                                        style={{ padding: '1px 6px', fontSize: 10, height: 18, lineHeight: '14px' }}
                                        title="Maximize workstation screen"
                                    >
                                        🔍 Full Screen
                                    </button>
                                </div>

                                {/* Workstation Sub-Header & Live Synchronized Clock */}
                                <div style={{
                                    padding: '6px 8px',
                                    backgroundColor: '#f5f5f5',
                                    borderBottom: '1px solid #ccc',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: 11,
                                }}>
                                    <div>
                                        <span style={{ fontWeight: 'bold', color: '#000080' }}>[{screen.roundId}]</span>{' '}
                                        <span style={{ fontWeight: 'bold' }}>{screen.questionId}:</span> {screen.questionTitle}
                                    </div>
                                    {/* Live Clock Pill */}
                                    <div style={{
                                        fontFamily: 'Consolas, monospace',
                                        fontWeight: 'bold',
                                        fontSize: 12,
                                        padding: '2px 8px',
                                        backgroundColor: timerUrgent ? '#fce8e6' : timerWarning ? '#fef7e0' : '#e6f4ea',
                                        color: timerUrgent ? '#c5221f' : timerWarning ? '#b06000' : '#0d652d',
                                        border: `1px solid ${timerUrgent ? '#c5221f' : timerWarning ? '#b06000' : '#137333'}`,
                                        borderRadius: 2,
                                    }}>
                                        ⏱ {formatTime(screen.timeRemaining)}
                                    </div>
                                </div>

                                {/* Live Code Editor Mirror (Real-Time Terminal Buffer) */}
                                <div style={{
                                    backgroundColor: '#1e1e1e',
                                    color: '#d4d4d4',
                                    fontFamily: 'Consolas, "Courier New", monospace',
                                    fontSize: 11,
                                    padding: 8,
                                    height: 180,
                                    overflowY: 'auto',
                                    lineHeight: 1.4,
                                    position: 'relative',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all',
                                    borderBottom: '1px solid #333',
                                }}>
                                    {screen.code ? (
                                        screen.code
                                    ) : (
                                        <span style={{ color: '#777', fontStyle: 'italic' }}>
                                            # Solution buffer empty. Waiting for participant keystrokes...
                                        </span>
                                    )}
                                </div>

                                {/* Status Bar & Telemetry Footer */}
                                <div style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#e0e0e0',
                                    fontSize: 10,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontFamily: 'monospace',
                                    color: '#333',
                                }}>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', color: keystrokeStatus.isTyping ? '#0d652d' : '#666' }}>
                                            {keystrokeStatus.text}
                                        </span>
                                        <span>{linesCount} L &bull; {charsCount} C</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        {screen.strikes !== undefined && screen.strikes > 0 ? (
                                            <span style={{ color: '#c5221f', fontWeight: 'bold' }}>
                                                ⚠️ {screen.strikes} Strike{screen.strikes > 1 ? 's' : ''}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#0d652d' }}>🛡️ Clean</span>
                                        )}
                                        {onSelectParticipant && (
                                            <button
                                                className="admin-btn"
                                                onClick={() => {
                                                    const p = participants.find(part => part.id === screen.participantId);
                                                    if (p) onSelectParticipant(p);
                                                }}
                                                style={{ fontSize: 9, padding: '1px 5px' }}
                                            >
                                                Dossier &gt;
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Fullscreen Workstation Inspector Modal */}
            {inspectedScreen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20,
                }}>
                    <div className="admin-box" style={{
                        width: '95vw',
                        maxWidth: 1100,
                        maxHeight: '92vh',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#c0c0c0',
                        padding: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    }}>
                        {/* Modal Title Bar */}
                        <div style={{
                            backgroundColor: '#000080',
                            color: '#ffffff',
                            padding: '4px 8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontWeight: 'bold',
                            fontSize: 13,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>🖥️ LIVE WORKSTATION INSPECTOR — {inspectedScreen.participantId}: {inspectedScreen.participantName}</span>
                                <span style={{
                                    fontSize: 11,
                                    backgroundColor: '#00ff66',
                                    color: '#000',
                                    padding: '1px 6px',
                                    fontWeight: 'bold',
                                }}>
                                    REAL-TIME STREAM ACTIVE
                                </span>
                            </div>
                            <button
                                className="admin-btn"
                                onClick={() => setInspectedScreen(null)}
                                style={{ padding: '1px 8px', fontSize: 12, fontWeight: 'bold' }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Top Telemetry Strip */}
                        <div style={{
                            padding: '8px 12px',
                            backgroundColor: '#f0f0f0',
                            borderBottom: '1px solid #808080',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 10,
                        }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 'bold' }}>
                                    {inspectedScreen.participantName} &bull; {inspectedScreen.college} ({inspectedScreen.department})
                                </div>
                                <div style={{ fontSize: 11, color: '#444' }}>
                                    Current Work Order: <b>[{inspectedScreen.roundId}] {inspectedScreen.questionId}: {inspectedScreen.questionTitle}</b>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {/* Synchronized Live Timer */}
                                <div style={{
                                    fontFamily: 'Consolas, monospace',
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                    padding: '4px 12px',
                                    backgroundColor: inspectedScreen.timeRemaining <= 120 ? '#fce8e6' : '#e6f4ea',
                                    color: inspectedScreen.timeRemaining <= 120 ? '#c5221f' : '#0d652d',
                                    border: '2px solid #808080',
                                }}>
                                    ⏱ REMAINING: {formatTime(inspectedScreen.timeRemaining)}
                                </div>

                                <div style={{ fontSize: 11, lineHeight: 1.4 }}>
                                    <div>Status: <span className={`status-badge status-badge-${inspectedScreen.status || 'ACTIVE'}`}>{inspectedScreen.status || 'ACTIVE'}</span></div>
                                    <div>Security Strikes: <b>{inspectedScreen.strikes || 0}</b></div>
                                </div>
                            </div>
                        </div>

                        {/* Main Inspector Code Editor Mirror */}
                        <div style={{
                            flex: 1,
                            backgroundColor: '#1e1e1e',
                            color: '#d4d4d4',
                            fontFamily: 'Consolas, "Courier New", monospace',
                            fontSize: 13,
                            padding: 12,
                            overflowY: 'auto',
                            maxHeight: '60vh',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                            lineHeight: 1.5,
                            borderTop: '2px solid #000',
                            borderBottom: '2px solid #000',
                        }}>
                            {inspectedScreen.code ? (
                                inspectedScreen.code
                            ) : (
                                <span style={{ color: '#888', fontStyle: 'italic' }}>
                                    # Participant code buffer is currently empty. Keystrokes will render here in real time as contestant writes code...
                                </span>
                            )}
                        </div>

                        {/* Modal Action Controls Footer */}
                        <div style={{
                            padding: '8px 12px',
                            backgroundColor: '#c0c0c0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 8,
                        }}>
                            <div style={{ fontSize: 11, fontFamily: 'monospace' }}>
                                <span>Buffer: {inspectedScreen.code ? inspectedScreen.code.split('\n').length : 0} lines &bull; {inspectedScreen.code ? inspectedScreen.code.length : 0} characters</span>
                                <span style={{ marginLeft: 10, color: '#0d652d', fontWeight: 'bold' }}>
                                    {getKeystrokeStatus(inspectedScreen.lastKeystrokeAt).text}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    className="admin-btn"
                                    onClick={() => {
                                        if (inspectedScreen.code) {
                                            navigator.clipboard.writeText(inspectedScreen.code);
                                            alert(`Copied ${inspectedScreen.participantId}'s live code buffer to clipboard!`);
                                        }
                                    }}
                                    style={{ fontSize: 11, padding: '4px 12px' }}
                                >
                                    📋 Copy Code Buffer
                                </button>
                                <button
                                    className="admin-btn admin-btn-danger"
                                    onClick={() => {
                                        ParticipantService.flagParticipant(inspectedScreen.participantId, 'Malpractice observed via Live Screen');
                                        alert(`Participant ${inspectedScreen.participantId} flagged.`);
                                    }}
                                    style={{ fontSize: 11, padding: '4px 12px' }}
                                >
                                    ⚠️ Flag Participant
                                </button>
                                <button
                                    className="admin-btn"
                                    onClick={() => setInspectedScreen(null)}
                                    style={{ fontSize: 11, padding: '4px 16px', fontWeight: 'bold' }}
                                >
                                    Close Screen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
