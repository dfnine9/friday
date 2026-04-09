"use client";

import { useEffect, useRef } from "react";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

interface VoiceOrbProps {
  state: OrbState;
  analyser: AnalyserNode | null;
  className?: string;
}

/**
 * HUD Concentric Ring System — Iron Man style.
 * Pure Canvas2D — no Three.js, no WebGL, no GPU pressure.
 * Multiple rotating ring layers with arcs, dots, and dashes.
 * Expands like neurons firing when speaking.
 */
export default function VoiceOrb({ state, analyser, className }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<OrbState>("idle");
  const analyserRef = useRef<AnalyserNode | null>(null);
  const destroyedRef = useRef(false);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { analyserRef.current = analyser; }, [analyser]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    destroyedRef.current = false;

    const ctx = canvas.getContext("2d")!;
    let animId: number;
    const freqData = new Uint8Array(64);

    // Ring definitions — each ring has its own behavior
    interface Ring {
      baseRadius: number;
      width: number;
      speed: number;        // rotation speed (rad/frame)
      dashPattern: number[];// [dash, gap] or [] for dots
      dots: number;         // number of dots on this ring (0 = arc mode)
      arcLength: number;    // 0-1, fraction of circle for arc segments
      arcCount: number;     // number of arc segments
      opacity: number;
      expandFactor: number; // how much this ring expands when speaking
    }

    const rings: Ring[] = [
      // Inner core rings — tight, fast
      { baseRadius: 25, width: 1.5, speed: 0.015, dashPattern: [], dots: 0, arcLength: 1, arcCount: 1, opacity: 0.9, expandFactor: 0.3 },
      { baseRadius: 32, width: 1, speed: -0.01, dashPattern: [4, 4], dots: 0, arcLength: 1, arcCount: 1, opacity: 0.6, expandFactor: 0.4 },
      { baseRadius: 40, width: 0.8, speed: 0.008, dashPattern: [], dots: 16, arcLength: 0, arcCount: 0, opacity: 0.5, expandFactor: 0.5 },
      // Mid rings — medium speed, arc segments
      { baseRadius: 55, width: 1.5, speed: -0.006, dashPattern: [], dots: 0, arcLength: 0.3, arcCount: 3, opacity: 0.7, expandFactor: 0.8 },
      { baseRadius: 65, width: 0.8, speed: 0.009, dashPattern: [2, 6], dots: 0, arcLength: 1, arcCount: 1, opacity: 0.35, expandFactor: 0.9 },
      { baseRadius: 72, width: 1, speed: -0.004, dashPattern: [], dots: 24, arcLength: 0, arcCount: 0, opacity: 0.4, expandFactor: 1.0 },
      { baseRadius: 80, width: 1.5, speed: 0.007, dashPattern: [], dots: 0, arcLength: 0.25, arcCount: 4, opacity: 0.6, expandFactor: 1.1 },
      // Outer rings — slow, subtle
      { baseRadius: 95, width: 0.5, speed: -0.003, dashPattern: [1, 8], dots: 0, arcLength: 1, arcCount: 1, opacity: 0.2, expandFactor: 1.3 },
      { baseRadius: 105, width: 0.8, speed: 0.005, dashPattern: [], dots: 32, arcLength: 0, arcCount: 0, opacity: 0.25, expandFactor: 1.4 },
      { baseRadius: 115, width: 1.2, speed: -0.004, dashPattern: [], dots: 0, arcLength: 0.2, arcCount: 5, opacity: 0.5, expandFactor: 1.5 },
      { baseRadius: 125, width: 0.5, speed: 0.002, dashPattern: [3, 5], dots: 0, arcLength: 1, arcCount: 1, opacity: 0.15, expandFactor: 1.6 },
      // Outermost — whisper rings, only visible when speaking
      { baseRadius: 140, width: 0.8, speed: -0.006, dashPattern: [], dots: 0, arcLength: 0.15, arcCount: 6, opacity: 0.4, expandFactor: 2.0 },
      { baseRadius: 155, width: 0.5, speed: 0.003, dashPattern: [], dots: 40, arcLength: 0, arcCount: 0, opacity: 0.2, expandFactor: 2.2 },
    ];

    const rotations = rings.map(() => Math.random() * Math.PI * 2);
    let coreGlow = 0.5;
    let expandAmount = 0; // 0 = idle, 1 = fully expanded (speaking)
    let breathPhase = 0;

    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      const size = Math.min(parent?.clientWidth || 400, parent?.clientHeight || 400, 500);
      canvas.width = size * 2; // 2x for retina
      canvas.height = size * 2;
      canvas.style.width = size + "px";
      canvas.style.height = size + "px";
    }
    resize();
    window.addEventListener("resize", resize);

    function animate() {
      if (destroyedRef.current) return;
      animId = requestAnimationFrame(animate);

      const w = canvas!.width;
      const h = canvas!.height;
      const cx = w / 2;
      const cy = h / 2;
      const scale = w / 500; // Scale factor for different sizes

      ctx.clearRect(0, 0, w, h);

      // Audio
      let bass = 0;
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(freqData);
        let sum = 0;
        for (let i = 0; i < 8; i++) sum += freqData[i];
        bass = sum / (8 * 255);
      }

      // State-driven targets
      let targetExpand = 0;
      let targetGlow = 0.5;
      let speedMult = 1;
      const st = stateRef.current;

      switch (st) {
        case "idle": targetExpand = 0; targetGlow = 0.4; speedMult = 1; break;
        case "listening": targetExpand = 0.15; targetGlow = 0.6; speedMult = 1.5; break;
        case "thinking": targetExpand = 0.3; targetGlow = 0.8; speedMult = 3; break;
        case "speaking": targetExpand = 0.2 + bass * 0.8; targetGlow = 0.6 + bass * 0.4; speedMult = 1.2 + bass * 2; break;
      }

      expandAmount += (targetExpand - expandAmount) * 0.06;
      coreGlow += (targetGlow - coreGlow) * 0.05;
      breathPhase += 0.02;
      const breath = Math.sin(breathPhase) * 0.02;

      // ═══ CORE GLOW ═══
      const coreR = 18 * scale;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.5);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${coreGlow * 0.9})`);
      gradient.addColorStop(0.3, `rgba(24, 160, 255, ${coreGlow * 0.5})`);
      gradient.addColorStop(0.6, `rgba(24, 86, 255, ${coreGlow * 0.2})`);
      gradient.addColorStop(1, "rgba(24, 86, 255, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Inner bright core
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 0.4 * scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${coreGlow})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 0.7 * scale, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(24, 160, 255, ${coreGlow * 0.8})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.stroke();

      // ═══ RINGS ═══
      for (let ri = 0; ri < rings.length; ri++) {
        const ring = rings[ri];
        rotations[ri] += ring.speed * speedMult;

        const expand = 1 + expandAmount * ring.expandFactor + breath;
        const radius = ring.baseRadius * scale * expand;
        const alpha = ring.opacity * (0.7 + expandAmount * 0.3);

        // Skip outermost rings when idle (they're invisible anyway)
        if (ri >= 11 && expandAmount < 0.1) continue;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotations[ri]);

        ctx.strokeStyle = `rgba(24, 160, 255, ${alpha})`;
        ctx.fillStyle = `rgba(24, 160, 255, ${alpha})`;
        ctx.lineWidth = ring.width * scale;

        if (ring.dots > 0) {
          // Dot ring
          for (let d = 0; d < ring.dots; d++) {
            const angle = (d / ring.dots) * Math.PI * 2;
            const dx = Math.cos(angle) * radius;
            const dy = Math.sin(angle) * radius;
            const dotSize = (1 + bass * 1.5) * scale;
            ctx.beginPath();
            ctx.arc(dx, dy, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (ring.arcCount > 1) {
          // Multi-arc segments
          for (let a = 0; a < ring.arcCount; a++) {
            const startAngle = (a / ring.arcCount) * Math.PI * 2;
            const endAngle = startAngle + ring.arcLength * Math.PI * 2;
            if (ring.dashPattern.length > 0) ctx.setLineDash(ring.dashPattern.map((d) => d * scale));
            else ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.stroke();
          }
        } else {
          // Full ring (solid or dashed)
          if (ring.dashPattern.length > 0) ctx.setLineDash(ring.dashPattern.map((d) => d * scale));
          else ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    animate();

    return () => {
      destroyedRef.current = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} style={{ display: "block" }} />;
}
