# 🛰️ SSA4ALL // ORBITAL INTELLIGENCE LAB

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)](LICENSE)

**SSA4ALL** is a high-performance, web-native **Space Domain Awareness (SDA)** and **Orbital Intelligence** platform. Designed for mission operators, space traffic managers, and orbital analysts, SSA4ALL provides real-time SGP4/SDP4 orbit propagation, phased-array radar tasking, collision avoidance maneuver (CAM) planning, spacecraft multiphysics diagnostics, and decentralized open sensor ingestion.

---
<img width="1886" height="1057" alt="s1" src="https://github.com/user-attachments/assets/b407af7c-448a-4704-86c6-fee9a79c9483" />

## Introduction to SSA4ALL - https://youtu.be/Oo9oQSz3ykY

## 🌟 Key Capabilities & Architecture

### 1. 🌍 Real-Time 3D Orbital Surveillance Matrix
- **Keplerian Orbit Propagation:** Precision client-side SGP4/SDP4 state vector calculation powered by `satellite.js` and custom orbital integrators.
- **Interactive 3D Earth Globe:** Procedural Earth continent mapping, day/night graticule, illuminated status halos, and glowing 3D orbital trajectory ellipses for all tracked assets ($28.5^\circ$ to $98.5^\circ$ inclinations).
- **Target Tracking HUD:** Instant readout of geodetic coordinates ($\text{Lat, Lon, Alt}$), orbital velocity ($v$), apogee/perigee, radar cross-section ($\text{RCS}$), and NORAD catalog telemetry.

### 2. 📡 Multi-Mission Phased Array Radar Network
- **Interactive Array Tasking:** Real-time beam steering and target assignment across global radar stations (Otago, Guanacaste, Santa Maria, Midland, Cape York, Puertollano).
- **Radar Range Equation Analytics:**
  $$SNR = \frac{P_t G^2 \lambda^2 \sigma}{(4\pi)^3 k T_0 B F R^4 L}$$
- **Doppler Velocity Profiler:** Line-of-sight range-rate measurement ($\Delta f = \frac{2 v_r f_0}{c}$) and pulse compression chirp analysis.
- **T/R Element Tile Matrix:** 128 solid-state GaN Transmit/Receive modules with phase calibration, beamforming vector graphics, and pass horizon scheduling (AOS, TCA, LOS).

### 3. ⚠️ Conjunction Assessment & Autonomous Collision Avoidance
- **Automated Screening:** Screening volume screening for close approaches between operational satellites and orbital debris (e.g. COSMOS 2251, Fengyun-1C).
- **Foster 3D Probability Density Integration ($P_c$):** Real-time probability of collision calculation from encounter covariance ellipsoids.
- **Impulsive CAM Trajectory Optimization:** Instant calculation of $\Delta V$ posigrade/retrograde burn vectors ($m/s$) with post-maneuver miss distance expansion ($>6\text{ km}$) and $P_c$ neutralization.
- **Authoritative CCSDS 508.0 CDM Export:** Downloadable Conjunction Data Message (CDM) files in standard format.
<img width="1887" height="965" alt="s2" src="https://github.com/user-attachments/assets/2be7944c-95a4-4961-8440-7d21569a2d55" />


### 4. 🛰️ Spacecraft Multiphysics Telemetry & TLE Data
- **Payload Subsystems:** Sensor Focal Plane Array (FPA) cryogenic temperatures ($-120.4^\circ\text{C}$), high-speed X/Ka-band downlink status ($850\text{ Mbps}$), reaction wheel momentum rates ($RW_1 \dots RW_4$), and thruster propellant budgets.
- **Two-Line Element (TLE) Sets:** Raw Line 1 & Line 2 inspection with one-click copy and Keplerian orbital element breakdowns.
- **Thermal & Environmental Flux Simulator:** Dynamic solar radiation flux ($1,000 - 1,800\text{ W/m}^2$), thermal radiator deployment, and solar particle storm simulation.
<img width="1845" height="747" alt="s4" src="https://github.com/user-attachments/assets/364e874b-8689-470f-92ad-77bd482e1661" />

### 5. 🌐 Open Sensor Ecosystem & Telescope Astrometry
- **🛰️ TinyGS Global LoRa Network:** Live ingestion of demodulated UHF ($433/868/915\text{ MHz}$) CubeSat LoRa frames from over 2,100+ global ground stations with decoded bus voltage, solar currents, and 3-axis gyro rates.
- **📡 SatNOGS SDR Network:** Open-source SDR observations with high-resolution Waterfall RF spectrograms, carrier Doppler curves, and frame counters.
- **🔭 MASCARA All-Sky Optical Telescopes:** Sub-arcsecond astrometric coordinates ($\text{RA } \alpha, \text{Dec } \delta$) and photometric light curve tumble period analysis ($P_{\text{tumble}} = 142.4\text{s}$) from La Palma and La Silla observatories.
<img width="1222" height="825" alt="s3" src="https://github.com/user-attachments/assets/81405fc3-5411-4d5c-8df7-a914fcd05b16" />

### 6. 🤖 AI Flight Dynamics Copilot
- **Tactical Command Parser:** Natural language command interpreter supporting rapid macros:
  - `/camera-target <assetId>` — Vector camera directly to target orbital object.
  - `/filter [debris|satellites|all]` — High-speed asset catalog filtering.
  - `/system-override-safety` — Autonomous execution of collision avoidance burns.
  - `/generate-report` — Multi-agency OpenSSA compliance report compilation.

### Demo: https://ankur608.github.io/SSA4ALL/ 
---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js** v18.17.0 or higher
- **npm** or **yarn** / **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   cd <YOUR_REPO_NAME>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📦 Deployment to GitHub Pages

This project is pre-configured with Next.js static HTML export (`output: 'export'`) and automated GitHub Actions deployment.

### Option A: Automatic Deployment (GitHub Actions)
1. Push your code to the `main` or `master` branch on GitHub:
   ```bash
   git add .
   git commit -m "Deploy SSA4ALL Orbital Intelligence Lab"
   git push origin main
   ```
2. Go to your GitHub repository $\rightarrow$ **Settings** $\rightarrow$ **Pages**.
3. Under **Build and deployment $\rightarrow$ Source**, select **`GitHub Actions`**.
4. The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) will automatically build and publish the site!

### Option B: Manual Deployment via `gh-pages`
```bash
npm run build
npx gh-pages -d out --dotfiles
```

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | [Next.js 14 (App Router)](https://nextjs.org/) |
| **UI Library** | [React 18](https://react.dev/) |
| **3D Engine** | [Three.js](https://threejs.org/) |
| **Astrodynamics** | [Satellite.js (SGP4/SDP4)](https://github.com/shashwatak/satellite-js) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 📄 Standards & Protocol Compliance

- **CCSDS 508.0-B-1** — Conjunction Data Message (CDM) Standard
- **NORAD TLE** — Two-Line Element Set Format (CelesTrak / Space-Track compatible)
- **WGS-84** — Earth Gravitational and Geodetic Model
- **OpenSSA / CCSDS OCM** — Orbit Comprehensive Message Architecture

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>SSA4ALL // ORBITAL INTELLIGENCE LAB</strong><br>
  <em>Next-Generation Space Domain Awareness & Orbital Intelligence</em>
</p>
