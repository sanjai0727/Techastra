// ============================================================================
// EXPORT SERVICE — TECHASTRA 2026 ADMIN PORTAL
// Handles CSV generation for participants, results, submissions, and JSON state dump.
// ============================================================================

import { Participant } from '../types';

export class ExportService {
    public static exportParticipantsCSV(participants: Participant[]): void {
        const list = Array.isArray(participants) ? participants : [];
        const headers = [
            'Participant ID',
            'Name',
            'College',
            'Department',
            'Year',
            'Status',
            'Strikes',
            'Current Round',
            'Current Question',
            'Round Score',
            'Round 1 Score',
            'Round 2 Score',
            'Round 3 Score',
            'Total Score',
            'Time Remaining',
            'Last Activity',
        ];

        const rows = list.map((p) => [
            p.id || '',
            `"${(p.name || p.id || 'Participant').replace(/"/g, '""')}"`,
            `"${(p.college || 'N/A').replace(/"/g, '""')}"`,
            `"${(p.department || 'N/A').replace(/"/g, '""')}"`,
            p.year || 'N/A',
            p.status || 'ACTIVE',
            (p.strikes ?? p.proctoringStrikes ?? 0).toString(),
            p.currentRound || 'R1',
            `"${(p.currentQuestion || 'Q1').replace(/"/g, '""')}"`,
            (p.score ?? 0).toString(),
            (p.scores?.round1 ?? 0).toString(),
            (p.scores?.round2 ?? 0).toString(),
            (p.scores?.round3 ?? 0).toString(),
            (p.scores?.total ?? p.totalScore ?? 0).toString(),
            (p.timeRemaining ?? 0).toString(),
            `"${(p.lastEvent || 'Active in Arena').replace(/"/g, '""')}"`,
        ]);

        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
        this.downloadFile(csvContent, `techastra_2026_participants_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
    }

    public static exportResultsCSV(participants: Participant[]): void {
        const list = Array.isArray(participants) ? participants : [];
        const headers = [
            'Rank',
            'Participant ID',
            'Name',
            'College',
            'Department',
            'Year',
            'Round 1 Score (Max 10)',
            'Round 2 Score (Max 20)',
            'Round 3 Score (Max 5)',
            'Total Score (Max 35)',
            'Time Used (Seconds)',
            'Status',
        ];

        const sorted = [...list].sort(
            (a, b) => (b.scores?.total ?? b.totalScore ?? 0) - (a.scores?.total ?? a.totalScore ?? 0)
        );

        const rows = sorted.map((p, idx) => {
            const total = p.scores?.total ?? p.totalScore ?? 0;
            const r1 = p.scores?.round1 ?? 0;
            const r2 = p.scores?.round2 ?? 0;
            const r3 = p.scores?.round3 ?? 0;
            const timeUsed = Math.max(0, 2700 - (p.timeRemaining ?? 0));

            return [
                (idx + 1).toString(),
                p.id || '',
                `"${(p.name || p.id || 'Participant').replace(/"/g, '""')}"`,
                `"${(p.college || 'N/A').replace(/"/g, '""')}"`,
                `"${(p.department || 'N/A').replace(/"/g, '""')}"`,
                p.year || 'N/A',
                r1.toString(),
                r2.toString(),
                r3.toString(),
                total.toString(),
                timeUsed.toString(),
                p.status || 'ACTIVE',
            ];
        });

        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
        this.downloadFile(csvContent, `techastra_2026_tournament_results_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
    }

    public static exportSubmissionsCSV(submissions: any[]): void {
        const list = Array.isArray(submissions) ? submissions : [];
        const headers = [
            'Submission ID',
            'Participant ID',
            'Participant Name',
            'Round',
            'Question',
            'Language',
            'Result',
            'Score Earned',
            'Max Score',
            'Execution Time',
            'Timestamp',
        ];

        const rows = list.map((s) => [
            s.id || '',
            s.participantId || '',
            `"${(s.participantName || s.participantId || '').replace(/"/g, '""')}"`,
            s.round || '',
            `"${(s.question || '').replace(/"/g, '""')}"`,
            s.language || 'python',
            s.result || 'PASSED',
            (s.score ?? 0).toString(),
            (s.maxScore ?? 10).toString(),
            s.executionTime || '0ms',
            `"${(s.submissionTime || '').replace(/"/g, '""')}"`,
        ]);

        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
        this.downloadFile(csvContent, `techastra_2026_submissions_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
    }

    public static exportProctoringEventsCSV(events: any[]): void {
        const list = Array.isArray(events) ? events : [];
        const headers = [
            'Incident ID',
            'Participant ID',
            'Participant Name',
            'Event Type',
            'Description',
            'Strike Count',
            'Proctor Status',
            'Timestamp',
        ];

        const rows = list.map((e) => [
            e.id || '',
            e.participantId || '',
            `"${(e.participantName || e.participantId || '').replace(/"/g, '""')}"`,
            e.eventType || 'WINDOW_BLUR',
            `"${(e.description || '').replace(/"/g, '""')}"`,
            (e.strikeCount ?? e.strikes ?? 0).toString(),
            e.status || 'WARNING',
            `"${(e.timestamp || '').replace(/"/g, '""')}"`,
        ]);

        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
        this.downloadFile(csvContent, `techastra_2026_security_audit_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
    }

    public static exportFullDumpJSON(participants: Participant[], rounds?: any, submissions?: any, events?: any): void {
        const dump = {
            exportedAt: new Date().toISOString(),
            symposium: 'Techastra 2026',
            event: 'Code Rescue Championship',
            institution: 'Dr. M.G.R. Educational and Research Institute University',
            departments: ['Computer Science and Engineering', 'Cyber Security'],
            totalParticipants: Array.isArray(participants) ? participants.length : 0,
            participants: participants || [],
            rounds: rounds || [],
            submissions: submissions || [],
            securityEvents: events || [],
        };
        this.downloadFile(JSON.stringify(dump, null, 2), `techastra_2026_full_telemetry_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
    }

    public static printReport(): void {
        try {
            window.print();
        } catch {}
    }

    private static downloadFile(content: string, filename: string, mimeType: string): void {
        try {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err: any) {
            alert(`Download error: ${err.message}`);
        }
    }
}
