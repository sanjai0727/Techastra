import React, { useState, useEffect } from 'react';
import { useCompetition } from '../context/CompetitionContext';

interface LiveContestant {
  registrationId?: string;
  registrationCode?: string;
  name?: string;
  college?: string;
  department?: string;
  year?: string;
}

export const RegistrationPage: React.FC = () => {
  const { registerParticipant, setView } = useCompetition();

  // Mode: 'login' | 'signup'
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login form state - clean production default (no hardcoded demo pre-fill)
  const [loginToken, setLoginToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedCandidate, setVerifiedCandidate] = useState<LiveContestant | null>(null);

  // Sign-up form state
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [year, setYear] = useState('3rd Year');
  const [assignedToken, setAssignedToken] = useState('');

  // Shared state
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch stats to suggest the next slot number for on-spot signup
  useEffect(() => {
    fetch('/api/participants/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.totalRegistered === 'number') {
          const nextSlot = 36 + data.totalRegistered;
          setAssignedToken(`SYM2026-${String(nextSlot).padStart(4, '0')}`);
        }
      })
      .catch(() => {
        setAssignedToken('SYM2026-0039');
      });
  }, []);

  // Handle Token Lookup / Live Portal Verification
  const verifyToken = async (codeToVerify: string): Promise<LiveContestant | null> => {
    let cleanCode = codeToVerify.trim().toUpperCase();
    if (!cleanCode) {
      setVerifiedCandidate(null);
      setError('Please enter your Contestant Token ID (e.g. SYM2026-0036).');
      return null;
    }

    if (/^\d+$/.test(cleanCode)) {
      cleanCode = `SYM2026-${cleanCode.padStart(4, '0')}`;
      setLoginToken(cleanCode);
    }

    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch(`/api/coordinator/lookup/${encodeURIComponent(cleanCode)}`);
      const data = await res.json();

      if (data.success && data.found && data.participant) {
        const candidate: LiveContestant = {
          registrationCode: data.participant.id,
          name: data.participant.name,
          college: data.participant.college,
          department: data.participant.department || 'Computer Science and Engineering',
          year: data.participant.year || 'Senior Engineering',
        };
        setVerifiedCandidate(candidate);
        setError(null);
        return candidate;
      } else {
        setVerifiedCandidate(null);
        setError(
          `Token '${cleanCode}' was not found in the official Techastra Symposium database. ` +
          `Please check the token on your badge. If you are an on-spot registrant, switch to the 'On-Spot Sign-up' tab.`
        );
        return null;
      }
    } catch (err: any) {
      setVerifiedCandidate(null);
      setError('Unable to reach the authentication server. Please check local network connectivity.');
      return null;
    } finally {
      setIsVerifying(false);
    }
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let cleanToken = loginToken.trim().toUpperCase();
    if (!cleanToken) {
      setError('Please provide your official Contestant Token ID (e.g. SYM2026-0036).');
      return;
    }

    if (/^\d+$/.test(cleanToken)) {
      cleanToken = `SYM2026-${cleanToken.padStart(4, '0')}`;
      setLoginToken(cleanToken);
    }

    setIsSubmitting(true);
    try {
      // 1. Authenticate with backend and live Techastra website
      const res = await fetch('/api/participants/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: cleanToken }),
      });
      const data = await res.json();

      if (data.success && data.participant) {
        registerParticipant({
          fullName: data.participant.fullName || verifiedCandidate?.name || `Contestant ${cleanToken}`,
          college: data.participant.college || verifiedCandidate?.college || 'Engineering College',
          department: data.participant.department || 'Computer Science and Engineering',
          year: data.participant.year || 'Senior Engineering',
          participantId: cleanToken,
          registeredAt: Date.now(),
        });
        setView('rules');
      } else {
        setError(data.error || 'Authentication rejected by Techastra server.');
      }
    } catch (err) {
      // Offline fallback: if verifiedCandidate exists in client state, proceed
      if (verifiedCandidate) {
        registerParticipant({
          fullName: verifiedCandidate.name || `Contestant ${cleanToken}`,
          college: verifiedCandidate.college || 'Engineering College',
          department: verifiedCandidate.department || 'Computer Science and Engineering',
          year: verifiedCandidate.year || 'Senior Engineering',
          participantId: cleanToken,
          registeredAt: Date.now(),
        });
        setView('rules');
      } else {
        setError('Network error while logging in. Please verify your connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign-up handler for new on-spot contestants
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !college.trim() || !department.trim()) {
      setError('Full Name, College, and Department are strictly mandatory fields.');
      return;
    }

    let token = assignedToken.trim().toUpperCase();
    if (!token) {
      token = `SYM2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (/^\d+$/.test(token)) {
      token = `SYM2026-${token.padStart(4, '0')}`;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/participants/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          college: college.trim(),
          department: department.trim(),
          year,
          participantId: token,
        }),
      });
      const data = await res.json();

      if (data.success) {
        registerParticipant({
          fullName: fullName.trim(),
          college: college.trim(),
          department: department.trim(),
          year,
          participantId: data.participant?.id || token,
          registeredAt: Date.now(),
        });
        setView('rules');
      } else {
        setError(data.error || 'Failed to register on-spot contestant.');
      }
    } catch (err) {
      // Local fallback
      registerParticipant({
        fullName: fullName.trim(),
        college: college.trim(),
        department: department.trim(),
        year,
        participantId: token,
        registeredAt: Date.now(),
      });
      setView('rules');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl xl:max-w-6xl mx-auto my-2 sm:my-3 px-2 sm:px-4 select-none text-black font-sans text-sm">
      <div className="win95-dialog-frame shadow-md">
        {/* Titlebar */}
        <div className="bg-[#000080] text-white px-2.5 py-1.5 flex items-center justify-between font-bold text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <span>🛡️</span>
            <span>Contestant Authentication &amp; Onboarding — Techastra 2026</span>
          </div>
          <button
            onClick={() => setView('welcome')}
            className="site-button"
            style={{ padding: '0 5px', height: 18, fontSize: 11, lineHeight: '14px' }}
            title="Return to Welcome Screen"
          >
            ✕
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-3 sm:p-5 space-y-3.5 sm:space-y-4 bg-[#c0c0c0]">
          {/* Official Institutional Banner */}
          <div className="bg-white p-3 sm:p-4 border-2 border-[#808080] border-t-black border-l-black flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <img
                src="./mgr_university_logo.png"
                alt="Dr. M.G.R. University"
                className="h-11 sm:h-14 object-contain"
              />
              <div>
                <div className="font-bold text-[#000080] text-sm sm:text-base">Dr. M.G.R. EDUCATIONAL AND RESEARCH INSTITUTE</div>
                <div className="text-xs sm:text-sm text-gray-700"><b>Dept. of Computer Science &amp; Engineering</b> &bull; <b>Dept. of Cyber Security</b></div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 bg-[#e0ffe0] border border-[#008000] px-2.5 py-1 rounded text-xs sm:text-sm text-[#006000] font-mono font-bold">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-600 animate-pulse"></span>
                PORTAL SYNC: LIVE
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Win95 tab bar style) */}
          <div className="flex items-end gap-1.5 border-b-2 border-[#808080] pt-1">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(null); }}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 font-bold text-xs sm:text-base border-t-2 border-l-2 border-r-2 ${
                activeTab === 'login'
                  ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-black border-b-0 -mb-[2px] z-10 text-black'
                  : 'bg-[#a0a0a0] border-[#606060] text-gray-700'
              }`}
            >
              🔑 Contestant Login (Pre-Registered)
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('signup'); setError(null); }}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 font-bold text-xs sm:text-base border-t-2 border-l-2 border-r-2 ${
                activeTab === 'signup'
                  ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-black border-b-0 -mb-[2px] z-10 text-black'
                  : 'bg-[#a0a0a0] border-[#606060] text-gray-700'
              }`}
            >
              ✍️ On-Spot Sign-up (New Contestant)
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="win95-sunken p-3 bg-[#fff0f0] text-red-800 font-bold text-xs sm:text-sm flex items-center gap-2 border border-red-500">
              <span className="text-lg">⚠️</span>
              <span>[AUTHENTICATION NOTICE] {error}</span>
            </div>
          )}

          {/* TAB 1: LOGIN WITH OFFICIAL TOKEN */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              {/* Institutional Directive Notice */}
              <div className="win95-sunken p-3 bg-[#f5f5f5] text-xs sm:text-sm text-gray-800 space-y-1">
                <div className="font-bold text-[#000080] text-sm sm:text-base">
                  Official Symposium Registration Authentication Directive:
                </div>
                <div className="leading-relaxed">
                  Please enter the <b>Contestant Token ID</b> issued on your official Techastra 2026 Registration Badge or Confirmation Slip (Format: <code>SYM2026-XXXX</code>).
                  Your identity is authenticated live against the Dr. M.G.R. Educational and Research Institute event portal.
                </div>
              </div>

              {/* Token Input Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <fieldset className="win95-fieldset">
                  <legend className="win95-legend font-bold text-sm sm:text-base text-[#000080]">
                    Contestant Token Authentication Gateway
                  </legend>
                  <div className="p-3.5 sm:p-4 space-y-3.5">
                    <div>
                      <label className="block font-bold text-xs sm:text-base mb-1.5 text-gray-800">
                        Enter Contestant Token ID (Format: SYM2026-XXXX): <span className="text-red-700">*</span>
                      </label>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="text"
                          placeholder="e.g. SYM2026-0036"
                          value={loginToken}
                          onChange={(e) => {
                            setLoginToken(e.target.value);
                            if (verifiedCandidate && verifiedCandidate.registrationCode !== e.target.value.toUpperCase()) {
                              setVerifiedCandidate(null);
                            }
                          }}
                          className="site-input font-mono font-bold text-sm sm:text-lg tracking-wider flex-1 py-2 sm:py-2.5 px-3"
                          style={{ textTransform: 'uppercase' }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => verifyToken(loginToken)}
                          disabled={isVerifying || !loginToken.trim()}
                          className="site-button"
                          style={{ height: 42, fontSize: 14, padding: '0 20px', fontWeight: 'bold' }}
                        >
                          {isVerifying ? 'Verifying...' : '🔍 Verify Token'}
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1.5">
                        Tip: You can also enter just your token digits (e.g. <b>36</b> or <b>0036</b>), and it will automatically format as <b>SYM2026-0036</b>.
                      </p>
                    </div>

                    {/* Verified Candidate Card Preview */}
                    {verifiedCandidate && (
                      <div className="win95-sunken p-3.5 sm:p-4 bg-[#f0fff0] border-2 border-[#008000] text-black shadow-inner space-y-2.5">
                        <div className="flex items-center justify-between border-b border-[#a0c0a0] pb-2 mb-2">
                          <span className="font-bold text-sm sm:text-base text-[#006000] flex items-center gap-1.5">
                            <span>✓</span> Official Portal Verified Candidate
                          </span>
                          <span className="font-mono text-sm sm:text-base font-bold text-[#000080] bg-white px-2.5 py-0.5 border border-[#808080]">
                            {verifiedCandidate.registrationCode}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                          <div>
                            <span className="text-gray-600 text-xs sm:text-sm block">Candidate Full Name:</span>
                            <span className="font-bold text-base sm:text-lg text-gray-900">{verifiedCandidate.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 text-xs sm:text-sm block">Institution / College:</span>
                            <span className="font-bold text-sm sm:text-base text-gray-900">{verifiedCandidate.college}</span>
                          </div>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-[#b0d0b0] text-xs sm:text-sm text-gray-700 flex flex-wrap items-center justify-between gap-1">
                          <span>Venue: <b>IBM Lab</b> • Day 1 (Oct 8, 2026)</span>
                          <span className="text-[#008000] font-bold font-mono">
                            ● AUTHENTICATED WITH TECHASTRA PORTAL
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </fieldset>

                {/* Submit Action */}
                <div className="flex items-center justify-between pt-2 border-t border-[#808080]">
                  <button
                    type="button"
                    onClick={() => setView('welcome')}
                    className="site-button"
                    style={{ fontSize: 14, padding: '7px 20px', fontWeight: 'bold' }}
                  >
                    &lt; Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !loginToken.trim()}
                    className="site-button active font-bold text-white bg-[#000080]"
                    style={{ fontSize: 15, padding: '9px 28px' }}
                  >
                    {isSubmitting ? 'Authenticating...' : '▶ Enter Arena with Verified Token >>'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: ON-SPOT REGISTRATION */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              <fieldset className="win95-fieldset">
                <legend className="win95-legend font-bold text-xs sm:text-sm text-[#000080]">
                  On-Spot Contestant Registration Form
                </legend>
                <div className="p-3 space-y-3">
                  <p className="text-xs sm:text-[13px] text-gray-800 pb-1.5 border-b border-[#808080]">
                    Register a new participant directly into the Code Rescue tournament roster. A unique <b>SYM2026-XXXX</b> token will be allocated.
                  </p>

                  {/* Full Name */}
                  <div>
                    <label className="block font-bold text-xs sm:text-sm mb-1 text-gray-800">
                      Full Name: <span className="text-red-700">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Arunkumar R"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="site-input py-1.5 px-2 text-sm"
                      required
                    />
                  </div>

                  {/* College */}
                  <div>
                    <label className="block font-bold text-xs sm:text-sm mb-1 text-gray-800">
                      College / Institution: <span className="text-red-700">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. M.G.R. Educational and Research Institute"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="site-input py-1.5 px-2 text-sm"
                      required
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block font-bold text-xs sm:text-sm mb-1 text-gray-800">
                      Department / Major: <span className="text-red-700">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science and Engineering"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="site-input py-1.5 px-2 text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Year */}
                    <div>
                      <label className="block font-bold text-xs sm:text-sm mb-1 text-gray-800">
                        Academic Year:
                      </label>
                      <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="site-input"
                        style={{ height: 32, fontSize: 13 }}
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="PG / Other">PG / Other</option>
                      </select>
                    </div>

                    {/* Assigned Token */}
                    <div>
                      <label className="block font-bold text-xs sm:text-sm mb-1 text-gray-800">
                        Allocated Contestant Token:
                      </label>
                      <input
                        type="text"
                        placeholder="SYM2026-0039"
                        value={assignedToken}
                        onChange={(e) => setAssignedToken(e.target.value.toUpperCase())}
                        className="site-input font-mono font-bold text-xs sm:text-sm py-1.5 px-2"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Submit Action */}
              <div className="flex items-center justify-between pt-2 border-t border-[#808080]">
                <button
                  type="button"
                  onClick={() => setView('welcome')}
                  className="site-button"
                  style={{ fontSize: 13, padding: '5px 16px', fontWeight: 'bold' }}
                >
                  &lt; Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="site-button active font-bold text-white bg-[#000080]"
                  style={{ fontSize: 14, padding: '7px 24px' }}
                >
                  {isSubmitting ? 'Registering...' : '✍️ Complete Registration & Enter Arena >>'}
                </button>
              </div>
            </form>
          )}

          {/* Footer Notice */}
          <div className="p-1.5 bg-[#e0e0e0] border border-[#808080] text-[10px] text-gray-700 flex items-center justify-between">
            <span>Official Event: <b>Code Rescue (IBM Lab)</b> • Dept. of CSE &amp; Dept. of Cyber Security • Coordinator: coderescue@techastra.drmgrdu.ac.in</span>
            <span className="font-mono text-gray-600">ID SPEC: SYM2026-XXXX</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
