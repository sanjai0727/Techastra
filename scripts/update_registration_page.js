const fs = require('fs');

const regCode = `import React, { useState } from 'react';
import { useCompetition } from '../context/CompetitionContext';
import { Participant } from '../types/competition';
import { UserCheck, Building, GraduationCap, Calendar, Hash, ArrowRight, ArrowLeft, Shield } from 'lucide-react';

export const RegistrationPage: React.FC = () => {
  const { state, registerParticipant, setView } = useCompetition();

  const [fullName, setFullName] = useState(state.participant?.fullName || '');
  const [college, setCollege] = useState(state.participant?.college || '');
  const [department, setDepartment] = useState(state.participant?.department || '');
  const [year, setYear] = useState(state.participant?.year || '3rd Year');
  const [participantId] = useState(
    state.participant?.participantId || \`CR-\${String(Math.floor(1 + Math.random() * 999)).padStart(4, '0')}\`
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!college.trim()) {
      setError('Please enter your college or institution.');
      return;
    }
    if (!department.trim()) {
      setError('Please enter your department or major.');
      return;
    }

    const participant: Participant = {
      fullName: fullName.trim(),
      college: college.trim(),
      department: department.trim(),
      year,
      participantId: participantId.trim(),
      registeredAt: Date.now()
    };

    registerParticipant(participant);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#0d1322] border border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setView('welcome')}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
              <Shield className="w-3.5 h-3.5" />
              <span>Official Contest Pass</span>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-white pt-2">
            Participant Registration
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Enter your contestant details to activate your competition station and telemetry tracking.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Full Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full Name <span className="text-rose-400">*</span></span>
            </label>
            <input
              type="text"
              placeholder="e.g. Sanjai Kumar"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>

          {/* College / Institution */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              <span>College / University / Institution <span className="text-rose-400">*</span></span>
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. M.G.R. Educational and Research Institute"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Department / Major <span className="text-rose-400">*</span></span>
            </label>
            <input
              type="text"
              placeholder="e.g. Computer Science and Engineering"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>

          {/* Year & Participant ID Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Academic Year</span>
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior)</option>
                <option value="4th Year">4th Year (Senior)</option>
                <option value="Post-Graduate">Post-Graduate</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span>Assigned Participant ID</span>
              </label>
              <input
                type="text"
                value={participantId}
                readOnly
                title="Authoritative Participant ID assigned by event coordinators"
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 font-mono font-bold focus:outline-none cursor-not-allowed opacity-90"
              />
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-cyan-500/25 transition-all"
            >
              <span>Confirm & Continue to Instructions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('E:/projects/techastra-coderescue/src/pages/RegistrationPage.tsx', regCode, 'utf8');
console.log('Successfully updated RegistrationPage.tsx');
