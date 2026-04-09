"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

interface VoiceOrbProps {
  state: OrbState;
  analyser: AnalyserNode | null;
  className?: string;
}

export default function VoiceOrb({ state, analyser, className }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbRef = useRef<{
    destroy: () => void;
    setState: (s: OrbState) => void;
    setAnalyser: (a: AnalyserNode | null) => void;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || orbRef.current) return;

    const N = 500;
    let destroyed = false;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    camera.position.z = 80;

    // ═══ PARTICLES on a torus/Möbius topology ═══
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    const basePos = new Float32Array(N * 3); // Store original torus positions
    const phase = new Float32Array(N);
    const vel = new Float32Array(N * 3);

    // Distribute particles on a torus (Möbius-like shape)
    const R = 20; // Major radius
    const r = 8;  // Minor radius
    for (let i = 0; i < N; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      // Add randomness to make it organic
      const jitter = 1 + (Math.random() - 0.5) * 0.6;
      const rr = r * jitter;
      pos[i * 3] = (R + rr * Math.cos(v)) * Math.cos(u);
      pos[i * 3 + 1] = (R + rr * Math.cos(v)) * Math.sin(u);
      pos[i * 3 + 2] = rr * Math.sin(v);
      basePos[i * 3] = pos[i * 3];
      basePos[i * 3 + 1] = pos[i * 3 + 1];
      basePos[i * 3 + 2] = pos[i * 3 + 2];
      phase[i] = Math.random() * 1000;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x18a0ff, size: 0.55, transparent: true, opacity: 0.7,
      sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Connection lines
    const MAX_LINES = 2000;
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
    let targetBright = 0.6, currentBright = 0.6;
    let lineAmount = 0, targetLineAmount = 0;
    let breathScale = 1, targetBreathScale = 1;
    let freqData = new Uint8Array(64);
    let bass = 0;
    const clock = new THREE.Clock();

    // Möbius rotation axes
    let rotX = 0, rotY = 0, rotZ = 0;
    let rotSpeedX = 0.003, rotSpeedY = 0.005, rotSpeedZ = 0.002;

    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      const size = Math.min(parent?.clientWidth || 400, parent?.clientHeight || 400, 480);
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

      // State-driven parameters
      switch (currentState) {
        case "idle":
          targetBright = 0.5; targetLineAmount = 0.08; targetBreathScale = 1.0;
          rotSpeedX = 0.003; rotSpeedY = 0.005; rotSpeedZ = 0.002;
          break;
        case "listening":
          targetBright = 0.7; targetLineAmount = 0.3; targetBreathScale = 0.85;
          rotSpeedX = 0.005; rotSpeedY = 0.008; rotSpeedZ = 0.003;
          break;
        case "thinking":
          targetBright = 0.8; targetLineAmount = 0.8; targetBreathScale = 0.7;
          rotSpeedX = 0.01; rotSpeedY = 0.015; rotSpeedZ = 0.008;
          break;
        case "speaking":
          targetBright = 0.75; targetLineAmount = 0.5; targetBreathScale = 1.0;
          rotSpeedX = 0.004; rotSpeedY = 0.006; rotSpeedZ = 0.003;
          break;
      }

      currentBright += (targetBright - currentBright) * 0.03;
      lineAmount += (targetLineAmount - lineAmount) * 0.03;
      breathScale += (targetBreathScale - breathScale) * 0.02;

      // Audio analysis
      bass = 0;
      if (currentAnalyser) {
        currentAnalyser.getByteFrequencyData(freqData);
        let bSum = 0;
        for (let i = 0; i < 8; i++) bSum += freqData[i];
        bass = bSum / (8 * 255);
      }

      // Möbius rotation — triple-axis gives the infinity/strip feel
      rotX += rotSpeedX;
      rotY += rotSpeedY;
      rotZ += rotSpeedZ;
      points.rotation.set(rotX, rotY, rotZ);
      lines.rotation.set(rotX, rotY, rotZ);

      // Update particles — breathing + audio reactivity
      const p = geo.getAttribute("position") as THREE.BufferAttribute;
      const a = p.array as Float32Array;
      const audioExpand = currentState === "speaking" ? 1 + bass * 0.4 : 1;
      const breathMod = breathScale + Math.sin(t * 0.8) * 0.03;
      const scale = breathMod * audioExpand;

      for (let i = 0; i < N; i++) {
        const i3 = i * 3;
        const px = phase[i];

        // Organic drift
        vel[i3] += Math.sin(t * 0.04 + px) * 0.0005;
        vel[i3 + 1] += Math.cos(t * 0.05 + px * 1.3) * 0.0005;
        vel[i3 + 2] += Math.sin(t * 0.045 + px * 0.7) * 0.0005;

        // Pull back to torus shape
        const tx = basePos[i3] * scale;
        const ty = basePos[i3 + 1] * scale;
        const tz = basePos[i3 + 2] * scale;
        vel[i3] += (tx - a[i3]) * 0.008;
        vel[i3 + 1] += (ty - a[i3 + 1]) * 0.008;
        vel[i3 + 2] += (tz - a[i3 + 2]) * 0.008;

        // Damping
        vel[i3] *= 0.96; vel[i3 + 1] *= 0.96; vel[i3 + 2] *= 0.96;

        // Speaking: add extra turbulence from audio
        if (currentState === "speaking" && bass > 0.1) {
          vel[i3] += (Math.random() - 0.5) * bass * 0.3;
          vel[i3 + 1] += (Math.random() - 0.5) * bass * 0.3;
          vel[i3 + 2] += (Math.random() - 0.5) * bass * 0.3;
        }

        a[i3] += vel[i3];
        a[i3 + 1] += vel[i3 + 1];
        a[i3 + 2] += vel[i3 + 2];
      }
      p.needsUpdate = true;
      mat.opacity = currentBright;
      mat.size = 0.5 + (currentState === "speaking" ? bass * 0.4 : 0);

      // Connection lines
      const lineDist = 36;
      let lc = 0;
      const maxDraw = Math.floor(lineAmount * MAX_LINES);
      if (maxDraw > 0) {
        const la = (lineGeo.getAttribute("position") as THREE.BufferAttribute).array as Float32Array;
        for (let i = 0; i < N && lc < maxDraw; i += 2) {
          for (let j = i + 2; j < N && lc < maxDraw; j += 2) {
            const dx = a[i * 3] - a[j * 3], dy = a[i * 3 + 1] - a[j * 3 + 1], dz = a[i * 3 + 2] - a[j * 3 + 2];
            if (dx * dx + dy * dy + dz * dz < lineDist) {
              la[lc * 6] = a[i * 3]; la[lc * 6 + 1] = a[i * 3 + 1]; la[lc * 6 + 2] = a[i * 3 + 2];
              la[lc * 6 + 3] = a[j * 3]; la[lc * 6 + 4] = a[j * 3 + 1]; la[lc * 6 + 5] = a[j * 3 + 2];
              lc++;
            }
          }
        }
        (lineGeo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
      }
      lineGeo.setDrawRange(0, lc * 2);
      lineMat.opacity = lineAmount * 0.12;

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

  useEffect(() => { orbRef.current?.setState(state); }, [state]);
  useEffect(() => { orbRef.current?.setAnalyser(analyser); }, [analyser]);

  return <canvas ref={canvasRef} className={className} style={{ display: "block" }} />;
}
