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

  // Login form state
  const [loginToken, setLoginToken] = useState('SYM2026-0036');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedCandidate, setVerifiedCandidate] = useState<LiveContestant | null>(null);

  // Sign-up form state
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [year, setYear] = useState('3rd Year');
  const [assignedToken, setAssignedToken] = useState('SYM2026-0038');

  // Shared state
  const [error, setError] = useState<string | null>(null);
  const [liveRoster, setLiveRoster] = useState<LiveContestant[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch live roster from official portal on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoadingRoster(true);

    fetch('/api/coordinator/roster')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.roster)) {
          setLiveRoster(data.roster);
          // If first item exists and loginToken is empty or default, pre-verify
          const defaultCandidate = data.roster.find(
            (c: LiveContestant) => c.registrationCode === 'SYM2026-0036'
          ) || data.roster[0];

          if (defaultCandidate) {
            setVerifiedCandidate(defaultCandidate);
            if (defaultCandidate.registrationCode) {
              setLoginToken(defaultCandidate.registrationCode);
            }
          }

          // Suggest next token for on-spot signup based on highest token number
          let maxNum = 37;
          data.roster.forEach((c: LiveContestant) => {
            const code = c.registrationCode || '';
            const match = code.match(/(\d+)$/);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxNum) maxNum = num;
            }
          });
          setAssignedToken(`SYM2026-${String(maxNum + 1).padStart(4, '0')}`);
        }
      })
      .catch((err) => {
        console.error('[Registration] Failed to load live roster:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingRoster(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Token Lookup / Verification
  const verifyToken = async (codeToVerify: string) => {
    let cleanCode = codeToVerify.trim().toUpperCase();
    if (!cleanCode) {
      setVerifiedCandidate(null);
      return;
    }

    if (/^\d+$/.test(cleanCode)) {
      cleanCode = `SYM2026-${cleanCode.padStart(4, '0')}`;
      setLoginToken(cleanCode);
    }

    // Check in local liveRoster first
    const localMatch = liveRoster.find(
      (c) => (c.registrationCode && c.registrationCode.toUpperCase() === cleanCode) ||
             (c.registrationId && c.registrationId.toUpperCase() === cleanCode)
    );

    if (localMatch) {
      setVerifiedCandidate(localMatch);
      setError(null);
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch(`/api/coordinator/lookup/${encodeURIComponent(cleanCode)}`);
      const data = await res.json();
      if (data.success && data.found && data.participant) {
        setVerifiedCandidate({
          registrationCode: data.participant.id,
          name: data.participant.name,
          college: data.participant.college,
          department: data.participant.department || 'Computer Science and Engineering',
          year: data.participant.year || 'Senior Engineering',
        });
        setError(null);
      } else {
        setVerifiedCandidate(null);
        setError(`Token '${cleanCode}' was not found in the official Techastra roster. If you are a walk-in contestant, switch to the "On-Spot Sign-up" tab.`);
      }
    } catch (err: any) {
      setVerifiedCandidate(null);
      setError('Verification service unavailable. Check connection to coordinator server.');
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
    }

    setIsSubmitting(true);
    try {
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
          year: data.participant.year || '3rd Year',
          participantId: cleanToken,
          registeredAt: Date.now(),
        });
        setView('rules');
      } else {
        setError(data.error || 'Login verification failed.');
      }
    } catch (err) {
      // Offline fallback: if verifiedCandidate exists in client state, proceed
      if (verifiedCandidate) {
        registerParticipant({
          fullName: verifiedCandidate.name || `Contestant ${cleanToken}`,
          college: verifiedCandidate.college || 'Engineering College',
          department: verifiedCandidate.department || 'Computer Science and Engineering',
          year: verifiedCandidate.year || '3rd Year',
          participantId: cleanToken,
          registeredAt: Date.now(),
        });
        setView('rules');
      } else {
        setError('Network error while logging in. Please retry.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign-up handler
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

  const handleSelectRosterItem = (c: LiveContestant) => {
    const code = c.registrationCode || '';
    setLoginToken(code);
    setVerifiedCandidate(c);
    setError(null);
  };

  const handleQuickDemoFill = () => {
    setActiveTab('login');
    setLoginToken('SYM2026-0036');
    verifyToken('SYM2026-0036');
  };

  return (
    <div className="max-w-2xl mx-auto my-3 select-none text-black font-sans text-xs">
      <div className="win95-dialog-frame">
        {/* Titlebar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
          <div className="flex items-center gap-1.5">
            <span>🛡️</span>
            <span>Contestant Authentication & Onboarding — Techastra 2026</span>
          </div>
          <button
            onClick={() => setView('welcome')}
            className="site-button"
            style={{ padding: '0 4px', height: 16, fontSize: 10, lineHeight: '12px' }}
            title="Return to Welcome Screen"
          >
            ✕
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-3 space-y-3 bg-[#c0c0c0]">
          {/* Official Institutional Banner */}
          <div className="bg-white p-2 border-2 border-[#808080] border-t-black border-l-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="./mgr_university_logo.png"
                alt="Dr. M.G.R. University"
                className="h-9 object-contain"
              />
              <div>
                <div className="font-bold text-[#000080] text-xs">Dr. M.G.R. EDUCATIONAL AND RESEARCH INSTITUTE</div>
                <div className="text-[10px] text-gray-600">Event Coordinator Gateway • Code Rescue Arena</div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1 bg-[#e0ffe0] border border-[#008000] px-1.5 py-0.5 rounded text-[10px] text-[#006000] font-mono font-bold">
                <span className="inline-block w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                PORTAL SYNC: LIVE
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Win95 tab bar style) */}
          <div className="flex items-end gap-1 border-b-2 border-[#808080] pt-1">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(null); }}
              className={`px-3 py-1.5 font-bold text-xs border-t-2 border-l-2 border-r-2 ${
                activeTab === 'login'
                  ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-black border-b-0 -mb-[2px] z-10'
                  : 'bg-[#a0a0a0] border-[#606060] text-gray-700'
              }`}
            >
              🔑 Contestant Login (Pre-Registered)
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('signup'); setError(null); }}
              className={`px-3 py-1.5 font-bold text-xs border-t-2 border-l-2 border-r-2 ${
                activeTab === 'signup'
                  ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-black border-b-0 -mb-[2px] z-10'
                  : 'bg-[#a0a0a0] border-[#606060] text-gray-700'
              }`}
            >
              ✍️ On-Spot Sign-up (New Contestant)
            </button>
            <div className="ml-auto pb-1">
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="site-button"
                style={{ fontSize: 10, padding: '2px 6px' }}
              >
                [⚡ Fast-Track Demo (SYM2026-0036) ]
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="win95-sunken p-2 bg-[#fff0f0] text-red-800 font-bold text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>[AUTHENTICATION ERROR] {error}</span>
            </div>
          )}

          {/* TAB 1: LOGIN WITH OFFICIAL TOKEN */}
          {activeTab === 'login' && (
            <div className="space-y-3">
              {/* Live Official Contestants Quick Selection */}
              <fieldset className="win95-fieldset">
                <legend className="win95-legend font-bold text-[#000080]">
                  Official Techastra Coordinator Roster ({liveRoster.length} Pre-Registered Contestants)
                </legend>
                <div className="p-2 space-y-2 bg-[#d8d8d8]">
                  <p className="text-[11px] text-gray-700">
                    Contestants registered via <b>https://techastra.drmgrdu.ac.in/coordinator</b> for Code Rescue:
                  </p>

                  {isLoadingRoster ? (
                    <div className="text-[11px] font-mono text-gray-600 animate-pulse">
                      Contacting Techastra portal at techastra.drmgrdu.ac.in...
                    </div>
                  ) : liveRoster.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {liveRoster.map((c) => {
                        const isSelected = verifiedCandidate?.registrationCode === c.registrationCode;
                        return (
                          <button
                            key={c.registrationId || c.registrationCode}
                            type="button"
                            onClick={() => handleSelectRosterItem(c)}
                            className={`text-left p-1.5 text-xs transition-colors border ${
                              isSelected
                                ? 'bg-[#000080] text-white border-black font-bold'
                                : 'bg-white text-black border-[#808080] hover:bg-[#e8f0fe]'
                            }`}
                          >
                            <div className="flex items-center justify-between font-mono text-[11px]">
                              <span>{c.registrationCode}</span>
                              <span className={`text-[9px] px-1 rounded ${isSelected ? 'bg-white text-[#000080]' : 'bg-[#e0ffe0] text-[#006000]'}`}>
                                VERIFIED
                              </span>
                            </div>
                            <div className="truncate font-sans font-bold text-xs">{c.name}</div>
                            <div className={`truncate text-[10px] ${isSelected ? 'text-gray-200' : 'text-gray-600'}`}>
                              {c.college}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-600 italic">
                      No contestants found in roster cache. Enter your token below.
                    </div>
                  )}
                </div>
              </fieldset>

              {/* Token Input Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <fieldset className="win95-fieldset">
                  <legend className="win95-legend font-bold">Contestant Token Authentication</legend>
                  <div className="p-2 space-y-2.5">
                    <div>
                      <label className="block font-bold text-[11px] mb-1 text-gray-800">
                        Enter Contestant Token (Format: SYM2026-XXXX): <span className="text-red-700">*</span>
                      </label>
                      <div className="flex items-center gap-2">
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
                          className="site-input font-mono font-bold text-sm tracking-wider flex-1"
                          style={{ textTransform: 'uppercase' }}
                        />
                        <button
                          type="button"
                          onClick={() => verifyToken(loginToken)}
                          disabled={isVerifying || !loginToken.trim()}
                          className="site-button"
                          style={{ height: 26, fontSize: 11, padding: '0 12px', fontWeight: 'bold' }}
                        >
                          {isVerifying ? 'Checking...' : '🔍 Verify Token'}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-600 mt-0.5">
                        Tip: You can also enter just the digits (e.g. <b>36</b> or <b>0036</b>), and it will automatically prefix <b>SYM2026-</b>.
                      </p>
                    </div>

                    {/* Verified Candidate Card Preview */}
                    {verifiedCandidate && (
                      <div className="win95-sunken p-2.5 bg-[#f0fff0] border border-[#008000] text-black">
                        <div className="flex items-center justify-between border-b border-[#a0c0a0] pb-1 mb-1.5">
                          <span className="font-bold text-xs text-[#006000]">
                            ✓ Official Portal Verified Candidate
                          </span>
                          <span className="font-mono text-[11px] font-bold text-[#000080]">
                            {verifiedCandidate.registrationCode}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600 text-[10px] block">Full Name:</span>
                            <span className="font-bold text-sm">{verifiedCandidate.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 text-[10px] block">Institution / College:</span>
                            <span className="font-bold">{verifiedCandidate.college}</span>
                          </div>
                        </div>
                        <div className="mt-1.5 pt-1 border-t border-[#b0d0b0] text-[10px] text-gray-600 flex items-center justify-between">
                          <span>Venue: <b>IBM Lab</b> • Day 1 (Oct 8, 2026)</span>
                          <span className="text-[#008000] font-bold">READY TO INITIALIZE DOSSIER</span>
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
                    style={{ fontSize: 12, padding: '3px 14px' }}
                  >
                    &lt; Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="site-button active font-bold text-white bg-[#000080]"
                    style={{ fontSize: 13, padding: '5px 22px' }}
                  >
                    {isSubmitting ? 'Authenticating...' : '▶ Enter Arena with Verified Token >>'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: ON-SPOT REGISTRATION */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              <fieldset className="win95-fieldset">
                <legend className="win95-legend font-bold">On-Spot Contestant Registration Form</legend>
                <div className="p-2 space-y-2">
                  <p className="text-[11px] text-gray-700 pb-1 border-b border-[#808080]">
                    Register a new participant directly into the Code Rescue tournament roster. A unique <b>SYM2026-XXXX</b> token will be allocated.
                  </p>

                  {/* Full Name */}
                  <div>
                    <label className="block font-bold text-[11px] mb-0.5 text-gray-800">
                      Full Name: <span className="text-red-700">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Arunkumar R"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="site-input"
                      required
                    />
                  </div>

                  {/* College */}
                  <div>
                    <label className="block font-bold text-[11px] mb-0.5 text-gray-800">
                      College / Institution: <span className="text-red-700">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. M.G.R. Educational and Research Institute"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="site-input"
                      required
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
                      required
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

                    {/* Assigned Token */}
                    <div>
                      <label className="block font-bold text-[11px] mb-0.5 text-gray-800">
                        Allocated Contestant Token:
                      </label>
                      <input
                        type="text"
                        placeholder="SYM2026-0038"
                        value={assignedToken}
                        onChange={(e) => setAssignedToken(e.target.value.toUpperCase())}
                        className="site-input font-mono font-bold text-xs"
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
                  style={{ fontSize: 12, padding: '3px 14px' }}
                >
                  &lt; Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="site-button active font-bold text-white bg-[#000080]"
                  style={{ fontSize: 13, padding: '5px 22px' }}
                >
                  {isSubmitting ? 'Registering...' : '✍️ Complete Registration & Enter Arena >>'}
                </button>
              </div>
            </form>
          )}

          {/* Footer Notice */}
          <div className="p-1.5 bg-[#e0e0e0] border border-[#808080] text-[10px] text-gray-700 flex items-center justify-between">
            <span>Official Event: <b>Code Rescue (IBM Lab)</b> • Coordinator: coderescue@techastra.drmgrdu.ac.in</span>
            <span className="font-mono text-gray-600">ID SPEC: SYM2026-XXXX</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
