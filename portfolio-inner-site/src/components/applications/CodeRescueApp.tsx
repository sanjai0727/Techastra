import React, { useState, useEffect, useRef, useCallback } from 'react';
import Window from '../os/Window';
import useInitialWindowSize from '../../hooks/useInitialWindowSize';

export interface CodeRescueAppProps extends WindowAppProps {}

const CodeRescueApp: React.FC<CodeRescueAppProps> = (props) => {
    const getNormalSize = useCallback(() => {
        const normalW = Math.min(960, Math.max(780, window.innerWidth - 80));
        const normalH = Math.min(650, Math.max(520, window.innerHeight - 90));
        const normalTop = 24;
        const normalLeft = Math.max(16, Math.floor((window.innerWidth - normalW) / 2));
        return { normalW, normalH, normalTop, normalLeft };
    }, []);

    const { normalW: initW, normalH: initH, normalTop: initT, normalLeft: initL } = getNormalSize();
    const [width, setWidth] = useState(initW);
    const [height, setHeight] = useState(initH);
    const [top, setTop] = useState(initT);
    const [left, setLeft] = useState(initL);
    const [isRoundActive, setIsRoundActive] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleEnterFullscreen = useCallback(() => {
        // Seamlessly maximize inside the inner OS desktop
        setIsRoundActive(true);
        setIsMaximized(true);
        setTop(0);
        setLeft(0);
        setWidth(window.innerWidth);
        setHeight(window.innerHeight - 32);

        // If running directly as top window, request browser fullscreen
        if (window.parent === window && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    }, []);

    const handleExitFullscreen = useCallback(() => {
        // Restore cleanly back to centered windowed size on the monitor desktop
        const { normalW, normalH, normalTop, normalLeft } = getNormalSize();
        setIsRoundActive(false);
        setIsMaximized(false);
        setTop(normalTop);
        setLeft(normalLeft);
        setWidth(normalW);
        setHeight(normalH);

        // If running directly as top window, exit browser fullscreen
        if (window.parent === window && document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
    }, [getNormalSize]);

    useEffect(() => {
        const handleResize = () => {
            if (isRoundActive) {
                setTop(0);
                setLeft(0);
                setWidth(window.innerWidth);
                setHeight(window.innerHeight - 32);
            } else if (!isMaximized) {
                const { normalW, normalH, normalTop, normalLeft } = getNormalSize();
                setTop(normalTop);
                setLeft(normalLeft);
                setWidth(normalW);
                setHeight(normalH);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isRoundActive, isMaximized, getNormalSize]);

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

    const handleMaximizeChange = (maximized: boolean) => {
        setIsMaximized(maximized);
        if (!maximized) {
            if (isRoundActive) {
                try {
                    iframeRef.current?.contentWindow?.postMessage(
                        { type: 'ARENA_FULLSCREEN_LOST' },
                        '*'
                    );
                } catch (e) {}
            }
            const { normalW, normalH, normalTop, normalLeft } = getNormalSize();
            setTop(normalTop);
            setLeft(normalLeft);
            setWidth(normalW);
            setHeight(normalH);
        } else {
            setTop(0);
            setLeft(0);
            setWidth(window.innerWidth);
            setHeight(window.innerHeight - 32);
        }
    };

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
            top={top}
            left={left}
            width={width}
            height={height}
            isMaximized={isMaximized}
            windowTitle="TECHASTRA 2026 — Code Rescue Championship Arena"
            windowBarIcon="computerBig"
            closeWindow={handleCloseWindow}
            onInteract={props.onInteract}
            minimizeWindow={handleMinimizeWindow}
            onMaximizeChange={handleMaximizeChange}
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
        backgroundColor: '#ffffff',
    },
};

export default CodeRescueApp;
