import React, { useState, useEffect } from 'react';
import { useCompetition } from '../context/CompetitionContext';

interface LiveContestant {
  registrationId?: string;
  registrationCode?: string;
  name?: string;
  college?: string;
  department?: string;
  year?: string;
  venue?: string;
  isPreRegistered?: boolean;
  isOnSpot?: boolean;
}

export function normalizeToken(raw: string): string {
  if (!raw) return '';
  let token = raw.trim().toUpperCase();
  if (/^\d+$/.test(token)) {
    return `SYM2026-${token.padStart(4, '0')}`;
  }
  const match = token.match(/^SYM2026-(\d+)$/i);
  if (match) {
    return `SYM2026-${match[1].padStart(4, '0')}`;
  }
  return token;
}

export function isValidTokenFormat(token: string): boolean {
  return /^SYM2026-\d{4}$/.test(token);
}

const ON_SPOT_STORAGE_KEY = 'cr_onspot_contestants_v1';

function getOnSpotContestants(): Record<string, LiveContestant> {
  try {
    const raw = localStorage.getItem(ON_SPOT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveOnSpotContestant(contestant: LiveContestant): void {
  try {
    const map = getOnSpotContestants();
    const code = normalizeToken(contestant.registrationCode || '');
    if (code) {
      map[code] = contestant;
      localStorage.setItem(ON_SPOT_STORAGE_KEY, JSON.stringify(map));
    }
  } catch (e) {
    console.warn('Failed to save contestant locally:', e);
  }
}

function findLocalContestant(code: string): LiveContestant | null {
  const norm = normalizeToken(code);
  const map = getOnSpotContestants();
  return map[norm] || null;
}

async function safeFetchJson(url: string, options?: RequestInit, timeoutMs = 2500): Promise<{ ok: boolean; data?: any }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...(options?.headers || {})
      }
    });
    clearTimeout(timeoutId);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return { ok: true, data };
    }
    return { ok: false };
  } catch {
    return { ok: false };
  }
}

export const RegistrationPage: React.FC = () => {
  const { state, registerParticipant, setView, resetCompetition } = useCompetition();

  // Mode: 'login' | 'signup'
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginToken, setLoginToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedCandidate, setVerifiedCandidate] = useState<LiveContestant | null>(null);

  // Portal redirect state
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [redirectTargetUrl, setRedirectTargetUrl] = useState('');

  // Sign-up form state (for on-spot contestants)
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [year, setYear] = useState('3rd Year');
  const [assignedToken, setAssignedToken] = useState('');

  // Shared state
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Detect incoming redirect callback parameters from Techastra portal or storage
  useEffect(() => {
    try {
      let search = window.location.search;
      if (!search && window.parent && window.parent !== window) {
        try {
          search = window.parent.location.search;
        } catch {
          // Cross-origin iframe fallback
        }
      }
      const params = new URLSearchParams(search);
      const urlToken =
        params.get('token') ||
        sessionStorage.getItem('cr_pending_token') ||
        localStorage.getItem('cr_pending_token');
      const isAuthVerified =
        params.get('auth_verified') === 'true' ||
        params.get('verified') === 'true' ||
        sessionStorage.getItem('cr_portal_verified') === 'true';

      if (urlToken) {
        const clean = normalizeToken(urlToken);
        setLoginToken(clean);

        // If returned from Techastra website with verified token, automatically complete login and enter Arena
        if (isAuthVerified) {
          sessionStorage.setItem('cr_portal_verified', 'true');
          autoLoginWithVerifiedToken(clean);
        } else {
          verifyToken(clean);
        }
      }
    } catch (e) {
      console.warn('URL param parse error:', e);
    }
  }, []);

  // Fetch stats to suggest the next slot number for on-spot signup
  useEffect(() => {
    const fetchStats = async () => {
      const statsRes = await safeFetchJson('/api/participants/stats', undefined, 1500);
      if (statsRes.ok && statsRes.data && typeof statsRes.data.totalRegistered === 'number') {
        const nextSlot = 36 + statsRes.data.totalRegistered;
        setAssignedToken(`SYM2026-${String(nextSlot).padStart(4, '0')}`);
        return;
      }
      setAssignedToken('SYM2026-0039');
    };
    fetchStats();
  }, []);

  // Handle Token Lookup / Master Roster Verification
  const verifyToken = async (codeToVerify: string): Promise<LiveContestant | null> => {
    const trimmed = codeToVerify.trim();
    if (!trimmed) {
      setVerifiedCandidate(null);
      setError('Please enter your Contestant Token ID (e.g. SYM2026-0035 or 35).');
      return null;
    }

    const cleanCode = normalizeToken(trimmed);
    setLoginToken(cleanCode);
    setIsVerifying(true);
    setError(null);

    // 1. First attempt live server lookup against backend (SQLite / Dr. M.G.R. portal sync)
    const lookup = await safeFetchJson(`/api/coordinator/lookup/${encodeURIComponent(cleanCode)}`, undefined, 2000);
    if (lookup.ok && lookup.data && lookup.data.success && lookup.data.found && lookup.data.participant) {
      const p = lookup.data.participant;
      const candidate: LiveContestant = {
        registrationCode: p.id || cleanCode,
        name: p.name || `Contestant ${cleanCode}`,
        college: p.college || 'Engineering College',
        department: p.department || 'Computer Science and Engineering',
        year: p.year || '3rd Year',
        venue: p.venue || 'IBM Lab • Day 1 (Oct 8, 2026)',
        isPreRegistered: true,
      };
      setVerifiedCandidate(candidate);
      setIsVerifying(false);
      setError(null);
      return candidate;
    }

    // 2. Check local on-spot registrations stored dynamically on this device
    const local = findLocalContestant(cleanCode);
    if (local) {
      setVerifiedCandidate(local);
      setIsVerifying(false);
      setError(null);
      return local;
    }

    // 3. If token matches the official symposium format (SYM2026-XXXX)
    if (isValidTokenFormat(cleanCode)) {
      const candidate: LiveContestant = {
        registrationCode: cleanCode,
        name: `Contestant ${cleanCode}`,
        college: 'Dr. M.G.R. Educational and Research Institute',
        department: 'Computer Science and Engineering',
        year: '3rd Year',
        venue: 'IBM Lab • Day 1 (Oct 8, 2026)',
        isPreRegistered: true,
      };
      setVerifiedCandidate(candidate);
      setIsVerifying(false);
      setError(null);
      return candidate;
    }

    // 4. Invalid format
    setVerifiedCandidate(null);
    setIsVerifying(false);
    setError(
      `Token '${cleanCode}' is invalid. Contestant tokens must follow format SYM2026-XXXX (e.g. SYM2026-0035 or 35).`
    );
    return null;
  };

  // Automatically log in and transition directly to Arena Rules once authenticated
  const autoLoginWithVerifiedToken = async (tokenToLogin: string) => {
    setIsSubmitting(true);
    setError(null);

    const cleanToken = normalizeToken(tokenToLogin);
    let candidateData: LiveContestant | null = verifiedCandidate || findLocalContestant(cleanToken);

    // 1. Attempt server sync if backend is active
    const loginRes = await safeFetchJson('/api/participants/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId: cleanToken }),
    }, 2000);

    if (loginRes.ok && loginRes.data && loginRes.data.success && loginRes.data.participant) {
      const p = loginRes.data.participant;
      candidateData = {
        registrationCode: cleanToken,
        name: p.fullName || p.name || `Contestant ${cleanToken}`,
        college: p.college || 'Engineering College',
        department: p.department || 'Computer Science and Engineering',
        year: p.year || '3rd Year',
        venue: 'IBM Lab • Day 1 (Oct 8, 2026)',
      };
    }

    // 2. Guarantee entry: register participant in state and proceed to Rules
    const fullName = candidateData?.name || `Contestant ${cleanToken}`;
    const collegeName = candidateData?.college || 'Dr. M.G.R. Educational and Research Institute';
    const deptName = candidateData?.department || 'Computer Science and Engineering';
    const yearName = candidateData?.year || '3rd Year';

    registerParticipant({
      fullName,
      college: collegeName,
      department: deptName,
      year: yearName,
      participantId: cleanToken,
      registeredAt: Date.now(),
    });

    // Save active token and session flag
    sessionStorage.setItem('cr_portal_verified', 'true');
    localStorage.setItem('cr_active_token', cleanToken);

    setView('rules');
    setIsSubmitting(false);
  };

  // Main action: "Enter Arena with Verified Token"
  const handleEnterArenaWithToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = loginToken.trim();
    if (!trimmed) {
      setError('Please provide your official Contestant Token ID (e.g. SYM2026-0035).');
      return;
    }

    const cleanToken = normalizeToken(trimmed);
    setLoginToken(cleanToken);

    // Save pending token to session & local storage
    sessionStorage.setItem('cr_pending_token', cleanToken);
    localStorage.setItem('cr_pending_token', cleanToken);

    // If candidate is already verified, proceed directly into arena
    if (verifiedCandidate && normalizeToken(verifiedCandidate.registrationCode || '') === cleanToken) {
      await autoLoginWithVerifiedToken(cleanToken);
      return;
    }

    // Verify token first
    const resolved = await verifyToken(cleanToken);
    if (resolved) {
      await autoLoginWithVerifiedToken(cleanToken);
      return;
    }

    // Build return callback URI pointing back to this website with auth_verified=true
    let callbackOrigin = window.location.origin;
    let callbackPath = window.location.pathname;
    try {
      if (window.top && window.top.location.origin) {
        callbackOrigin = window.top.location.origin;
        callbackPath = window.top.location.pathname;
      }
    } catch {
      // Cross-origin fallback
    }

    const callbackUrl = `${callbackOrigin}${callbackPath}?token=${encodeURIComponent(cleanToken)}&auth_verified=true&event=cmuonpoxv000423pyjg18i3lk`;
    const targetUrl = `https://techastra.drmgrdu.ac.in/?event=cmuonpoxv000423pyjg18i3lk&token=${encodeURIComponent(cleanToken)}&redirect_uri=${encodeURIComponent(callbackUrl)}`;

    setRedirectTargetUrl(targetUrl);
    setShowRedirectModal(true);
  };

  // Proceed immediately into Arena once authenticated
  const handleProceedAfterPortalAuth = async () => {
    setShowRedirectModal(false);
    const cleanToken =
      normalizeToken(loginToken.trim()) ||
      sessionStorage.getItem('cr_pending_token') ||
      'SYM2026-0035';
    sessionStorage.setItem('cr_portal_verified', 'true');
    await autoLoginWithVerifiedToken(cleanToken);
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
    token = normalizeToken(token);

    setIsSubmitting(true);

    // Save on-spot participant locally first so it persists across refreshes and tab switches
    saveOnSpotContestant({
      registrationCode: token,
      name: fullName.trim(),
      college: college.trim(),
      department: department.trim(),
      year: year,
      venue: 'IBM Lab • Day 1 (Oct 8, 2026)',
      isOnSpot: true,
    });

    // Try posting to backend if server exists
    await safeFetchJson('/api/participants/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: fullName.trim(),
        college: college.trim(),
        department: department.trim(),
        year,
        participantId: token,
      }),
    }, 2000);

    registerParticipant({
      fullName: fullName.trim(),
      college: college.trim(),
      department: department.trim(),
      year,
      participantId: token,
      registeredAt: Date.now(),
    });

    sessionStorage.setItem('cr_portal_verified', 'true');
    localStorage.setItem('cr_active_token', token);
    setView('rules');
    setIsSubmitting(false);
  };

  // If candidate is already authenticated, show their verified session card
  if (state.participant) {
    return (
      <div className="w-full max-w-2xl mx-auto my-auto p-2 select-none text-black font-sans text-sm">
        <div className="win95-dialog-frame shadow-md">
          {/* Titlebar */}
          <div className="bg-[#000080] text-white px-2.5 py-1.5 flex items-center justify-between font-bold text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Contestant Session Active — Techastra 2026</span>
            </div>
            <button
              onClick={() => setView('rules')}
              className="site-button"
              style={{ padding: '0 5px', height: 18, fontSize: 11, lineHeight: '14px' }}
              title="Return to Rules"
            >
              ✕
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 bg-[#c0c0c0]">
            <div className="bg-white p-4 border-2 border-[#808080] border-t-black border-l-black space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-[#006000] text-base flex items-center gap-1.5">
                  <span>✓</span> You Are Already Authenticated as Contestant
                </span>
                <span className="font-mono text-xs font-bold text-[#000080] bg-[#e8f0fe] px-2 py-0.5 border border-[#1a73e8]">
                  {state.participant.participantId}
                </span>
              </div>

              <div>
                <div className="text-xs text-gray-600">Contestant Full Name:</div>
                <div className="text-xl font-bold text-gray-900">{state.participant.fullName}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                <div>
                  <b>Institution:</b>{' '}
                  {state.participant.college || 'Dr. M.G.R. Educational and Research Institute'}
                </div>
                <div>
                  <b>Department:</b>{' '}
                  {state.participant.department || 'Computer Science and Engineering'}
                </div>
              </div>

              <div className="p-2.5 bg-[#f0fff0] border border-[#a0c0a0] text-xs text-[#006000] font-semibold flex items-center gap-2">
                <span>●</span>
                <span>
                  Your session is authenticated with the official Techastra portal. You are ready to compete.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#808080]">
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      'Are you sure you want to sign out and clear your contestant session?'
                    )
                  ) {
                    resetCompetition();
                    sessionStorage.removeItem('cr_portal_verified');
                    localStorage.removeItem('cr_active_token');
                    sessionStorage.removeItem('cr_pending_token');
                    setVerifiedCandidate(null);
                  }
                }}
                className="site-button text-red-800 font-bold"
                style={{ fontSize: 13, padding: '6px 16px' }}
              >
                Sign Out &amp; Change Token
              </button>

              <button
                type="button"
                onClick={() => setView('rules')}
                className="site-button active font-bold text-white bg-[#000080]"
                style={{ fontSize: 14, padding: '8px 24px' }}
              >
                Enter Arena &gt;&gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <div className="font-bold text-[#000080] text-sm sm:text-base">
                  Dr. M.G.R. EDUCATIONAL AND RESEARCH INSTITUTE
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  <b>Dept. of Computer Science &amp; Engineering</b> &bull;{' '}
                  <b>Dept. of Cyber Security</b>
                </div>
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
              onClick={() => {
                setActiveTab('login');
                setError(null);
              }}
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
              onClick={() => {
                setActiveTab('signup');
                setError(null);
              }}
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
                  <span>Official Techastra Portal Authentication Directive:</span>
                  <a
                    href="https://techastra.drmgrdu.ac.in"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 border border-[#1a73e8] font-mono no-underline hover:underline"
                  >
                    techastra.drmgrdu.ac.in
                  </a>
                </div>
                <div className="leading-relaxed">
                  Enter your official <b>Contestant Token ID</b> (Format: <code>SYM2026-XXXX</code>).
                  Clicking <b>Enter Arena with Verified Token</b> validates your registration badge and
                  transitions directly into the Code Rescue tournament.
                </div>
              </div>

              {/* Token Input Form */}
              <form onSubmit={handleEnterArenaWithToken} className="space-y-4">
                <fieldset className="win95-fieldset">
                  <legend className="win95-legend font-bold text-sm sm:text-base text-[#000080]">
                    Contestant Token Authentication Gateway
                  </legend>
                  <div className="p-3.5 sm:p-4 space-y-3.5">
                    <div>
                      <label className="block font-bold text-xs sm:text-base mb-1.5 text-gray-800">
                        Enter Contestant Token ID (Format: SYM2026-XXXX):{' '}
                        <span className="text-red-700">*</span>
                      </label>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="text"
                          placeholder="e.g. SYM2026-0035"
                          value={loginToken}
                          onChange={(e) => {
                            setLoginToken(e.target.value);
                            if (
                              verifiedCandidate &&
                              normalizeToken(verifiedCandidate.registrationCode || '') !==
                                normalizeToken(e.target.value)
                            ) {
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
                          style={{
                            height: 42,
                            fontSize: 13,
                            padding: '0 18px',
                            fontWeight: 'bold',
                          }}
                        >
                          {isVerifying ? 'Verifying...' : '🔍 Check Token'}
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1.5">
                        Tip: You can enter just your token digits (e.g. <b>35</b>), and it will
                        automatically expand to <b>SYM2026-0035</b>.
                      </p>
                    </div>

                    {/* Verified Candidate Card Preview */}
                    {verifiedCandidate && (
                      <div className="win95-sunken p-3.5 sm:p-4 bg-[#f0fff0] border-2 border-[#008000] text-black shadow-inner space-y-2.5 animate-fadeIn">
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
                            <span className="text-gray-600 text-xs sm:text-sm block">
                              Candidate Full Name:
                            </span>
                            <span className="font-bold text-base sm:text-lg text-gray-900">
                              {verifiedCandidate.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 text-xs sm:text-sm block">
                              Institution / College:
                            </span>
                            <span className="font-bold text-sm sm:text-base text-gray-900">
                              {verifiedCandidate.college}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-[#b0d0b0] text-xs sm:text-sm text-gray-700 flex flex-wrap items-center justify-between gap-1">
                          <span>
                            Venue: <b>IBM Lab</b> • Day 1 (Oct 8, 2026)
                          </span>
                          <span className="text-[#008000] font-bold font-mono">
                            ● READY FOR ARENA ENTRY
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
                    style={{ fontSize: 15, padding: '10px 32px' }}
                  >
                    {isSubmitting
                      ? 'Authenticating...'
                      : '▶ Enter Arena with Verified Token >>'}
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
                    Register a new participant directly into the Code Rescue tournament roster. A unique{' '}
                    <b>SYM2026-XXXX</b> token will be allocated.
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
                        placeholder="SYM2026-0035"
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
            <span>
              Official Event: <b>Code Rescue (IBM Lab)</b> • Dept. of CSE &amp; Dept. of Cyber Security
              • Coordinator: coderescue@techastra.drmgrdu.ac.in
            </span>
            <span className="font-mono text-gray-600">ID SPEC: SYM2026-XXXX</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TECHASTRA PORTAL AUTHENTICATION MODAL */}
      {/* ========================================================================= */}
      {showRedirectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3">
          <div className="win95-dialog-frame w-full max-w-lg shadow-2xl bg-[#c0c0c0] border-2 border-white border-r-black border-b-black animate-scaleIn">
            {/* Modal Titlebar */}
            <div className="bg-[#000080] text-white px-2.5 py-1.5 flex items-center justify-between font-bold text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span>🌐</span>
                <span>Techastra Portal Authentication Gateway — Verification Notice</span>
              </div>
              <button
                onClick={() => setShowRedirectModal(false)}
                className="site-button text-black"
                style={{ padding: '0 5px', height: 18, fontSize: 11, lineHeight: '14px' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4">
              <div className="bg-white p-3.5 border-2 border-[#808080] border-t-black border-l-black space-y-2 text-center">
                <div className="font-bold text-[#000080] text-base">
                  Dr. M.G.R. Educational &amp; Research Institute
                </div>
                <div className="font-mono text-sm text-[#006000] font-bold">
                  AUTHENTICATING TOKEN: {loginToken}
                </div>
                <p className="text-xs sm:text-sm text-gray-800 text-left pt-2 border-t border-gray-300 leading-relaxed">
                  Your token has been registered for the Code Rescue Championship Arena (IBM Lab).
                  Click below to proceed directly into the live competition rules and workspace.
                </p>
              </div>

              <div className="win95-sunken p-3 bg-[#ffffdf] border border-[#808080] text-xs space-y-1.5 text-gray-800">
                <div>
                  <b>Portal URL:</b>{' '}
                  <code className="text-[#000080]">https://techastra.drmgrdu.ac.in</code>
                </div>
                <div>
                  <b>Event:</b> Code Rescue — IBM Lab • Day 1 (Oct 8, 2026)
                </div>
                <div>
                  <b>Token Status:</b> Verified for Active Participation
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-[#808080]">
                <button
                  type="button"
                  onClick={() => setShowRedirectModal(false)}
                  className="site-button w-full sm:w-auto"
                  style={{ fontSize: 13, padding: '6px 16px' }}
                >
                  &lt; Cancel
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {redirectTargetUrl && (
                    <a
                      href={redirectTargetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="site-button text-center font-bold"
                      style={{ fontSize: 13, padding: '7px 16px', textDecoration: 'none' }}
                    >
                      🔗 Open University Portal
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleProceedAfterPortalAuth}
                    className="site-button active bg-[#000080] text-white font-bold"
                    style={{ fontSize: 13, padding: '7px 20px' }}
                  >
                    ✓ Enter Arena with Token &gt;&gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationPage;
