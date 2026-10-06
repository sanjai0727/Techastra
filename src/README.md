# Techastra 3D Interactive Workstation

> **Three.js 3D Virtual Room & Interactive CRT Monitor**  
> Built with **Three.js, WebGL, TypeScript, and CSS3DRenderer**.

---

## 🎯 Overview

The **3D Workstation** creates an immersive retro computer lab ambiance:

- **3D Room Rendering:** Real-time WebGL rendering of an authentic vintage computing desk with keyboard, mouse, cassette player, and CRT monitor.
- **CSS3D Screen Integration:** An interactive CSS3D monitor display running the Windows 95 desktop OS or Code Rescue arena seamlessly inside the 3D room.
- **Smooth Orbit & Zoom Controls:** Camera transitions smoothly between the overall room view and up-close monitor view.
- **Fullscreen Mode:** One-click toggle allowing contestants to focus solely on the workspace during rounds, with a return button (`ESC`) to restore the 3D room view.

## 📁 Architecture

```
src/
├── Application/            # Three.js scene graph, camera controls, materials, and loaders
├── index.html              # HTML shell containing WebGL and CSS3D container elements
├── script.ts               # Main TypeScript entry bootstrapping the 3D scene
├── style.css               # Viewport, overlay, and fullscreen HUD styles
├── tsconfig.json           # TypeScript configuration
└── types.d.ts              # Global type definitions
```
