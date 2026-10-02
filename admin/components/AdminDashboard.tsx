// ============================================================================
// ADMIN COMMAND CENTER DASHBOARD — TECHASTRA 2026
// Coordinates overview, live participant telemetry, proctoring strikes,
// code submissions, round cutoffs, broadcasts, and reports.
// Fit completely inside the main Event Dossier content area.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Participant, Submission, AdminUser } from '../types';
import { ParticipantService } from '../services/participantService';
import { OverviewCards } from './OverviewCards';
import { LiveParticipantMonitor } from './LiveParticipantMonitor';
import { ParticipantDetailModal } from './ParticipantDetailModal';
import { ProctoringPanel } from './ProctoringPanel';
import { SubmissionsPanel } from './SubmissionsPanel';
import { RoundManagement } from './RoundManagement';
import { AnnouncementsPanel } from './AnnouncementsPanel';
import { ReportsPanel } from './ReportsPanel';

type DashboardTab = 'participants' | 'proctoring' | 'submissions' | 'rounds' | 'announcements' | 'reports';

interface AdminDashboardProps {
    user: AdminUser;
    onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState<DashboardTab>('participants');
    const [participants, setParticipants] = useState<Participant[]>(ParticipantService.getParticipants());
    const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
    const [inspectedSubmission, setInspectedSubmission] = useState<Submission | null>(null);

    useEffect(() => {
        const unsubscribe = ParticipantService.subscribe((updated) => {
            setParticipants(updated);
            if (selectedParticipant) {
                const refreshed = updated.find(p => p.id === selectedParticipant.id);
                if (refreshed) setSelectedParticipant(refreshed);
            }
        });
        return unsubscribe;
    }, [selectedParticipant]);

    const handleFlag = (id: string) => {
        ParticipantService.flagParticipant(id, 'Coordinator manual flag');
    };

    const handleReinstate = (id: string) => {
        ParticipantService.reinstateSession(id);
    };

    const handleViewSubmissionFromModal = (submission: Submission) => {
        setInspectedSubmission(submission);
        setSelectedParticipant(null);
        setActiveTab('submissions');
    };

    return (
        <div className="admin-page">
            {/* Header Control Bar */}
            <div className="admin-cc-header">
                <div>
                    <h2 className="admin-cc-title">TECHASTRA 2026 — ADMIN COMMAND CENTER</h2>
                    <div className="admin-cc-sub">Department of Computer Science &amp; Engineering</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 'bold', color: '#0d652d' }}>● SYSTEM ONLINE</span>
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
                    ⚙️ Round Management
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
                    onClick={() => setActiveTab('announcements')}
                >
                    📢 Announcements
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reports')}
                >
                    📈 Reports &amp; Exports
                </button>
            </div>

            {/* Active Tab View */}
            {activeTab === 'participants' && (
                <div>
                    <h4 style={{ margin: '0 0 10px 0', color: '#000080' }}>
                        LIVE PARTICIPANT MONITOR
                    </h4>
                    <LiveParticipantMonitor
                        participants={participants}
                        onSelectParticipant={(p) => setSelectedParticipant(p)}
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
                        TOURNAMENT ROUNDS &amp; QUALIFICATION CUTOFF CONFIGURATION
                    </h4>
                    <RoundManagement />
                </div>
            )}

            {activeTab === 'announcements' && (
                <div>
                    <h4 style={{ margin: '0 0 10px 0', color: '#000080' }}>
                        SYSTEM ANNOUNCEMENTS &amp; WIRE BROADCAST
                    </h4>
                    <AnnouncementsPanel />
                </div>
            )}

            {activeTab === 'reports' && (
                <div>
                    <h4 style={{ margin: '0 0 10px 0', color: '#000080' }}>
                        TOURNAMENT SCORECARD &amp; OFFICIAL REPORTS
                    </h4>
                    <ReportsPanel participants={participants} />
                </div>
            )}

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
