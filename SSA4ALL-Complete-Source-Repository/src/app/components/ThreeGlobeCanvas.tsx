"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { SpaceAsset, SensorStation, ConjunctionEvent } from "../../types/ssa";
import { generateOrbitGroundTrack } from "../../utils/orbitPropagator";
import {
  Compass,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Target,
  Layers,
  Radio,
  Crosshair,
  ShieldAlert,
} from "lucide-react";

interface ThreeGlobeCanvasProps {
  assets: SpaceAsset[];
  sensors: SensorStation[];
  conjunctions: ConjunctionEvent[];
  selectedAsset: SpaceAsset | null;
  onSelectAsset: (asset: SpaceAsset) => void;
  targetCameraAssetId: string | null;
  onCameraFlyComplete?: () => void;
  theme?: "dark" | "light";
}

export const ThreeGlobeCanvas: React.FC<ThreeGlobeCanvasProps> = ({
  assets,
  sensors,
  conjunctions,
  selectedAsset,
  onSelectAsset,
  targetCameraAssetId,
  onCameraFlyComplete,
  theme = "dark",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const satelliteMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const orbitLinesGroupRef = useRef<THREE.Group | null>(null);
  const radarConesGroupRef = useRef<THREE.Group | null>(null);
  const collisionLineRef = useRef<THREE.Line | null>(null);

  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [showRadarBeams, setShowRadarBeams] = useState<boolean>(true);
  const [currentUtcTime, setCurrentUtcTime] = useState<string>("");

  const EARTH_RADIUS = 3.6;

  // UTC Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentUtcTime(new Date().toUTCString().replace("GMT", "UTC"));
    }, 1000);
    setCurrentUtcTime(new Date().toUTCString().replace("GMT", "UTC"));
    return () => clearInterval(timer);
  }, []);

  // Helper: Convert Lat/Lon/Alt to 3D Cartesian coordinates
  const latLonAltToVector3 = (lat: number, lon: number, altKm: number, radius = EARTH_RADIUS) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const r = radius + (altKm / 6371) * radius * 1.5;

    const x = -(r * Math.sin(phi) * Math.cos(theta));
    const z = r * Math.sin(phi) * Math.sin(theta);
    const y = r * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 2.5, 11);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Globe Group
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    const orbitLinesGroup = new THREE.Group();
    orbitLinesGroupRef.current = orbitLinesGroup;
    globeGroup.add(orbitLinesGroup);

    const radarConesGroup = new THREE.Group();
    radarConesGroupRef.current = radarConesGroup;
    globeGroup.add(radarConesGroup);

    // 1. Earth Base Mesh Sphere (Deep Space Duke Blue in dark, crisp slate in light)
    const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 48, 48);
    const earthMat = new THREE.MeshBasicMaterial({
      color: theme === "light" ? 0xf5f3ff : 0x0c0122,
      transparent: true,
      opacity: 0.94,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // 2. Earth Wireframe Lat/Lon Grid Mesh Lines (Duke Blue / Orange)
    const wireMat = new THREE.LineBasicMaterial({
      color: theme === "light" ? 0xd8b4fe : 0x4b148c,
      transparent: true,
      opacity: 0.75,
    });
    const wireMesh = new THREE.LineSegments(new THREE.WireframeGeometry(earthGeo), wireMat);
    globeGroup.add(wireMesh);

    // 3. Earth Equator & Prime Meridian Highlight Rings
    const equatorGeo = new THREE.RingGeometry(EARTH_RADIUS * 1.002, EARTH_RADIUS * 1.006, 64);
    const equatorMat = new THREE.MeshBasicMaterial({
      color: 0xff5b00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const equatorMesh = new THREE.Mesh(equatorGeo, equatorMat);
    equatorMesh.rotation.x = Math.PI / 2;
    globeGroup.add(equatorMesh);

    // 4. Continent Point Cloud Mesh (Glowing Neon Orange)
    const pointsGeo = new THREE.BufferGeometry();
    const pointCount = 2400;
    const positions = new Float32Array(pointCount * 3);

    for (let i = 0; i < pointCount; i++) {
      const lat = (Math.random() - 0.5) * 160;
      const lon = (Math.random() - 0.5) * 360;
      const vec = latLonAltToVector3(lat, lon, 0, EARTH_RADIUS * 1.002);
      positions[i * 3] = vec.x;
      positions[i * 3 + 1] = vec.y;
      positions[i * 3 + 2] = vec.z;
    }
    pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pointsMat = new THREE.PointsMaterial({
      color: 0xff5b00,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
    });
    const earthPoints = new THREE.Points(pointsGeo, pointsMat);
    globeGroup.add(earthPoints);

    // 5. Atmospheric Outer Glow
    const atmosGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.03, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0xff5b00,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosMesh);

    // 6. Collision Line Mesh
    const collisionGeo = new THREE.BufferGeometry();
    const collisionMat = new THREE.LineDashedMaterial({
      color: 0xff1e56,
      dashSize: 0.25,
      gapSize: 0.12,
      linewidth: 3,
    });
    const collisionLine = new THREE.Line(collisionGeo, collisionMat);
    collisionLineRef.current = collisionLine;
    globeGroup.add(collisionLine);

    // Drag Orbit Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !globeGroupRef.current) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globeGroupRef.current.rotation.y += deltaX * 0.005;
      globeGroupRef.current.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const zoomFactor = e.deltaY * 0.005;
      cameraRef.current.position.z = Math.max(6.0, Math.min(20, cameraRef.current.position.z + zoomFactor));
    };

    // Click Detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!cameraRef.current) return;
      raycaster.setFromCamera(mouse, cameraRef.current);

      const meshes: THREE.Object3D[] = [];
      satelliteMeshesRef.current.forEach((grp) => {
        grp.children.forEach((child) => meshes.push(child));
      });

      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        let parent = intersects[0].object.parent;
        if (parent && parent.userData && parent.userData.spaceAsset) {
          onSelectAsset(parent.userData.spaceAsset);
        }
      }
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("click", onClick);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (globeGroupRef.current && !isDragging) {
        globeGroupRef.current.rotation.y += 0.0012;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("click", onClick);

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [theme, onSelectAsset]);

  // Update Orbit Tracks, 3D Satellites, and Phased Array Radar Beams
  useEffect(() => {
    if (!globeGroupRef.current || !orbitLinesGroupRef.current || !radarConesGroupRef.current) return;
    const globe = globeGroupRef.current;
    const orbitGroup = orbitLinesGroupRef.current;
    const radarGroup = radarConesGroupRef.current;

    // 1. Build and Update Satellites & Glowing Orbit Curves
    assets.forEach((asset) => {
      const satPos = latLonAltToVector3(
        asset.calculatedPos.lat,
        asset.calculatedPos.lon,
        asset.calculatedPos.alt
      );

      const isSelected = selectedAsset?.id === asset.id;
      const isDebris = asset.type === "Debris" || asset.type === "Rocket Body";
      const isStation = asset.type === "Space Station";

      const colorHex = isSelected
        ? 0xffffff
        : isStation
        ? 0x00d2ff
        : isDebris
        ? 0xff1e56
        : 0xff5b00;

      let satGrp = satelliteMeshesRef.current.get(asset.id);

      if (!satGrp) {
        satGrp = new THREE.Group();
        satGrp.userData = { spaceAsset: asset };

        // Satellite Core Mesh
        const coreGeo = new THREE.SphereGeometry(isStation ? 0.12 : isDebris ? 0.065 : 0.09, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: colorHex });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        satGrp.add(coreMesh);

        // Outer Pulsing Halo Ring Mesh
        const haloGeo = new THREE.RingGeometry(0.14, 0.18, 16);
        const haloMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        satGrp.add(haloMesh);

        globe.add(satGrp);
        satelliteMeshesRef.current.set(asset.id, satGrp);

        // Prominent 3D Orbit Path Curve Mesh
        const points: THREE.Vector3[] = [];
        const orbitRadius = EARTH_RADIUS + (asset.calculatedPos.alt / 6371) * EARTH_RADIUS * 1.5;
        const inclinationRad = (asset.inclination * Math.PI) / 180;
        const numSegments = 90;

        for (let i = 0; i <= numSegments; i++) {
          const u = (i / numSegments) * Math.PI * 2;
          const x = orbitRadius * Math.cos(u);
          const y = orbitRadius * Math.sin(u) * Math.sin(inclinationRad);
          const z = orbitRadius * Math.sin(u) * Math.cos(inclinationRad);
          points.push(new THREE.Vector3(x, y, z));
        }

        const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
        const orbitMat = new THREE.LineBasicMaterial({
          color: isDebris ? 0xff1e56 : isStation ? 0x00d2ff : 0xff5b00,
          transparent: true,
          opacity: isSelected ? 0.95 : isDebris ? 0.4 : 0.65,
          linewidth: isSelected ? 2.5 : 1.5,
        });
        const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
        orbitGroup.add(orbitLine);
      } else {
        satGrp.position.copy(satPos);
        satGrp.userData.spaceAsset = asset;
      }
    });

    orbitGroup.visible = showOrbits;

    // 2. Render 3D Phased Array Radar Pedestals & Targeted Beams
    while (radarGroup.children.length > 0) {
      radarGroup.remove(radarGroup.children[0]);
    }

    if (showRadarBeams) {
      sensors.forEach((sensor) => {
        const radarPos = latLonAltToVector3(sensor.lat, sensor.lon, 0);

        // Ground Radar Base Mesh
        const baseGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.08, 16);
        const baseMat = new THREE.MeshBasicMaterial({ color: 0xff5b00 });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.copy(radarPos);
        baseMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), radarPos.clone().normalize());
        radarGroup.add(baseMesh);

        // Phased Array Antenna Dish Wireframe Mesh
        const dishGeo = new THREE.SphereGeometry(0.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const dishMat = new THREE.MeshBasicMaterial({
          color: sensor.isTracking ? 0xff5b00 : 0x64748b,
          wireframe: true,
        });
        const dishMesh = new THREE.Mesh(dishGeo, dishMat);
        dishMesh.position.copy(radarPos.clone().add(radarPos.clone().normalize().multiplyScalar(0.06)));
        dishMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), radarPos.clone().normalize());
        radarGroup.add(dishMesh);

        // Targeted 3D Radar Beam Cone Mesh
        let targetVec = radarPos.clone().normalize().multiplyScalar(EARTH_RADIUS + 2.0);
        if (sensor.isTracking && sensor.activeTargetId) {
          const target = assets.find((a) => a.id === sensor.activeTargetId);
          if (target) {
            targetVec = latLonAltToVector3(target.calculatedPos.lat, target.calculatedPos.lon, target.calculatedPos.alt);
          }
        }

        const beamDist = radarPos.distanceTo(targetVec);
        const dir = targetVec.clone().sub(radarPos).normalize();

        const beamGeo = new THREE.ConeGeometry(0.45, beamDist, 16, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
          color: sensor.isTracking ? 0xff5b00 : 0x00d2ff,
          transparent: true,
          opacity: sensor.isTracking ? 0.35 : 0.12,
          side: THREE.DoubleSide,
        });

        beamGeo.translate(0, -beamDist / 2, 0);

        const beamMesh = new THREE.Mesh(beamGeo, beamMat);
        beamMesh.position.copy(radarPos);
        beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
        radarGroup.add(beamMesh);
      });
    }

    // 3. Collision Vector
    const criticalConj = conjunctions.find((c) => c.riskLevel === "CRITICAL" && c.maneuverStatus !== "AVOIDED");
    if (criticalConj && collisionLineRef.current) {
      const primary = assets.find((a) => a.id === criticalConj.primaryAssetId);
      const chaser = assets.find((a) => a.id === criticalConj.chaserDebrisId);
      if (primary && chaser) {
        const p1 = latLonAltToVector3(primary.calculatedPos.lat, primary.calculatedPos.lon, primary.calculatedPos.alt);
        const p2 = latLonAltToVector3(chaser.calculatedPos.lat, chaser.calculatedPos.lon, chaser.calculatedPos.alt);
        collisionLineRef.current.geometry.setFromPoints([p1, p2]);
        collisionLineRef.current.visible = true;
      }
    } else if (collisionLineRef.current) {
      collisionLineRef.current.visible = false;
    }
  }, [assets, sensors, conjunctions, selectedAsset, showOrbits, showRadarBeams]);

  useEffect(() => {
    if (!targetCameraAssetId || !globeGroupRef.current) return;
    const target = assets.find((a) => a.id === targetCameraAssetId);
    if (!target) return;

    const targetPos = latLonAltToVector3(target.calculatedPos.lat, target.calculatedPos.lon, target.calculatedPos.alt);
    const globe = globeGroupRef.current;

    const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
      targetPos.clone().normalize(),
      new THREE.Vector3(0, 0, 1)
    );
    globe.quaternion.slerp(targetQuaternion, 0.85);

    if (onCameraFlyComplete) onCameraFlyComplete();
  }, [targetCameraAssetId, assets, onCameraFlyComplete]);

  const resetCamera = useCallback(() => {
    if (!cameraRef.current || !globeGroupRef.current) return;
    cameraRef.current.position.set(0, 2.5, 11);
    cameraRef.current.lookAt(0, 0, 0);
    globeGroupRef.current.quaternion.set(0, 0, 0, 1);
  }, []);

  const handleZoom = useCallback((direction: "in" | "out") => {
    if (!cameraRef.current) return;
    const step = direction === "in" ? -1.5 : 1.5;
    cameraRef.current.position.z = Math.max(6.0, Math.min(20, cameraRef.current.position.z + step));
  }, []);

  return (
    <div
      className={`relative w-full h-full min-h-[520px] rounded-3xl overflow-hidden border transition-all ${
        theme === "light"
          ? "bg-purple-50/50 border-purple-200 shadow-md"
          : "bg-[#090117] border-[rgba(75,20,140,0.7)] shadow-2xl"
      }`}
    >
      <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top Banner Chip */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-20">
        <div
          className={`px-4 py-2 rounded-xl flex items-center gap-3.5 pointer-events-auto border backdrop-blur-md ${
            theme === "light"
              ? "bg-white/95 border-purple-200 text-purple-950 shadow-sm"
              : "bg-[#1c0248]/90 border-[rgba(100,35,185,0.7)] text-white"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-orbit-orange animate-orange-pulse inline-block" />
            <span className="font-display text-xs font-black tracking-widest uppercase">
              ORBITAL SURVEILLANCE MATRIX
            </span>
          </div>
          <div className="h-4 w-[1px] bg-purple-700/60" />
          <div className="font-mono text-xs opacity-90">
            TRACKING: <span className="text-orbit-orange font-bold">{assets.length}</span> OBJECTS
          </div>
          <div className="h-4 w-[1px] bg-purple-700/60 hidden sm:block" />
          <div className="font-mono text-xs text-orbit-crimson hidden sm:block font-bold">
            ACTIVE CDMs:{" "}
            {conjunctions.filter((c) => c.riskLevel === "CRITICAL" && c.maneuverStatus !== "AVOIDED").length} CRITICAL
          </div>
        </div>

        <div
          className={`px-3.5 py-2 rounded-xl flex items-center gap-2 pointer-events-auto font-mono text-xs border backdrop-blur-md ${
            theme === "light"
              ? "bg-white/95 border-purple-200 text-purple-950 shadow-sm"
              : "bg-[#1c0248]/90 border-[rgba(100,35,185,0.7)] text-slate-200"
          }`}
        >
          <Compass className="w-4 h-4 text-orbit-orange animate-pulse" />
          <span>{currentUtcTime || "SYNCING UTC..."}</span>
        </div>
      </div>

      {/* Selected Object HUD Card */}
      {selectedAsset && (
        <div
          className={`absolute top-20 left-4 p-4 rounded-2xl max-w-xs z-20 border-l-4 border-l-orbit-orange border backdrop-blur-md ${
            theme === "light"
              ? "bg-white/95 border-purple-200 text-purple-950 shadow-xl"
              : "bg-[#1c0248]/95 border-[rgba(100,35,185,0.8)] text-white shadow-2xl"
          }`}
        >
          <div className="flex justify-between items-start gap-2 mb-2.5">
            <div className="text-sm font-bold font-sans truncate">
              {selectedAsset.name}
            </div>
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded font-mono uppercase font-bold ${
                selectedAsset.type === "Debris"
                  ? "bg-orbit-crimson/20 text-orbit-crimson border border-orbit-crimson/50"
                  : "bg-orbit-orange/20 text-orbit-orange border border-orbit-orange/50"
              }`}
            >
              {selectedAsset.type}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 font-mono text-xs opacity-95">
            <div>NORAD: <span className="font-semibold">{selectedAsset.noradId}</span></div>
            <div>STATUS: <span className="font-semibold">{selectedAsset.status}</span></div>
            <div>LAT: <span className="text-orbit-orange font-bold">{selectedAsset.calculatedPos.lat.toFixed(2)}°</span></div>
            <div>LON: <span className="text-orbit-orange font-bold">{selectedAsset.calculatedPos.lon.toFixed(2)}°</span></div>
            <div>ALT: <span>{selectedAsset.calculatedPos.alt.toFixed(1)} km</span></div>
            <div>VEL: <span className="text-orbit-orange font-bold">{selectedAsset.calculatedPos.velocity} km/s</span></div>
            <div className="col-span-2 text-xs opacity-80 truncate mt-1">
              RCS: <span>{selectedAsset.radarCrossSection} m²</span> | INCL: <span>{selectedAsset.inclination}°</span>
            </div>
          </div>
        </div>
      )}

      {/* Radar / Orbit Toggles */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 z-20">
        <div
          className={`p-1.5 rounded-xl flex items-center gap-2 border backdrop-blur-md ${
            theme === "light" ? "bg-white/95 border-purple-200" : "bg-[#1c0248]/90 border-[rgba(100,35,185,0.7)]"
          }`}
        >
          <button
            onClick={() => setShowOrbits(!showOrbits)}
            className={`px-3.5 py-1.5 text-xs font-sans font-bold rounded-lg transition-all ${
              showOrbits
                ? "bg-orbit-orange text-white shadow-orange-glow"
                : "bg-neutral-900 border border-neutral-700 text-neutral-400"
            }`}
          >
            Orbits {showOrbits ? "ON" : "OFF"}
          </button>
          <button
            onClick={() => setShowRadarBeams(!showRadarBeams)}
            className={`px-3.5 py-1.5 text-xs font-sans font-bold rounded-lg transition-all ${
              showRadarBeams
                ? "bg-orbit-orange text-white shadow-orange-glow"
                : "bg-neutral-900 border border-neutral-700 text-neutral-400"
            }`}
          >
            Radar Beams {showRadarBeams ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
        <button
          onClick={() => handleZoom("in")}
          className={`p-2.5 rounded-xl border transition-all ${
            theme === "light"
              ? "bg-white border-purple-200 text-purple-950 hover:bg-purple-50"
              : "bg-[#1c0248] border-[rgba(100,35,185,0.7)] text-white hover:border-orbit-orange"
          }`}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom("out")}
          className={`p-2.5 rounded-xl border transition-all ${
            theme === "light"
              ? "bg-white border-purple-200 text-purple-950 hover:bg-purple-50"
              : "bg-[#1c0248] border-[rgba(100,35,185,0.7)] text-white hover:border-orbit-orange"
          }`}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetCamera}
          className={`px-3.5 py-2.5 rounded-xl text-xs font-sans font-bold border flex items-center gap-1.5 transition-all ${
            theme === "light"
              ? "bg-white border-purple-200 text-purple-950 hover:bg-purple-50"
              : "bg-[#1c0248] border-[rgba(100,35,185,0.7)] text-white hover:border-orbit-orange"
          }`}
          title="Reset Camera View"
        >
          <Target className="w-4 h-4 text-orbit-orange" />
          <span>RESET VIEW</span>
        </button>
      </div>
    </div>
  );
};
