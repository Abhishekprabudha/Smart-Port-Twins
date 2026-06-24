# SMART Axiata × AIonOS Agentic Port Twin HTML Platform

A GitHub Pages-ready, front-end-only demo platform for port terminal operators. It converts the POV deck story into a live cockpit showing telemetry for all deck agents:

- Yard Stack Optimization Agent
- Berth & Crane Scheduling Twin
- Gate Appointment + Queue Agent
- Port Dispatch Orchestrator
- Vessel ETA + Berth Stay Predictor
- Equipment Health + Maintenance Agent
- Safety, Security + Compliance Agent
- Trade Documentation + Release Agent
- Energy, Reefer + ESG Agent
- Billing, Demurrage + Revenue Leakage Agent

## What is included

```text
index.html                     Main platform
src/styles.css                 Consulting-style dark UI theme
src/app.js                     Synthetic live telemetry simulation
data/agents.json               Agent portfolio and KPI data
data/kpi_timeseries.json       Time-series telemetry
/data/port_objects.json        Vessels, equipment, gate lanes
assets/videos/                 Uploaded demo and port videos
assets/images/                 Attached port twin slide visual
docs/                          Source POV deck reference
```

## Run locally

Because the app uses `fetch()` for local JSON, run it through a simple static server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Deploy on GitHub Pages

1. Create a new GitHub repository.
2. Upload all files from this folder to the repository root.
3. Go to **Settings → Pages**.
4. Set source to **Deploy from a branch**.
5. Select branch **main** and folder **/** root.
6. Save and open the generated GitHub Pages URL.

## Demo talk track

1. Start with the hero video and explain the operating loop: **sense → predict → decide → act**.
2. Open the agent section and show how each terminal function becomes an agentic loop.
3. Move to telemetry and show KPI movement, event stream, vessel risk, equipment health and gate queues.
4. Close with the architecture: Smart Axiata anchors connectivity and managed service; AIonOS supplies the agentic twin core, workflows and governance.

## No backend

The platform is pure HTML, CSS, JavaScript and JSON. It is safe to host on GitHub Pages or any static web host.
