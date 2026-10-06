import React from 'react';
import { Question } from '../types/competition';

interface ProblemDescriptionProps {
  question: Question;
}

export const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ question }) => {
  const getDifficultyBadge = (difficulty: Question['difficulty']) => {
    switch (difficulty) {
      case 'Basic':
        return 'cyber-pill-green';
      case 'Intermediate':
        return 'cyber-pill-amber';
      case 'Advanced':
        return 'cyber-pill-red';
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-[#c0c0c0] select-text font-sans text-xs text-black"
      style={{ boxShadow: 'var(--border-field)', overflow: 'hidden' }}
    >
      {/* Docked Tool Window Titlebar */}
      <div className="win95-tool-title">
        <div className="flex items-center gap-1.5 truncate">
          <span>📋</span>
          <span className="truncate">Work Order Q{question.number}: {question.title}</span>
        </div>
        <span className="font-mono text-[10px] bg-[#c0c0c0] text-black px-1.5 py-0.2 shrink-0 font-bold" style={{ boxShadow: 'var(--border-status)' }}>
          +{question.points} PTS
        </span>
      </div>

      {/* Meta Bar */}
      <div className="px-2 py-1 bg-[#c0c0c0] border-b border-[#808080] flex flex-wrap items-center gap-1.5">
        <span className="win95-badge cyber-pill-cyan font-bold">
          Q{question.number}
        </span>
        <span className={`win95-badge ${getDifficultyBadge(question.difficulty)}`}>
          {question.difficulty}
        </span>
        <span className="win95-badge font-mono">
          {question.bugType}
        </span>
      </div>

      {/* Body Content */}
      <div className="flex-1 p-2 overflow-y-auto space-y-2 bg-[#c0c0c0]">
        {/* Description */}
        <fieldset className="win95-fieldset" style={{ margin: 0, padding: '6px 10px' }}>
          <legend className="win95-legend font-bold text-[11px] uppercase">
            Work Order Description
          </legend>
          <div className="win95-sunken p-2 bg-white text-black font-sans text-xs whitespace-pre-line leading-relaxed">
            {question.description}
          </div>
        </fieldset>

        {/* Expected Behavior */}
        <fieldset className="win95-fieldset" style={{ margin: 0, padding: '6px 10px' }}>
          <legend className="win95-legend font-bold text-[11px] text-green-900 uppercase">
            Expected Behavior / Contract
          </legend>
          <div className="win95-sunken p-2 bg-[#f6fff8] text-gray-900 font-sans text-xs leading-relaxed">
            {question.expectedBehavior}
          </div>
        </fieldset>

        {/* I/O Format */}
        {(question.inputFormat || question.outputFormat) && (
          <fieldset className="win95-fieldset" style={{ margin: 0, padding: '6px 10px' }}>
            <legend className="win95-legend font-bold text-[11px] uppercase">
              I/O Specification
            </legend>
            <div className="win95-sunken p-2 bg-white space-y-1">
              {question.inputFormat && (
                <div>
                  <span className="font-bold text-[11px] block text-gray-800">Input Format:</span>
                  <p className="font-mono text-xs text-black">{question.inputFormat}</p>
                </div>
              )}
              {question.outputFormat && (
                <div>
                  <span className="font-bold text-[11px] block text-gray-800">Output Format:</span>
                  <p className="font-mono text-xs text-black">{question.outputFormat}</p>
                </div>
              )}
            </div>
          </fieldset>
        )}

        {/* Constraints */}
        {question.constraints && question.constraints.length > 0 && (
          <fieldset className="win95-fieldset" style={{ margin: 0, padding: '6px 10px' }}>
            <legend className="win95-legend font-bold text-[11px] uppercase">
              Operational Constraints
            </legend>
            <div className="win95-sunken p-2 bg-white">
              <ul className="list-disc list-inside space-y-0.5 font-mono text-xs text-gray-800">
                {question.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </fieldset>
        )}

        {/* Visible Test Cases */}
        {question.visibleTests && question.visibleTests.length > 0 && (
          <fieldset className="win95-fieldset" style={{ margin: 0, padding: '6px 10px' }}>
            <legend className="win95-legend font-bold text-[11px] uppercase">
              Visible Verification Baseline
            </legend>
            <table className="retro-table text-xs">
              <thead>
                <tr>
                  <th style={{ width: '50%' }}>Sample Input</th>
                  <th style={{ width: '50%' }}>Expected Return</th>
                </tr>
              </thead>
              <tbody>
                {question.visibleTests.map((t, idx) => (
                  <tr key={idx}>
                    <td><code>{t.input}</code></td>
                    <td><code className="text-blue-800 font-bold">{t.expectedOutput}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </fieldset>
        )}
      </div>
    </div>
  );
};
export default ProblemDescription;
