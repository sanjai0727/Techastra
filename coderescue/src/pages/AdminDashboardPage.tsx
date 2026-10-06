import React from 'react';

/**
 * AdminDashboardPage (Contestant Application Boundary)
 *
 * Notice: All administrative management, timer adjustments, scoring reveals,
 * and contestant oversight are strictly restricted to the standalone
 * Coordinator Command Center at `/admin`.
 */
export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="win95-window max-w-xl w-full mx-auto my-8 p-4">
      <div className="win95-titlebar mb-4 flex items-center justify-between">
        <span>SECURITY NOTICE — TOURNAMENT ADMINISTRATION</span>
        <button className="win95-button px-1.5 py-0 text-xs font-bold leading-none">✕</button>
      </div>
      <div className="p-4 bg-white border border-[#808080] text-sm">
        <p className="font-bold text-[#000080] mb-2">RESTRICTED COORDINATOR PORTAL</p>
        <p className="mb-4 text-black">
          Contestant arena terminals are locked to participant code rescue triage.
          The official Coordinator Command Center and Event Telemetry Dashboard is located at:
        </p>
        <div className="p-3 bg-[#f0f0f0] font-mono font-bold text-center border border-[#ccc] mb-4 text-[#000080]">
          /admin
        </div>
        <p className="text-xs text-[#555] mb-4">
          To manage master clocks, review proctoring flags, or reveal final rankings,
          please authenticate via the official coordinator portal.
        </p>
        <div className="flex justify-end gap-2">
          <a
            href="/admin"
            className="win95-button font-bold text-xs px-3 py-1 text-black no-underline"
          >
            Open Admin Portal (/admin)
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
