import React from 'react';
import { useCompetition } from '../context/CompetitionContext';
import { Settings, X, FastForward, UserCheck, RefreshCw, Trophy, ShieldAlert, ArrowRight } from 'lucide-react';

export const OrganizerModal: React.FC = () => {
  const {
    state,
    setOrganizerMode,
    organizerJumpToRound,
    organizerSetTimer,
    organizerAutofillParticipant,
    resetCompetition,
    setView,
    updateQualificationConfig,
    resetSecurityState
  } = useCompetition();

  if (!state.organizerModeOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 select-none font-sans text-xs text-black">
      <div
        className="win95-dialog-frame max-w-lg w-full p-1 text-black"
      >
        {/* Modal Window Titlebar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
          <span>ORGANIZER & DEMO CONTROL PANEL</span>
          <button
            onClick={() => setOrganizerMode(false)}
            className="site-button"
            style={{
              padding: '0 4px',
              height: 16,
              fontSize: 10,
              lineHeight: '12px',
              fontWeight: 'bold',
              background: '#c0c0c0',
              color: '#000000',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 space-y-3 text-xs bg-[#c0c0c0]">
          {/* Quick Round Navigation */}
          <fieldset className="win95-fieldset" style={{ margin: 0, padding: '8px 12px' }}>
            <legend className="win95-legend font-bold text-xs">
              Fast-Track Stage Jump
            </legend>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <button
                onClick={() => {
                  if (!state.participant) organizerAutofillParticipant();
                  organizerJumpToRound(1);
                  setOrganizerMode(false);
                }}
                className="site-button flex-col py-2"
                style={{ fontSize: 12 }}
              >
                <b>Round 1</b>
                <span className="text-[10px] text-gray-700">Bug Hunt</span>
              </button>
              <button
                onClick={() => {
                  if (!state.participant) organizerAutofillParticipant();
                  organizerJumpToRound(2);
                  setOrganizerMode(false);
                }}
                className="site-button flex-col py-2"
                style={{ fontSize: 12 }}
              >
                <b>Round 2</b>
                <span className="text-[10px] text-gray-700">Logic Breaker</span>
              </button>
              <button
                onClick={() => {
                  if (!state.participant) organizerAutofillParticipant();
                  organizerJumpToRound(3);
                  setOrganizerMode(false);
                }}
                className="site-button flex-col py-2"
                style={{ fontSize: 12 }}
              >
                <b>Round 3</b>
                <span className="text-[10px] text-gray-700">Code Rescue</span>
              </button>
            </div>
          </fieldset>

          {/* Direct Views */}
          <fieldset className="win95-fieldset" style={{ margin: 0, padding: '8px 12px' }}>
            <legend className="win95-legend font-bold text-xs">
              Quick Actions
            </legend>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => {
                  setView('leaderboard');
                  setOrganizerMode(false);
                }}
                className="site-button"
                style={{ fontSize: 12, padding: '6px' }}
              >
                View Leaderboard
              </button>
              <button
                onClick={() => {
                  organizerAutofillParticipant();
                  setOrganizerMode(false);
                }}
                className="site-button"
                style={{ fontSize: 12, padding: '6px' }}
              >
                Autofill Participant
              </button>
            </div>
          </fieldset>

          {/* Timer controls */}
          <fieldset className="win95-fieldset" style={{ margin: 0, padding: '8px 12px' }}>
            <legend className="win95-legend font-bold text-xs">
              Timer Controls
            </legend>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-xs text-gray-800">Round {state.currentRound} Clock:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const dur = (state.currentRound === 1 ? 20 : state.currentRound === 2 ? 25 : 40) * 60;
                    organizerSetTimer(state.currentRound, dur);
                  }}
                  className="site-button font-bold"
                  style={{ fontSize: 11, padding: '3px 8px' }}
                >
                  Reset Full Time
                </button>
                <button
                  onClick={() => {
                    organizerSetTimer(state.currentRound, 10);
                  }}
                  className="site-button"
                  style={{ fontSize: 11, padding: '3px 8px' }}
                >
                  Set to 10s (Test Expiry)
                </button>
              </div>
            </div>
          </fieldset>

          {/* Configurable Qualification Cutoffs */}
          <fieldset className="win95-fieldset" style={{ margin: 0, padding: '8px 12px' }}>
            <legend className="win95-legend font-bold text-xs">
              Qualification Cutoffs (Pts)
            </legend>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div>
                <label className="text-gray-800 block mb-1 font-bold">Round 1 Cutoff:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={state.qualificationConfig.round1MinScore}
                  onChange={(e) => updateQualificationConfig({ round1MinScore: parseInt(e.target.value) || 0 })}
                  className="site-input font-mono"
                  style={{ height: 26 }}
                />
              </div>
              <div>
                <label className="text-gray-800 block mb-1 font-bold">Round 2 Cutoff:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={state.qualificationConfig.round2MinScore}
                  onChange={(e) => updateQualificationConfig({ round2MinScore: parseInt(e.target.value) || 0 })}
                  className="site-input font-mono"
                  style={{ height: 26 }}
                />
              </div>
            </div>
          </fieldset>

          {/* Proctor Security Override */}
          <fieldset className="win95-fieldset" style={{ margin: 0, padding: '8px 12px' }}>
            <legend className="win95-legend font-bold text-xs" style={{ color: '#800000' }}>
              🛡️ Proctoring & Security Controls
            </legend>
            <div className="space-y-1.5 mt-1">
              <div className="flex items-center justify-between text-xs">
                <span>Security Status:</span>
                <span
                  className="font-bold font-mono px-1.5 py-0.5 text-white"
                  style={{
                    backgroundColor: state.securityState?.isDisqualified
                      ? '#a00000'
                      : (state.securityState?.tabSwitchCount || 0) > 0
                      ? '#d97706'
                      : '#15803d',
                  }}
                >
                  {state.securityState?.isDisqualified
                    ? 'DISQUALIFIED'
                    : `Active (Strikes: ${state.securityState?.tabSwitchCount || 0}/2)`}
                </span>
              </div>
              <button
                onClick={() => {
                  resetSecurityState();
                  setOrganizerMode(false);
                }}
                className="site-button w-full font-bold"
                style={{ fontSize: 11, padding: '5px' }}
              >
                Proctor Override: Reinstate Contestant (Clear All Strikes)
              </button>
            </div>
          </fieldset>

          {/* Reset Competition */}
          <div className="pt-2 border-t border-gray-400">
            <button
              onClick={() => {
                if (window.confirm('Reset all competition state and return to welcome screen?')) {
                  resetCompetition();
                  setOrganizerMode(false);
                }
              }}
              className="site-button w-full"
              style={{ fontSize: 12, padding: '6px', color: '#a40e26', fontWeight: 'bold' }}
            >
              Reset Entire Competition (Wipe LocalStorage)
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-3 py-1.5 bg-[#d8d8d8] border-t border-gray-400 text-[11px] text-gray-700 flex items-center justify-between">
          <span>Techastra Code Rescue v1.0</span>
          <span>Evaluation Prototype</span>
        </div>
      </div>
    </div>
  );
};
