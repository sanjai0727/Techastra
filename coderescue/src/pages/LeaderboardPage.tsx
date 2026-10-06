import React, { useState } from 'react';
import { useCompetition } from '../context/CompetitionContext';
import { mockLeaderboardData } from '../data/leaderboardData';
import { LeaderboardEntry } from '../types/competition';

export const LeaderboardPage: React.FC = () => {
  const { state, setView } = useCompetition();
  const [searchTerm, setSearchTerm] = useState('');

  // Combine mock leaderboard with current active participant
  const allEntries: LeaderboardEntry[] = [...mockLeaderboardData];

  if (state.participant) {
    const r1Score = Object.values(state.bestScores).slice(0, 10).reduce((a, b) => a + b, 0);
    const r2Score = Object.values(state.bestScores).slice(10, 15).reduce((a, b) => a + b, 0);
    const r3Score = Object.values(state.bestScores).slice(15, 16).reduce((a, b) => a + b, 0);
    const totalScore = r1Score + r2Score + r3Score;

    const isDisqualified = !!state.securityState?.isDisqualified;
    const existingIdx = allEntries.findIndex(e => e.participantId === state.participant?.participantId);
    const userEntry: LeaderboardEntry = {
      rank: 1,
      name: `${state.participant.fullName} (YOU)${isDisqualified ? ' [DISQUALIFIED]' : ''}`,
      college: state.participant.college,
      round1Score: r1Score,
      round2Score: r2Score,
      round3Score: r3Score,
      totalScore: isDisqualified ? 0 : totalScore,
      totalTimeUsedSeconds: 120,
      participantId: state.participant.participantId,
      status: isDisqualified ? 'DISQUALIFIED' : 'QUALIFIED',
      isCurrentParticipant: true,
      isDemoData: false
    };

    if (existingIdx >= 0) {
      allEntries[existingIdx] = userEntry;
    } else {
      allEntries.unshift(userEntry);
    }
  }

  // Sort by Total Score descending, then Total Time ascending
  const sorted = [...allEntries].sort((a, b) => {
    if (a.status === 'DISQUALIFIED' && b.status !== 'DISQUALIFIED') return 1;
    if (b.status === 'DISQUALIFIED' && a.status !== 'DISQUALIFIED') return -1;
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return a.totalTimeUsedSeconds - b.totalTimeUsedSeconds;
  }).map((item, idx) => ({ ...item, rank: idx + 1 }));

  const filtered = sorted.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.participantId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBack = () => {
    if (state.securityState?.isDisqualified) {
      setView('disqualified');
      return;
    }
    if (state.currentRound > 0 && state.participant) {
      setView(`round${state.currentRound}_workspace` as any);
    } else {
      setView('welcome');
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-2 select-none font-sans text-black text-xs">
      <div className="win95-dialog-frame">
        {/* Titlebar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
          <div className="flex items-center gap-1.5">
            <span>🏆</span>
            <span>Championship Arbitration Matrix — Live Standings</span>
          </div>
          <button
            onClick={handleBack}
            className="site-button"
            style={{ padding: '0 4px', height: 16, fontSize: 10, lineHeight: '12px' }}
          >
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-2 bg-[#c0c0c0] border-b border-[#808080] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="site-button"
              style={{ fontSize: 11, padding: '2px 10px' }}
            >
              &lt; Return
            </button>
            <span className="font-bold text-sm text-black">
              Official Championship Standings
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold font-mono">SEARCH:</span>
            <input
              type="text"
              placeholder="Search contestant or college..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="site-input"
              style={{ width: 220, padding: '2px 6px', fontSize: 11 }}
            />
          </div>
        </div>

        {/* Client Area / Table */}
        <div className="p-2.5 bg-[#c0c0c0]">
          <div className="win95-sunken p-1 bg-white overflow-x-auto">
            <table className="retro-table text-xs">
              <thead>
                <tr>
                  <th style={{ width: 45, textAlign: 'center' }}>Rank</th>
                  <th>Contestant</th>
                  <th>Institution</th>
                  <th style={{ textAlign: 'center', width: 75 }}>R1 (Bug)</th>
                  <th style={{ textAlign: 'center', width: 75 }}>R2 (Logic)</th>
                  <th style={{ textAlign: 'center', width: 75 }}>R3 (Rescue)</th>
                  <th style={{ textAlign: 'center', width: 85 }}>Total Score</th>
                  <th style={{ textAlign: 'center', width: 75 }}>Time</th>
                  <th style={{ textAlign: 'center', width: 85 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const isCurrent = state.participant?.participantId === item.participantId;
                  return (
                    <tr
                      key={item.participantId}
                      style={{
                        backgroundColor: isCurrent ? '#ffffd0' : undefined,
                        fontWeight: isCurrent ? 'bold' : 'normal',
                      }}
                    >
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                        {item.rank === 1 ? '🥇 1' : item.rank === 2 ? '🥈 2' : item.rank === 3 ? '🥉 3' : item.rank}
                      </td>
                      <td className="font-bold">
                        {item.name}
                        <span className="text-[10px] text-gray-500 font-mono block">
                          {item.participantId}
                        </span>
                      </td>
                      <td className="text-gray-800">{item.college}</td>
                      <td style={{ textAlign: 'center' }} className="font-mono">
                        {item.status === 'COMPLETED' || item.status === 'WINNER_EVALUATION' ? `${item.round1Score}/100` : '--/100'}
                      </td>
                      <td style={{ textAlign: 'center' }} className="font-mono">
                        {item.status === 'COMPLETED' || item.status === 'WINNER_EVALUATION' ? `${item.round2Score}/100` : '--/100'}
                      </td>
                      <td style={{ textAlign: 'center' }} className="font-mono">
                        {item.status === 'COMPLETED' || item.status === 'WINNER_EVALUATION' ? `${item.round3Score}/100` : '--/100'}
                      </td>
                      <td style={{ textAlign: 'center' }} className="font-mono font-bold text-blue-900">
                        {item.status === 'COMPLETED' || item.status === 'WINNER_EVALUATION' ? `${item.totalScore} Pts` : '-- Pts'}
                      </td>
                      <td style={{ textAlign: 'center' }} className="font-mono text-gray-700">
                        {Math.floor(item.totalTimeUsedSeconds / 60)}m {item.totalTimeUsedSeconds % 60}s
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className="win95-badge font-bold"
                          style={{
                            backgroundColor: item.status === 'DISQUALIFIED' ? '#a00000' : item.status === 'QUALIFIED' || item.status === 'WINNER_EVALUATION' ? '#006400' : '#800000',
                            color: '#ffffff',
                            padding: '1px 6px',
                            fontSize: 10,
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom matrix telemetry */}
          <div className="flex items-center justify-between pt-2 text-[11px] text-gray-700 font-mono">
            <div>Displaying {filtered.length} of {allEntries.length} recorded dossiers</div>
            <div>Department of Computer Science & Engineering • Techastra 2026</div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LeaderboardPage;
