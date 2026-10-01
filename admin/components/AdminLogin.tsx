// ============================================================================
// ADMIN LOGIN VIEW — TECHASTRA 2026 CODE RESCUE
// Clean, centered panel inside Event Dossier content area.
// No duplicate fake windows, no absolute positioning, no overflow.
// ============================================================================

import React, { useState } from 'react';
import { AdminAuthService } from '../services/adminAuthService';
import { AdminUser } from '../types';

interface AdminLoginProps {
    onSuccess: (user: AdminUser) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
    const [adminId, setAdminId] = useState('');
    const [passkey, setPasskey] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);

        const result = await AdminAuthService.login(adminId, passkey);
        setLoading(false);

        if (result.success && result.user) {
            onSuccess(result.user);
        } else {
            setErrorMessage(result.error || 'Invalid Administrator ID or Passkey');
        }
    };

    return (
        <div className="admin-page">
            <h1 style={{ marginLeft: -16 }}>Admin Access</h1>
            <h3>TECHASTRA 2026 • CODE RESCUE</h3>
            <br />

            <div className="admin-login-wrapper">
                <div className="admin-login-card">
                    {/* Header */}
                    <h2 className="admin-login-title-primary">TECHASTRA 2026</h2>
                    <h3 className="admin-login-title-secondary">ADMIN ACCESS</h3>
                    <div className="admin-login-subtitle">Authorized Coordinator Access</div>

                    {/* Error Notice */}
                    {errorMessage && (
                        <div className="admin-error-box">
                            ⚠️ {errorMessage}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <div className="admin-field-group">
                            <label htmlFor="admin-id" className="admin-field-label">Administrator ID</label>
                            <input
                                id="admin-id"
                                type="text"
                                className="admin-input"
                                placeholder="Enter Administrator ID"
                                value={adminId}
                                onChange={(e) => setAdminId(e.target.value)}
                                disabled={loading}
                                autoFocus
                                required
                            />
                        </div>

                        <div className="admin-field-group">
                            <label htmlFor="admin-passkey" className="admin-field-label">Passkey</label>
                            <div className="admin-password-wrap">
                                <input
                                    id="admin-passkey"
                                    type={showPassword ? 'text' : 'password'}
                                    className="admin-input"
                                    placeholder="Enter passkey"
                                    value={passkey}
                                    onChange={(e) => setPasskey(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    className="admin-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, marginBottom: 8 }}>
                            <button
                                type="submit"
                                className="admin-btn admin-btn-primary"
                                style={{ minWidth: 120, height: 32, fontSize: 13 }}
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'LOGIN'}
                            </button>
                        </div>

                        <div className="admin-login-auth-note">
                            Authorized coordinators only
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
