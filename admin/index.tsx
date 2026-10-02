// ============================================================================
// TECHASTRA 2026 ADMIN PORTAL ENTRY POINT
// Provides standalone mounting and window.mountTechastraAdmin hook for Event Dossier integration.
// ============================================================================

import React from 'react';
import ReactDOM from 'react-dom';
import AdminPortal from './pages/AdminPortal';
import './styles.css';

// Export for external consumption
export { AdminPortal };

// Global mounting function for embedding inside Event Dossier or iframe
declare global {
    interface Window {
        mountTechastraAdmin?: (container: HTMLElement, forcedView?: 'login' | 'dashboard') => void;
        unmountTechastraAdmin?: (container: HTMLElement) => void;
        TechastraAdmin?: typeof AdminPortal;
    }
}

window.TechastraAdmin = AdminPortal;

window.mountTechastraAdmin = (container: HTMLElement, forcedView?: 'login' | 'dashboard') => {
    if (!container) return;
    ReactDOM.render(React.createElement(AdminPortal, { forcedView }), container);
};

window.unmountTechastraAdmin = (container: HTMLElement) => {
    if (!container) return;
    ReactDOM.unmountComponentAtNode(container);
};

// Auto-mount if root exists and not in embedded mode
const autoMountAdmin = () => {
    const rootElement = document.getElementById('techastra-admin-root') || document.getElementById('admin-root');
    if (rootElement && !rootElement.hasAttribute('data-admin-mounted')) {
        rootElement.setAttribute('data-admin-mounted', 'true');
        ReactDOM.render(React.createElement(AdminPortal, {}), rootElement);
    }
};

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoMountAdmin);
    } else {
        autoMountAdmin();
    }
    // Secondary safety mount
    window.addEventListener('load', autoMountAdmin);
}

