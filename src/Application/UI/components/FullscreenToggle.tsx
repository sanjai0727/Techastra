import React, { useCallback, useEffect, useState } from 'react';

interface FullscreenToggleProps {}

const FullscreenToggle: React.FC<FullscreenToggleProps> = () => {
    const [isHovering, setIsHovering] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const checkFs = () => {
            setIsFullscreen(document.body.classList.contains('fullscreen-os-active'));
        };
        window.addEventListener('message', checkFs);
        document.addEventListener('fullscreenchange', checkFs);
        return () => {
            window.removeEventListener('message', checkFs);
            document.removeEventListener('fullscreenchange', checkFs);
        };
    }, []);

    const toggle = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsActive(true);
        if (document.body.classList.contains('fullscreen-os-active')) {
            window.postMessage({ type: 'CODE_RESCUE_EXIT_FULLSCREEN' }, '*');
            setIsFullscreen(false);
        } else {
            window.postMessage({ type: 'CODE_RESCUE_ENTER_FULLSCREEN' }, '*');
            setIsFullscreen(true);
        }
        setTimeout(() => setIsActive(false), 200);
    }, []);

    return (
        <div
            id="prevent-click"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseDown={toggle}
            style={{
                ...styles.container,
                borderColor: isHovering ? '#00ff66' : 'rgba(0, 255, 102, 0.4)',
                boxShadow: isHovering
                    ? '0 0 12px rgba(0, 255, 102, 0.5)'
                    : '0 0 6px rgba(0, 255, 102, 0.15)',
                transform: isActive ? 'scale(0.96)' : 'scale(1)',
            }}
            title={isFullscreen ? 'Return to 3D CRT View' : 'Maximize OS to Fullscreen (High Readability)'}
        >
            <span style={{ fontSize: 13, marginRight: 6 }}>
                {isFullscreen ? '🗗' : '⛶'}
            </span>
            <span style={styles.text}>
                {isFullscreen ? '3D CRT VIEW' : 'EXPAND OS'}
            </span>
        </div>
    );
};

const styles = {
    container: {
        background: 'rgba(0, 0, 0, 0.85)',
        border: '1px solid rgba(0, 255, 102, 0.4)',
        boxShadow: '0 0 6px rgba(0, 255, 102, 0.15)',
        padding: '3px 10px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none' as const,
        height: 26.5,
        boxSizing: 'border-box' as const,
        transition: 'all 0.15s ease',
    },
    text: {
        color: '#00ff66',
        fontSize: 11,
        fontFamily: 'Consolas, Courier New, monospace',
        fontWeight: 'bold' as const,
        letterSpacing: '0.08em',
        textShadow: '0 0 4px rgba(0, 255, 102, 0.6)',
    },
};

export default FullscreenToggle;
