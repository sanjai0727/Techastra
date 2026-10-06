import { LeaderboardEntry } from '../types/competition';

/**
 * Clean empty leaderboard dataset.
 * Production leaderboard data is loaded authoritatively from the backend server (/api/leaderboard).
 */
export const mockLeaderboardData: LeaderboardEntry[] = [];
