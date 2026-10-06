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
    <div className="max-w-4xl mx-auto my-2 select-none text-black font-sans text-xs">
      <div className="win95-dialog-frame">
        {/* Titlebar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
          <div className="flex items-center gap-1.5">
            <span>📜</span>
            <span>Rules & Engagement Directives — Code Rescue Championship</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setView('welcome')}
              className="site-button"
              style={{ padding: '0 4px', height: 16, fontSize: 10, lineHeight: '12px' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="p-3 space-y-3 bg-[#c0c0c0]">
          {/* Institutional Header Banner */}
          <div className="bg-white p-2 border-2 border-[#808080] border-t-black border-l-black flex items-center justify-between">
            <img
              src="./mgr_university_logo.png"
              alt="Dr. M.G.R. Educational and Research Institute University"
              className="h-9 sm:h-11 object-contain"
            />
            <div className="text-right text-[10px] text-gray-700 hidden sm:block">
              <p className="font-bold text-[#000080]">Dr. M.G.R. EDUCATIONAL AND RESEARCH INSTITUTE</p>
              <p>(Deemed to be University • NAAC A+)</p>
            </div>
          </div>

          {/* Header */}
          <div className="p-2 bg-[#c0c0c0] border-b border-[#808080] flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-black font-sans">
                Official Competition Protocol & Ethics Agreement
              </h1>
              <p className="text-[11px] text-gray-700">
                Department of Computer Science & Engineering • Techastra 2026
              </p>
            </div>
            <button
              onClick={() => setView('welcome')}
              className="site-button"
              style={{ fontSize: 11, padding: '2px 8px' }}
            >
              &lt; Return to Home
            </button>
          </div>

          {/* Prohibited AI Alert Banner */}
          <fieldset className="win95-fieldset">
            <legend className="win95-legend font-bold text-red-800">
              [!] ZERO SYNTHETIC AI GENERATION POLICY
            </legend>
            <div className="win95-sunken p-2.5 bg-[#fff8f8] text-xs space-y-2">
              <p className="text-gray-900 leading-relaxed">
                The following generative AI systems and automated coding tools are <b>strictly forbidden</b> during all three rounds. Use of unauthorized assistance triggers immediate disqualification:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {prohibitedAiTools.map((tool) => (
                  <span
                    key={tool}
                    className="win95-badge cyber-pill-red font-mono"
                  >
                    ✗ {tool}
                  </span>
                ))}
              </div>
            </div>
          </fieldset>

          {/* Rule Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {competitionRules.map((section, idx) => (
              <fieldset
                key={idx}
                className="win95-fieldset"
                style={{ margin: 0 }}
              >
                <legend className="win95-legend font-bold">
                  {section.title}
                </legend>
                <div className="win95-sunken p-2 bg-white text-xs space-y-1.5 h-full">
                  <ul className="space-y-1 text-gray-900 leading-relaxed text-[11px]">
                    {section.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1">
                        <span className="font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </fieldset>
            ))}
          </div>

          {/* Next Stage Info */}
          <div className="win95-sunken p-2 bg-[#ffffdf] flex items-center justify-between text-xs">
            <div>
              <span className="font-bold">Next Stage: Round 1 — Bug Hunt</span>
              <div className="text-[11px] text-gray-700 font-mono">
                10 Work Orders • 20 Minutes • Qualification Cutoff: 50 Points
              </div>
            </div>
            <span className="win95-badge cyber-pill-amber font-mono font-bold">
              Timer starts upon entry
            </span>
          </div>

          {/* Agreement Checkbox & Actions */}
          <fieldset className="win95-fieldset">
            <legend className="win95-legend font-bold">Acknowledgment & Consent</legend>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-sans text-xs bg-white p-2 win95-sunken">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    setAttemptedStartWithoutAgree(false);
                  }}
                  style={{ width: 14, height: 14, cursor: 'pointer' }}
                />
                <span>
                  I have read, understood, and agree to abide by all the competition rules, regulations, and honor directives.
                </span>
              </label>

              {attemptedStartWithoutAgree && (
                <div className="win95-sunken p-1.5 bg-[#fff0f0] text-red-800 font-bold text-xs">
                  [NOTICE] You must acknowledge and check the agreement box before entering Round 1.
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setView('welcome')}
                  className="site-button"
                  style={{ fontSize: 12, padding: '4px 14px' }}
                >
                  &lt; Cancel
                </button>

                <button
                  onClick={handleStart}
                  disabled={!agreed}
                  className="site-button active font-bold"
                  style={{ fontSize: 13, padding: '5px 22px' }}
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
