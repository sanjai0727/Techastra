import React, { useState } from 'react';
import { useCompetition } from '../context/CompetitionContext';
import { mockLeaderboardData } from '../data/leaderboardData';
import { LeaderboardEntry } from '../types/competition';

export const AdminDashboardPage: React.FC = () => {
  const {
    state,
    setView,
    organizerJumpToRound,
    organizerSetTimer,
    organizerAutofillParticipant,
    updateQualificationConfig,
    resetCompetition
  } = useCompetition();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [disqualifiedIds, setDisqualifiedIds] = useState<string[]>([]);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  // Compute live contestant data
  const currentEntry: LeaderboardEntry | null = state.participant ? {
    rank: 0,
    participantId: state.participant.participantId,
    name: state.participant.fullName,
    college: state.participant.college,
    round1Score: state.roundResults.round1?.totalScore ?? Object.keys(state.bestScores).filter(k => k.startsWith('r1-')).reduce((s, k) => s + (state.bestScores[k] || 0), 0),
    round2Score: state.roundResults.round2?.totalScore ?? Object.keys(state.bestScores).filter(k => k.startsWith('r2-')).reduce((s, k) => s + (state.bestScores[k] || 0), 0),
    round3Score: state.roundResults.round3?.totalScore ?? (state.bestScores['r3-q1'] || 0),
    totalScore: (state.roundResults.round1?.totalScore ?? 0) + (state.roundResults.round2?.totalScore ?? 0) + (state.roundResults.round3?.totalScore ?? 0),
    totalTimeUsedSeconds: (state.roundResults.round1?.timeUsedSeconds || 0) + (state.roundResults.round2?.timeUsedSeconds || 0) + (state.roundResults.round3?.timeUsedSeconds || 0),
    status: 'IN_PROGRESS',
    isCurrentParticipant: true,
    isDemoData: false
  } : null;

  const allEntries: LeaderboardEntry[] = currentEntry
    ? [currentEntry, ...mockLeaderboardData]
    : [...mockLeaderboardData];

  // Active round timer
  const currentRemaining = state.currentRound === 1
    ? state.timers.round1Remaining
    : (state.currentRound === 2 ? state.timers.round2Remaining : state.timers.round3Remaining);

  const minutes = Math.floor(currentRemaining / 60);
  const seconds = currentRemaining % 60;
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Filter contestants
  const filteredContestants = allEntries.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.participantId.toLowerCase().includes(searchTerm.toLowerCase());
    const isDisqualified = disqualifiedIds.includes(item.participantId);
    if (filterStatus === 'DISQUALIFIED') return isDisqualified && matchesSearch;
    if (filterStatus !== 'ALL') return item.status === filterStatus && !isDisqualified && matchesSearch;
    return matchesSearch;
  });

  const toggleDisqualification = (id: string, name: string) => {
    if (disqualifiedIds.includes(id)) {
      setDisqualifiedIds(prev => prev.filter(x => x !== id));
      setAdminNotice(`Reinstated participant ${name} (${id}).`);
    } else {
      setDisqualifiedIds(prev => [...prev, id]);
      setAdminNotice(`DISQUALIFIED: ${name} (${id}) flagged for Anti-AI / Malpractice policy violation.`);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Rank', 'Participant ID', 'Full Name', 'College', 'Round 1', 'Round 2', 'Round 3', 'Total Score', 'Time Used (s)', 'Status'];
    const rows = allEntries.map((e, idx) => [
      idx + 1,
      e.participantId,
      `"${e.name}"`,
      `"${e.college}"`,
      e.round1Score,
      e.round2Score,
      e.round3Score,
      e.totalScore,
      e.totalTimeUsedSeconds,
      disqualifiedIds.includes(e.participantId) ? 'DISQUALIFIED (AI Violation)' : e.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `code_rescue_leaderboard_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setAdminNotice('Exported contest standings to CSV successfully.');
  };

  return (
    <div className="max-w-7xl mx-auto my-2 select-none font-sans text-black text-xs">
      {/* Top Admin Command Header */}
      <div className="p-2.5 bg-[#c0c0c0] border-b border-[#808080] mb-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="win95-badge cyber-pill-cyan font-bold font-mono text-[10px]">
                ADMINISTRATIVE DESK
              </span>
              <h1 className="text-lg sm:text-xl font-bold font-sans text-black">
                Techastra '26: Contest Administration Portal
              </h1>
            </div>
            <div className="text-[11px] text-gray-700 space-x-2">
              <span><b>Faculty Coordinators:</b> Dr. G. Senthil Velan, Ms. Anu</span>
              <span>•</span>
              <span><b>Student Leads:</b> Kavitha G, Sanjai P.A., Yashvinthan M</span>
            </div>
          </div>

          {/* Quick View Switches */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setView('welcome')}
              className="site-button"
              style={{ fontSize: 11, padding: '3px 10px' }}
            >
              &lt; Participant View
            </button>

            <button
              onClick={() => setView('leaderboard')}
              className="site-button"
              style={{ fontSize: 11, padding: '3px 10px' }}
            >
              Auditorium Projector
            </button>

            <button
              onClick={handleExportCSV}
              className="site-button"
              style={{ fontSize: 11, padding: '3px 10px' }}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Admin Notice Banner */}
      {adminNotice && (
        <div style={{ backgroundColor: '#ffffdf', boxShadow: 'var(--border-field)', padding: '6px 12px' }} className="flex items-center justify-between text-xs font-mono mb-3">
          <span>ℹ {adminNotice}</span>
          <button
            onClick={() => setAdminNotice(null)}
            className="font-bold underline cursor-pointer ml-4"
          >
            [Dismiss]
          </button>
        </div>
      )}

      {/* Key Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        {/* Tile 1: Active Stage */}
        <fieldset className="win95-fieldset" style={{ margin: 0 }}>
          <legend className="win95-legend">CONTEST STAGE</legend>
          <div className="win95-sunken bg-white p-2 text-center">
            <div className="font-bold text-sm font-sans text-black">
              {state.currentRound === 1 ? 'Round 1: Bug Hunt' : (state.currentRound === 2 ? 'Round 2: Logic Breaker' : 'Round 3: Code Rescue')}
            </div>
            <div className="text-[11px] text-gray-600 mt-0.5 font-mono">
              Stage {state.currentRound} of 3 Active
            </div>
          </div>
        </fieldset>

        {/* Tile 2: Master Timer */}
        <fieldset className="win95-fieldset" style={{ margin: 0 }}>
          <legend className="win95-legend">ROUND TIMER</legend>
          <div className="win95-sunken bg-white p-2 text-center">
            <div className="font-bold font-mono text-xl text-black">
              {formattedTimer}
            </div>
            <div className="text-[11px] text-gray-600 mt-0.5">
              Time Remaining for Current Round
            </div>
          </div>
        </fieldset>

        {/* Tile 3: Registered Contestants */}
        <fieldset className="win95-fieldset" style={{ margin: 0 }}>
          <legend className="win95-legend">TOTAL CANDIDATES</legend>
          <div className="win95-sunken bg-white p-2 text-center">
            <div className="font-bold font-mono text-xl text-black">
              {allEntries.length}
            </div>
            <div className="text-[11px] text-gray-600 mt-0.5">
              {state.participant ? '1 Live + 10 Benchmark' : '10 Benchmark Contenders'}
            </div>
          </div>
        </fieldset>

        {/* Tile 4: Qualification Cutoffs */}
        <fieldset className="win95-fieldset" style={{ margin: 0 }}>
          <legend className="win95-legend">QUALIFICATION CUTOFFS</legend>
          <div className="win95-sunken bg-white p-2 text-center">
            <div className="font-bold font-mono text-xs">
              R1: {state.qualificationConfig.round1MinScore} pts | R2: {state.qualificationConfig.round2MinScore} pts
            </div>
            <div className="text-[11px] text-gray-600 mt-0.5">
              50% Cutoff Required to Advance
            </div>
          </div>
        </fieldset>
      </div>

      {/* Main Grid: Control Panel & Contestant Table */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Left Column: Admin Controls */}
        <div className="md:col-span-5 space-y-2.5">
          {/* Round Navigation Controller */}
          <fieldset className="win95-fieldset">
            <legend className="win95-legend">Round Progression Controls</legend>

            <div className="space-y-1.5 p-1">
              <button
                onClick={() => {
                  if (!state.participant) organizerAutofillParticipant();
                  organizerJumpToRound(1);
                }}
                className={`site-button w-full text-left justify-between ${
                  state.currentRound === 1 && state.currentView === 'round1_workspace' ? 'active' : ''
                }`}
                style={{ padding: '4px 8px', fontSize: 12 }}
              >
                <span>🐞 Round 1: Bug Hunt</span>
                <span className="font-mono text-xs">(20m)</span>
              </button>

              <button
                onClick={() => {
                  if (!state.participant) organizerAutofillParticipant();
                  organizerJumpToRound(2);
                }}
                className={`site-button w-full text-left justify-between ${
                  state.currentRound === 2 && state.currentView === 'round2_workspace' ? 'active' : ''
                }`}
                style={{ padding: '4px 8px', fontSize: 12 }}
              >
                <span>🧠 Round 2: Logic Breaker</span>
                <span className="font-mono text-xs">(25m)</span>
              </button>

              <button
                onClick={() => {
                  if (!state.participant) organizerAutofillParticipant();
                  organizerJumpToRound(3);
                }}
                className={`site-button w-full text-left justify-between ${
                  state.currentRound === 3 && state.currentView === 'round3_workspace' ? 'active' : ''
                }`}
                style={{ padding: '4px 8px', fontSize: 12 }}
              >
                <span>🚨 Round 3: Code Rescue</span>
                <span className="font-mono text-xs">(40m)</span>
              </button>
            </div>

            <div className="pt-2 mt-2 border-t border-[#808080]">
              <button
                onClick={() => {
                  organizerAutofillParticipant();
                  setAdminNotice('Autofilled demo contestant profile.');
                }}
                className="site-button w-full"
                style={{ fontSize: 11, padding: '3px 8px' }}
              >
                + Autofill Candidate Profile
              </button>
            </div>
          </fieldset>

          {/* Master Timer Controls */}
          <fieldset className="win95-fieldset">
            <legend className="win95-legend">Clock Overrides</legend>

            <div className="space-y-1.5 p-1 text-xs">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    organizerSetTimer(state.currentRound, currentRemaining + 300);
                    setAdminNotice(`Added +5 Minutes to Round ${state.currentRound}.`);
                  }}
                  className="site-button"
                  style={{ fontSize: 11, padding: '3px 6px' }}
                >
                  +5 Mins Extension
                </button>

                <button
                  onClick={() => {
                    organizerSetTimer(state.currentRound, 10);
                    setAdminNotice(`Set Round ${state.currentRound} timer to 10 seconds for testing auto-expiry.`);
                  }}
                  className="site-button"
                  style={{ fontSize: 11, padding: '3px 6px' }}
                >
                  Set to 10s (Test)
                </button>
              </div>

              <button
                onClick={() => {
                  const defaultSecs = state.currentRound === 1 ? 20 * 60 : (state.currentRound === 2 ? 25 * 60 : 40 * 60);
                  organizerSetTimer(state.currentRound, defaultSecs);
                  setAdminNotice(`Reset Round ${state.currentRound} timer to default.`);
                }}
                className="site-button w-full"
                style={{ fontSize: 11, padding: '3px 6px' }}
              >
                Reset Round Timer to Default
              </button>
            </div>
          </fieldset>

          {/* Qualification Threshold Configuration */}
          <fieldset className="win95-fieldset">
            <legend className="win95-legend">Cutoff Threshold Rules</legend>

            <div className="grid grid-cols-2 gap-2 p-1 text-xs">
              <div>
                <label className="block mb-0.5 font-bold text-[11px]">Round 1 Cutoff (pts):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={state.qualificationConfig.round1MinScore}
                  onChange={(e) => updateQualificationConfig({ round1MinScore: parseInt(e.target.value) || 0 })}
                  className="site-input"
                />
              </div>

              <div>
                <label className="block mb-0.5 font-bold text-[11px]">Round 2 Cutoff (pts):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={state.qualificationConfig.round2MinScore}
                  onChange={(e) => updateQualificationConfig({ round2MinScore: parseInt(e.target.value) || 0 })}
                  className="site-input"
                />
              </div>
            </div>
          </fieldset>

          {/* Emergency Session Wipe */}
          <fieldset className="win95-fieldset">
            <legend className="win95-legend" style={{ color: '#a40e26' }}>Emergency Session Wipe</legend>
            <div className="p-1">
              <p className="text-[11px] text-gray-700 mb-1.5">
                Clears all local storage, participant submissions, and timers back to factory defaults.
              </p>
              <button
                onClick={() => {
                  if (window.confirm('WARNING: Are you sure you want to reset all contest data? This cannot be undone.')) {
                    resetCompetition();
                    setView('welcome');
                  }
                }}
                className="site-button w-full"
                style={{ color: '#a40e26', fontSize: 12, fontWeight: 'bold' }}
              >
                ⚠ Reset Entire Contest
              </button>
            </div>
          </fieldset>
        </div>

        {/* Right Column: Contestant Roster & Submissions Monitor */}
        <div className="md:col-span-7">
          <fieldset className="win95-fieldset">
            <legend className="win95-legend">Contestant Submissions & Audit</legend>

            {/* Filter Bar & Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 p-1">
              <div className="flex items-center gap-1">
                {['ALL', 'QUALIFIED', 'WINNER_EVALUATION', 'DISQUALIFIED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`site-button ${filterStatus === st ? 'active' : ''}`}
                    style={{ fontSize: 11, padding: '2px 8px' }}
                  >
                    {st === 'WINNER_EVALUATION' ? 'FINALIST' : st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <span className="text-[11px] font-mono font-bold">SEARCH:</span>
                <input
                  type="text"
                  placeholder="Filter name, college, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="site-input"
                  style={{ width: 170, padding: '2px 6px', fontSize: 11 }}
                />
              </div>
            </div>

            {/* Table */}
            <div className="win95-sunken bg-white p-1 overflow-x-auto">
              <table className="retro-table">
                <thead>
                  <tr>
                    <th>Contestant</th>
                    <th>College</th>
                    <th style={{ textAlign: 'center', width: 45 }}>R1</th>
                    <th style={{ textAlign: 'center', width: 45 }}>R2</th>
                    <th style={{ textAlign: 'center', width: 45 }}>R3</th>
                    <th style={{ textAlign: 'center', width: 60 }}>Total</th>
                    <th style={{ textAlign: 'center', width: 90 }}>Status</th>
                    <th style={{ textAlign: 'center', width: 85 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContestants.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        No contestants match your search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredContestants.map((entry) => {
                      const isDisq = disqualifiedIds.includes(entry.participantId);
                      return (
                        <tr
                          key={entry.participantId}
                          style={{
                            backgroundColor: isDisq ? '#ffebee' : (entry.isCurrentParticipant ? '#ffffdf' : undefined),
                          }}
                        >
                          <td>
                            <div className="font-bold flex items-center gap-1">
                              <span>{entry.name}</span>
                              {entry.isCurrentParticipant && (
                                <span className="win95-badge cyber-pill-cyan" style={{ fontSize: 10 }}>
                                  YOU
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: 10, color: '#666', fontFamily: 'Courier New, monospace' }}>
                              {entry.participantId}
                            </span>
                          </td>

                          <td style={{ maxWidth: 140 }} className="truncate">
                            {entry.college}
                          </td>

                          <td style={{ textAlign: 'center', fontFamily: 'Courier New, monospace' }}>
                            {entry.round1Score}
                          </td>

                          <td style={{ textAlign: 'center', fontFamily: 'Courier New, monospace' }}>
                            {entry.round2Score}
                          </td>

                          <td style={{ textAlign: 'center', fontFamily: 'Courier New, monospace' }}>
                            {entry.round3Score}
                          </td>

                          <td style={{ textAlign: 'center', fontFamily: 'Courier New, monospace', fontWeight: 'bold' }}>
                            {entry.totalScore}
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            {isDisq ? (
                              <span className="win95-badge cyber-pill-red" style={{ fontSize: 10 }}>
                                DISQUALIFIED
                              </span>
                            ) : (
                              <span
                                className={`win95-badge ${
                                  entry.status === 'WINNER_EVALUATION'
                                    ? 'cyber-pill-amber'
                                    : entry.status === 'QUALIFIED'
                                    ? 'cyber-pill-green'
                                    : ''
                                }`}
                                style={{ fontSize: 10 }}
                              >
                                {entry.status}
                              </span>
                            )}
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => toggleDisqualification(entry.participantId, entry.name)}
                              className="site-button"
                              style={{
                                fontSize: 11,
                                padding: '1px 6px',
                                color: isDisq ? '#0d652d' : '#c5221f',
                              }}
                              title={isDisq ? 'Reinstate participant' : 'Flag for Anti-AI policy infraction'}
                            >
                              {isDisq ? 'Reinstate' : 'Flag AI'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
};
