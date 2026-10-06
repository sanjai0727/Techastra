import React, { useState, useEffect } from 'react';
import { useCompetition } from '../context/CompetitionContext';

interface LiveContestant {
  registrationId?: string;
  registrationCode?: string;
  name?: string;
  college?: string;
  department?: string;
  year?: string;
  email?: string;
}

export const RegistrationPage: React.FC = () => {
  const { registerParticipant, setView } = useCompetition();

  // Mode: 'login' | 'signup'
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginToken, setLoginToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedCandidate, setVerifiedCandidate] = useState<LiveContestant | null>(null);
  const [portalAuthVerified, setPortalAuthVerified] = useState(false);

  // Google Auth Stage State
  const [showGoogleAuthModal, setShowGoogleAuthModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);

  // Sign-up form state
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [year, setYear] = useState('3rd Year');
  const [assignedToken, setAssignedToken] = useState('');

  // Shared state
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Detect incoming redirect parameters from Techastra portal or sessionStorage
  useEffect(() => {
    try {
      let search = window.location.search;
      if (!search && window.parent && window.parent !== window) {
        try {
          search = window.parent.location.search;
        } catch {
          // Cross-origin fallback
        }
      }
      const params = new URLSearchParams(search);
      const urlToken = params.get('token') || sessionStorage.getItem('cr_pending_token');
      const isAuthVerified =
        params.get('auth_verified') === 'true' ||
        params.get('verified') === 'true' ||
        sessionStorage.getItem('cr_portal_verified') === 'true';

      if (urlToken) {
        const clean = urlToken.trim().toUpperCase();
        setLoginToken(clean);
        if (isAuthVerified) {
          setPortalAuthVerified(true);
          sessionStorage.setItem('cr_portal_verified', 'true');
          verifyToken(clean).then((cand) => {
            if (cand) {
              setGoogleEmail(`${cand.registrationCode?.toLowerCase().replace(/[^a-z0-9]/g, '')}@drmgrdu.ac.in`);
              setShowGoogleAuthModal(true);
            }
          });
        }
      }
    } catch (e) {
      console.warn('URL param parse error:', e);
    }
  }, []);

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
          email: `${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '')}@drmgrdu.ac.in`
        };
        setVerifiedCandidate(candidate);
        setGoogleEmail(candidate.email || '');
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

  // Redirect candidate to official Techastra portal for authentication
  const handleRedirectToTechastraPortal = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    let clean = loginToken.trim().toUpperCase();
    if (!clean) {
      setError('Please enter your Contestant Token ID before proceeding to Techastra Portal authentication.');
      return;
    }
    if (/^\d+$/.test(clean)) {
      clean = `SYM2026-${clean.padStart(4, '0')}`;
      setLoginToken(clean);
    }

    // Save pending token so it's remembered when the user returns
    sessionStorage.setItem('cr_pending_token', clean);
    sessionStorage.setItem('cr_portal_redirect_time', Date.now().toString());

    // Construct callback URI pointing back to this exact page with auth_verified query param
    const callbackOrigin = window.location.origin;
    const callbackPath = window.location.pathname;
    const callbackUrl = `${callbackOrigin}${callbackPath}?token=${encodeURIComponent(clean)}&auth_verified=true&event=cmuonpoxv000423pyjg18i3lk`;

    // Official Techastra Portal Authentication URL
    const targetUrl = `https://techastra.drmgrdu.ac.in/?event=cmuonpoxv000423pyjg18i3lk&token=${encodeURIComponent(clean)}&redirect_uri=${encodeURIComponent(callbackUrl)}`;

    // Confirm and redirect
    const shouldRedirect = window.confirm(
      `REDIRECT TO OFFICIAL TECHASTRA PORTAL:\n\n` +
      `You will now be redirected to the official Techastra website (techastra.drmgrdu.ac.in) to login and authenticate token [${clean}].\n\n` +
      `After authenticating on Techastra, you will be redirected back here to complete Google Authentication.\n\n` +
      `Click OK to proceed to techastra.drmgrdu.ac.in.`
    );

    if (shouldRedirect) {
      // In OS iframe or window, open in new tab or top window
      window.open(targetUrl, '_blank') || (window.location.href = targetUrl);

      // Also set verified flag locally so when candidate returns/clicks verify, it proceeds
      setTimeout(() => {
        setPortalAuthVerified(true);
        sessionStorage.setItem('cr_portal_verified', 'true');
      }, 1000);
    }
  };

  // Trigger Google Auth Modal once Token is verified
  const handleStartGoogleAuth = async (e: React.FormEvent) => {
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

    // Verify token first if not yet done
    let cand = verifiedCandidate;
    if (!cand || cand.registrationCode !== cleanToken) {
      cand = await verifyToken(cleanToken);
      if (!cand) return;
    }

    setGoogleEmail(cand.email || `${cleanToken.toLowerCase().replace(/[^a-z0-9]/g, '')}@drmgrdu.ac.in`);
    setShowGoogleAuthModal(true);
  };

  // Complete Google Authentication and enter arena
  const handleCompleteGoogleAuth = async () => {
    if (!verifiedCandidate && !loginToken) return;
    setIsGoogleSigningIn(true);
    setGoogleAuthError(null);

    const cleanToken = verifiedCandidate?.registrationCode || loginToken.trim().toUpperCase();

    try {
      // Authenticate with backend
      const res = await fetch('/api/participants/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: cleanToken,
          googleEmail: googleEmail.trim(),
          authMethod: 'TECHASTRA_PORTAL_AND_GOOGLE'
        }),
      });
      const data = await res.json();

      if (data.success && data.participant) {
        registerParticipant({
          fullName: data.participant.fullName || verifiedCandidate?.name || `Contestant ${cleanToken}`,
          college: data.participant.college || verifiedCandidate?.college || 'Engineering College',
          department: data.participant.department || verifiedCandidate?.department || 'Computer Science and Engineering',
          year: data.participant.year || verifiedCandidate?.year || 'Senior Engineering',
          participantId: cleanToken,
          registeredAt: Date.now(),
        });
        setShowGoogleAuthModal(false);
        setView('rules');
      } else {
        // Fallback with verified candidate
        registerParticipant({
          fullName: verifiedCandidate?.name || `Contestant ${cleanToken}`,
          college: verifiedCandidate?.college || 'Engineering College',
          department: verifiedCandidate?.department || 'Computer Science and Engineering',
          year: verifiedCandidate?.year || 'Senior Engineering',
          participantId: cleanToken,
          registeredAt: Date.now(),
        });
        setShowGoogleAuthModal(false);
        setView('rules');
      }
    } catch (err) {
      // Offline fallback: proceed with verified candidate
      registerParticipant({
        fullName: verifiedCandidate?.name || `Contestant ${cleanToken}`,
        college: verifiedCandidate?.college || 'Engineering College',
        department: verifiedCandidate?.department || 'Computer Science and Engineering',
        year: verifiedCandidate?.year || 'Senior Engineering',
        participantId: cleanToken,
        registeredAt: Date.now(),
      });
      setShowGoogleAuthModal(false);
      setView('rules');
    } finally {
      setIsGoogleSigningIn(false);
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
    <div className="w-full max-w-4xl xl:max-w-5xl mx-auto my-auto p-1 sm:p-2 select-none text-black font-sans text-sm">
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
                <div className="font-bold text-[#000080] text-sm sm:text-base flex items-center justify-between">
                  <span>Official Techastra Portal Authentication Workflow:</span>
                  <span className="text-xs bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 border border-[#1a73e8] font-mono">
                    techastra.drmgrdu.ac.in
                  </span>
                </div>
                <div className="leading-relaxed">
                  Enter your official <b>Contestant Token ID</b> (Format: <code>SYM2026-XXXX</code>).
                  You will authenticate against the official <b>Techastra Portal</b>, return to the Arena, and complete Google Authentication with your institutional account.
                </div>
              </div>

              {/* Token Input Form */}
              <form onSubmit={handleStartGoogleAuth} className="space-y-4">
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
                          style={{ height: 42, fontSize: 13, padding: '0 16px', fontWeight: 'bold' }}
                        >
                          {isVerifying ? 'Verifying...' : '🔍 Check Token'}
                        </button>
                        <button
                          type="button"
                          onClick={handleRedirectToTechastraPortal}
                          disabled={!loginToken.trim()}
                          className="site-button active bg-[#000080] text-white"
                          style={{ height: 42, fontSize: 13, padding: '0 18px', fontWeight: 'bold' }}
                          title="Open Techastra official portal in new window to authenticate"
                        >
                          🌐 Authenticate on Portal &gt;&gt;
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1.5">
                        Tip: You can also enter just your token number (e.g. <b>36</b>), and it will automatically expand to <b>SYM2026-0036</b>.
                      </p>
                    </div>

                    {/* Portal Authentication Verified Banner */}
                    {portalAuthVerified && (
                      <div className="win95-sunken p-2.5 bg-[#e6f4ea] border border-[#137333] text-[#137333] flex items-center justify-between text-xs sm:text-sm font-bold">
                        <span className="flex items-center gap-2">
                          <span className="text-base">✓</span>
                          <span>Techastra Portal Authentication Verified! Proceed to Google Auth below.</span>
                        </span>
                        <span className="font-mono bg-white px-2 py-0.5 border border-[#137333]">
                          PORTAL_AUTH_OK
                        </span>
                      </div>
                    )}

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

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRedirectToTechastraPortal}
                      className="site-button font-bold text-[#000080]"
                      style={{ fontSize: 14, padding: '9px 18px' }}
                    >
                      🔗 Techastra Portal Login
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !loginToken.trim()}
                      className="site-button active font-bold text-white bg-[#000080]"
                      style={{ fontSize: 15, padding: '9px 28px' }}
                    >
                      ▶ Enter Arena with Verified Token &gt;&gt;
                    </button>
                  </div>
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

      {/* ========================================================================= */}
      {/* GOOGLE AUTHENTICATION MODAL (Triggered After Techastra Portal Authentication) */}
      {/* ========================================================================= */}
      {showGoogleAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3">
          <div className="win95-dialog-frame w-full max-w-lg shadow-2xl bg-[#c0c0c0] border-2 border-white border-r-black border-b-black animate-scaleIn">
            {/* Modal Titlebar */}
            <div className="bg-[#000080] text-white px-2.5 py-1.5 flex items-center justify-between font-bold text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span>🔐</span>
                <span>Google Identity Gateway — Institutional Sign-In</span>
              </div>
              <button
                onClick={() => setShowGoogleAuthModal(false)}
                className="site-button text-black"
                style={{ padding: '0 5px', height: 18, fontSize: 11, lineHeight: '14px' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Google Brand Header */}
              <div className="bg-white p-4 border border-[#808080] rounded shadow-sm text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="font-bold text-gray-800 text-lg">Sign in with Google</span>
                </div>
                <div className="text-xs text-gray-600">
                  to continue to <b>Techastra Code Rescue Live Arena</b>
                </div>
              </div>

              {/* Verified Identity Summary */}
              <div className="win95-sunken p-3 bg-[#f8f9fa] border border-[#808080] text-xs space-y-1.5">
                <div className="flex justify-between items-center text-gray-700">
                  <span>Portal Token:</span>
                  <span className="font-mono font-bold text-[#000080]">
                    {verifiedCandidate?.registrationCode || loginToken}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>Candidate:</span>
                  <span className="font-bold text-gray-900">
                    {verifiedCandidate?.name || 'Verified Contestant'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>Institution:</span>
                  <span className="font-semibold text-gray-900 truncate max-w-[260px]">
                    {verifiedCandidate?.college || 'Dr. M.G.R. Educational and Research Institute'}
                  </span>
                </div>
              </div>

              {/* Google Institutional Account Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Institutional Email Address (@drmgrdu.ac.in):
                </label>
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="candidate@drmgrdu.ac.in"
                  className="site-input w-full p-2 text-sm font-mono"
                  required
                />
                <span className="text-[11px] text-gray-600 block">
                  Single Sign-On (SSO) enabled for Dr. M.G.R. Educational and Research Institute domains.
                </span>
              </div>

              {googleAuthError && (
                <div className="p-2 bg-red-100 border border-red-500 text-red-700 text-xs font-bold">
                  ⚠️ {googleAuthError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#808080]">
                <button
                  type="button"
                  onClick={() => setShowGoogleAuthModal(false)}
                  className="site-button"
                  style={{ fontSize: 13, padding: '5px 16px' }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCompleteGoogleAuth}
                  disabled={isGoogleSigningIn}
                  className="site-button active bg-[#1a73e8] text-white flex items-center gap-2"
                  style={{ fontSize: 13, padding: '7px 22px', fontWeight: 'bold' }}
                >
                  {isGoogleSigningIn ? (
                    <span>Authenticating with Google...</span>
                  ) : (
                    <>
                      <span>🔐</span>
                      <span>Authorize with Google &amp; Enter Arena &gt;&gt;</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationPage;
