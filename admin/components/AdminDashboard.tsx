// ============================================================================
// ADMIN COMMAND CENTER DASHBOARD — TECHASTRA 2026
// Coordinates overview, live participant telemetry, proctoring strikes,
// code submissions, round cutoffs, broadcasts, and reports.
// Fit completely inside the main Event Dossier content area.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Participant, Submission, AdminUser } from '../types';
import { ParticipantService } from '../services/participantService';
import { RealtimeService, StreamConnectionStatus } from '../services/realtimeService';
import { OverviewCards } from './OverviewCards';
import { LiveParticipantMonitor } from './LiveParticipantMonitor';
import { ParticipantDetailModal } from './ParticipantDetailModal';
import { ProctoringPanel } from './ProctoringPanel';
import { SubmissionsPanel } from './SubmissionsPanel';
import { RoundManagement } from './RoundManagement';
import { AnnouncementsPanel } from './AnnouncementsPanel';
import { ReportsPanel } from './ReportsPanel';
import { LiveScreensMatrix } from './LiveScreensMatrix';
import { DatabaseResetPanel } from './DatabaseResetPanel';
import { ErrorBoundary } from './ErrorBoundary';

type DashboardTab = 'participants' | 'screens' | 'proctoring' | 'submissions' | 'rounds' | 'announcements' | 'reports' | 'database';

interface AdminDashboardProps {
    user: AdminUser;
    onLogout: () => void;
}

interface SystemStats {
    totalParticipants: number;
    activeParticipants: number;
    qualifiedParticipants: number;
    flaggedParticipants: number;
    totalSubmissions: number;
    totalEvents: number;
    sseClients: number;
    eventEnded: boolean;
    uptimeSeconds: number;
    serverTime: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState<DashboardTab>('participants');
    const [participants, setParticipants] = useState<Participant[]>(ParticipantService.getParticipants());
    const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
    const [inspectedSubmission, setInspectedSubmission] = useState<Submission | null>(null);
    const [streamStatus, setStreamStatus] = useState<StreamConnectionStatus>('CONNECTING');
    const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
    const [isTogglingScore, setIsTogglingScore] = useState<boolean>(false);

    const fetchSystemStats = async () => {
        try {
            const res = await fetch('/api/admin/system-stats', {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });
            const data = await res.json();
            if (data.success && data.stats) {
                setSystemStats(data.stats);
            }
        } catch {}
    };

    useEffect(() => {
        // Initialize Realtime SSE Stream
        RealtimeService.init();
        const unsubsStatus = RealtimeService.subscribeStatus((st) => setStreamStatus(st));

        const unsubscribe = ParticipantService.subscribe((updated) => {
            setParticipants(updated);
            if (selectedParticipant) {
                const refreshed = updated.find(p => p.id === selectedParticipant.id);
                if (refreshed) setSelectedParticipant(refreshed);
            }
        });

        fetchSystemStats();
        const statsInterval = setInterval(fetchSystemStats, 5000);

        return () => {
            unsubsStatus();
            unsubscribe();
            clearInterval(statsInterval);
        };
    }, [selectedParticipant]);

    const handleFlag = (id: string) => {
        ParticipantService.flagParticipant(id, 'Coordinator manual flag');
        fetchSystemStats();
    };

    const handleReinstate = (id: string) => {
        ParticipantService.reinstateSession(id);
        fetchSystemStats();
    };

    const handleViewSubmissionFromModal = (submission: Submission) => {
        setInspectedSubmission(submission);
        setSelectedParticipant(null);
        setActiveTab('submissions');
    };

    const handleToggleScorePrivacy = async () => {
        if (!systemStats) return;
        const nextState = !systemStats.eventEnded;
        const msg = nextState
            ? '⚠️ REVEAL ALL SCORES & FINAL STANDINGS?\n\nThis will publish final marks and reveal complete leaderboards across all contestant terminals.\n\nProceed to REVEAL?'
            : '🔒 CONCEAL SCORES & LEADERBOARDS?\n\nThis will re-mask scores on contestant screens to keep competition results confidential.\n\nProceed to CONCEAL?';

        if (!window.confirm(msg)) return;

        setIsTogglingScore(true);
        try {
            const res = await fetch('/api/admin/toggle-event-ended', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({ eventEnded: nextState }),
            });
            const d = await res.json();
            if (d.success) {
                setSystemStats(prev => prev ? { ...prev, eventEnded: d.eventEnded } : null);
                alert(d.eventEnded ? '✓ Scores are now REVEALED publicly!' : '✓ Scores are now CONCEALED.');
            } else {
                alert(`Error: ${d.error || 'Unauthorized'}`);
            }
        } catch (e: any) {
            alert(`Failed: ${e.message}`);
        } finally {
            setIsTogglingScore(false);
        }
    };

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return (
        <div className="admin-page">
            {/* Header Control Bar */}
            <div className="admin-cc-header">
                <div>
                    <h2 className="admin-cc-title">TECHASTRA 2026 — ADMIN COMMAND CENTER</h2>
                    <div className="admin-cc-sub">Department of Computer Science &amp; Engineering &bull; Department of Cyber Security</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {streamStatus === 'CONNECTED' ? (
                        <span style={{ fontSize: 11, fontWeight: 'bold', color: '#0d652d', backgroundColor: '#e6f4ea', padding: '2px 8px', border: '1px solid #137333' }}>
                            🟢 SSE STREAM ACTIVE (0ms)
                        </span>
                    ) : streamStatus === 'CONNECTING' ? (
                        <span style={{ fontSize: 11, fontWeight: 'bold', color: '#b06000', backgroundColor: '#fef7e0', padding: '2px 8px', border: '1px solid #b06000' }}>
                            🟡 CONNECTING STREAM...
                        </span>
                    ) : (
                        <span style={{ fontSize: 11, fontWeight: 'bold', color: '#c5221f', backgroundColor: '#fce8e6', padding: '2px 8px', border: '1px solid #c5221f' }}>
                            🔴 OFFLINE (POLLING ACTIVE)
                        </span>
                    )}

                    {/* Master Score Reveal Quick Toggle */}
                    {systemStats && (
                        <button
                            className="admin-btn"
                            disabled={isTogglingScore}
                            onClick={handleToggleScorePrivacy}
                            style={{
                                padding: '3px 10px',
                                fontSize: 11,
                                fontWeight: 'bold',
                                backgroundColor: systemStats.eventEnded ? '#2e7d32' : '#7a5200',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                            }}
                            title="Toggle whether scores are hidden or revealed to contestants"
                        >
                            {systemStats.eventEnded ? '🔓 SCORES REVEALED (Public)' : '🔒 SCORES LOCKED (Private)'}
                        </button>
                    )}

                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={async () => {
                            try {
                                const res = await fetch('/api/coordinator/sync', { method: 'POST' });
                                const d = await res.json();
                                alert(d.success ? `Successfully synced ${d.synced} contestants from Techastra Event Portal!` : `Sync error: ${d.error}`);
                                ParticipantService.pollServerTelemetry();
                                fetchSystemStats();
                            } catch (e: any) {
                                alert(`Failed to connect to sync endpoint: ${e.message}`);
                            }
                        }}
                        style={{ padding: '3px 10px', fontSize: 11, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}
                        title="Synchronize contestants directly from Dr. M.G.R. Techastra Event Coordinator Portal"
                    >
                        🔄 Sync Live Portal
                    </button>

                    <button
                        className="admin-btn admin-btn-danger"
                        onClick={() => setActiveTab('database')}
                        style={{ padding: '3px 12px', fontSize: 11, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 5 }}
                        title="Database Management & Contest Reset: Clear submissions, pardon strikes, or execute clean slate reset"
                    >
                        🗄️ Database Reset
                    </button>

                    <span style={{ fontSize: 12, color: '#333' }}>
                        Coordinator: <b>{user.username}</b>
                    </span>
                    <button
                        className="admin-btn admin-btn-danger"
                        onClick={onLogout}
                        style={{ padding: '3px 10px', fontSize: 11 }}
                    >
                        LOGOUT
                    </button>
                </div>
            </div>

            {/* System Infrastructure Telemetry Ribbon */}
            {systemStats && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 8,
                    marginBottom: 10,
                    padding: '6px 10px',
                    backgroundColor: '#d8e4f0',
                    border: '1px solid #7a92ad',
                    fontSize: 11,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span>👥 Enrolled: <b>{systemStats.totalParticipants}</b></span>
                        <span style={{ color: '#0d652d' }}>🟢 Active Terminals: <b>{systemStats.activeParticipants}</b></span>
                        <span style={{ color: '#000080' }}>🏆 Qualified: <b>{systemStats.qualifiedParticipants}</b></span>
                        <span style={{ color: systemStats.flaggedParticipants > 0 ? '#c5221f' : '#333' }}>
                            🚩 Flagged/Strikes: <b>{systemStats.flaggedParticipants}</b>
                        </span>
                        <span>💾 Code Submissions: <b>{systemStats.totalSubmissions}</b></span>
                        <span>🛡️ Proctoring Events: <b>{systemStats.totalEvents}</b></span>
                        <span>📡 Live SSE Pool: <b>{systemStats.sseClients}</b></span>
                    </div>
                    <div style={{ color: '#555', fontStyle: 'italic' }}>
                        ⏱ Uptime: {formatUptime(systemStats.uptimeSeconds)} &bull; {new Date(systemStats.serverTime).toLocaleTimeString()}
                    </div>
                </div>
            )}

            {/* Overview Stat Cards */}
            <OverviewCards participants={participants} />

            {/* Navigation Tabs */}
            <div className="admin-tab-bar">
                <button
                    className={`admin-tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
                    onClick={() => setActiveTab('participants')}
                >
                    👥 Live Monitor ({participants.length})
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'screens' ? 'active' : ''}`}
                    onClick={() => setActiveTab('screens')}
                >
                    🖥️ Live Screens Matrix
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'proctoring' ? 'active' : ''}`}
                    onClick={() => setActiveTab('proctoring')}
                >
                    🛡️ Proctoring &amp; Strikes
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('submissions')}
                >
                    💾 Submissions
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'rounds' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rounds')}
                >
                    ⚙️ Round &amp; Timer Controls
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
                    onClick={() => setActiveTab('announcements')}
                >
                    📢 Wire Broadcasts
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reports')}
                >
                    📈 Reports &amp; Score Reveal
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'database' ? 'active' : ''}`}
                    onClick={() => setActiveTab('database')}
                    style={activeTab === 'database' ? { backgroundColor: '#fff0f0', color: '#c5221f' } : undefined}
                >
                    🗄️ Database Reset
                </button>
            </div>

            {/* Active Tab View */}
            <ErrorBoundary fallbackTitle={activeTab.toUpperCase()}>
                {activeTab === 'participants' && (
                    <div>
                        <h4 style={{ margin: '0 0 10px 0', color: '#000080' }}>
                            LIVE PARTICIPANT MONITOR &amp; WORKSTATION CONTROLS
                        </h4>
                        <LiveParticipantMonitor
                            participants={participants}
                            onSelectParticipant={(p) => setSelectedParticipant(p)}
                        />
                    </div>
                )}

                {activeTab === 'screens' && (
                    <div>
                        <LiveScreensMatrix
                            onSelectParticipant={(p) => {
                                setSelectedParticipant(p);
                                setActiveTab('participants');
                            }}
                        />
                    </div>
                )}

                {activeTab === 'proctoring' && (
                    <div>
                        <h4 style={{ margin: '0 0 10px 0', color: '#000080' }}>
                            PROCTORING &amp; WORKSTATION INTEGRITY AUDIT
                        </h4>
                        <ProctoringPanel />
                    </div>
                )}

                {activeTab === 'submissions' && (
                    <div>
                        <h4 style={{ margin: '0 0 10px 0', color: '#000080' }}>
                            PARTICIPANT CODE SUBMISSION INSPECTION
                        </h4>
                        <SubmissionsPanel initialSelected={inspectedSubmission} />
                    </div>
                )}

                {activeTab === 'rounds' && (
                    <div>
                        <h4 style={{ margin: '0 0 10px 0', color: '#000080' }}>
                            MASTER CLOCK &amp; TOURNAMENT ROUND CONTROLS
                        </h4>
                        <RoundManagement />
                    </div>
                )}

                {activeTab === 'announcements' && (
                    <div>
                        <h4 style={{ margin: '0 0 10px 0', color: '#000080' }}>
                            SYSTEM ANNOUNCEMENTS &amp; ARENA WIRE BROADCAST
                        </h4>
                        <AnnouncementsPanel />
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div>
                        <h4 style={{ margin: '0 0 10px 0', color: '#000080' }}>
                            TOURNAMENT SCORECARD, DATA EXPORTS &amp; AUDIT REPORTS
                        </h4>
                        <ReportsPanel participants={participants} />
                    </div>
                )}

                {activeTab === 'database' && (
                    <div>
                        <DatabaseResetPanel
                            user={user}
                            onResetCompleted={() => {
                                ParticipantService.pollServerTelemetry();
                                fetchSystemStats();
                            }}
                        />
                    </div>
                )}
            </ErrorBoundary>

            {/* Participant Details Drawer */}
            {selectedParticipant && (
                <ParticipantDetailModal
                    participant={selectedParticipant}
                    onClose={() => setSelectedParticipant(null)}
                    onFlag={handleFlag}
                    onReinstate={handleReinstate}
                    onViewSubmission={handleViewSubmissionFromModal}
                />
            )}
        </div>
    );
};
