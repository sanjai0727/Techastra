import React, { useState } from 'react';
import { useCompetition } from '../context/CompetitionContext';

export const RegistrationPage: React.FC = () => {
  const { registerParticipant, setView } = useCompetition();

  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('3rd Year');
  const [participantId, setParticipantId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !college.trim() || !department.trim()) {
      setError('Full Name, College, and Department are strictly mandatory fields.');
      return;
    }

    const assignedId = participantId.trim() || `CR-${Math.floor(1000 + Math.random() * 9000)}`;

    registerParticipant({
      fullName: fullName.trim(),
      college: college.trim(),
      department: department.trim(),
      year,
      participantId: assignedId,
      registeredAt: Date.now()
    });

    setView('rules');
  };

  const handleQuickDemoFill = () => {
    setFullName('Sanjai Kumar');
    setCollege('College of Engineering, Guindy');
    setDepartment('Computer Science & Engineering');
    setYear('3rd Year');
    setParticipantId('CR-2026-LIVE');
    setError(null);
  };

  return (
    <div className="max-w-xl mx-auto my-3 select-none text-black font-sans text-xs">
      <div className="win95-dialog-frame">
        {/* Titlebar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
          <div className="flex items-center gap-1.5">
            <span>👤</span>
            <span>Contestant Enrollment Dossier — Setup Wizard</span>
          </div>
          <button
            onClick={() => setView('welcome')}
            className="site-button"
            style={{ padding: '0 4px', height: 16, fontSize: 10, lineHeight: '12px' }}
          >
            ✕
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-3 space-y-3 bg-[#c0c0c0]">
          {/* Top Info Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-[#808080]">
            <div>
              <div className="font-bold text-sm text-black">Candidate Identification Setup</div>
              <div className="text-[11px] text-gray-700">Enter academic credentials to initialize contestant token.</div>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="site-button"
              style={{ fontSize: 11, padding: '2px 8px' }}
            >
              [ Quick Demo Fill ]
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="win95-sunken p-2 bg-[#fff0f0] text-red-800 font-bold text-xs">
              [ERROR] {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <fieldset className="win95-fieldset">
              <legend className="win95-legend font-bold">Academic Identification</legend>
              <div className="space-y-2 p-1">
                {/* Full Name */}
                <div>
                  <label className="block font-bold text-[11px] mb-0.5 text-gray-800">
                    Full Name: <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sanjai Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="site-input"
                  />
                </div>

                {/* College */}
                <div>
                  <label className="block font-bold text-[11px] mb-0.5 text-gray-800">
                    College / Institution: <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. College of Engineering, Guindy"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="site-input"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block font-bold text-[11px] mb-0.5 text-gray-800">
                    Department / Major: <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science and Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="site-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Year */}
                  <div>
                    <label className="block font-bold text-[11px] mb-0.5 text-gray-800">
                      Academic Year:
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="site-input"
                      style={{ height: 26 }}
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="PG / Other">PG / Other</option>
                    </select>
                  </div>

                  {/* Participant ID */}
                  <div>
                    <label className="block font-bold text-[11px] mb-0.5 text-gray-800">
                      Contestant Token:
                    </label>
                    <input
                      type="text"
                      placeholder="Auto-assigned if blank"
                      value={participantId}
                      onChange={(e) => setParticipantId(e.target.value)}
                      className="site-input font-mono"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Dialog Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#808080]">
              <button
                type="button"
                onClick={() => setView('welcome')}
                className="site-button"
                style={{ fontSize: 12, padding: '3px 14px' }}
              >
                &lt; Cancel
              </button>

              <button
                type="submit"
                className="site-button active font-bold"
                style={{ fontSize: 13, padding: '4px 20px' }}
              >
                Initialize Dossier &gt;&gt;
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default RegistrationPage;
