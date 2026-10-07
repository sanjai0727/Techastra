// ============================================================================
// DATABASE RESET & SYSTEM MANAGEMENT PANEL — TECHASTRA 2026 ADMIN PORTAL
// Provides coordinators with granular database reset, telemetry wipe,
// pristine clean-slate reset, and official contestant roster restoration.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { AdminUser } from '../types';

interface DatabaseStats {
    participantsCount: number;
    activeParticipants: number;
    submissionsCount: number;
    proctoringEventsCount: number;
    sessionsCount: number;
    liveScreensCount: number;
    announcementsCount: number;
}

interface DatabaseResetPanelProps {
    user: AdminUser;
    onResetCompleted?: () => void;
}

export const DatabaseResetPanel: React.FC<DatabaseResetPanelProps> = ({ user, onResetCompleted }) => {
    const [stats, setStats] = useState<DatabaseStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

    // Modal Confirmation State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        mode: 'full' | 'sessions_only' | 'clean_slate' | 'seed_only';
        seedRoster?: boolean;
        dangerLevel: 'high' | 'medium';
    }>({
        isOpen: false,
        title: '',
        description: '',
        mode: 'full',
        dangerLevel: 'medium'
    });

    const fetchDatabaseStats = async () => {
        setLoadingStats(true);
        try {
            const res = await fetch('/api/admin/database-stats', {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });
            const data = await res.json();
            if (data.success && data.stats) {
                setStats(data.stats);
            }
        } catch (e: any) {
            console.error('Failed to fetch database stats:', e);
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        fetchDatabaseStats();
        const interval = setInterval(fetchDatabaseStats, 5000);
        return () => clearInterval(interval);
    }, [user.token]);

    const handleExecuteReset = async (mode: 'full' | 'sessions_only' | 'clean_slate' | 'seed_only', seedRoster: boolean = true) => {
        setIsExecuting(true);
        setStatusMessage({ text: 'Executing database operation, please wait...', type: 'info' });

        try {
            const res = await fetch('/api/admin/reset-database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({ mode, seedRoster }),
            });

            const data = await res.json();
            if (data.success) {
                setStatusMessage({
                    text: `✓ ${data.message || 'Database reset successfully executed!'}`,
                    type: 'success',
                });
                await fetchDatabaseStats();
                if (onResetCompleted) {
                    onResetCompleted();
                }
            } else {
                setStatusMessage({
                    text: `⚠️ Database reset failed: ${data.error || 'Server error'}`,
                    type: 'error',
                });
            }
        } catch (err: any) {
            setStatusMessage({
                text: `❌ Network connection error: ${err.message}`,
                type: 'error',
            });
        } finally {
            setIsExecuting(false);
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const openConfirmModal = (
        title: string,
        description: string,
        mode: 'full' | 'sessions_only' | 'clean_slate' | 'seed_only',
        dangerLevel: 'high' | 'medium',
        seedRoster: boolean = true
    ) => {
        setConfirmModal({
            isOpen: true,
            title,
            description,
            mode,
            seedRoster,
            dangerLevel,
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Header Directive */}
            <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #7a92ad',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10
            }}>
                <div>
                    <h3 style={{ margin: 0, color: '#000080', fontSize: 16 }}>
                        🗄️ DATABASE MANAGEMENT &amp; CONTEST AUDIT RESET
                    </h3>
                    <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                        Authorized Coordinator: <b>{user.username}</b> &bull; Direct ACID persistence on <code>server/data/techastra.db</code>
                    </div>
                </div>
                <button
                    className="admin-btn"
                    onClick={fetchDatabaseStats}
                    disabled={loadingStats}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '4px 12px' }}
                >
                    {loadingStats ? 'Refreshing...' : '🔄 Refresh Metrics'}
                </button>
            </div>

            {/* Notification Banner */}
            {statusMessage && (
                <div style={{
                    padding: '10px 14px',
                    fontSize: 13,
                    fontWeight: 'bold',
                    backgroundColor: statusMessage.type === 'success' ? '#e6f4ea' : statusMessage.type === 'error' ? '#fce8e6' : '#e8f0fe',
                    color: statusMessage.type === 'success' ? '#137333' : statusMessage.type === 'error' ? '#c5221f' : '#1a73e8',
                    border: `1px solid ${statusMessage.type === 'success' ? '#34a853' : statusMessage.type === 'error' ? '#ea4335' : '#4285f4'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <span>{statusMessage.text}</span>
                    <button
                        className="admin-btn"
                        onClick={() => setStatusMessage(null)}
                        style={{ fontSize: 10, padding: '1px 6px' }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Live Database Metrics Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: 10
            }}>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #ccc', padding: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase' }}>Enrolled Contestants</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold', color: '#000080', margin: '4px 0' }}>
                        {stats ? stats.participantsCount : '...'}
                    </div>
                    <div style={{ fontSize: 11, color: '#0d652d' }}>
                        {stats ? `${stats.activeParticipants} Active` : ''}
                    </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #ccc', padding: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase' }}>Submissions</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold', color: '#2b5b84', margin: '4px 0' }}>
                        {stats ? stats.submissionsCount : '...'}
                    </div>
                    <div style={{ fontSize: 11, color: '#555' }}>Python solutions</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #ccc', padding: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase' }}>Proctor Logs</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold', color: '#c5221f', margin: '4px 0' }}>
                        {stats ? stats.proctoringEventsCount : '...'}
                    </div>
                    <div style={{ fontSize: 11, color: '#555' }}>Security strikes</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #ccc', padding: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase' }}>Active Sessions</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold', color: '#8250df', margin: '4px 0' }}>
                        {stats ? stats.sessionsCount : '...'}
                    </div>
                    <div style={{ fontSize: 11, color: '#555' }}>Bearer tokens</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #ccc', padding: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase' }}>Live Screens</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold', color: '#008080', margin: '4px 0' }}>
                        {stats ? stats.liveScreensCount : '...'}
                    </div>
                    <div style={{ fontSize: 11, color: '#555' }}>Editor feeds</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #ccc', padding: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase' }}>Announcements</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold', color: '#b06000', margin: '4px 0' }}>
                        {stats ? stats.announcementsCount : '...'}
                    </div>
                    <div style={{ fontSize: 11, color: '#555' }}>Broadcast wires</div>
                </div>
            </div>

            {/* Reset Action Control Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                {/* CARD 1: FACTORY RESET WITH OFFICIAL ROSTER (RECOMMENDED) */}
                <div style={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #000080',
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '2px 2px 5px rgba(0,0,0,0.08)'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontWeight: 'bold', fontSize: 14, color: '#000080' }}>
                                ⚠️ 1. Factory Reset &amp; Seed Official Roster
                            </span>
                            <span style={{
                                backgroundColor: '#e8f0fe',
                                color: '#1a73e8',
                                fontSize: 10,
                                fontWeight: 'bold',
                                padding: '2px 6px',
                                border: '1px solid #1a73e8'
                            }}>
                                RECOMMENDED
                            </span>
                        </div>
                        <p style={{ fontSize: 12, color: '#444', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                            Purges all submissions, strikes, sessions, announcements, and screens.
                            Automatically seeds the official pre-registered contestant roster from the official Techastra Portal (<b>10 Verified Contestants</b>: SYM2026-0037, SYM2026-0040, SYM2026-0091, SYM2026-0100, SYM2026-0110, SYM2026-0114, SYM2026-0116, SYM2026-0117, SYM2026-0119, SYM2026-0120) with 0 strikes and 0 points in Round 1.
                        </p>
                    </div>
                    <button
                        className="admin-btn admin-btn-danger"
                        disabled={isExecuting}
                        onClick={() => openConfirmModal(
                            'Execute Factory Reset with Official Roster',
                            'This will purge all active submissions, security strikes, session tokens, and workstation feeds. It will re-seed all 10 official pre-registered contestants from the Techastra portal in clean Round 1 state.',
                            'full',
                            'high',
                            true
                        )}
                        style={{ padding: '8px 14px', fontWeight: 'bold', fontSize: 12 }}
                    >
                        ⚠️ Execute Factory Reset &amp; Seed Roster
                    </button>
                </div>

                {/* CARD 2: CONTEST PROGRESS & SESSION RESET (SOFT RESET) */}
                <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #7a92ad',
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: 14, color: '#000080', marginBottom: 8 }}>
                            🔄 2. Reset Scores &amp; Telemetry (Soft Reset)
                        </div>
                        <p style={{ fontSize: 12, color: '#444', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                            Retains all enrolled participants in the database.
                            Wipes all test submissions, pardons all security strikes, resets scores to 0, resets workstation timers to Round 1 (45 mins), and reactivates any flagged or disqualified contestants.
                        </p>
                    </div>
                    <button
                        className="admin-btn admin-btn-primary"
                        disabled={isExecuting}
                        onClick={() => openConfirmModal(
                            'Reset Scores & Telemetry (Soft Reset)',
                            'This will clear all participant submissions, pardon all strikes, reset scores to 0, and restore all contestants to ACTIVE status. No registered participant dossiers will be deleted.',
                            'sessions_only',
                            'medium',
                            false
                        )}
                        style={{ padding: '8px 14px', fontWeight: 'bold', fontSize: 12 }}
                    >
                        🔄 Reset Scores &amp; Pardon All Strikes
                    </button>
                </div>

                {/* CARD 3: CLEAN SLATE WIPE (EMPTY DB MODE) */}
                <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #c5221f',
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: 14, color: '#c5221f', marginBottom: 8 }}>
                            🧹 3. Clean Slate Wipe (Empty DB Mode)
                        </div>
                        <p style={{ fontSize: 12, color: '#444', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                            Wipes every table in the SQLite database including the participants table (matching <code>reset-db.js</code>).
                            The database starts in an absolute 0-record state. Contestants will enter the database strictly when they log in or sign up.
                        </p>
                    </div>
                    <button
                        className="admin-btn admin-btn-danger"
                        disabled={isExecuting}
                        onClick={() => openConfirmModal(
                            'Execute Clean Slate Wipe (Empty DB Mode)',
                            'CRITICAL WARNING: This completely empties the participants table and all telemetry tables. Contestants will only appear in the database after authenticating or registering.',
                            'clean_slate',
                            'high',
                            false
                        )}
                        style={{ padding: '8px 14px', fontWeight: 'bold', fontSize: 12 }}
                    >
                        🧹 Clean Slate Wipe (Strict Empty DB)
                    </button>
                </div>

                {/* CARD 4: RESTORE / SEED OFFICIAL ROSTER */}
                <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #7a92ad',
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: 14, color: '#0d652d', marginBottom: 8 }}>
                            👥 4. Seed / Restore Official Contestant Roster
                        </div>
                        <p style={{ fontSize: 12, color: '#444', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                            Restores the official symposium contestant roster directly from the Techastra Portal (<b>10 Verified Contestants</b>) into the database without deleting existing submissions or resetting other tables.
                        </p>
                    </div>
                    <button
                        className="admin-btn"
                        disabled={isExecuting}
                        onClick={() => handleExecuteReset('seed_only', true)}
                        style={{ padding: '8px 14px', fontWeight: 'bold', fontSize: 12, color: '#0d652d' }}
                    >
                        👥 Restore Official Roster Only
                    </button>
                </div>
            </div>

            {/* Official Seed Roster Reference Preview */}
            <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #ccc',
                padding: 12
            }}>
                <div style={{ fontSize: 13, fontWeight: 'bold', color: '#000080', marginBottom: 8 }}>
                    📋 Official Verified Contestant Tokens Available for Login &amp; Arena Entry:
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: 8,
                    fontSize: 11
                }}>
                    <div style={{ padding: 6, backgroundColor: '#f0fff0', border: '1px solid #a0c0a0' }}>
                        <b style={{ color: '#000080' }}>SYM2026-0037</b> &bull; <b>Muniyappan V</b>
                        <div style={{ color: '#555' }}>Simats university</div>
                        <div style={{ color: '#0d652d', fontSize: 10 }}>Venue: IBM Lab &bull; Day 1</div>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#f0fff0', border: '1px solid #a0c0a0' }}>
                        <b style={{ color: '#000080' }}>SYM2026-0040</b> &bull; <b>Divagar R N</b>
                        <div style={{ color: '#555' }}>VelTech MultiTech Dr Rangarajan Dr Sakuntala</div>
                        <div style={{ color: '#0d652d', fontSize: 10 }}>Venue: IBM Lab &bull; Day 1</div>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
                        <b style={{ color: '#000080' }}>SYM2026-0091</b> &bull; Madhu mitha B
                        <div style={{ color: '#555' }}>Vel tech multi tech Dr Rangarajan Dr Sakhunthala</div>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
                        <b style={{ color: '#000080' }}>SYM2026-0100</b> &bull; Gurunathan M
                        <div style={{ color: '#555' }}>New prince shri bavani college engineering</div>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
                        <b style={{ color: '#000080' }}>SYM2026-0110</b> &bull; Gunal K
                        <div style={{ color: '#555' }}>New prince shri bavani college engineering</div>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
                        <b style={{ color: '#000080' }}>SYM2026-0114</b> &bull; Goutham.v
                        <div style={{ color: '#555' }}>New Prince Shri Bhavani College Engineering</div>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
                        <b style={{ color: '#000080' }}>SYM2026-0116</b> &bull; Abdul Kalam asath M
                        <div style={{ color: '#555' }}>New prince shri bhavani college of engineering</div>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
                        <b style={{ color: '#000080' }}>SYM2026-0117</b> &bull; Dinesh kumar
                        <div style={{ color: '#555' }}>New prince shri bhavani college of engineering</div>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
                        <b style={{ color: '#000080' }}>SYM2026-0119</b> &bull; J balaji
                        <div style={{ color: '#555' }}>New prince shri bhavani engineering</div>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
                        <b style={{ color: '#000080' }}>SYM2026-0120</b> &bull; Arunachalam K L
                        <div style={{ color: '#555' }}>New prince shri Bhavani college of engineering</div>
                    </div>
                </div>
            </div>

            {/* Interactive Confirmation Modal */}
            {confirmModal.isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99999,
                    padding: 16
                }}>
                    <div style={{
                        backgroundColor: '#c0c0c0',
                        border: '2px solid #ffffff',
                        borderRightColor: '#000000',
                        borderBottomColor: '#000000',
                        boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.5)',
                        maxWidth: 480,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Title Bar */}
                        <div style={{
                            backgroundColor: confirmModal.dangerLevel === 'high' ? '#800000' : '#000080',
                            color: '#ffffff',
                            padding: '4px 8px',
                            fontWeight: 'bold',
                            fontSize: 13,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <span>⚠️ SECURITY CONFIRMATION: {confirmModal.title}</span>
                            <button
                                className="admin-btn"
                                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                style={{ padding: '0 4px', height: 18, fontSize: 11, lineHeight: '14px' }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: 16, backgroundColor: '#f4f4f4', fontSize: 13, lineHeight: 1.5 }}>
                            <div style={{
                                backgroundColor: '#fff0f0',
                                border: '1px solid #ea4335',
                                padding: 10,
                                marginBottom: 12,
                                color: '#c5221f',
                                fontWeight: 'bold'
                            }}>
                                ⚠️ ATTENTION COORDINATOR {user.username}:
                            </div>
                            <p style={{ margin: '0 0 12px 0', color: '#222' }}>
                                {confirmModal.description}
                            </p>
                            <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                                This operation will execute instantly against SQLite database and broadcast real-time state changes to all connected contestant workstations.
                            </p>
                        </div>

                        {/* Modal Action Buttons */}
                        <div style={{
                            padding: 12,
                            backgroundColor: '#c0c0c0',
                            borderTop: '1px solid #808080',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 10
                        }}>
                            <button
                                className="admin-btn"
                                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                disabled={isExecuting}
                                style={{ padding: '6px 16px', fontSize: 12 }}
                            >
                                Cancel
                            </button>
                            <button
                                className="admin-btn admin-btn-danger"
                                onClick={() => handleExecuteReset(confirmModal.mode, confirmModal.seedRoster)}
                                disabled={isExecuting}
                                style={{
                                    padding: '6px 20px',
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    backgroundColor: confirmModal.dangerLevel === 'high' ? '#a40e26' : '#c5221f'
                                }}
                            >
                                {isExecuting ? 'Processing...' : 'CONFIRM & EXECUTE RESET'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
