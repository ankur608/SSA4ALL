"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { SpaceAsset, SensorStation, ConjunctionEvent } from "../../types/ssa";
import { generateOrbitGroundTrack, propagateSatellite } from "../../utils/orbitPropagator";
import { Crosshair, Eye, ShieldAlert, Radio, Compass, RefreshCw, ZoomIn, ZoomOut, Layers, Activity, Target } from "lucide-react";

interface CesiumCanvasProps {
  assets: SpaceAsset[];
  sensors: SensorStation[];
  conjunctions: ConjunctionEvent[];
  selectedAsset: SpaceAsset | null;
  onSelectAsset: (asset: SpaceAsset) => void;
  targetCameraAssetId: string | null;
  onCameraFlyComplete?: () => void;
}

declare global {
  interface Window {
    Cesium?: any;
    CESIUM_BASE_URL?: string;
  }
}

export const CesiumCanvas: React.FC<CesiumCanvasProps> = ({
  assets,
  sensors,
  conjunctions,
  selectedAsset,
  onSelectAsset,
  targetCameraAssetId,
  onCameraFlyComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const entitiesRef = useRef<{
    assetEntities: Map<string, any>;
    orbitLines: Map<string, any>;
    sensorCones: Map<string, any>;
    conjunctionLines: Map<string, any>;
  }>({
    assetEntities: new Map(),
    orbitLines: new Map(),
    sensorCones: new Map(),
    conjunctionLines: new Map(),
  });

  const [cesiumLoaded, setCesiumLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [showRadarBeams, setShowRadarBeams] = useState<boolean>(true);
  const [currentUtcTime, setCurrentUtcTime] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentUtcTime(new Date().toUTCString().replace("GMT", "UTC"));
    }, 1000);
    setCurrentUtcTime(new Date().toUTCString().replace("GMT", "UTC"));
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (window.Cesium) {
      setCesiumLoaded(true);
      return;
    }

    window.CESIUM_BASE_URL = "https://cesium.com/downloads/cesiumjs/releases/1.120/Build/Cesium/";

    const script = document.createElement("script");
    script.src = "https://cesium.com/downloads/cesiumjs/releases/1.120/Build/Cesium/Cesium.js";
    script.async = true;
    script.onload = () => {
      if (isMounted) setCesiumLoaded(true);
    };
    script.onerror = () => {
      if (isMounted) setLoadError("Failed to load Cesium 3D engine.");
    };

    document.head.appendChild(script);
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!cesiumLoaded || !containerRef.current || viewerRef.current || !window.Cesium) return;
    const Cesium = window.Cesium;

    try {
      Cesium.Ion.defaultAccessToken = "";

      const viewer = new Cesium.Viewer(containerRef.current, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        scene3DOnly: true,
        shouldAnimate: true,
        skyAtmosphere: false,
        imageryProvider: new Cesium.TileMapServiceImageryProvider({
          url: Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
        }),
      });

      // Pure pitch-black space atmosphere & deep slate globe tone
      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#000000");
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#08080C");
      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.depthTestAgainstTerrain = false;

      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(0.0, 20.0, 20000000.0),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-90),
          roll: 0,
        },
      });

      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((click: any) => {
        const pickedObject = viewer.scene.pick(click.position);
        if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.spaceAssetData) {
          onSelectAsset(pickedObject.id.spaceAssetData);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      viewerRef.current = viewer;

      return () => {
        handler.destroy();
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          viewerRef.current.destroy();
          viewerRef.current = null;
        }
      };
    } catch (err) {
      console.error("Cesium initialization error:", err);
      setLoadError("Cesium 3D initialization failed.");
    }
  }, [cesiumLoaded, onSelectAsset]);

  useEffect(() => {
    if (!viewerRef.current || !window.Cesium) return;
    const Cesium = window.Cesium;
    const viewer = viewerRef.current;
    const { assetEntities, orbitLines, sensorCones, conjunctionLines } = entitiesRef.current;

    assets.forEach((asset) => {
      const isSelected = selectedAsset?.id === asset.id;
      const isDebris = asset.type === "Debris" || asset.type === "Rocket Body";
      const isStation = asset.type === "Space Station";

      // Minimalist Palette: Mint Green (#00F299), Ice Blue (#00D2FF), Scarlet (#FF2E5B)
      const color = isSelected
        ? Cesium.Color.fromCssColorString("#00F299")
        : isStation
        ? Cesium.Color.fromCssColorString("#00D2FF")
        : isDebris
        ? Cesium.Color.fromCssColorString("#FF2E5B")
        : Cesium.Color.fromCssColorString("#00F299");

      const posCartesian = Cesium.Cartesian3.fromDegrees(
        asset.calculatedPos.lon,
        asset.calculatedPos.lat,
        asset.calculatedPos.alt * 1000
      );

      let entity = assetEntities.get(asset.id);

      if (!entity) {
        entity = viewer.entities.add({
          name: asset.name,
          position: posCartesian,
          point: {
            pixelSize: isSelected ? 12 : isStation ? 9 : isDebris ? 6 : 7,
            color: color,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: isSelected ? 2 : 1,
          },
          label: {
            text: asset.name,
            font: "10px Inter, sans-serif",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            fillColor: color,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -9),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 32000000),
          },
        });
        entity.spaceAssetData = asset;
        assetEntities.set(asset.id, entity);
      } else {
        entity.position = posCartesian;
        entity.point.color = color;
        entity.point.pixelSize = isSelected ? 12 : isStation ? 9 : isDebris ? 6 : 7;
        entity.spaceAssetData = asset;
      }

      let orbitEntity = orbitLines.get(asset.id);
      if (showOrbits) {
        if (!orbitEntity) {
          const trackPoints = generateOrbitGroundTrack(asset.tleLine1, asset.tleLine2, 95, 120);
          const cartesianPositions = trackPoints.map((pt) =>
            Cesium.Cartesian3.fromDegrees(pt.lon, pt.lat, pt.alt * 1000)
          );

          orbitEntity = viewer.entities.add({
            name: `${asset.name}_Orbit`,
            polyline: {
              positions: cartesianPositions,
              width: isSelected ? 2.5 : 1.1,
              material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: isSelected ? 0.35 : 0.12,
                color: isSelected
                  ? Cesium.Color.fromCssColorString("#00F299")
                  : isDebris
                  ? Cesium.Color.fromCssColorString("rgba(255, 46, 91, 0.45)")
                  : Cesium.Color.fromCssColorString("rgba(0, 242, 153, 0.3)"),
              }),
            },
          });
          orbitLines.set(asset.id, orbitEntity);
        } else {
          orbitEntity.show = true;
          orbitEntity.polyline.width = isSelected ? 2.5 : 1.1;
        }
      } else if (orbitEntity) {
        orbitEntity.show = false;
      }
    });

    sensors.forEach((sensor) => {
      let coneEntity = sensorCones.get(sensor.id);
      if (showRadarBeams) {
        const apexPosition = Cesium.Cartesian3.fromDegrees(
          sensor.lon,
          sensor.lat,
          sensor.altMeters + (sensor.rangeKm * 1000) / 2
        );

        if (!coneEntity) {
          coneEntity = viewer.entities.add({
            name: `${sensor.name}_Beam`,
            position: apexPosition,
            cylinder: {
              length: sensor.rangeKm * 1000,
              topRadius: sensor.rangeKm * 400,
              bottomRadius: 300,
              material: sensor.isTracking
                ? Cesium.Color.fromCssColorString("rgba(0, 242, 153, 0.15)")
                : Cesium.Color.fromCssColorString("rgba(0, 210, 255, 0.05)"),
              outline: true,
              outlineColor: sensor.isTracking
                ? Cesium.Color.fromCssColorString("rgba(0, 242, 153, 0.55)")
                : Cesium.Color.fromCssColorString("rgba(0, 210, 255, 0.2)"),
            },
          });

          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(sensor.lon, sensor.lat, sensor.altMeters),
            point: {
              pixelSize: 8,
              color: Cesium.Color.fromCssColorString("#00F299"),
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 1.5,
            },
            label: {
              text: `[SSN] ${sensor.name.split(" ")[0]}`,
              font: "10px Inter, sans-serif",
              fillColor: Cesium.Color.fromCssColorString("#00F299"),
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, 10),
            },
          });

          sensorCones.set(sensor.id, coneEntity);
        } else {
          coneEntity.show = true;
        }
      } else if (coneEntity) {
        coneEntity.show = false;
      }
    });

    conjunctions.forEach((conj) => {
      const primary = assets.find((a) => a.id === conj.primaryAssetId);
      const chaser = assets.find((a) => a.id === conj.chaserDebrisId);

      let lineEntity = conjunctionLines.get(conj.id);
      if (primary && chaser && conj.riskLevel === "CRITICAL" && conj.maneuverStatus !== "AVOIDED") {
        const p1 = Cesium.Cartesian3.fromDegrees(
          primary.calculatedPos.lon,
          primary.calculatedPos.lat,
          primary.calculatedPos.alt * 1000
        );
        const p2 = Cesium.Cartesian3.fromDegrees(
          chaser.calculatedPos.lon,
          chaser.calculatedPos.lat,
          chaser.calculatedPos.alt * 1000
        );

        if (!lineEntity) {
          lineEntity = viewer.entities.add({
            name: `Conjunction_${conj.id}`,
            polyline: {
              positions: [p1, p2],
              width: 3,
              material: new Cesium.PolylineDashMaterialProperty({
                color: Cesium.Color.fromCssColorString("#FF2E5B"),
                dashLength: 16.0,
              }),
            },
          });
          conjunctionLines.set(conj.id, lineEntity);
        } else {
          lineEntity.polyline.positions = [p1, p2];
          lineEntity.show = true;
        }
      } else if (lineEntity) {
        lineEntity.show = false;
      }
    });
  }, [assets, sensors, conjunctions, selectedAsset, showOrbits, showRadarBeams]);

  useEffect(() => {
    if (!targetCameraAssetId || !viewerRef.current || !window.Cesium) return;
    const Cesium = window.Cesium;
    const targetAsset = assets.find((a) => a.id === targetCameraAssetId);
    if (!targetAsset) return;

    const viewer = viewerRef.current;
    const targetPos = Cesium.Cartesian3.fromDegrees(
      targetAsset.calculatedPos.lon,
      targetAsset.calculatedPos.lat,
      targetAsset.calculatedPos.alt * 1000 + 420000
    );

    viewer.camera.flyTo({
      destination: targetPos,
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0.0,
      },
      duration: 2.0,
      complete: () => {
        if (onCameraFlyComplete) onCameraFlyComplete();
      },
    });
  }, [targetCameraAssetId, assets, onCameraFlyComplete]);

  const resetCameraView = useCallback(() => {
    if (!viewerRef.current || !window.Cesium) return;
    const Cesium = window.Cesium;
    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(0.0, 20.0, 20000000.0),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: 0,
      },
      duration: 1.5,
    });
  }, []);

  const handleZoom = useCallback((direction: "in" | "out") => {
    if (!viewerRef.current || !window.Cesium) return;
    const camera = viewerRef.current.camera;
    const height = camera.positionCartographic?.height || 20000000;
    const factor = direction === "in" ? 0.6 : 1.4;
    camera.zoomIn(height * (1 - factor));
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-black overflow-hidden rounded-xl border border-orbit-border shadow-orbit-card">
      <div ref={containerRef} className="w-full h-full absolute inset-0" />

      {!cesiumLoaded && !loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md z-30">
          <RefreshCw className="w-9 h-9 text-orbit-mint animate-spin mb-3 glow-mint" />
          <div className="font-display font-bold text-sm tracking-widest text-white uppercase">
            ORBITAL SPATIAL ENGINE INITIALIZING...
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Calibrating SGP4/SDP4 radar ephemeris layers
          </div>
        </div>
      )}

      {/* Top Banner Chip */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-center pointer-events-none z-20">
        <div className="orbit-panel px-3.5 py-1.5 rounded-lg flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orbit-mint animate-mint-pulse inline-block" />
            <span className="font-display text-xs text-white font-bold tracking-widest uppercase">
              ORBITAL SURVEILLANCE MATRIX
            </span>
          </div>
          <div className="h-3 w-[1px] bg-orbit-border" />
          <div className="font-mono text-[11px] text-slate-300">
            TRACKING: <span className="text-orbit-mint font-bold">{assets.length}</span> OBJECTS
          </div>
          <div className="h-3 w-[1px] bg-orbit-border hidden sm:block" />
          <div className="font-mono text-[11px] text-orbit-crimson hidden sm:block">
            ACTIVE CDMs:{" "}
            <span className="font-bold">
              {conjunctions.filter((c) => c.riskLevel === "CRITICAL" && c.maneuverStatus !== "AVOIDED").length} CRITICAL
            </span>
          </div>
        </div>

        <div className="orbit-panel px-3 py-1.5 rounded-lg flex items-center gap-2 pointer-events-auto font-mono text-[11px] text-slate-300">
          <Compass className="w-3.5 h-3.5 text-orbit-mint animate-pulse" />
          <span>{currentUtcTime || "SYNCING UTC..."}</span>
        </div>
      </div>

      {/* Radar / Orbit Toggles */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 z-20">
        <div className="orbit-panel p-1.5 rounded-lg flex items-center gap-2">
          <button
            onClick={() => setShowOrbits(!showOrbits)}
            className={`px-3 py-1 text-[11px] font-sans font-semibold rounded-md transition-all ${
              showOrbits
                ? "bg-orbit-mint/20 border border-orbit-mint text-orbit-mint"
                : "bg-slate-900/60 border border-slate-700 text-slate-400"
            }`}
          >
            Orbits {showOrbits ? "ON" : "OFF"}
          </button>
          <button
            onClick={() => setShowRadarBeams(!showRadarBeams)}
            className={`px-3 py-1 text-[11px] font-sans font-semibold rounded-md transition-all ${
              showRadarBeams
                ? "bg-orbit-mint/20 border border-orbit-mint text-orbit-mint"
                : "bg-slate-900/60 border border-slate-700 text-slate-400"
            }`}
          >
            Radar Beams {showRadarBeams ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 z-20">
        <button
          onClick={() => handleZoom("in")}
          className="orbit-panel p-2 rounded-lg text-slate-300 hover:text-white hover:border-orbit-mint transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom("out")}
          className="orbit-panel p-2 rounded-lg text-slate-300 hover:text-white hover:border-orbit-mint transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetCameraView}
          className="orbit-panel px-3 py-2 rounded-lg text-[11px] font-sans font-medium text-slate-300 hover:text-white hover:border-orbit-mint transition-all flex items-center gap-1.5"
          title="Reset Camera"
        >
          <Target className="w-3.5 h-3.5 text-orbit-mint" />
          <span>RESET VIEW</span>
        </button>
      </div>

      {/* Selected Object HUD Card */}
      {selectedAsset && (
        <div className="absolute top-16 left-3.5 orbit-panel p-3.5 rounded-lg max-w-xs z-20 border-l-4 border-l-orbit-mint">
          <div className="flex justify-between items-start gap-2 mb-2">
            <div className="text-xs font-bold text-white font-sans truncate">
              {selectedAsset.name}
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-semibold ${
                selectedAsset.type === "Debris"
                  ? "bg-orbit-crimson/20 text-orbit-crimson border border-orbit-crimson/40"
                  : "bg-orbit-mint/20 text-orbit-mint border border-orbit-mint/40"
              }`}
            >
              {selectedAsset.type}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[10px] text-slate-300">
            <div>NORAD: <span className="text-white font-semibold">{selectedAsset.noradId}</span></div>
            <div>STATUS: <span className="text-white font-semibold">{selectedAsset.status}</span></div>
            <div>LAT: <span className="text-orbit-mint">{selectedAsset.calculatedPos.lat.toFixed(2)}°</span></div>
            <div>LON: <span className="text-orbit-mint">{selectedAsset.calculatedPos.lon.toFixed(2)}°</span></div>
            <div>ALT: <span className="text-white">{selectedAsset.calculatedPos.alt.toFixed(1)} km</span></div>
            <div>VEL: <span className="text-orbit-mint">{selectedAsset.calculatedPos.velocity} km/s</span></div>
            <div className="col-span-2 text-[10px] text-slate-400 truncate mt-1">
              RCS: <span className="text-slate-200">{selectedAsset.radarCrossSection} m²</span> | INCL: <span className="text-slate-200">{selectedAsset.inclination}°</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
