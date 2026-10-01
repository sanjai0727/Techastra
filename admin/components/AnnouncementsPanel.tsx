// ============================================================================
// ANNOUNCEMENTS PANEL — TECHASTRA 2026 ADMIN DASHBOARD
// Enables coordinator broadcast to participant workstation screens.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Announcement } from '../types';
import { AnnouncementService } from '../services/announcementService';

export const AnnouncementsPanel: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>(AnnouncementService.getAnnouncements());
    const [message, setMessage] = useState('');
    const [targetRound, setTargetRound] = useState('ALL');
    const [broadcastSuccess, setBroadcastSuccess] = useState(false);

    useEffect(() => {
        const unsubscribe = AnnouncementService.subscribe((updated) => setAnnouncements(updated));
        return unsubscribe;
    }, []);

    const handleBroadcast = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        AnnouncementService.broadcast(message, 'Chief Coordinator', targetRound);
        setMessage('');
        setBroadcastSuccess(true);
        setTimeout(() => setBroadcastSuccess(false), 4000);
    };

    const handleQuickTemplate = (templateText: string) => {
        setMessage(templateText);
    };

    return (
        <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Broadcast Form Box */}
            <div className="admin-box">
                <div className="admin-box-title">
                    LIVE ANNOUNCEMENT BROADCASTER (WIRE DISPATCH)
                </div>

                {broadcastSuccess && (
                    <div style={{ backgroundColor: '#e6f4ea', border: '1px solid #137333', color: '#137333', padding: '6px 12px', fontSize: 12, marginBottom: 12, fontWeight: 'bold' }}>
                        ✓ Announcement broadcast successfully dispatched to active participant workstations.
                    </div>
                )}

                <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 10, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <label style={{ fontSize: 12, fontWeight: 'bold' }}>Target Audience:</label>
                        <select
                            className="admin-input"
                            value={targetRound}
                            onChange={(e) => setTargetRound(e.target.value)}
                            style={{ padding: '4px 6px' }}
                        >
                            <option value="ALL">All Active Participants (All Rounds)</option>
                            <option value="R1">Round 1 Participants Only</option>
                            <option value="R2">Round 2 Participants Only</option>
                            <option value="R3">Round 3 Finalists Only</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: 8 }}>
                        <textarea
                            className="admin-input"
                            rows={3}
                            placeholder="Enter announcement message to broadcast..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            style={{ width: '100%', resize: 'vertical' }}
                            required
                        />
                    </div>

                    {/* Quick Templates */}
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: '#555' }}>Presets:</span>
                        <button
                            type="button"
                            className="admin-btn"
                            style={{ fontSize: 11, padding: '2px 6px' }}
                            onClick={() => handleQuickTemplate('5 minutes remaining for Round 1.')}
                        >
                            "5 mins remaining"
                        </button>
                        <button
                            type="button"
                            className="admin-btn"
                            style={{ fontSize: 11, padding: '2px 6px' }}
                            onClick={() => handleQuickTemplate('1 minute remaining! Ensure your solution is submitted.')}
                        >
                            "1 min remaining"
                        </button>
                        <button
                            type="button"
                            className="admin-btn"
                            style={{ fontSize: 11, padding: '2px 6px' }}
                            onClick={() => handleQuickTemplate('Maintain fullscreen mode. Leaving the screen incurs a warning strike.')}
                        >
                            "Fullscreen reminder"
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <button type="submit" className="admin-btn admin-btn-primary" style={{ minWidth: 120 }}>
                            📢 BROADCAST
                        </button>
                    </div>
                </form>
            </div>

            {/* Broadcast History */}
            <h4 style={{ margin: '12px 0 8px 0', color: '#000080' }}>BROADCAST DISPATCH LOG</h4>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Author</th>
                            <th>Target</th>
                            <th>Announcement Content</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {announcements.map((a) => (
                            <tr key={a.id}>
                                <td style={{ fontFamily: 'monospace' }}>{a.timestamp}</td>
                                <td><b>{a.author}</b></td>
                                <td><span className="status-badge status-badge-ACTIVE">{a.roundTarget}</span></td>
                                <td>{a.message}</td>
                                <td><span className="status-badge status-badge-QUALIFIED">SENT</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
