import React from 'react';
import { useCompetition } from '../context/CompetitionContext';

export const WelcomePage: React.FC = () => {
  const { setView } = useCompetition();

  return (
    <div className="max-w-4xl mx-auto my-2 select-none text-black font-sans text-xs">
      {/* Windows 95 Main Software Window Frame */}
      <div className="win95-dialog-frame">
        {/* Dialog Client Area */}
        <div className="p-3 space-y-3 bg-[#c0c0c0]">
          {/* Institutional Header Banner */}
          <div className="bg-white p-2.5 border-2 border-[#808080] border-t-black border-l-black flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
            <img
              src="./mgr_university_logo.png"
              alt="Dr. M.G.R. Educational and Research Institute University"
              className="h-10 sm:h-12 object-contain"
            />
            <div className="text-right text-[11px] text-gray-700 hidden sm:block">
              <p className="font-bold text-[#000080]">Dr. M.G.R. EDUCATIONAL AND RESEARCH INSTITUTE</p>
              <p>(Deemed to be University • NAAC A+ Grade)</p>
              <p className="text-[10px] text-gray-500">Dept. of Computer Science &amp; Engineering &bull; Dept. of Cyber Security</p>
            </div>
          </div>

          {/* Header Banner */}
          <div className="p-2.5 bg-[#c0c0c0] flex items-center justify-between border-b border-[#808080]">
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-black font-sans">
                TECHASTRA '26: CODE RESCUE
              </h1>
              <p className="text-xs text-gray-700">
                Three-Round Competitive Debugging Championship • Department of Computer Science & Engineering
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1 font-mono text-[11px]">
              <span className="win95-badge cyber-pill-green">RUNTIME ONLINE</span>
              <span className="win95-badge cyber-pill-cyan">BUILD 3.11</span>
            </div>
          </div>

          {/* Mission Directive GroupBox */}
          <fieldset className="win95-fieldset">
            <legend className="win95-legend font-bold">
              Incident Mission Directive // Incident 0x26
            </legend>
            <div className="win95-sunken p-3 text-xs leading-relaxed text-black font-sans bg-white">
              <p className="mb-2">
                We don't troubleshoot printers. We don't write "Hello World". When mission-critical production infrastructure crashes at 03:00 AM, ordinary coders panic — Code Rescue triage engineers step up, decipher tracebacks, fix runtime defects, and rescue systems against the countdown clock.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                <span className="win95-badge cyber-pill-green">R1: Bug Hunt (20m)</span>
                <span className="win95-badge cyber-pill-amber">R2: Logic Breaker (25m)</span>
                <span className="win95-badge cyber-pill-red">R3: Code Rescue (40m)</span>
                <span className="win95-badge cyber-pill-cyan font-bold">Max Score: 300 Pts</span>
              </div>
            </div>
          </fieldset>

          {/* Championship Stages GroupBox */}
          <fieldset className="win95-fieldset">
            <legend className="win95-legend font-bold">
              Championship Stages & Work Orders
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {/* Round 1 */}
              <div className="win95-sunken p-2.5 space-y-1.5 flex flex-col justify-between text-xs bg-white">
                <div>
                  <div className="font-bold text-[#000080] border-b border-gray-300 pb-1 mb-1">
                    Round 1: Bug Hunt
                  </div>
                  <p className="text-gray-900 leading-normal text-[11px]">
                    Syntax & lexical triage: Missing colons, bracket mismatches, tab vs space indentation faults, and misspelled identifiers.
                  </p>
                </div>
                <div className="space-y-0.5 font-mono text-[11px] pt-1.5 border-t border-gray-200 text-gray-700">
                  <div><b>Orders:</b> 10 Work Orders</div>
                  <div><b>Clock:</b> 20 Minutes</div>
                  <div><b>Max Points:</b> 100 Pts</div>
                </div>
              </div>

              {/* Round 2 */}
              <div className="win95-sunken p-2.5 space-y-1.5 flex flex-col justify-between text-xs bg-white">
                <div>
                  <div className="font-bold text-[#704000] border-b border-gray-300 pb-1 mb-1">
                    Round 2: Logic Breaker
                  </div>
                  <p className="text-gray-900 leading-normal text-[11px]">
                    Insidious logical hazards: Off-by-one loops, zero-division hazards, mutable default argument traps, and boundary cases.
                  </p>
                </div>
                <div className="space-y-0.5 font-mono text-[11px] pt-1.5 border-t border-gray-200 text-gray-700">
                  <div><b>Orders:</b> 5 Work Orders</div>
                  <div><b>Clock:</b> 25 Minutes</div>
                  <div><b>Max Points:</b> 100 Pts</div>
                </div>
              </div>

              {/* Round 3 */}
              <div className="win95-sunken p-2.5 space-y-1.5 flex flex-col justify-between text-xs bg-white">
                <div>
                  <div className="font-bold text-[#a00000] border-b border-gray-300 pb-1 mb-1">
                    Round 3: Code Rescue
                  </div>
                  <p className="text-gray-900 leading-normal text-[11px]">
                    System disaster recovery: Complex interconnected legacy codebase triage with cascaded failures across ingestion, computation, and output.
                  </p>
                </div>
                <div className="space-y-0.5 font-mono text-[11px] pt-1.5 border-t border-gray-200 text-gray-700">
                  <div><b>Architecture:</b> 1 Legacy System</div>
                  <div><b>Clock:</b> 40 Minutes</div>
                  <div><b>Max Points:</b> 100 Pts</div>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Action Command Bar */}
          <div className="p-2 bg-[#c0c0c0] flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setView('registration')}
              className="site-button"
              style={{ fontSize: 13, padding: '5px 20px', fontWeight: 'bold' }}
            >
              ▶ Enter as Contestant &gt;&gt;
            </button>

            <button
              onClick={() => setView('rules')}
              className="site-button"
              style={{ fontSize: 12, padding: '5px 14px' }}
            >
              Rules & Briefing...
            </button>

            <button
              onClick={() => setView('leaderboard')}
              className="site-button"
              style={{ fontSize: 12, padding: '5px 14px' }}
            >
              View Live Standings...
            </button>

            <button
              onClick={() => setView('admin_dashboard')}
              className="site-button"
              style={{ fontSize: 12, padding: '5px 14px' }}
            >
              Coordinator Command Desk...
            </button>
          </div>

          {/* Notice Groupbox */}
          <fieldset className="win95-fieldset">
            <legend className="win95-legend">Official Notice</legend>
            <div className="p-1.5 text-center text-[11px] space-y-0.5 text-gray-800">
              <div>
                <b>DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING • TECHASTRA 2026</b>
              </div>
              <div>
                Faculty: Dr. G. Senthil Velan, Ms. Anu • Student Coordinators: Yashvinthan M, Kavitha G, Sanjai P.A.
              </div>
              <div className="text-red-700 font-bold font-mono">
                [ STRICT ANTI-AI VERIFICATION PROTOCOL ACTIVE • ZERO EXTERNAL ASSISTANCE ]
              </div>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
};
