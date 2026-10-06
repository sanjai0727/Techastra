# Techastra Code Rescue Platform

> **Three-Round Competitive Debugging & Code Repair Arena**  
> Built with **React 18, TypeScript, Vite, Monaco Editor, Tailwind CSS, and Lucide Icons**.

---

## 🎯 Overview

The **Code Rescue** platform is the flagship technical competition system for Techastra 2026. It hosts three progressive competition rounds:

1. **Round 1 — Bug Hunt:** Syntax errors, off-by-one errors, and simple bug fixes in Python, C, C++, and Java.
2. **Round 2 — Logic Breaker:** Algorithmic failures, edge cases, and algorithmic optimization.
3. **Round 3 — Code Rescue:** System crashes, concurrency defects, and corrupt execution pipelines.

## 📁 Architecture

```
coderescue/
├── public/                 # Favicons and public static assets
├── src/
│   ├── assets/             # Brand logos (M.G.R. University logo)
│   ├── components/         # CodeEditor, Console, Header, ProctoringShield, OrganizerModal
│   ├── context/            # CompetitionContext (State management, timer, live telemetry)
│   ├── data/               # Round questions (R1, R2, R3) and rules
│   ├── pages/              # Welcome, Registration, Rules, RoundWorkspace, Leaderboard, Results
│   ├── services/           # executionEngine (Pyodide / mock compiler), storageService
│   ├── types/              # Competition TypeScript schemas and interfaces
│   ├── App.tsx             # Root application router
│   ├── index.css           # Global Tailwind and terminal styling
│   └── main.tsx            # Vite React entrypoint
├── package.json            # Subsystem dependencies and scripts
└── vite.config.ts          # Vite build and asset configuration
```

## 🛠️ Development & Building

- **Run Dev Server:** `npm run dev` (Runs on `http://localhost:5173/coderescue/`)
- **Build Distribution:** `npm run build` (Outputs bundle to `dist/`)
- **Deploy to Main Techastra Server:** `node ../scripts/deploy-coderescue.js` (or from root: `npm run build:coderescue`)
