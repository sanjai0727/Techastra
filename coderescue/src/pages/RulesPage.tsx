import React, { useState } from 'react';
import { useCompetition } from '../context/CompetitionContext';
import { competitionRules, prohibitedAiTools } from '../data/rulesData';

export const RulesPage: React.FC = () => {
  const { startRound, setView } = useCompetition();
  const [agreed, setAgreed] = useState(false);
  const [attemptedStartWithoutAgree, setAttemptedStartWithoutAgree] = useState(false);

  const handleStart = () => {
    if (!agreed) {
      setAttemptedStartWithoutAgree(true);
      return;
    }
    // Attempt direct browser fullscreen from user gesture
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}

    // Trigger inner OS fullscreen transition
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'CODE_RESCUE_ENTER_FULLSCREEN' }, '*');
      }
    } catch (e) {
      // Ignore
    }
    startRound(1);
  };

  return (
    <div className="w-full max-w-6xl xl:max-w-7xl mx-auto my-auto p-1 sm:p-2 select-none text-black font-sans text-sm">
      <div className="win95-dialog-frame shadow-md">
        {/* Titlebar */}
        <div className="bg-[#000080] text-white px-3 py-1.5 flex items-center justify-between font-bold text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <span>📜</span>
            <span>Rules &amp; Engagement Directives — Code Rescue Championship</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setView('welcome')}
              className="site-button"
              style={{ padding: '0 5px', height: 20, fontSize: 11, lineHeight: '14px' }}
              title="Close and return to welcome"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="p-3.5 sm:p-5 space-y-4 sm:space-y-4.5 bg-[#c0c0c0]">
          {/* Institutional Header Banner */}
          <div className="bg-white p-3 sm:p-4 border-2 border-[#808080] border-t-black border-l-black flex items-center justify-between shadow-sm">
            <img
              src="./mgr_university_logo.png"
              alt="Dr. M.G.R. Educational and Research Institute University"
              className="h-11 sm:h-14 object-contain"
            />
            <div className="text-right text-xs sm:text-sm text-gray-800 hidden sm:block">
              <p className="font-bold text-[#000080] text-sm sm:text-base">Dr. M.G.R. EDUCATIONAL AND RESEARCH INSTITUTE</p>
              <p className="text-xs sm:text-sm text-gray-700 font-medium">(Deemed to be University • NAAC A+)</p>
              <p className="text-xs sm:text-sm text-gray-700 font-bold">Dept. of Computer Science &amp; Engineering &bull; Dept. of Cyber Security</p>
            </div>
          </div>

          {/* Header */}
          <div className="p-2.5 bg-[#c0c0c0] border-b border-[#808080] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-black font-sans">
                Official Competition Protocol &amp; Ethics Agreement
              </h1>
              <p className="text-xs sm:text-sm text-gray-700 mt-0.5">
                Department of Computer Science &amp; Engineering • Department of Cyber Security • Techastra 2026
              </p>
            </div>
            <button
              onClick={() => setView('welcome')}
              className="site-button"
              style={{ fontSize: 13, padding: '6px 16px', fontWeight: 'bold' }}
            >
              &lt; Return to Home
            </button>
          </div>

          {/* Prohibited AI Alert Banner */}
          <fieldset className="win95-fieldset">
            <legend className="win95-legend font-bold text-sm sm:text-base text-red-800">
              [!] ZERO SYNTHETIC AI GENERATION POLICY
            </legend>
            <div className="win95-sunken p-3.5 bg-[#fff8f8] text-xs sm:text-sm space-y-2.5">
              <p className="text-gray-900 leading-relaxed">
                The following generative AI systems and automated coding tools are <b>strictly forbidden</b> during all three rounds. Use of unauthorized assistance triggers immediate disqualification:
              </p>
              <div className="flex flex-wrap gap-2">
                {prohibitedAiTools.map((tool) => (
                  <span
                    key={tool}
                    className="win95-badge cyber-pill-red font-mono text-xs sm:text-sm px-2.5 py-1 font-bold"
                  >
                    ✗ {tool}
                  </span>
                ))}
              </div>
            </div>
          </fieldset>

          {/* Rule Sections Grid (3 Columns on Large Screens) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {competitionRules.map((section, idx) => (
              <fieldset
                key={idx}
                className="win95-fieldset"
                style={{ margin: 0 }}
              >
                <legend className="win95-legend font-bold text-xs sm:text-sm text-[#000080]">
                  {section.title}
                </legend>
                <div className="win95-sunken p-3.5 bg-white text-xs sm:text-sm space-y-2 h-full">
                  <ul className="space-y-2 text-gray-900 leading-relaxed">
                    {section.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <span className="font-bold text-[#000080] text-sm">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </fieldset>
            ))}
          </div>

          {/* Next Stage Info */}
          <div className="win95-sunken p-3.5 bg-[#ffffdf] border border-[#a0a060] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm">
            <div>
              <span className="font-bold text-sm sm:text-base text-[#403000]">Next Stage: Round 1 — Bug Hunt</span>
              <div className="text-xs sm:text-sm text-gray-800 font-mono mt-0.5">
                10 Work Orders • 20 Minutes • Qualification Cutoff: 50 Points
              </div>
            </div>
            <span className="win95-badge cyber-pill-amber font-mono font-bold text-xs sm:text-sm px-3 py-1">
              Timer starts upon entry
            </span>
          </div>

          {/* Agreement Checkbox & Actions */}
          <fieldset className="win95-fieldset">
            <legend className="win95-legend font-bold text-xs sm:text-sm">Acknowledgment &amp; Consent</legend>
            <div className="space-y-3 p-1.5">
              <label className="flex items-center gap-3 cursor-pointer font-sans text-xs sm:text-base bg-white p-3 sm:p-3.5 win95-sunken border border-[#808080]">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    setAttemptedStartWithoutAgree(false);
                  }}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
                <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                  I have read, understood, and agree to abide by all the competition rules, regulations, and honor directives.
                </span>
              </label>

              {attemptedStartWithoutAgree && (
                <div className="win95-sunken p-2.5 bg-[#fff0f0] text-red-800 font-bold text-xs sm:text-sm border border-red-400">
                  [NOTICE] You must acknowledge and check the agreement box before entering Round 1.
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#808080]">
                <button
                  onClick={() => setView('welcome')}
                  className="site-button"
                  style={{ fontSize: 13, padding: '7px 20px', fontWeight: 'bold' }}
                >
                  &lt; Cancel
                </button>

                <button
                  onClick={handleStart}
                  disabled={!agreed}
                  className="site-button active font-bold text-white bg-[#000080]"
                  style={{ fontSize: 15, padding: '9px 30px' }}
                >
                  ▶ Enter Round 1 — Bug Hunt &gt;&gt;
                </button>
              </div>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
};

export default RulesPage;
