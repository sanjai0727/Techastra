// ============================================================================
// EXPORT SERVICE — TECHASTRA 2026 ADMIN PORTAL
// Handles CSV generation for participants and results, plus printable reports.
// ============================================================================

import { Participant } from '../types';

export class ExportService {
    public static exportParticipantsCSV(participants: Participant[]): void {
        const headers = ['Participant ID', 'Name', 'College', 'Department', 'Year', 'Status', 'Strikes', 'Current Round', 'Score'];
        const rows = participants.map(p => [
            p.id,
            `"${p.name.replace(/"/g, '""')}"`,
            `"${p.college.replace(/"/g, '""')}"`,
            p.department,
            p.year,
            p.status,
            p.strikes.toString(),
            p.currentRound,
            p.score.toString(),
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
            p.scores.round1.toString(),
            p.scores.round2.toString(),
            p.scores.round3.toString(),
            p.scores.total.toString(),
            p.status,
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        this.downloadFile(csvContent, 'techastra_2026_results.csv', 'text/csv;charset=utf-8;');
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
