// ============================================================================
// LIVE PARTICIPANT MONITOR — TECHASTRA 2026 ADMIN DASHBOARD
// Dense table layout for coordinators with search, filter, and clickable rows.
// Table is contained in .admin-table-container to isolate horizontal scrolling.
// ============================================================================

import React, { useState, useMemo } from 'react';
import { Participant, ParticipantStatus } from '../types';

interface LiveParticipantMonitorProps {
    participants: Participant[];
    onSelectParticipant: (participant: Participant) => void;
}

export const LiveParticipantMonitor: React.FC<LiveParticipantMonitorProps> = ({
    participants,
    onSelectParticipant,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | ParticipantStatus>('ALL');

    const filtered = useMemo(() => {
        return participants.filter(p => {
            const q = searchQuery.toLowerCase().trim();
            const matchesQuery =
                !q ||
                p.id.toLowerCase().includes(q) ||
                p.name.toLowerCase().includes(q) ||
                p.college.toLowerCase().includes(q) ||
                p.department.toLowerCase().includes(q);

            const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

            return matchesQuery && matchesStatus;
        });
    }, [participants, searchQuery, statusFilter]);

    const getRoundMax = (roundId: string) => {
        if (roundId === 'R1') return 10;
        if (roundId === 'R2') return 20;
        return 5;
    };

    return (
        <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Filter Bar */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                    <input
                        type="text"
                        className="admin-input"
                        placeholder="Search ID, Name, College, Dept..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 'bold' }}>Status:</span>
                    <select
                        className="admin-input"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        style={{ padding: '4px 8px' }}
                    >
                        <option value="ALL">ALL ({participants.length})</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="QUALIFIED">QUALIFIED</option>
                        <option value="ELIMINATED">ELIMINATED</option>
                        <option value="FLAGGED">FLAGGED</option>
                    </select>
                </div>
            </div>

            {/* Table Container */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Participant ID</th>
                            <th>Name</th>
                            <th>College</th>
                            <th>Dept</th>
                            <th>Year</th>
                            <th>Round</th>
                            <th>Question</th>
                            <th>Round Score</th>
                            <th>Total Score</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={11} style={{ textAlign: 'center', padding: '16px', color: '#666' }}>
                                    No participants matched the current filter.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((p) => {
                                const rMax = getRoundMax(p.currentRound);
                                return (
                                    <tr key={p.id} onClick={() => onSelectParticipant(p)} title="Click to view participant dossier">
                                        <td style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{p.id}</td>
                                        <td><b>{p.name}</b></td>
                                        <td>{p.college}</td>
                                        <td>{p.department}</td>
                                        <td style={{ textAlign: 'center' }}>{p.year}</td>
                                        <td style={{ fontWeight: 'bold' }}>{p.currentRound}</td>
                                        <td>{p.currentQuestion}</td>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{p.score}/{rMax}</td>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#000080' }}>{p.totalScore}/35</td>
                                        <td style={{ fontFamily: 'monospace' }}>{p.time}</td>
                                        <td>
                                            <span className={`status-badge status-badge-${p.status}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <div style={{ fontSize: 11, color: '#555', fontStyle: 'italic', marginBottom: 12 }}>
                * Click on any participant row to open the detailed dossier drawer.
            </div>
        </div>
    );
};
