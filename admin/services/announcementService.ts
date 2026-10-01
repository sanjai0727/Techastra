// ============================================================================
// ANNOUNCEMENT SERVICE — TECHASTRA 2026 ADMIN PORTAL
// Allows coordinator to compose and broadcast announcements to participant screens.
// Operates on admin state now, architected for future WebSocket / backend dispatch.
// ============================================================================

import { Announcement } from '../types';

export class AnnouncementService {
    private static announcements: Announcement[] = [
        {
            id: 'ANN-001',
            message: 'Welcome all teams to TECHASTRA 2026 — Code Rescue! Round 1 is now LIVE.',
            timestamp: '11:30:00',
            author: 'Chief Coordinator',
            roundTarget: 'ALL',
            broadcasted: true,
        },
        {
            id: 'ANN-002',
            message: 'Reminder: Fullscreen mode is mandatory. Leaving workstation triggers warning strike.',
            timestamp: '11:45:00',
            author: 'Invigilation Lead',
            roundTarget: 'R1',
            broadcasted: true,
        },
    ];

    private static listeners: Array<(announcements: Announcement[]) => void> = [];

    public static getAnnouncements(): Announcement[] {
        return [...this.announcements];
    }

    public static broadcast(message: string, author: string = 'Coordinator Desk', roundTarget: string = 'ALL'): Announcement {
        const announcement: Announcement = {
            id: `ANN-${Date.now().toString().slice(-4)}`,
            message: message.trim(),
            timestamp: new Date().toTimeString().split(' ')[0],
            author,
            roundTarget,
            broadcasted: true,
        };

        this.announcements = [announcement, ...this.announcements];

        // Future backend broadcast integration hook
        try {
            // Broadcast custom event so active workstation iframes or listeners can receive
            window.dispatchEvent(new CustomEvent('techastra-broadcast', { detail: announcement }));
        } catch (e) {}

        this.notify();
        return announcement;
    }

    public static subscribe(listener: (announcements: Announcement[]) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private static notify(): void {
        const copy = [...this.announcements];
        this.listeners.forEach(l => l(copy));
    }
}
