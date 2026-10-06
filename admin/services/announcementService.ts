// ============================================================================
// ANNOUNCEMENT SERVICE — TECHASTRA 2026 ADMIN PORTAL
// Allows coordinator to broadcast real announcements to participant screens.
// Zero demo announcements — real-time persistent dispatch to SQLite DB.
// ============================================================================

import { Announcement } from '../types';
import { AdminAuthService } from './adminAuthService';

export class AnnouncementService {
    private static announcements: Announcement[] = [];
    private static listeners: Array<(announcements: Announcement[]) => void> = [];
    private static isInitialized = false;

    public static init(): void {
        if (this.isInitialized) return;
        this.isInitialized = true;
        this.fetchAnnouncements();
    }

    public static setAnnouncements(list: Announcement[]): void {
        if (!Array.isArray(list)) return;
        this.announcements = list;
        this.notify();
    }

    public static addAnnouncement(announcement: Announcement): void {
        if (!announcement || !announcement.id) return;
        const exists = this.announcements.some(a => a.id === announcement.id);
        if (!exists) {
            this.announcements = [announcement, ...this.announcements];
            this.notify();
        }
    }

    public static fetchAnnouncements(): void {
        if (typeof fetch === 'undefined') return;

        fetch('/api/announcements')
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data.announcements)) {
                    this.announcements = data.announcements;
                    this.notify();
                }
            })
            .catch(() => {});
    }

    public static getAnnouncements(): Announcement[] {
        this.init();
        return [...this.announcements];
    }

    public static broadcast(message: string, author: string = 'Coordinator Desk', roundTarget: string = 'ALL'): void {
        const trimmed = message.trim();
        if (!trimmed) return;

        // Persist to backend database and trigger real-time SSE broadcast
        fetch('/api/announcements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...AdminAuthService.getAuthHeader(),
            },
            body: JSON.stringify({ message: trimmed, priority: roundTarget === 'ALL' ? 'NORMAL' : 'HIGH', targetRound: roundTarget }),
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.announcement) {
                this.addAnnouncement(data.announcement);
            }
        })
        .catch(() => {});
    }

    public static subscribe(listener: (announcements: Announcement[]) => void): () => void {
        this.init();
        this.listeners.push(listener);
        listener([...this.announcements]);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private static notify(): void {
        const copy = [...this.announcements];
        this.listeners.forEach(l => l(copy));
    }
}
