# Eko Horizons — Milestone 1

A playable 3D browser prototype for an original Nigerian city-life simulator, built with HTML, CSS, JavaScript and Three.js.

## Run in VS Code with Live Server
1. Extract the ZIP to a normal folder.
2. Open the extracted `Eko_Horizons_MVP` folder in VS Code.
3. Install the **Live Server** extension if you don't already have it.
4. Right-click `index.html` → **Open with Live Server**.
5. Keep internet access on; Three.js is loaded from jsDelivr CDN.
6. Click **ENTER THE CITY**.

Do not double-click `index.html` to open as a `file://` page. JavaScript module imports usually require a local server.

## Controls
- **W A S D** or arrow keys: move
- **Shift**: run
- **Space**: jump
- **Mouse drag**: rotate the third-person camera
- **E**: interact near selected businesses
- **M**: open/close the map overlay

## Implemented
- Live 3D rendering with Three.js
- Controllable third-person character assembled from 3D meshes
- Keyboard movement, running, jumping, and basic building collision boundaries
- Mouse-drag camera control
- Nigerian-inspired street area, local business signs, market stalls, trees, and a danfo-style bus
- HUD, map overlay, starter wallet, exploration objective and in-game reward
- Responsive overlay UI

## Honest limitations
This is a **Milestone 1 prototype**, not a finished AAA game. Character and vehicle shapes are prototype meshes, not production assets. There is no skeletal animation, drivable vehicle system, persistent save, full traffic/pedestrian AI, interiors, audio, multiplayer, or mobile touch controls yet. Business interactions currently show information only; purchases are not implemented. The environment is a small handcrafted neighbourhood, not a full Lagos-scale world.

## Troubleshooting
- **Blank page:** use Live Server, not `file://`; press F12 and check Console for errors; confirm internet access to jsDelivr.
- **Slow performance:** close other tabs; the prototype caps render pixel ratio at 1.5.
- **Controls don't work:** click **ENTER THE CITY** first.
- **Live Server missing:** VS Code → Extensions → search `Live Server` → Install.

## Structure
```
Eko_Horizons_MVP/
├── index.html
├── style.css
├── game.js
└── README.md
```
