// ============================================================================
// EXPORT SERVICE — TECHASTRA 2026 ADMIN PORTAL
// Handles CSV generation for participants, results, submissions, and JSON state dump.
// ============================================================================

import { Participant } from '../types';

export class ExportService {
    public static exportParticipantsCSV(participants: Participant[]): void {
        const headers = ['Participant ID', 'Name', 'College', 'Department', 'Year', 'Status', 'Strikes', 'Current Round', 'Round Score', 'Total Score'];
        const rows = participants.map(p => [
            p.id,
            `"${p.name.replace(/"/g, '""')}"`,
            `"${p.college.replace(/"/g, '""')}"`,
            p.department,
            p.year,
            p.status,
            (p.proctoringStrikes || p.strikes || 0).toString(),
            p.currentRound,
            p.score.toString(),
            (p.totalScore || p.scores?.total || 0).toString(),
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        this.downloadFile(csvContent, 'techastra_2026_participants.csv', 'text/csv;charset=utf-8;');
    }

    public static exportResultsCSV(participants: Participant[]): void {
        const headers = ['Participant ID', 'Name', 'College', 'Round 1 Score', 'Round 2 Score', 'Round 3 Score', 'Total Score', 'Status'];
        const rows = participants.map(p => [
            p.id,
            `"${p.name.replace(/"/g, '""')}"`,
            `"${p.college.replace(/"/g, '""')}"`,
            (p.scores?.round1 ?? 0).toString(),
            (p.scores?.round2 ?? 0).toString(),
            (p.scores?.round3 ?? 0).toString(),
            (p.scores?.total ?? p.totalScore ?? 0).toString(),
            p.status,
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        this.downloadFile(csvContent, 'techastra_2026_results.csv', 'text/csv;charset=utf-8;');
    }

    public static exportSubmissionsCSV(submissions: any[]): void {
        const headers = ['Submission ID', 'Participant ID', 'Question', 'Language', 'Result', 'Score', 'Timestamp'];
        const rows = submissions.map(s => [
            s.id,
            s.participantId,
            `"${(s.question || '').replace(/"/g, '""')}"`,
            s.language || 'python',
            s.result || 'PASSED',
            (s.score || 0).toString(),
            s.submissionTime || '',
        ]);
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        this.downloadFile(csvContent, 'techastra_2026_submissions.csv', 'text/csv;charset=utf-8;');
    }

    public static exportFullDumpJSON(participants: Participant[], rounds?: any, submissions?: any): void {
        const dump = {
            exportedAt: new Date().toISOString(),
            tournament: 'Techastra 2026 Code Rescue Championship',
            totalParticipants: participants.length,
            participants,
            rounds,
            submissions,
        };
        this.downloadFile(JSON.stringify(dump, null, 2), 'techastra_2026_full_telemetry.json', 'application/json');
    }

    public static printReport(): void {
        window.print();
    }

    private static downloadFile(content: string, filename: string, mimeType: string): void {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}
