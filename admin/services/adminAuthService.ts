// ============================================================================
// ADMIN AUTHENTICATION SERVICE — TECHASTRA 2026
// Zero-trust client authentication communicating with hardened server API.
// Never stores passkeys client-side. Strict session token verification.
// ============================================================================

import { AdminUser } from '../types';

const STORAGE_KEY = 'techastra_admin_session';
let inactivityTimer: any = null;

export class AdminAuthService {
    private static currentUser: AdminUser | null = null;

    /**
     * Authenticate Administrator ID + Passkey against server.
     */
    public static async login(adminId: string, passkey: string): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
        const trimmedId = adminId.trim();
        const trimmedPasskey = passkey.trim();

        if (!trimmedId || !trimmedPasskey) {
            return { success: false, error: 'Administrator ID and Passkey are required.' };
        }

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId: trimmedId, passkey: trimmedPasskey }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.admin && data.token) {
                    const user: AdminUser = {
                        id: data.admin.id,
                        username: data.admin.id,
                        name: data.admin.name || 'Chief Coordinator',
                        role: data.admin.role || 'ADMINISTRATOR',
                        token: data.token,
                        authenticatedAt: new Date().toISOString(),
                    };
                    this.saveSession(user);
                    this.startInactivityWatch();
                    return { success: true, user };
                }
            } else if (response.status === 429) {
                const errData = await response.json().catch(() => ({}));
                return { success: false, error: errData.error || 'Too many failed login attempts. Temporarily locked for 5 minutes.' };
            } else if (response.status === 401) {
                const errData = await response.json().catch(() => ({}));
                return { success: false, error: errData.error || 'Access Denied: Invalid Administrator ID or Passkey.' };
            }
        } catch (netErr) {
            return { success: false, error: 'Authentication Server Offline. Contact Network Admin.' };
        }

        return { success: false, error: 'Access Denied: Invalid credentials.' };
    }

    public static isAuthenticated(): boolean {
        return !!this.getCurrentUser();
    }

    public static getAuthHeader(): Record<string, string> {
        const user = this.getCurrentUser();
        if (user && user.token) {
            return { 'Authorization': `Bearer ${user.token}` };
        }
        return {};
    }

    public static getCurrentUser(): AdminUser | null {
        if (this.currentUser) return this.currentUser;

        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as AdminUser;
                const authTime = new Date(parsed.authenticatedAt).getTime();
                const now = Date.now();
                // 2-hour hard session expiration
                if (now - authTime < 2 * 60 * 60 * 1000) {
                    this.currentUser = parsed;
                    this.startInactivityWatch();
                    return parsed;
                } else {
                    this.logout();
                }
            }
        } catch (e) {
            this.logout();
        }
        return null;
    }

    public static logout(): void {
        const token = this.currentUser?.token;
        this.currentUser = null;
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
            inactivityTimer = null;
        }
        try {
            sessionStorage.removeItem(STORAGE_KEY);
            if (token) {
                fetch('/api/admin/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ token }),
                }).catch(() => {});
            }
        } catch (e) {}
    }

    private static saveSession(user: AdminUser): void {
        this.currentUser = user;
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } catch (e) {}
    }

    private static startInactivityWatch(): void {
        const resetTimer = () => {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            // Auto logout after 30 minutes of no user activity
            inactivityTimer = setTimeout(() => {
                alert('Session expired due to 30 minutes of inactivity. Logging out for security.');
                AdminAuthService.logout();
                window.location.reload();
            }, 30 * 60 * 1000);
        };

        window.removeEventListener('mousemove', resetTimer);
        window.removeEventListener('keydown', resetTimer);
        window.removeEventListener('click', resetTimer);

        window.addEventListener('mousemove', resetTimer, { passive: true });
        window.addEventListener('keydown', resetTimer, { passive: true });
        window.addEventListener('click', resetTimer, { passive: true });
        resetTimer();
    }
}

