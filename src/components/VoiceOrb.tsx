"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

interface VoiceOrbProps {
  state: OrbState;
  analyser: AnalyserNode | null;
  className?: string;
}

/**
 * Audio-reactive particle orb visualization.
 * Based on ethanplusai/jarvis orb.ts — adapted for React.
 *
 * 800 particles (reduced from 2000 for performance in dashboard context)
 * with connection lines and state-driven behavior.
 */
export default function VoiceOrb({ state, analyser, className }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbRef = useRef<{ destroy: () => void; setState: (s: OrbState) => void; setAnalyser: (a: AnalyserNode | null) => void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || orbRef.current) return;

    const N = 600; // Particle count — reduced for perf
    let destroyed = false;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    camera.position.z = 80;

    // Particles
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    const phase = new Float32Array(N);
    const vel = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 0.5) * 25;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      phase[i] = Math.random() * 1000;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x18a0ff, size: 0.5, transparent: true, opacity: 0.7,
      sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Connection lines
    const MAX_LINES = 3000;
    const linePos = new Float32Array(MAX_LINES * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    lineGeo.setDrawRange(0, 0);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x18a0ff, transparent: true, opacity: 0.0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // State
    let currentState: OrbState = "idle";
    let currentAnalyser: AnalyserNode | null = null;
    let targetRadius = 25, currentRadius = 25;
    let targetSpeed = 0.3, currentSpeed = 0.3;
    let targetBright = 0.6, currentBright = 0.6;
    let lineAmount = 0, targetLineAmount = 0;
    let spinX = 0, spinY = 0;
    let transitionEnergy = 0;
    let lastState: OrbState = "idle";
    let freqData = new Uint8Array(64);
    let bass = 0;
    const clock = new THREE.Clock();

    function resize() {
      if (!canvas) return;
      const size = Math.min(canvas.parentElement?.clientWidth || 400, canvas.parentElement?.clientHeight || 400, 500);
      canvas.style.width = size + "px";
      canvas.style.height = size + "px";
      renderer.setSize(size, size);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    function animate() {
      if (destroyed) return;
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      switch (currentState) {
        case "idle": targetRadius = 28; targetSpeed = 0.2; targetBright = 0.5; targetLineAmount = 0.1; break;
        case "listening": targetRadius = 22; targetSpeed = 0.35; targetBright = 0.7; targetLineAmount = 0.4; break;
        case "thinking": targetRadius = 16; targetSpeed = 0.6; targetBright = 0.8; targetLineAmount = 1.0; break;
        case "speaking": targetRadius = 20; targetSpeed = 0.25; targetBright = 0.75; targetLineAmount = 0.7; break;
      }

      currentRadius += (targetRadius - currentRadius) * 0.02;
      currentSpeed += (targetSpeed - currentSpeed) * 0.02;
      currentBright += (targetBright - currentBright) * 0.02;
      lineAmount += (targetLineAmount - lineAmount) * 0.02;

      if (currentState !== lastState) { transitionEnergy = 1.0; lastState = currentState; }
      transitionEnergy *= 0.985;
      if (transitionEnergy > 0.05) {
        spinX += transitionEnergy * 0.01;
        spinY += transitionEnergy * 0.015;
      }

      // Audio
      bass = 0;
      if (currentAnalyser) {
        currentAnalyser.getByteFrequencyData(freqData);
        let bSum = 0;
        for (let i = 0; i < 8; i++) bSum += freqData[i];
        bass = bSum / (8 * 255);
      }

      points.rotation.x = spinX;
      points.rotation.y += 0.002;

      // Update particles
      const p = geo.getAttribute("position") as THREE.BufferAttribute;
      const a = p.array as Float32Array;
      for (let i = 0; i < N; i++) {
        const i3 = i * 3;
        const px = phase[i];
        vel[i3] += Math.sin(t * 0.05 + px) * 0.001 * currentSpeed;
        vel[i3 + 1] += Math.cos(t * 0.06 + px * 1.3) * 0.001 * currentSpeed;
        vel[i3 + 2] += Math.sin(t * 0.055 + px * 0.7) * 0.001 * currentSpeed;
        const dist = Math.sqrt(a[i3] ** 2 + a[i3 + 1] ** 2 + a[i3 + 2] ** 2) || 0.01;
        const speakingPull = currentState === "speaking" ? bass * 0.01 : 0;
        const pull = Math.max(0, dist - currentRadius) * 0.002 + 0.0003 + speakingPull;
        vel[i3] -= (a[i3] / dist) * pull;
        vel[i3 + 1] -= (a[i3 + 1] / dist) * pull;
        vel[i3 + 2] -= (a[i3 + 2] / dist) * pull;
        vel[i3] *= 0.98; vel[i3 + 1] *= 0.98; vel[i3 + 2] *= 0.98;
        a[i3] += vel[i3]; a[i3 + 1] += vel[i3 + 1]; a[i3 + 2] += vel[i3 + 2];
      }
      p.needsUpdate = true;
      mat.opacity = currentBright;

      // Connection lines
      const lineDistSq = 64;
      let lc = 0;
      const maxDraw = Math.floor(lineAmount * MAX_LINES);
      if (maxDraw > 0) {
        for (let i = 0; i < N && lc < maxDraw; i += 3) {
          for (let j = i + 3; j < N && lc < maxDraw; j += 3) {
            const dx = a[i * 3] - a[j * 3], dy = a[i * 3 + 1] - a[j * 3 + 1], dz = a[i * 3 + 2] - a[j * 3 + 2];
            if (dx * dx + dy * dy + dz * dz < lineDistSq) {
              const lp = lineGeo.getAttribute("position") as THREE.BufferAttribute;
              const la = lp.array as Float32Array;
              la[lc * 6] = a[i * 3]; la[lc * 6 + 1] = a[i * 3 + 1]; la[lc * 6 + 2] = a[i * 3 + 2];
              la[lc * 6 + 3] = a[j * 3]; la[lc * 6 + 4] = a[j * 3 + 1]; la[lc * 6 + 5] = a[j * 3 + 2];
              lc++;
            }
          }
        }
      }
      lineGeo.setDrawRange(0, lc * 2);
      (lineGeo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
      lineMat.opacity = lineAmount * 0.15;

      renderer.render(scene, camera);
    }
    animate();

    orbRef.current = {
      destroy() { destroyed = true; renderer.dispose(); window.removeEventListener("resize", resize); },
      setState(s: OrbState) { currentState = s; },
      setAnalyser(a: AnalyserNode | null) { currentAnalyser = a; freqData = new Uint8Array(a?.frequencyBinCount || 64); },
    };

    return () => { orbRef.current?.destroy(); orbRef.current = null; };
  }, []);

  // Sync props to orb
  useEffect(() => { orbRef.current?.setState(state); }, [state]);
  useEffect(() => { orbRef.current?.setAnalyser(analyser); }, [analyser]);

  return <canvas ref={canvasRef} className={className} style={{ display: "block" }} />;
}
