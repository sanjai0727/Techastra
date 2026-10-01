// ============================================================================
// ADMIN AUTHENTICATION SERVICE — TECHASTRA 2026
// Validates credentials against Express server /api/admin/login with fallback
// to secure prototype verification. Never exposes passkey in visible UI.
// ============================================================================

import { AdminUser } from '../types';

const STORAGE_KEY = 'techastra_admin_session';

export class AdminAuthService {
    private static currentUser: AdminUser | null = null;

    /**
     * Authenticate Administrator ID + Passkey.
     * Prefers server-side validation via POST /api/admin/login.
     */
    public static async login(adminId: string, passkey: string): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
        const trimmedId = adminId.trim();
        const trimmedPasskey = passkey.trim();

        if (!trimmedId || !trimmedPasskey) {
            return { success: false, error: 'Administrator ID and Passkey are required.' };
        }

        try {
            // Attempt server-side authentication
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId: trimmedId, passkey: trimmedPasskey }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.admin) {
                    const user: AdminUser = {
                        id: data.admin.id,
                        username: data.admin.id,
                        name: data.admin.name || 'Chief Coordinator',
                        role: data.admin.role || 'ADMINISTRATOR',
                        token: data.token || `token-${Date.now()}`,
                        authenticatedAt: new Date().toISOString(),
                    };
                    this.saveSession(user);
                    return { success: true, user };
                }
            } else if (response.status === 401) {
                return { success: false, error: 'Authentication failed: Invalid Administrator ID or Passkey.' };
            }
        } catch (netErr) {
            // Server offline or prototype fallback
            console.warn('[AdminAuthService] Server API unavailable, using prototype authentication layer.');
        }

        // Prototype credential verification (supports default admin / techastra2026 or environment variables)
        const validId = (typeof process !== 'undefined' && process.env?.ADMIN_ID) || 'admin';
        const validPass = (typeof process !== 'undefined' && process.env?.ADMIN_PASSKEY) || 'techastra2026';

        if (trimmedId.toLowerCase() === validId.toLowerCase() && trimmedPasskey === validPass) {
            const user: AdminUser = {
                id: trimmedId,
                username: trimmedId,
                name: 'Chief Coordinator (Prototype Mode)',
                role: 'ADMINISTRATOR',
                token: `proto-${btoa(trimmedId + ':' + Date.now())}`,
                authenticatedAt: new Date().toISOString(),
            };
            this.saveSession(user);
            return { success: true, user };
        }

        return { success: false, error: 'Access Denied: Invalid Administrator ID or Passkey.' };
    }

    public static isAuthenticated(): boolean {
        return !!this.getCurrentUser();
    }

    public static getCurrentUser(): AdminUser | null {
        if (this.currentUser) return this.currentUser;

        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as AdminUser;
                // Optional 4-hour session expiration
                const authTime = new Date(parsed.authenticatedAt).getTime();
                const now = Date.now();
                if (now - authTime < 4 * 60 * 60 * 1000) {
                    this.currentUser = parsed;
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
        this.currentUser = null;
        try {
            sessionStorage.removeItem(STORAGE_KEY);
            // Optionally notify backend
            fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
        } catch (e) {}
    }

    private static saveSession(user: AdminUser): void {
        this.currentUser = user;
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } catch (e) {}
    }
}
