# Techastra Coordinator Admin Portal

> **Real-Time Proctoring & Event Control Center**  
> Built with **React, TypeScript, Webpack, and Tailwind/Lucide icons**.

---

## 🎯 Overview

The **Admin Portal** gives symposium faculty, student coordinators, and proctors full supervisory control over the ongoing Code Rescue competition:

- **Live Participant Grid:** Real-time roster of all registered participants, current round, solved problems, elapsed time, and status.
- **Real-Time Screen & Code Broadcast:** Inspect live contestant screens, typing activity, and editor code via Server-Sent Events (SSE).
- **Proctoring Audit Trail:** Instant notifications for tab switching, fullscreen escapes, copy-paste attempts, and strike warnings.
- **Contest Life Cycle Controls:** Toggle live score hiding vs end-of-event score release, or perform emergency contest resets.
- **Export Data:** Download CSV/JSON reports of final standings, timestamps, and proctoring logs.

## 🔐 Authentication

- **Portal URL:** `http://localhost:8080/admin`
- **Username:** `admin`
- **Passkey:** `techastra2026`

## 📁 Architecture

```
admin/
├── components/             # LiveGrid, ParticipantDetailModal, ScreenViewer, LogViewer
├── data/                   # Initial coordinator schemas
├── pages/                  # AdminPortalPage, AuthModal
├── services/               # adminApiService (REST endpoints & SSE stream listeners)
├── types/                  # Admin telemetry & proctoring event schemas
├── index.tsx               # Admin entry point
└── styles.css              # Dark cyberpunk proctor control styling
```
