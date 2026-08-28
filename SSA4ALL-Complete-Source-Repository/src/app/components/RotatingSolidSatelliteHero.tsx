"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface RotatingSolidSatelliteHeroProps {
  theme?: "dark" | "light";
  isRotating?: boolean;
  onToggleRotation?: () => void;
}

export const RotatingSolidSatelliteHero: React.FC<RotatingSolidSatelliteHeroProps> = ({
  theme = "dark",
  isRotating = true,
  onToggleRotation,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const satelliteGroupRef = useRef<THREE.Group | null>(null);
  const isRotatingRef = useRef<boolean>(isRotating);

  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 5.2);
    camera.lookAt(0, 0, 0);

    // WebGL Renderer with Physically Correct Lighting
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Lighting (Sunlight + Ambient Space Glow)
    const ambientLight = new THREE.AmbientLight(0x382860, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 3.2);
    sunLight.position.set(5, 4, 3.5);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xff5b00, 2.0);
    rimLight.position.set(-5, -2, -3);
    scene.add(rimLight);

    const cyanFillLight = new THREE.PointLight(0x00d2ff, 1.5, 10);
    cyanFillLight.position.set(0, -3, 2);
    scene.add(cyanFillLight);

    // Main Satellite 3D Group
    const satelliteGroup = new THREE.Group();
    satelliteGroupRef.current = satelliteGroup;
    scene.add(satelliteGroup);

    // 1. Central Spacecraft Bus (Gold MLI Thermal Foil)
    const busGeo = new THREE.BoxGeometry(1.0, 1.4, 1.0);
    const goldMliMat = new THREE.MeshStandardMaterial({
      color: 0xdfa010,
      metalness: 0.88,
      roughness: 0.28,
      bumpScale: 0.05,
    });
    const busMesh = new THREE.Mesh(busGeo, goldMliMat);
    satelliteGroup.add(busMesh);

    // Bus Structural End Caps (Dark Carbon Composite)
    const capGeo = new THREE.BoxGeometry(1.04, 0.08, 1.04);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a24,
      metalness: 0.6,
      roughness: 0.4,
    });
    const topCap = new THREE.Mesh(capGeo, capMat);
    topCap.position.set(0, 0.72, 0);
    satelliteGroup.add(topCap);

    const bottomCap = new THREE.Mesh(capGeo, capMat);
    bottomCap.position.set(0, -0.72, 0);
    satelliteGroup.add(bottomCap);

    // 2. High-Gain Dish Antenna (Silver / Metallic)
    const dishGeo = new THREE.SphereGeometry(0.55, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2.8);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15,
      side: THREE.DoubleSide,
    });
    const dishMesh = new THREE.Mesh(dishGeo, dishMat);
    dishMesh.position.set(0, 0.8, 0);
    dishMesh.rotation.x = Math.PI;
    satelliteGroup.add(dishMesh);

    // Dish Feed Horn & Struts
    const hornGeo = new THREE.ConeGeometry(0.08, 0.35, 12);
    const hornMat = new THREE.MeshStandardMaterial({ color: 0xff5b00, metalness: 0.9, roughness: 0.2 });
    const hornMesh = new THREE.Mesh(hornGeo, hornMat);
    hornMesh.position.set(0, 1.15, 0);
    satelliteGroup.add(hornMesh);

    // 3. Solar Panel Wings (Photovoltaic Deep Blue with Gold Trim)
    const wingGeo = new THREE.BoxGeometry(1.9, 0.9, 0.04);
    const solarCellMat = new THREE.MeshStandardMaterial({
      color: 0x0a285c,
      metalness: 0.8,
      roughness: 0.2,
    });

    const leftWing = new THREE.Mesh(wingGeo, solarCellMat);
    leftWing.position.set(-1.65, 0, 0);
    satelliteGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, solarCellMat);
    rightWing.position.set(1.65, 0, 0);
    satelliteGroup.add(rightWing);

    // Solar Panel Grid Borders (Duke Blue / Gold Trim)
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xff5b00, metalness: 0.9, roughness: 0.3 });
    const leftBorderGeo = new THREE.BoxGeometry(1.94, 0.94, 0.02);
    const leftBorder = new THREE.Mesh(leftBorderGeo, borderMat);
    leftBorder.position.set(-1.65, 0, -0.015);
    satelliteGroup.add(leftBorder);

    const rightBorder = new THREE.Mesh(leftBorderGeo, borderMat);
    rightBorder.position.set(1.65, 0, -0.015);
    satelliteGroup.add(rightBorder);

    // Attachment Booms
    const boomGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 12);
    const boomMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
    const leftBoom = new THREE.Mesh(boomGeo, boomMat);
    leftBoom.rotation.z = Math.PI / 2;
    leftBoom.position.set(-0.7, 0, 0);
    satelliteGroup.add(leftBoom);

    const rightBoom = new THREE.Mesh(boomGeo, boomMat);
    rightBoom.rotation.z = Math.PI / 2;
    rightBoom.position.set(0.7, 0, 0);
    satelliteGroup.add(rightBoom);

    // 4. Main Propulsion Engine Nozzles (Bottom)
    const thrusterGeo = new THREE.ConeGeometry(0.18, 0.35, 16, 1, true);
    const thrusterMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.95,
      roughness: 0.25,
      side: THREE.DoubleSide,
    });

    const thruster1 = new THREE.Mesh(thrusterGeo, thrusterMat);
    thruster1.position.set(-0.25, -0.9, 0);
    satelliteGroup.add(thruster1);

    const thruster2 = new THREE.Mesh(thrusterGeo, thrusterMat);
    thruster2.position.set(0.25, -0.9, 0);
    satelliteGroup.add(thruster2);

    // Active Engine Exhaust Plume (Glowing Orange/Blue Flame)
    const flameGeo = new THREE.ConeGeometry(0.12, 0.6, 12);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xff5b00,
      transparent: true,
      opacity: 0.85,
    });
    const flame1 = new THREE.Mesh(flameGeo, flameMat);
    flame1.position.set(-0.25, -1.2, 0);
    flame1.rotation.x = Math.PI;
    satelliteGroup.add(flame1);

    const flame2 = new THREE.Mesh(flameGeo, flameMat);
    flame2.position.set(0.25, -1.2, 0);
    flame2.rotation.x = Math.PI;
    satelliteGroup.add(flame2);

    // Optical Sensor Lenses
    const lensGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.2, 16);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x00d2ff, metalness: 0.95, roughness: 0.1 });
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.position.set(0, 0, 0.55);
    lensMesh.rotation.x = Math.PI / 2;
    satelliteGroup.add(lensMesh);

    // Mouse Drag Rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !satelliteGroupRef.current) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      satelliteGroupRef.current.rotation.y += deltaX * 0.012;
      satelliteGroupRef.current.rotation.x += deltaY * 0.012;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (satelliteGroupRef.current && isRotatingRef.current && !isDragging) {
        satelliteGroupRef.current.rotation.y += 0.009;
        satelliteGroupRef.current.rotation.x = Math.sin(elapsedTime * 0.6) * 0.2;
        satelliteGroupRef.current.rotation.z = Math.cos(elapsedTime * 0.4) * 0.12;
      }

      // Thruster Flame Pulsing
      const flameScale = 0.85 + Math.sin(elapsedTime * 15) * 0.15;
      flame1.scale.set(1, flameScale, 1);
      flame2.scale.set(1, flameScale, 1);

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

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [theme]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div ref={mountRef} className="w-full h-72 cursor-grab active:cursor-grabbing" />
    </div>
  );
};
