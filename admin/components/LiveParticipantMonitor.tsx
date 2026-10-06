// ============================================================================
// LIVE PARTICIPANT MONITOR — TECHASTRA 2026 ADMIN DASHBOARD
// Dense table layout for coordinators with search, multi-filters, quick inline actions,
// and spot/walk-in contestant enrollment desk.
// ============================================================================

import React, { useState, useMemo } from 'react';
import { Participant, ParticipantStatus } from '../types';
import { ParticipantService } from '../services/participantService';

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
    const [roundFilter, setRoundFilter] = useState<'ALL' | 'R1' | 'R2' | 'R3'>('ALL');

    // Walk-in Registration Modal State
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [regId, setRegId] = useState('');
    const [regName, setRegName] = useState('');
    const [regCollege, setRegCollege] = useState('');
    const [regDept, setRegDept] = useState('Computer Science & Engineering');
    const [regYear, setRegYear] = useState('III');
    const [regLoading, setRegLoading] = useState(false);
    const [regError, setRegError] = useState('');

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
            const matchesRound = roundFilter === 'ALL' || p.currentRound === roundFilter;

            return matchesQuery && matchesStatus && matchesRound;
        });
    }, [participants, searchQuery, statusFilter, roundFilter]);

    const getRoundMax = (roundId: string) => {
        if (roundId === 'R1') return 10;
        if (roundId === 'R2') return 20;
        return 5;
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!regName.trim() || !regCollege.trim()) {
            setRegError('Please provide both Full Name and College/Institution.');
            return;
        }

        setRegLoading(true);
        setRegError('');

        const res = await ParticipantService.registerParticipant({
            participantId: regId.trim() || undefined,
            fullName: regName.trim(),
            college: regCollege.trim(),
            department: regDept.trim(),
            year: regYear.trim(),
        });

        setRegLoading(false);
        if (res.success) {
            alert(`✓ Contestant successfully registered!\nAssigned ID: ${res.participant?.id || regId || 'Generated'}`);
            setShowRegisterModal(false);
            setRegId('');
            setRegName('');
            setRegCollege('');
        } else {
            setRegError(res.error || 'Failed to register contestant.');
        }
    };

    const handleQuickAdd5m = async (p: Participant, e: React.MouseEvent) => {
        e.stopPropagation();
        const ok = await ParticipantService.adjustParticipantTimer(p.id, 300);
        if (ok) {
            alert(`✓ Added +5 minutes extra time to ${p.name} (${p.id})`);
        } else {
            alert('Failed to adjust workstation timer.');
        }
    };

    const handleQuickPardon = async (p: Participant, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Pardon strikes and reset session for ${p.name}?`)) {
            const ok = await ParticipantService.resetSession(p.id);
            if (ok) {
                alert(`✓ Strikes cleared and session restored for ${p.name}`);
            } else {
                alert('Failed to reset participant session.');
            }
        }
    };

    const handleQuickFlag = async (p: Participant, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Disqualify / flag ${p.name} (${p.id}) for integrity violation?`)) {
            ParticipantService.flagParticipant(p.id, 'Coordinator inline flag');
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Control & Filter Bar */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center', flex: 1, minWidth: 280 }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
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
                        <span style={{ fontSize: 12, fontWeight: 'bold' }}>Round:</span>
                        <select
                            className="admin-input"
                            value={roundFilter}
                            onChange={(e) => setRoundFilter(e.target.value as any)}
                            style={{ padding: '4px 8px' }}
                        >
                            <option value="ALL">ALL ROUNDS</option>
                            <option value="R1">ROUND 1 (Bug Hunter)</option>
                            <option value="R2">ROUND 2 (Logic Repair)</option>
                            <option value="R3">ROUND 3 (Crisis Rescue)</option>
                        </select>
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

                {/* Spot Registration Button */}
                <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => setShowRegisterModal(true)}
                    style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    ➕ Register Walk-in Contestant
                </button>
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
                            <th>Total</th>
                            <th>Time</th>
                            <th>Strikes</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'center' }}>Workstation Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={13} style={{ textAlign: 'center', padding: '24px', color: '#555' }}>
                                    {participants.length === 0
                                        ? 'No participants enrolled yet. Live contestant data will populate as participants register.'
                                        : 'No participants matched the current filter.'}
                                </td>
                            </tr>
                        ) : (
                            filtered.map((p) => {
                                const rMax = getRoundMax(p.currentRound);
                                const strikes = p.proctoringStrikes || 0;
                                return (
                                    <tr key={p.id} onClick={() => onSelectParticipant(p)} title="Click to view full dossier drawer">
                                        <td style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{p.id}</td>
                                        <td><b>{p.name}</b></td>
                                        <td>{p.college}</td>
                                        <td>{p.department}</td>
                                        <td style={{ textAlign: 'center' }}>{p.year}</td>
                                        <td style={{ fontWeight: 'bold' }}>{p.currentRound}</td>
                                        <td>{p.currentQuestion}</td>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{p.score}/{rMax}</td>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#000080' }}>{p.totalScore}/35</td>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                            <span style={{
                                                padding: '2px 6px',
                                                backgroundColor: (p.timeRemaining !== undefined && p.timeRemaining <= 120) ? '#fce8e6' : '#f0f0f0',
                                                color: (p.timeRemaining !== undefined && p.timeRemaining <= 120) ? '#c5221f' : '#000',
                                                border: '1px solid #ccc',
                                                borderRadius: 2,
                                                fontSize: 11,
                                            }}>
                                                ⏱ {p.time}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                padding: '2px 6px',
                                                fontWeight: 'bold',
                                                fontSize: 11,
                                                borderRadius: 2,
                                                backgroundColor: strikes >= 3 ? '#c5221f' : strikes > 0 ? '#fef7e0' : '#e6f4ea',
                                                color: strikes >= 3 ? '#fff' : strikes > 0 ? '#b06000' : '#137333',
                                                border: '1px solid',
                                                borderColor: strikes >= 3 ? '#a50e0e' : strikes > 0 ? '#b06000' : '#137333',
                                            }}>
                                                {strikes} / 3
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-badge-${p.status}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                                            <div style={{ display: 'inline-flex', gap: 4 }}>
                                                <button
                                                    className="admin-btn"
                                                    style={{ padding: '2px 6px', fontSize: 10, fontWeight: 'bold' }}
                                                    onClick={() => onSelectParticipant(p)}
                                                    title="Open detailed participant dossier"
                                                >
                                                    🔍 Dossier
                                                </button>
                                                <button
                                                    className="admin-btn"
                                                    style={{ padding: '2px 6px', fontSize: 10, backgroundColor: '#2e7d32', color: '#fff' }}
                                                    onClick={(e) => handleQuickAdd5m(p, e)}
                                                    title="Add +5 minutes extra time"
                                                >
                                                    ⏱ +5m
                                                </button>
                                                <button
                                                    className="admin-btn"
                                                    style={{ padding: '2px 6px', fontSize: 10, backgroundColor: '#0288d1', color: '#fff' }}
                                                    onClick={(e) => handleQuickPardon(p, e)}
                                                    title="Pardon strikes & reset session"
                                                >
                                                    🔄 Pardon
                                                </button>
                                                <button
                                                    className="admin-btn admin-btn-danger"
                                                    style={{ padding: '2px 6px', fontSize: 10 }}
                                                    onClick={(e) => handleQuickFlag(p, e)}
                                                    title="Flag / Disqualify contestant"
                                                >
                                                    🚩 Flag
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <div style={{ fontSize: 11, color: '#555', fontStyle: 'italic', marginBottom: 12 }}>
                * Click on any participant row to open the complete live dossier drawer with code inspection and proctoring audit log.
            </div>

            {/* Walk-in Contestant Enrollment Modal */}
            {showRegisterModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                }}>
                    <div className="admin-box" style={{ width: 480, maxWidth: '90%', backgroundColor: '#c0c0c0', boxShadow: '4px 4px 0 #000' }}>
                        <div className="admin-box-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>ON-SPOT / WALK-IN CONTESTANT ENROLLMENT</span>
                            <button
                                style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => setShowRegisterModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        {regError && (
                            <div style={{ backgroundColor: '#fce8e6', border: '1px solid #c5221f', color: '#c5221f', padding: 8, fontSize: 12, marginBottom: 10 }}>
                                ⚠️ {regError}
                            </div>
                        )}

                        <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 'bold', marginBottom: 3 }}>
                                    Full Name: *
                                </label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    value={regName}
                                    onChange={(e) => setRegName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    style={{ width: '100%' }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 'bold', marginBottom: 3 }}>
                                    College / Institution: *
                                </label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    value={regCollege}
                                    onChange={(e) => setRegCollege(e.target.value)}
                                    placeholder="e.g. Dr. M.G.R. Educational and Research Institute"
                                    style={{ width: '100%' }}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 'bold', marginBottom: 3 }}>
                                        Department:
                                    </label>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        value={regDept}
                                        onChange={(e) => setRegDept(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ width: 90 }}>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 'bold', marginBottom: 3 }}>
                                        Year:
                                    </label>
                                    <select
                                        className="admin-input"
                                        value={regYear}
                                        onChange={(e) => setRegYear(e.target.value)}
                                        style={{ width: '100%' }}
                                    >
                                        <option value="I">I</option>
                                        <option value="II">II</option>
                                        <option value="III">III</option>
                                        <option value="IV">IV</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 'bold', marginBottom: 3 }}>
                                    Custom Participant ID (Optional):
                                </label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    value={regId}
                                    onChange={(e) => setRegId(e.target.value.toUpperCase())}
                                    placeholder="Leave blank to auto-assign (SYM2026-XXXX)"
                                    style={{ width: '100%', fontFamily: 'monospace' }}
                                />
                                <span style={{ fontSize: 10, color: '#555' }}>
                                    Format: SYM2026-0001 or slot number 1-100
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                                <button
                                    type="button"
                                    className="admin-btn"
                                    onClick={() => setShowRegisterModal(false)}
                                    disabled={regLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="admin-btn admin-btn-primary"
                                    disabled={regLoading}
                                    style={{ fontWeight: 'bold' }}
                                >
                                    {regLoading ? 'Enrolling...' : '✓ Register & Authorize'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
