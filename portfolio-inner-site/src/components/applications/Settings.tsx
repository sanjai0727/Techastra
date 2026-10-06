import React, { useState } from 'react';
import Window from '../os/Window';

export interface SettingsAppProps extends WindowAppProps {
    crtEnabled?: boolean;
    setCrtEnabled?: (val: boolean) => void;
    vcrEnabled?: boolean;
    setVcrEnabled?: (val: boolean) => void;
}

type TabType = 'display' | 'station' | 'about';

const SettingsApp: React.FC<SettingsAppProps> = ({
    onClose,
    onInteract,
    onMinimize,
    crtEnabled,
    setCrtEnabled,
    vcrEnabled,
    setVcrEnabled,
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('display');
    const [localCrt, setLocalCrt] = useState<boolean>(() => {
        if (crtEnabled !== undefined) return crtEnabled;
        return localStorage.getItem('cr_crt') === 'true';
    });
    const [localVcr, setLocalVcr] = useState<boolean>(() => {
        if (vcrEnabled !== undefined) return vcrEnabled;
        return localStorage.getItem('cr_vcr') === 'true';
    });

    const [diagRunning, setDiagRunning] = useState(false);
    const [diagResult, setDiagResult] = useState<string | null>(null);
    const [savedNotice, setSavedNotice] = useState(false);

    const applySettings = () => {
        localStorage.setItem('cr_crt', String(localCrt));
        localStorage.setItem('cr_vcr', String(localVcr));
        if (setCrtEnabled) setCrtEnabled(localCrt);
        if (setVcrEnabled) setVcrEnabled(localVcr);
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2500);
    };

    const handleOk = () => {
        applySettings();
        if (onClose) onClose();
    };

    const handleCancel = () => {
        if (onClose) onClose();
    };

    const runDiagnostics = () => {
        setDiagRunning(true);
        setDiagResult(null);
        setTimeout(() => {
            setDiagRunning(false);
            setDiagResult('DIAGNOSTICS PASSED: ALL SUBSYSTEMS NOMINAL (0 ERRORS)');
        }, 800);
    };

    return (
        <Window
            top={70}
            left={140}
            width={480}
            height={500}
            windowTitle="Settings & Display Properties"
            windowBarIcon="settings"
            closeWindow={onClose}
            onInteract={onInteract}
            minimizeWindow={onMinimize}
            bottomLeftText="Station CR-26 Control Panel"
        >
            <div style={styles.dialogContainer}>
                {/* Windows 95 Tab Bar */}
                <div style={styles.tabBar}>
                    <button
                        type="button"
                        style={Object.assign(
                            {},
                            styles.tabButton,
                            activeTab === 'display' ? styles.activeTab : styles.inactiveTab
                        )}
                        onClick={() => setActiveTab('display')}
                    >
                        Display & Effects
                    </button>
                    <button
                        type="button"
                        style={Object.assign(
                            {},
                            styles.tabButton,
                            activeTab === 'station' ? styles.activeTab : styles.inactiveTab
                        )}
                        onClick={() => setActiveTab('station')}
                    >
                        Station Node
                    </button>
                    <button
                        type="button"
                        style={Object.assign(
                            {},
                            styles.tabButton,
                            activeTab === 'about' ? styles.activeTab : styles.inactiveTab
                        )}
                        onClick={() => setActiveTab('about')}
                    >
                        About OS
                    </button>
                </div>

                {/* Tab Pane Body with 3D Border */}
                <div style={styles.tabBodyWrapper}>
                    {activeTab === 'display' && (
                        <div style={styles.tabContent}>
                            {/* CRT Monitor Preview */}
                            <div style={styles.monitorContainer}>
                                <div style={styles.monitorHousing}>
                                    <div style={styles.monitorScreenBezel}>
                                        <div style={styles.monitorScreen}>
                                            {/* Screen background preview */}
                                            {localCrt && <div style={styles.miniScanlines} />}
                                            {localVcr && (
                                                <div style={styles.miniVcrText}>
                                                    ▶ PLAY 00:85
                                                </div>
                                            )}
                                            {/* Mini desktop window */}
                                            <div style={styles.miniWindow}>
                                                <div style={styles.miniTitlebar} />
                                                <div style={styles.miniContent}>
                                                    <div style={styles.miniIcon} />
                                                    <div style={styles.miniIcon} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={styles.monitorPowerLed} />
                                </div>
                                <div style={styles.monitorNeck} />
                                <div style={styles.monitorBase} />
                            </div>

                            {/* Visual Effects Fieldset */}
                            <fieldset style={styles.fieldset}>
                                <legend style={styles.legend}>Visual Shaders & Retro Emulation</legend>

                                <label style={styles.checkboxRow}>
                                    <input
                                        type="checkbox"
                                        checked={localCrt}
                                        onChange={(e) => setLocalCrt(e.target.checked)}
                                    />
                                    <span style={styles.checkboxLabel}>Enable CRT Scanline Emulation</span>
                                </label>
                                <div style={styles.helpText}>
                                    Simulates vintage phosphor aperture grille raster scanlines across the viewport.
                                </div>

                                <label style={styles.checkboxRow}>
                                    <input
                                        type="checkbox"
                                        checked={localVcr}
                                        onChange={(e) => setLocalVcr(e.target.checked)}
                                    />
                                    <span style={styles.checkboxLabel}>
                                        Enable VCR OSD Telemetry Bar (▶ PLAY SP)
                                    </span>
                                </label>
                                <div style={styles.helpText}>
                                    Overlays 80s tape telemetry, station clock, and live dispatch recorder status.
                                </div>
                            </fieldset>

                            {/* Color Scheme Fieldset */}
                            <fieldset style={styles.fieldset}>
                                <legend style={styles.legend}>Desktop Color Scheme</legend>
                                <div style={styles.colorRow}>
                                    <div style={styles.colorSwatch} />
                                    <div>
                                        <span style={styles.boldText}>Classic Win95 Matrix Teal</span>
                                        <div style={styles.smallNote}>RGB (0, 128, 128) • High Contrast Standard</div>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    )}

                    {activeTab === 'station' && (
                        <div style={styles.tabContent}>
                            <fieldset style={styles.fieldset}>
                                <legend style={styles.legend}>Station Node Telemetry</legend>
                                <table style={styles.infoTable}>
                                    <tbody>
                                        <tr>
                                            <td style={styles.tableKey}>Station Identifier:</td>
                                            <td style={styles.tableVal}>TECHASTRA-CR-26</td>
                                        </tr>
                                        <tr>
                                            <td style={styles.tableKey}>Event Track:</td>
                                            <td style={styles.tableVal}>Code Rescue — R1 / R2 / R3</td>
                                        </tr>
                                        <tr>
                                            <td style={styles.tableKey}>Security Subsystem:</td>
                                            <td style={styles.tableVal}>
                                                <span style={styles.badgeSuccess}>ANTI-AI AGENT ARMED</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={styles.tableKey}>Execution Kernel:</td>
                                            <td style={styles.tableVal}>Python 3.11 Emscripten WASM</td>
                                        </tr>
                                        <tr>
                                            <td style={styles.tableKey}>Dispatch Network:</td>
                                            <td style={styles.tableVal}>CR-NET / MS-DOS 7.00</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </fieldset>

                            <fieldset style={styles.fieldset}>
                                <legend style={styles.legend}>Hardware Self-Test</legend>
                                <p style={styles.diagDesc}>
                                    Run an automated diagnostic test on workstation memory, terminal I/O, and testbench hooks.
                                </p>
                                <button
                                    type="button"
                                    className="win95-dialog-btn"
                                    onClick={runDiagnostics}
                                    disabled={diagRunning}
                                    style={{ marginTop: 4, minWidth: 150 }}
                                >
                                    {diagRunning ? 'Testing Subsystems...' : 'Run Diagnostics'}
                                </button>
                                {diagResult && (
                                    <div style={styles.diagNotice}>{diagResult}</div>
                                )}
                            </fieldset>
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div style={styles.tabContent}>
                            <fieldset style={styles.fieldset}>
                                <legend style={styles.legend}>System Information</legend>
                                <div style={styles.aboutHeader}>
                                    <div style={styles.aboutIconBox}>💻</div>
                                    <div>
                                        <div style={styles.aboutTitle}>TECHASTRA 2026 Code Rescue OS</div>
                                        <div style={styles.aboutSub}>Version 4.00.950 (Symposium Build 2026.03)</div>
                                        <div style={styles.aboutSub}>Department of Computer Engineering</div>
                                    </div>
                                </div>
                                <div style={styles.divider} />
                                <p style={styles.aboutText}>
                                    Installed Components:
                                    <br />• Code Rescue Interactive Arena & Live Terminal
                                    <br />• Event Dossier & Problem Bank Explorer
                                    <br />• Shader.se Scanline Telemetry Emulation
                                    <br />• Official Competition Rules & Rubric
                                </p>
                                <div style={styles.divider} />
                                <div style={styles.aboutSub}>Memory Available: 640 KB Base / 16,384 KB Extended</div>
                            </fieldset>
                        </div>
                    )}
                </div>

                {/* Status notice */}
                {savedNotice && (
                    <div style={styles.appliedBanner}>
                        ✓ Settings applied successfully to Station CR-26.
                    </div>
                )}

                {/* Bottom Action Buttons */}
                <div style={styles.buttonRow}>
                    <button
                        type="button"
                        className="win95-dialog-btn"
                        onClick={handleOk}
                    >
                        OK
                    </button>
                    <button
                        type="button"
                        className="win95-dialog-btn"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="win95-dialog-btn"
                        onClick={applySettings}
                    >
                        Apply
                    </button>
                </div>
            </div>
        </Window>
    );
};

const styles: StyleSheetCSS = {
    dialogContainer: {
        backgroundColor: '#c0c0c0',
        padding: '10px 12px 12px 12px',
        boxSizing: 'border-box',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"MS Sans Serif", "Segoe UI", Tahoma, Arial, sans-serif',
        fontSize: 11,
        color: '#000000',
        userSelect: 'none',
    },
    tabBar: {
        display: 'flex',
        alignItems: 'flex-end',
        paddingLeft: 6,
        zIndex: 2,
    },
    tabButton: {
        fontFamily: '"MS Sans Serif", "Segoe UI", Tahoma, Arial, sans-serif',
        fontSize: 11,
        padding: '3px 12px',
        cursor: 'pointer',
        border: 'none',
        outline: 'none',
        marginRight: 2,
        backgroundColor: '#c0c0c0',
        boxSizing: 'border-box',
    },
    activeTab: {
        fontWeight: 'bold',
        paddingTop: 5,
        paddingBottom: 5,
        boxShadow: 'inset 1px 1px 0px #ffffff, inset -1px 0px 0px #000000, inset -2px 0px 0px #808080',
        backgroundColor: '#c0c0c0',
        position: 'relative',
        top: 1,
        zIndex: 3,
    },
    inactiveTab: {
        boxShadow: 'inset 1px 1px 0px #ffffff, inset -1px 0px 0px #808080, inset -2px 0px 0px #000000',
        backgroundColor: '#b0b0b0',
        position: 'relative',
        top: 2,
        zIndex: 1,
    },
    tabBodyWrapper: {
        flex: 1,
        backgroundColor: '#c0c0c0',
        border: '1px solid #000000',
        boxShadow: 'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080',
        padding: 12,
        boxSizing: 'border-box',
        overflowY: 'auto',
        zIndex: 2,
    },
    tabContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
    },
    monitorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 8,
    },
    monitorHousing: {
        width: 140,
        height: 94,
        backgroundColor: '#dfdfdf',
        borderTop: '2px solid #ffffff',
        borderLeft: '2px solid #ffffff',
        borderRight: '2px solid #808080',
        borderBottom: '2px solid #808080',
        boxShadow: '1px 1px 0px #000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    monitorScreenBezel: {
        width: 114,
        height: 72,
        backgroundColor: '#222222',
        borderTop: '2px solid #808080',
        borderLeft: '2px solid #808080',
        borderRight: '2px solid #ffffff',
        borderBottom: '2px solid #ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    monitorScreen: {
        width: 106,
        height: 64,
        backgroundColor: '#008080',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    miniScanlines: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 2px)',
        pointerEvents: 'none',
        zIndex: 3,
    },
    miniVcrText: {
        position: 'absolute',
        top: 2,
        left: 4,
        fontSize: 7,
        fontFamily: 'monospace',
        color: '#00ff66',
        fontWeight: 'bold',
        zIndex: 4,
    },
    miniWindow: {
        width: 60,
        height: 38,
        backgroundColor: '#c0c0c0',
        borderTop: '1px solid #ffffff',
        borderLeft: '1px solid #ffffff',
        borderRight: '1px solid #000000',
        borderBottom: '1px solid #000000',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 2,
    },
    miniTitlebar: {
        height: 6,
        backgroundColor: '#000080',
        width: '100%',
    },
    miniContent: {
        flex: 1,
        backgroundColor: '#ffffff',
        margin: 2,
        display: 'flex',
        gap: 2,
        padding: 2,
    },
    miniIcon: {
        width: 6,
        height: 6,
        backgroundColor: '#008080',
    },
    monitorPowerLed: {
        position: 'absolute',
        bottom: 4,
        right: 12,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#00ff00',
        boxShadow: '0 0 2px #00ff00',
    },
    monitorNeck: {
        width: 32,
        height: 10,
        backgroundColor: '#c0c0c0',
        borderLeft: '2px solid #808080',
        borderRight: '2px solid #ffffff',
    },
    monitorBase: {
        width: 80,
        height: 8,
        backgroundColor: '#dfdfdf',
        borderTop: '2px solid #ffffff',
        borderLeft: '2px solid #ffffff',
        borderRight: '2px solid #808080',
        borderBottom: '2px solid #000000',
    },
    fieldset: {
        borderTop: '1px solid #808080',
        borderLeft: '1px solid #808080',
        borderRight: '1px solid #ffffff',
        borderBottom: '1px solid #ffffff',
        padding: '8px 10px 10px 10px',
        margin: 0,
        boxSizing: 'border-box',
    },
    legend: {
        fontFamily: '"MS Sans Serif", "Segoe UI", Tahoma, Arial, sans-serif',
        fontSize: 11,
        fontWeight: 'bold',
        color: '#000000',
        padding: '0 4px',
    },
    checkboxRow: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        marginTop: 4,
        marginBottom: 2,
    },
    checkboxLabel: {
        fontSize: 11,
        color: '#000000',
        fontWeight: 'normal',
    },
    helpText: {
        fontSize: 10,
        color: '#444444',
        marginLeft: 20,
        marginBottom: 8,
        lineHeight: 1.3,
    },
    colorRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginTop: 4,
    },
    colorSwatch: {
        width: 24,
        height: 24,
        backgroundColor: '#008080',
        border: '1px solid #000000',
        boxShadow: 'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080',
    },
    boldText: {
        fontWeight: 'bold',
        fontSize: 11,
    },
    smallNote: {
        fontSize: 10,
        color: '#555555',
    },
    infoTable: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 11,
    },
    tableKey: {
        fontWeight: 'bold',
        padding: '4px 6px 4px 0',
        width: 140,
        color: '#000000',
    },
    tableVal: {
        padding: '4px 0',
        color: '#000000',
    },
    badgeSuccess: {
        backgroundColor: '#e6f4ea',
        color: '#0d652d',
        fontWeight: 'bold',
        padding: '1px 6px',
        border: '1px solid #0d652d',
        fontSize: 10,
    },
    diagDesc: {
        fontSize: 11,
        margin: '0 0 6px 0',
        lineHeight: 1.3,
    },
    diagNotice: {
        marginTop: 6,
        padding: 6,
        backgroundColor: '#000080',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontSize: 10,
        boxShadow: 'inset 1px 1px 0px #000000',
    },
    aboutHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    aboutIconBox: {
        fontSize: 32,
    },
    aboutTitle: {
        fontWeight: 'bold',
        fontSize: 12,
        color: '#000000',
    },
    aboutSub: {
        fontSize: 10,
        color: '#444444',
        marginTop: 2,
    },
    aboutText: {
        fontSize: 11,
        lineHeight: 1.5,
        margin: '6px 0',
        color: '#000000',
    },
    divider: {
        height: 1,
        backgroundColor: '#808080',
        borderBottom: '1px solid #ffffff',
        margin: '8px 0',
    },
    appliedBanner: {
        marginTop: 6,
        padding: '4px 8px',
        backgroundColor: '#e6f4ea',
        border: '1px solid #0d652d',
        color: '#0d652d',
        fontWeight: 'bold',
        fontSize: 11,
    },
    buttonRow: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 6,
        marginTop: 10,
    },
};

export default SettingsApp;
