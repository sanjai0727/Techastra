// ============================================================================
// ADMIN PORTAL PAGE — TECHASTRA 2026
// Coordinates authentication gating, session lifetime, login, and dashboard view.
// Fits completely inside the existing Event Dossier main content area.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { AdminAuthService } from '../services/adminAuthService';
import { AdminUser } from '../types';
import { AdminLogin } from '../components/AdminLogin';
import { AdminDashboard } from '../components/AdminDashboard';
import { ErrorBoundary } from '../components/ErrorBoundary';
import '../styles.css';

export interface AdminPortalProps {
    forcedView?: 'login' | 'dashboard';
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ forcedView }) => {
    const [user, setUser] = useState<AdminUser | null>(AdminAuthService.getCurrentUser());

    useEffect(() => {
        const current = AdminAuthService.getCurrentUser();
        setUser(current);
    }, []);

    const handleLoginSuccess = (authenticatedUser: AdminUser) => {
        setUser(authenticatedUser);
    };

    const handleLogout = () => {
        AdminAuthService.logout();
        setUser(null);
    };

    return (
        <ErrorBoundary fallbackTitle="ADMIN CONSOLE CORE">
            {!user || forcedView === 'login' ? (
                <AdminLogin onSuccess={handleLoginSuccess} />
            ) : (
                <AdminDashboard user={user} onLogout={handleLogout} />
            )}
        </ErrorBoundary>
    );
};

export default AdminPortal;
