import React from 'react';
import { useCompetition } from '../context/CompetitionContext';

export const WelcomePage: React.FC = () => {
  const { state, setView } = useCompetition();

  return (
    <div className="w-full max-w-6xl xl:max-w-7xl mx-auto my-auto p-1 sm:p-2 select-none text-black font-sans text-sm">
      {/* Windows 95 Main Software Window Frame */}
      <div className="win95-dialog-frame shadow-md">
        {/* Dialog Client Area */}
        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-5 bg-[#c0c0c0]">
          {/* Institutional Header Banner */}
          <div className="bg-white p-3 sm:p-4 border-2 border-[#808080] border-t-black border-l-black flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <img
              src="./mgr_university_logo.png"
              alt="Dr. M.G.R. Educational and Research Institute University"
              className="h-12 sm:h-16 object-contain"
            />
            <div className="text-center sm:text-right text-xs sm:text-sm text-gray-800">
              <p className="font-bold text-[#000080] text-sm sm:text-lg">Dr. M.G.R. EDUCATIONAL AND RESEARCH INSTITUTE</p>
              <p className="text-xs sm:text-sm text-gray-700 font-medium">(Deemed to be University • NAAC A+ Grade)</p>
              <p className="text-xs sm:text-sm text-gray-700 font-bold mt-0.5">Dept. of Computer Science &amp; Engineering &bull; Dept. of Cyber Security</p>
            </div>
          </div>

          {/* Header Banner */}
          <div className="p-3 bg-[#c0c0c0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#808080]">
            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-black font-sans">
                TECHASTRA '26: CODE RESCUE
              </h1>
              <p className="text-xs sm:text-base text-gray-700 mt-1">
                Three-Round Competitive Debugging Championship • Department of Computer Science &amp; Engineering &bull; Department of Cyber Security
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm">
              <span className="win95-badge cyber-pill-green text-xs sm:text-sm px-2.5 py-1">RUNTIME ONLINE</span>
              <span className="win95-badge cyber-pill-cyan text-xs sm:text-sm px-2.5 py-1">BUILD 3.11</span>
            </div>
          </div>

          {/* Mission Directive GroupBox */}
          <fieldset className="win95-fieldset">
            <legend className="win95-legend font-bold text-sm sm:text-base text-[#000080]">
              Incident Mission Directive // Incident 0x26
            </legend>
            <div className="win95-sunken p-3.5 sm:p-5 text-sm sm:text-base leading-relaxed text-black font-sans bg-white space-y-3">
              <p className="text-gray-900 leading-relaxed">
                We don't troubleshoot printers. We don't write "Hello World". When mission-critical production infrastructure crashes at 03:00 AM, ordinary coders panic — Code Rescue triage engineers step up, decipher tracebacks, fix runtime defects, and rescue systems against the countdown clock.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1 font-mono text-xs sm:text-sm">
                <span className="win95-badge cyber-pill-green px-3 py-1 font-bold">R1: Bug Hunt (20m)</span>
                <span className="win95-badge cyber-pill-amber px-3 py-1 font-bold">R2: Logic Breaker (25m)</span>
                <span className="win95-badge cyber-pill-red px-3 py-1 font-bold">R3: Code Rescue (40m)</span>
                <span className="win95-badge cyber-pill-cyan font-bold px-3 py-1">Max Score: 300 Pts</span>
              </div>
            </div>
          </fieldset>

          {/* Championship Stages GroupBox */}
          <fieldset className="win95-fieldset">
            <legend className="win95-legend font-bold text-sm sm:text-base text-[#000080]">
              Championship Stages &amp; Work Orders
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
              {/* Round 1 */}
              <div className="win95-sunken p-4 sm:p-5 space-y-3 flex flex-col justify-between bg-white border border-[#808080] min-h-[180px]">
                <div>
                  <div className="font-bold text-[#000080] border-b border-gray-300 pb-1.5 mb-2 text-sm sm:text-base">
                    Round 1: Bug Hunt
                  </div>
                  <p className="text-gray-900 leading-relaxed text-xs sm:text-sm">
                    Syntax &amp; lexical triage: Missing colons, bracket mismatches, tab vs space indentation faults, and misspelled identifiers.
                  </p>
                </div>
                <div className="space-y-1 font-mono text-xs sm:text-sm pt-2.5 border-t border-gray-200 text-gray-800 bg-[#f8f8f8] p-2.5 rounded-sm">
                  <div><b>Orders:</b> 10 Work Orders</div>
                  <div><b>Clock:</b> 20 Minutes</div>
                  <div><b>Max Points:</b> 100 Pts</div>
                </div>
              </div>

              {/* Round 2 */}
              <div className="win95-sunken p-4 sm:p-5 space-y-3 flex flex-col justify-between bg-white border border-[#808080] min-h-[180px]">
                <div>
                  <div className="font-bold text-[#704000] border-b border-gray-300 pb-1.5 mb-2 text-sm sm:text-base">
                    Round 2: Logic Breaker
                  </div>
                  <p className="text-gray-900 leading-relaxed text-xs sm:text-sm">
                    Insidious logical hazards: Off-by-one loops, zero-division hazards, mutable default argument traps, and boundary cases.
                  </p>
                </div>
                <div className="space-y-1 font-mono text-xs sm:text-sm pt-2.5 border-t border-gray-200 text-gray-800 bg-[#f8f8f8] p-2.5 rounded-sm">
                  <div><b>Orders:</b> 5 Work Orders</div>
                  <div><b>Clock:</b> 25 Minutes</div>
                  <div><b>Max Points:</b> 100 Pts</div>
                </div>
              </div>

              {/* Round 3 */}
              <div className="win95-sunken p-4 sm:p-5 space-y-3 flex flex-col justify-between bg-white border border-[#808080] min-h-[180px]">
                <div>
                  <div className="font-bold text-[#a00000] border-b border-gray-300 pb-1.5 mb-2 text-sm sm:text-base">
                    Round 3: Code Rescue
                  </div>
                  <p className="text-gray-900 leading-relaxed text-xs sm:text-sm">
                    System disaster recovery: Complex interconnected legacy codebase triage with cascaded failures across ingestion, computation, and output.
                  </p>
                </div>
                <div className="space-y-1 font-mono text-xs sm:text-sm pt-2.5 border-t border-gray-200 text-gray-800 bg-[#f8f8f8] p-2.5 rounded-sm">
                  <div><b>Architecture:</b> 1 Legacy System</div>
                  <div><b>Clock:</b> 40 Minutes</div>
                  <div><b>Max Points:</b> 100 Pts</div>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Action Command Bar */}
          <div className="p-3 sm:p-4 bg-[#c0c0c0] flex flex-wrap items-center justify-center gap-3 sm:gap-4 border-t border-[#808080]">
            <button
              onClick={() => setView(state.participant ? 'rules' : 'registration')}
              className="site-button active"
              style={{ fontSize: 15, padding: '10px 30px', fontWeight: 'bold', backgroundColor: '#000080', color: '#ffffff' }}
            >
              {state.participant ? `▶ Continue to Arena (${state.participant.fullName}) >>` : '▶ Enter as Contestant >>'}
            </button>

            <button
              onClick={() => setView('rules')}
              className="site-button"
              style={{ fontSize: 14, padding: '9px 22px', fontWeight: 'bold' }}
            >
              Rules &amp; Briefing...
            </button>

            <button
              onClick={() => setView('leaderboard')}
              className="site-button"
              style={{ fontSize: 14, padding: '9px 22px', fontWeight: 'bold' }}
            >
              View Live Standings...
            </button>
          </div>

          {/* Notice Groupbox */}
          <fieldset className="win95-fieldset">
            <legend className="win95-legend font-semibold text-xs sm:text-sm">Official Notice</legend>
            <div className="p-2 sm:p-2.5 text-center text-xs sm:text-sm space-y-1.5 text-gray-800">
              <div>
                <b>DEPARTMENT OF COMPUTER SCIENCE &amp; ENGINEERING • DEPARTMENT OF CYBER SECURITY • TECHASTRA 2026</b>
              </div>
              <div className="font-mono text-xs sm:text-sm text-gray-700">
                Event Date: <b>08/10/2026</b> • Venue: <b>IBM LAB</b>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                Faculty: Dr. G. Senthilvelan (+91 98404 66300), Mr. P. Sudarsan (+91 97907 80562) • Student Leads: Mr. Sanjai P A (+91 94878 26286), Ms. Kavitha G (+91 63824 01242), Mr. Yashvinthan M (+91 97899 21988)
              </div>
              <div className="text-red-700 font-bold font-mono text-xs sm:text-sm">
                [ STRICT ANTI-AI VERIFICATION PROTOCOL ACTIVE • ZERO EXTERNAL ASSISTANCE ]
              </div>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
