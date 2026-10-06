import React, { useState, useEffect, useRef, useCallback } from 'react';
import Window from '../os/Window';

export interface CodeRescueAppProps extends WindowAppProps {}

const CodeRescueApp: React.FC<CodeRescueAppProps> = (props) => {
    const getNormalSize = useCallback(() => {
        const normalW = Math.min(1360, Math.max(980, window.innerWidth - 100));
        const normalH = Math.min(880, Math.max(680, window.innerHeight - 90));
        const normalTop = Math.max(14, Math.floor((window.innerHeight - 32 - normalH) / 2));
        const normalLeft = Math.max(20, Math.floor((window.innerWidth - normalW) / 2));
        return { normalW, normalH, normalTop, normalLeft };
    }, []);

    const { normalW: initW, normalH: initH, normalTop: initT, normalLeft: initL } = getNormalSize();
    const [isRoundActive, setIsRoundActive] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleEnterFullscreen = useCallback(() => {
        setIsRoundActive(true);
        setIsMaximized(true);

        // If running directly as top window, request browser fullscreen
        if (window.parent === window && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    }, []);

    const handleExitFullscreen = useCallback(() => {
        setIsRoundActive(false);
        setIsMaximized(false);

        // If running directly as top window, exit browser fullscreen
        if (window.parent === window && document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
    }, []);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'CODE_RESCUE_ENTER_FULLSCREEN') {
                handleEnterFullscreen();
                if (window.parent && window.parent !== window) {
                    try {
                        window.parent.postMessage(
                            { type: 'CODE_RESCUE_ENTER_FULLSCREEN' },
                            '*'
                        );
                    } catch (e) {}
                }
            } else if (event.data?.type === 'CODE_RESCUE_EXIT_FULLSCREEN') {
                handleExitFullscreen();
                if (window.parent && window.parent !== window) {
                    try {
                        window.parent.postMessage(
                            { type: 'CODE_RESCUE_EXIT_FULLSCREEN' },
                            '*'
                        );
                    } catch (e) {}
                }
            } else if (
                event.data?.type === 'PARENT_TAB_SWITCH' ||
                event.data?.type === 'ARENA_FULLSCREEN_LOST'
            ) {
                try {
                    iframeRef.current?.contentWindow?.postMessage(
                        event.data,
                        '*'
                    );
                } catch (e) {}
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                try {
                    iframeRef.current?.contentWindow?.postMessage(
                        { type: 'PARENT_TAB_SWITCH' },
                        '*'
                    );
                } catch (e) {
                    // Ignore
                }
            }
        };

        window.addEventListener('message', handleMessage);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('message', handleMessage);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [handleEnterFullscreen, handleExitFullscreen]);

    const handleMinimizeWindow = () => {
        if (isRoundActive) {
            try {
                iframeRef.current?.contentWindow?.postMessage(
                    { type: 'ARENA_FULLSCREEN_LOST' },
                    '*'
                );
            } catch (e) {}
        }
        props.onMinimize();
    };

    const handleCloseWindow = () => {
        if (isRoundActive) {
            const confirmed = window.confirm(
                'WARNING: You are currently inside an active competition round.\n\nClosing this window will result in IMMEDIATE PERMANENT DISQUALIFICATION.\n\nAre you sure you want to exit and forfeit the competition?'
            );
            if (!confirmed) return;
        }
        handleExitFullscreen();
        if (window.parent && window.parent !== window) {
            try {
                window.parent.postMessage(
                    { type: 'CODE_RESCUE_EXIT_FULLSCREEN' },
                    '*'
                );
            } catch (e) {}
        }
        props.onClose();
    };

    const arenaUrl = React.useMemo(() => {
        try {
            const href = window.location.href.split('?')[0].split('#')[0];
            const baseDir = href.endsWith('/')
                ? href
                : href.substring(0, href.lastIndexOf('/') + 1);
            return `${baseDir}coderescue/index.html`;
        } catch {
            return './coderescue/index.html';
        }
    }, []);

    return (
        <Window
            top={initT}
            left={initL}
            width={initW}
            height={initH}
            isMaximized={isMaximized}
            onMaximizeChange={(max) => {
                setIsMaximized(max);
                if (!max && isRoundActive) {
                    try {
                        iframeRef.current?.contentWindow?.postMessage(
                            { type: 'ARENA_FULLSCREEN_LOST' },
                            '*'
                        );
                    } catch (e) {}
                }
            }}
            windowTitle="TECHASTRA 2026 — Code Rescue Championship Arena"
            windowBarIcon="computerBig"
            closeWindow={handleCloseWindow}
            onInteract={props.onInteract}
            minimizeWindow={handleMinimizeWindow}
            bottomLeftText={'TECHASTRA 2026 • Code Rescue Live Debugging Platform'}
        >
            <div style={styles.container}>
                <iframe
                    ref={iframeRef}
                    src={arenaUrl}
                    title="Code Rescue Arena"
                    allow="fullscreen"
                    allowFullScreen={true}
                    style={styles.iframe}
                />
            </div>
        </Window>
    );
};

const styles: StyleSheetCSS = {
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#c0c0c0',
        overflow: 'hidden',
    },
    iframe: {
        width: '100%',
        height: '100%',
        border: 'none',
        flex: 1,
        backgroundColor: '#c0c0c0',
    },
};

export default CodeRescueApp;
