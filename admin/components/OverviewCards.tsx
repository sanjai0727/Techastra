// ============================================================================
// OVERVIEW CARDS COMPONENT — TECHASTRA 2026 ADMIN DASHBOARD
// ============================================================================

import React from 'react';
import { Participant } from '../types';

interface OverviewCardsProps {
    participants: Participant[];
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ participants }) => {
    const total = participants.length;
    const active = participants.filter(p => p.status === 'ACTIVE').length;
    const completed = participants.filter(p => p.status === 'COMPLETED').length;
    const qualified = participants.filter(p => p.status === 'QUALIFIED').length;
    const eliminated = participants.filter(p => p.status === 'ELIMINATED').length;
    const flagged = participants.filter(p => p.status === 'FLAGGED' || p.status === 'DISQUALIFIED' || p.strikes >= 2).length;

    return (
        <div className="admin-stats-grid">
            <div className="admin-stat-card">
                <span className="admin-stat-label">TOTAL</span>
                <span className="admin-stat-val" style={{ color: '#000080' }}>{total}</span>
            </div>
            <div className="admin-stat-card">
                <span className="admin-stat-label">ACTIVE</span>
                <span className="admin-stat-val" style={{ color: '#0d652d' }}>{active}</span>
            </div>
            <div className="admin-stat-card">
                <span className="admin-stat-label">COMPLETED</span>
                <span className="admin-stat-val" style={{ color: '#1a73e8' }}>{completed}</span>
            </div>
            <div className="admin-stat-card">
                <span className="admin-stat-label">QUALIFIED</span>
                <span className="admin-stat-val" style={{ color: '#137333' }}>{qualified}</span>
            </div>
            <div className="admin-stat-card">
                <span className="admin-stat-label">ELIMINATED</span>
                <span className="admin-stat-val" style={{ color: '#666666' }}>{eliminated}</span>
            </div>
            <div className="admin-stat-card">
                <span className="admin-stat-label">FLAGGED / BLOCKED</span>
                <span className="admin-stat-val" style={{ color: '#c5221f' }}>{flagged}</span>
            </div>
        </div>
    );
};
