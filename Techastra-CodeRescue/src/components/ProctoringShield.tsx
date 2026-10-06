import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCompetition } from '../context/CompetitionContext';

export const ProctoringShield: React.FC = () => {
  const {
    state,
    recordTabSwitch,
    dismissTabSwitchWarning,
    triggerClipboardWarning,
    clearClipboardWarning,
    disqualifyContestant,
  } = useCompetition();

  const isWorkspace = state.currentView.includes('workspace');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [remainingGraceSeconds, setRemainingGraceSeconds] = useState(30);
  const lastBlurTime = useRef<number>(0);
  const toastTimeoutRef = useRef<any>(null);

  // 30-second return grace countdown timer
  useEffect(() => {
    if (!state.securityState?.showTabSwitchWarning || state.securityState?.isDisqualified) {
      return;
    }

    const checkCountdown = () => {
      const expiresAt = state.securityState?.graceExpiresAt || (Date.now() + 30 * 1000);
      const diff = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setRemainingGraceSeconds(diff);

      if (diff <= 0) {
        disqualifyContestant('Grace period expired: 30 seconds elapsed without returning to fullscreen workstation.');
      }
    };

    checkCountdown();
    const interval = setInterval(checkCountdown, 250);
    return () => clearInterval(interval);
  }, [
    state.securityState?.showTabSwitchWarning,
    state.securityState?.graceExpiresAt,
    state.securityState?.isDisqualified,
    disqualifyContestant
  ]);

  const showSecurityNotice = useCallback((msg: string) => {
    setToastMessage(msg);
    triggerClipboardWarning(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      clearClipboardWarning();
    }, 3500);
  }, [triggerClipboardWarning, clearClipboardWarning]);

  const requestFullscreen = useCallback(() => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'CODE_RESCUE_ENTER_FULLSCREEN' }, '*');
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  // Proctoring listeners: ContextMenu, Copy/Cut/Paste, Keyboard Anti-Cheat, Fullscreen Loss
  useEffect(() => {
    if (!isWorkspace || state.securityState?.isDisqualified) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showSecurityNotice('RIGHT-CLICK PROHIBITED: Context menu is disabled during active competition rounds.');
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showSecurityNotice('CLIPBOARD RESTRICTION: Copying code or text is blocked during examination.');
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showSecurityNotice('CLIPBOARD RESTRICTION: Cutting code is blocked.');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showSecurityNotice('SECURITY VIOLATION: Pasting external code is strictly prohibited by anti-cheat rules.');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+U (view source)
      if (isCtrl && ['c', 'C', 'v', 'V', 'x', 'X', 'u', 'U'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        showSecurityNotice(`BLOCKED [Ctrl+${e.key.toUpperCase()}]: Prohibited clipboard/source shortcut.`);
      }

      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
      if (
        e.key === 'F12' ||
        (isCtrl && e.shiftKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        showSecurityNotice('BLOCKED: Developer inspection tools are disabled.');
      }
    };

    // Fullscreen Loss / Tab Switch / Blur detection
    const handleVisibilityOrBlur = (source: string) => {
      const now = Date.now();
      // Debounce events within 1000ms
      if (now - lastBlurTime.current < 1000) return;
      lastBlurTime.current = now;
      recordTabSwitch();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleVisibilityOrBlur('visibilitychange_hidden');
      }
    };

    const handleWindowBlur = () => {
      handleVisibilityOrBlur('window_blur');
    };

    const handleParentMessage = (event: MessageEvent) => {
      if (
        event.data?.type === 'PARENT_TAB_SWITCH' ||
        event.data?.type === 'ARENA_FULLSCREEN_LOST'
      ) {
        handleVisibilityOrBlur('parent_' + event.data.type);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('copy', handleCopy, true);
    window.addEventListener('cut', handleCut, true);
    window.addEventListener('paste', handlePaste, true);
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('message', handleParentMessage);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('copy', handleCopy, true);
      window.removeEventListener('cut', handleCut, true);
      window.removeEventListener('paste', handlePaste, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('message', handleParentMessage);
    };
  }, [isWorkspace, state.securityState?.isDisqualified, recordTabSwitch, showSecurityNotice]);

  return (
    <>
      {/* Toast Notification Banner for Clipboard / Right-Click attempt */}
      {toastMessage && (
        <div
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none select-none max-w-xl w-[90%]"
          style={{ animation: 'bounce 0.3s ease-out' }}
        >
          <div
            className="win95-dialog-frame p-1"
            style={{
              backgroundColor: '#ffffdf',
              border: '2px solid #a00000',
              boxShadow: '2px 2px 0px #000000',
            }}
          >
            <div className="bg-[#a00000] text-white px-2 py-0.5 flex items-center gap-1.5 font-bold text-xs">
              <span>🛡️</span>
              <span>CR-SEC ANTI-CHEAT INTERCEPTION</span>
            </div>
            <div className="p-2 text-xs font-mono font-bold text-red-900 flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{toastMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* 30-Second Fullscreen Return Grace Warning Modal */}
      {state.securityState?.showTabSwitchWarning && !state.securityState?.isDisqualified && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 p-4 select-none font-sans text-xs text-black backdrop-blur-xs">
          <div
            className="win95-dialog-frame max-w-lg w-full p-1"
            style={{
              boxShadow: '0 0 25px rgba(255, 0, 0, 0.7), 3px 3px 0 #000000',
            }}
          >
            {/* Titlebar */}
            <div className="bg-[#a00000] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
              <div className="flex items-center gap-1.5">
                <span>⚠️</span>
                <span>SECURITY VIOLATION: FULLSCREEN BREACH DETECTED</span>
              </div>
              <span className="font-mono text-[10px] bg-white text-red-900 px-1 font-bold">
                STRIKE {state.securityState?.tabSwitchCount || 1} / 2
              </span>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3 bg-[#c0c0c0]">
              <div className="flex items-start gap-3 p-3 bg-[#fff0f0] border border-[#a00000] win95-sunken">
                <div className="text-3xl select-none">🚨</div>
                <div className="space-y-1">
                  <div className="font-bold text-sm text-red-900">
                    FULLSCREEN EXAMINATION ENVIRONMENT EXITED!
                  </div>
                  <p className="text-xs text-gray-900 leading-relaxed font-sans">
                    The workstation monitor detected that you exited fullscreen mode, minimized the window, or switched to another browser tab.
                  </p>
                </div>
              </div>

              {/* Prominent 30-Second Retro Countdown Display */}
              <div className="p-2.5 bg-black border-2 border-red-600 text-center space-y-0.5 win95-sunken">
                <div className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold">
                  ⏱️ MANDATORY RETURN GRACE PERIOD COUNTDOWN
                </div>
                <div className="font-mono text-3xl font-black tracking-widest text-[#ff3333] animate-pulse">
                  00:{String(remainingGraceSeconds).padStart(2, '0')}
                </div>
                <div className="text-[11px] text-gray-300 font-sans">
                  Return to fullscreen within <b>{remainingGraceSeconds} seconds</b> to resume without disqualification.
                </div>
              </div>

              <fieldset className="win95-fieldset" style={{ margin: 0, padding: '8px 12px' }}>
                <legend className="win95-legend font-bold text-red-800">
                  Strict Zero-Tolerance Protocol (Rule 4)
                </legend>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-900">
                  <li>
                    External search engines, generative AI assistants (ChatGPT, Copilot, Gemini), and communication apps are <b>strictly forbidden</b>.
                  </li>
                  <li className="text-red-900 font-bold">
                    {state.securityState?.tabSwitchCount === 1
                      ? 'STRIKE 1: Return in 30s to continue. Repeated exits or misusing this grace timer will result in AUTO-DISQUALIFICATION.'
                      : 'FINAL WARNING (STRIKE 2): You have one final chance to return. Any further exit is classified as intentional misuse and triggers INSTANT AUTO-DISQUALIFICATION.'}
                  </li>
                  <li>
                    Workstation session telemetry and exit timestamps are permanently committed to proctor arbitration logs.
                  </li>
                </ul>
              </fieldset>

              <div className="flex items-center justify-between pt-2 border-t border-[#808080]">
                <span className="font-mono text-[10px] text-gray-700">
                  Station: TECHASTRA-CR-26 • Proctor v1.0
                </span>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                        document.documentElement.requestFullscreen().catch(() => {});
                      }
                    } catch (e) {}
                    dismissTabSwitchWarning();
                    requestFullscreen();
                  }}
                  className="site-button active font-bold text-xs py-2 px-5 animate-pulse"
                  style={{
                    backgroundColor: '#000080',
                    color: '#ffffff',
                    fontSize: 12,
                  }}
                >
                  ⛶ Restore Fullscreen &amp; Resume ({remainingGraceSeconds}s) &gt;&gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
