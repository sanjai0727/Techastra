import React, { useState, useEffect } from 'react';
import { useCompetition } from '../context/CompetitionContext';
import { telemetryService } from '../services/telemetryService';

export const WaitingRoomPage: React.FC = () => {
  const { state, setView, startRound } = useCompetition();
  const { participant, schedule } = state;

  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(() => {
    if (schedule?.startTime) {
      const ms = new Date(schedule.startTime).getTime() - Date.now();
      return Math.max(0, Math.floor(ms / 1000));
    }
    return 0;
  });

  const [isCheckingClock, setIsCheckingClock] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (schedule?.startTime) {
        const ms = new Date(schedule.startTime).getTime() - Date.now();
        const secs = Math.max(0, Math.floor(ms / 1000));
        setTimeLeftSeconds(secs);

        // If clock reached 0 and event was waiting to start, unlock and start Round 1!
        if (secs <= 0 && (!schedule.isEnded)) {
          startRound(1);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [schedule?.startTime, schedule?.isEnded, startRound]);

  // If server schedule updates and isStarted becomes true, unlock automatically!
  useEffect(() => {
    if (schedule?.isStarted && !schedule?.isEnded) {
      startRound(1);
    }
  }, [schedule?.isStarted, schedule?.isEnded, startRound]);

  const handleManualCheck = async () => {
    setIsCheckingClock(true);
    try {
      const latest = await telemetryService.fetchSchedule();
      if (latest && latest.isStarted && !latest.isEnded) {
        startRound(1);
      }
    } finally {
      setTimeout(() => setIsCheckingClock(false), 600);
    }
  };

  const hours = Math.floor(timeLeftSeconds / 3600);
  const minutes = Math.floor((timeLeftSeconds % 3600) / 60);
  const seconds = timeLeftSeconds % 60;
  const formattedCountdown = `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;

  return (
    <div className="w-full max-w-4xl mx-auto my-auto p-2 sm:p-4 select-none text-black font-sans text-xs">
      <div className="win95-dialog-frame shadow-lg">
        {/* Titlebar */}
        <div className="bg-[#000080] text-white px-3 py-1 flex items-center justify-between font-bold text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <span>🔒</span>
            <span>ARENA GATEWAY: COMPETITION SCHEDULE LOCKOUT</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setView('welcome')}
              className="site-button"
              style={{ padding: '0 5px', height: 18, fontSize: 10, lineHeight: '14px' }}
              title="Return to Welcome"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="p-4 sm:p-6 space-y-4 bg-[#c0c0c0]">
          {/* Institutional Header Banner */}
          <div className="bg-white p-3 sm:p-4 border-2 border-[#808080] border-t-black border-l-black flex items-center justify-between shadow-sm">
            <img
              src="./mgr_university_logo.png"
              alt="Dr. M.G.R. Educational and Research Institute University"
              className="h-12 sm:h-16 object-contain"
            />
            <div className="text-right text-xs text-gray-800">
              <p className="font-bold text-[#000080] text-sm sm:text-base">Dr. M.G.R. EDUCATIONAL AND RESEARCH INSTITUTE</p>
              <p className="text-[11px] text-gray-700 font-medium">(Deemed to be University • NAAC A+)</p>
              <p className="text-[11px] text-gray-700 font-bold">Dept. of Computer Science &amp; Engineering &bull; Dept. of Cyber Security</p>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">Techastra 2026 Code Rescue Championship Arena</p>
            </div>
          </div>

          {/* Alert Header */}
          <div className="p-3 bg-[#fef7e0] border-2 border-[#b06000] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-[#b06000] uppercase font-sans">
                  Arena Gateway Locked — Standby for Official Commencement
                </h1>
                <p className="text-xs text-gray-800">
                  The contest has not started yet. Your workstation terminal is primed and will automatically unlock upon start time.
                </p>
              </div>
            </div>
            <div className="win95-badge font-mono font-bold text-xs px-3 py-1 bg-[#fff8e1] border border-[#b06000] text-[#b06000] shrink-0">
              GATE ARMED
            </div>
          </div>

          {/* Big LCD Countdown Display */}
          <div className="p-5 bg-[#000000] border-4 border-[#808080] border-t-black border-l-black text-center shadow-inner">
            <div className="text-[11px] font-mono tracking-widest text-[#00ff66] uppercase mb-1">
              Time Remaining Until Official Arena Unlock
            </div>
            <div className="text-3xl sm:text-5xl font-mono font-bold text-[#00ff66] tracking-wider py-2">
              {formattedCountdown}
            </div>
            <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-gray-400 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#00ff66] animate-pulse"></span>
              <span>SYNCHRONIZED WITH MASTER EVENT SERVER</span>
            </div>
          </div>

          {/* Contestant Dossier & Schedule Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <fieldset className="win95-fieldset">
              <legend className="win95-legend font-bold text-gray-800">Authenticated Contestant Node</legend>
              <div className="win95-sunken p-2.5 bg-white space-y-1.5 font-sans">
                <div className="flex justify-between">
                  <span className="text-gray-600">Contestant Name:</span>
                  <b className="text-black">{participant?.fullName || 'Anonymous Contestant'}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Token ID:</span>
                  <b className="font-mono text-[#000080]">{participant?.participantId || 'SYM2026-PENDING'}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Institution:</span>
                  <span className="text-gray-900 truncate max-w-[200px]" title={participant?.college}>
                    {participant?.college || 'Engineering College'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Terminal Node:</span>
                  <span className="font-mono text-gray-800">DRMGR-NODE-CR26</span>
                </div>
              </div>
            </fieldset>

            <fieldset className="win95-fieldset">
              <legend className="win95-legend font-bold text-gray-800">Official Tournament Directives</legend>
              <div className="win95-sunken p-2.5 bg-white space-y-1.5 font-sans">
                <div className="flex justify-between">
                  <span className="text-gray-600">Scheduled Start Time:</span>
                  <b className="font-mono text-[#0d652d]">
                    {schedule?.startTime ? new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Pending Broadcast'}
                  </b>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Scheduled End Time:</span>
                  <b className="font-mono text-[#c5221f]">
                    {schedule?.endTime ? new Date(schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Auto-timed'}
                  </b>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Initial Stage:</span>
                  <span className="font-bold text-[#000080]">Round 1: Bug Hunt (10 Orders)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Proctoring Status:</span>
                  <span className="font-mono text-green-700 font-bold">READY &amp; ARMED</span>
                </div>
              </div>
            </fieldset>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-[#808080]">
            <button
              onClick={() => setView('rules')}
              className="site-button"
              style={{ fontSize: 12, padding: '6px 16px' }}
            >
              &lt; Review Rules
            </button>

            <button
              onClick={handleManualCheck}
              disabled={isCheckingClock}
              className="site-button active font-bold"
              style={{ fontSize: 12, padding: '6px 18px', backgroundColor: '#e6f4ea', borderColor: '#137333', color: '#137333' }}
              title="Query the central server for immediate tournament activation"
            >
              {isCheckingClock ? 'Checking Clock...' : '🔄 Query Master Server Clock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoomPage;
