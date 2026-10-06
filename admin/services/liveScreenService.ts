// ============================================================================
// LIVE SCREEN SURVEILLANCE SERVICE — TECHASTRA 2026 ADMIN PORTAL
// Real-time Keystroke, Code Buffer & Synchronized Timer Telemetry
// ============================================================================

import { LiveScreenData } from '../types';

export class LiveScreenService {
    private static screens: Map<string, LiveScreenData> = new Map();
    private static listeners: Array<(screens: LiveScreenData[]) => void> = [];
    private static participantListeners: Map<string, Array<(screen: LiveScreenData) => void>> = new Map();
    private static tickerInterval: any = null;
    private static isInitialized = false;

    public static init(): void {
        if (this.isInitialized) return;
        this.isInitialized = true;

        // Fetch initial live screens snapshot from backend
        this.refreshScreens();

        // 1-Second Real-Time Clock Ticker (Smooth local countdown synced with SSE)
        if (typeof window !== 'undefined') {
            this.tickerInterval = setInterval(() => {
                let updated = false;
                this.screens.forEach((screen, id) => {
                    if (screen.timeRemaining > 0) {
                        screen.timeRemaining -= 1;
                        updated = true;
                        // Fire single participant listeners
                        const pListeners = this.participantListeners.get(id);
                        if (pListeners && pListeners.length > 0) {
                            pListeners.forEach(fn => fn({ ...screen }));
                        }
                    }
                });
                if (updated) {
                    this.notifyAll();
                }
            }, 1000);
        }
    }

    public static refreshScreens(): void {
        if (typeof fetch === 'undefined') return;
        fetch('/api/telemetry/live-screens')
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data.screens)) {
                    data.screens.forEach((row: any) => {
                        const item: LiveScreenData = {
                            participantId: row.participant_id || row.participantId,
                            participantName: row.participant_name || row.participantName,
                            roundId: row.round_id || row.roundId || 'R1',
                            questionId: row.question_id || row.questionId || 'Q1',
                            questionTitle: row.question_title || row.questionTitle || 'Work Order',
                            code: row.code || '',
                            timeRemaining: Number(row.time_remaining !== undefined ? row.time_remaining : row.timeRemaining || 0),
                            lastKeystrokeAt: Number(row.last_keystroke_at || row.lastKeystrokeAt || Date.now()),
                            college: row.college,
                            department: row.department,
                            status: row.status,
                            strikes: row.strikes,
                            score: row.score,
                            totalScore: row.total_score || row.totalScore,
                        };
                        this.screens.set(item.participantId, item);
                    });
                    this.notifyAll();
                }
            })
            .catch(() => {});
    }

    public static handleLiveScreenUpdate(data: Partial<LiveScreenData> & { participantId: string }): void {
        const id = data.participantId.toUpperCase();
        const existing = this.screens.get(id);

        const updated: LiveScreenData = {
            participantId: id,
            participantName: data.participantName || (existing ? existing.participantName : id),
            roundId: data.roundId || (existing ? existing.roundId : 'R1'),
            questionId: data.questionId || (existing ? existing.questionId : 'Q1'),
            questionTitle: data.questionTitle || (existing ? existing.questionTitle : 'Work Order'),
            code: data.code !== undefined ? data.code : (existing ? existing.code : ''),
            timeRemaining: data.timeRemaining !== undefined ? Number(data.timeRemaining) : (existing ? existing.timeRemaining : 2400),
            lastKeystrokeAt: data.lastKeystrokeAt || Date.now(),
            college: data.college || (existing ? existing.college : undefined),
            department: data.department || (existing ? existing.department : undefined),
            status: data.status || (existing ? existing.status : 'ACTIVE'),
            strikes: data.strikes !== undefined ? data.strikes : (existing ? existing.strikes : 0),
            score: data.score !== undefined ? data.score : (existing ? existing.score : 0),
            totalScore: data.totalScore !== undefined ? data.totalScore : (existing ? existing.totalScore : 0),
        };

        this.screens.set(id, updated);

        // Notify specific participant listener
        const pListeners = this.participantListeners.get(id);
        if (pListeners && pListeners.length > 0) {
            pListeners.forEach(fn => fn(updated));
        }

        this.notifyAll();
    }

    public static getScreens(): LiveScreenData[] {
        this.init();
        return Array.from(this.screens.values()).sort((a, b) => b.lastKeystrokeAt - a.lastKeystrokeAt);
    }

    public static getScreen(id: string): LiveScreenData | undefined {
        this.init();
        return this.screens.get(id.toUpperCase());
    }

    public static subscribe(callback: (screens: LiveScreenData[]) => void): () => void {
        this.init();
        this.listeners.push(callback);
        callback(this.getScreens());
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    public static subscribeToParticipant(id: string, callback: (screen: LiveScreenData) => void): () => void {
        this.init();
        const upperId = id.toUpperCase();
        if (!this.participantListeners.has(upperId)) {
            this.participantListeners.set(upperId, []);
        }
        this.participantListeners.get(upperId)!.push(callback);

        const current = this.screens.get(upperId);
        if (current) {
            callback(current);
        }

        return () => {
            const list = this.participantListeners.get(upperId);
            if (list) {
                this.participantListeners.set(upperId, list.filter(l => l !== callback));
            }
        };
    }

    private static notifyAll(): void {
        const screensArray = Array.from(this.screens.values()).sort((a, b) => b.lastKeystrokeAt - a.lastKeystrokeAt);
        this.listeners.forEach(fn => fn(screensArray));
    }
}
