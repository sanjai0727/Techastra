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

    // If forced to login view or not authenticated, render Login
    if (!user || forcedView === 'login') {
        return <AdminLogin onSuccess={handleLoginSuccess} />;
    }

    // Authenticated: Render Command Center Dashboard
    return <AdminDashboard user={user} onLogout={handleLogout} />;
};

export default AdminPortal;
