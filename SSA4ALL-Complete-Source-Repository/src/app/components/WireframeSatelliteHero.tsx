"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface WireframeSatelliteHeroProps {
  theme?: "dark" | "light";
  isRotating?: boolean;
  onToggleRotation?: () => void;
}

export const WireframeSatelliteHero: React.FC<WireframeSatelliteHeroProps> = ({
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

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 5.5);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Duke Blue #1C0248 & Neon Orange #FF5B00 Palette
    const orangeColor = 0xff5b00;
    const dukeBlueColor = 0x1c0248;
    const dukeLightColor = 0x4b148c;
    const cyanColor = 0x00d2ff;
    const crimsonColor = 0xff1e56;
    const busBodyColor = theme === "light" ? 0xfff0e6 : 0x14032d;

    // Create Main Satellite Group
    const satelliteGroup = new THREE.Group();
    satelliteGroupRef.current = satelliteGroup;
    scene.add(satelliteGroup);

    // Central Bus Geometry
    const busGeo = new THREE.CylinderGeometry(0.58, 0.58, 1.65, 16, 4);
    const busMat = new THREE.MeshBasicMaterial({
      color: busBodyColor,
      transparent: true,
      opacity: 0.88,
    });
    const busMesh = new THREE.Mesh(busGeo, busMat);
    satelliteGroup.add(busMesh);

    // Bus Wireframe (Neon Orange)
    const busWireMat = new THREE.LineBasicMaterial({ color: orangeColor, linewidth: 2 });
    const busWireGeo = new THREE.WireframeGeometry(busGeo);
    const busWire = new THREE.LineSegments(busWireGeo, busWireMat);
    satelliteGroup.add(busWire);

    // Top Dish (Duke Blue / Orange Accent)
    const dishGeo = new THREE.SphereGeometry(0.48, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.5);
    const dishWireMat = new THREE.LineBasicMaterial({ color: orangeColor });
    const dishWire = new THREE.LineSegments(new THREE.WireframeGeometry(dishGeo), dishWireMat);
    dishWire.position.set(0, 0.98, 0);
    dishWire.rotation.x = Math.PI;
    satelliteGroup.add(dishWire);

    // Top Feed Horn
    const hornGeo = new THREE.ConeGeometry(0.12, 0.38, 8);
    const hornWire = new THREE.LineSegments(new THREE.WireframeGeometry(hornGeo), new THREE.LineBasicMaterial({ color: cyanColor }));
    hornWire.position.set(0, 1.28, 0);
    satelliteGroup.add(hornWire);

    // Left Solar Panel Wing
    const panelGeo = new THREE.BoxGeometry(1.55, 0.78, 0.05, 6, 3, 1);
    const panelMat = new THREE.MeshBasicMaterial({
      color: theme === "light" ? 0xffedd5 : 0x1c0248,
      transparent: true,
      opacity: 0.9,
    });
    const panelWireMat = new THREE.LineBasicMaterial({ color: orangeColor });

    const leftPanelMesh = new THREE.Mesh(panelGeo, panelMat);
    leftPanelMesh.position.set(-1.52, 0, 0);
    satelliteGroup.add(leftPanelMesh);

    const leftPanelWire = new THREE.LineSegments(new THREE.WireframeGeometry(panelGeo), panelWireMat);
    leftPanelWire.position.set(-1.52, 0, 0);
    satelliteGroup.add(leftPanelWire);

    // Right Solar Panel Wing
    const rightPanelMesh = new THREE.Mesh(panelGeo, panelMat);
    rightPanelMesh.position.set(1.52, 0, 0);
    satelliteGroup.add(rightPanelMesh);

    const rightPanelWire = new THREE.LineSegments(new THREE.WireframeGeometry(panelGeo), panelWireMat);
    rightPanelWire.position.set(1.52, 0, 0);
    satelliteGroup.add(rightPanelWire);

    // Solar Panel Attachment Struts (Duke Blue & Orange)
    const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.85, 8);
    const strutMat = new THREE.MeshBasicMaterial({ color: orangeColor });
    const leftStrut = new THREE.Mesh(strutGeo, strutMat);
    leftStrut.rotation.z = Math.PI / 2;
    leftStrut.position.set(-0.68, 0, 0);
    satelliteGroup.add(leftStrut);

    const rightStrut = new THREE.Mesh(strutGeo, strutMat);
    rightStrut.rotation.z = Math.PI / 2;
    rightStrut.position.set(0.68, 0, 0);
    satelliteGroup.add(rightStrut);

    // Orbit Rings (Duke Blue Glow)
    const ringGeo = new THREE.RingGeometry(2.4, 2.43, 64);
    const ringMat = new THREE.LineBasicMaterial({
      color: theme === "light" ? 0x9333ea : 0x4b148c,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.4;
    scene.add(ringMesh);

    // Chaser Debris Particle / Box
    const chaserGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
    const chaserMat = new THREE.MeshBasicMaterial({ color: crimsonColor, wireframe: true });
    const chaserMesh = new THREE.Mesh(chaserGeo, chaserMat);
    scene.add(chaserMesh);

    // Mouse Interaction
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

      satelliteGroupRef.current.rotation.y += deltaX * 0.01;
      satelliteGroupRef.current.rotation.x += deltaY * 0.01;

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
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (satelliteGroupRef.current && isRotatingRef.current && !isDragging) {
        satelliteGroupRef.current.rotation.y += 0.009;
        satelliteGroupRef.current.rotation.x = Math.sin(elapsedTime * 0.5) * 0.22;
        satelliteGroupRef.current.rotation.z = Math.cos(elapsedTime * 0.3) * 0.15;
      }

      // Orbit Chaser Motion
      const chaserAngle = elapsedTime * 0.8;
      chaserMesh.position.x = Math.cos(chaserAngle) * 2.4;
      chaserMesh.position.z = Math.sin(chaserAngle) * 1.8;
      chaserMesh.position.y = Math.sin(chaserAngle * 1.5) * 0.5;
      chaserMesh.rotation.x += 0.025;
      chaserMesh.rotation.y += 0.035;

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
