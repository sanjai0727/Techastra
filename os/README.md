# Techastra 95 Desktop OS

> **Retro Windows 95 Operating System & Competition Gateway**  
> Built with **React, TypeScript, Framer Motion, js-dos, and 95.css**.

---

## 🎯 Overview

The **Techastra 95 OS** provides a fully interactive retro workstation environment running inside the 3D CRT monitor (or standalone). It features:

- **Start Menu & Taskbar:** Windows 95 start menu with symposium branding, university logos, and quick launch shortcuts.
- **Code Rescue Shortcut:** Launches the live Code Rescue competition arena in an authentic vintage OS window or fullscreen.
- **Event Dossier:** Official competition rules, schedule (`08/10/2026`), venue (`IBM LAB`), and staff/student coordinator contacts.
- **Official Rulebook Viewer:** Direct access to the official 5-page rulebook and event proposal PDF.
- **Built-in Retro Games:** DOS Doom, Henordle (Wordle), Scrabble, and Oregon Trail via js-dos emulators.
- **Hardware Diagnostics:** Vintage system diagnostic utility with CRT and VCR filter toggles.

## 📁 Architecture

```
os/
├── public/                 # HTML shell, DOS emulators, and manifest.json
├── src/
│   ├── assets/             # Audio, vintage fonts, icons, pictures, rulebook PDF
│   ├── components/         # Applications (CodeRescue, Showcase, Settings, Games, Credits)
│   ├── constants/          # Application registries and window presets
│   ├── hooks/              # Audio playback and window layout hooks
│   ├── App.tsx             # Window manager and desktop layout
│   ├── index.css           # Authentic Windows 95 UI styling
│   └── index.tsx           # React DOM root entry
├── package.json            # Subsystem dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## 🛠️ Development & Building

- **Run Dev Server:** `npm start` (Runs on `http://localhost:3000`)
- **Build Production:** `npm run build` (Outputs bundle to `build/`)
