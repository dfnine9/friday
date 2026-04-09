"use client";

import clsx from "clsx";

type ArcReactorLogoProps = {
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
};

const SIZES = {
  sm: { container: 36, core: 8, rings: [14, 18], particles: 3, filaments: 0 },
  md: { container: 56, core: 12, rings: [20, 28], particles: 4, filaments: 4 },
  lg: { container: 80, core: 16, rings: [28, 38], particles: 6, filaments: 6 },
  hero: { container: 160, core: 28, rings: [50, 70, 90], particles: 12, filaments: 10 },
};

export default function ArcReactorLogo({ size = "md", className }: ArcReactorLogoProps) {
  const s = SIZES[size];
  const center = s.container / 2;

  return (
    <div
      className={clsx("relative flex items-center justify-center shrink-0", className)}
      style={{ width: s.container, height: s.container }}
    >
      {/* Outer ambient glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245,166,35,0.15) 0%, rgba(255,107,0,0.05) 50%, transparent 70%)",
          filter: "blur(8px)",
          animation: "reactor-energy-wave 4s ease-in-out infinite",
        }}
      />

      {/* SVG Canvas */}
      <svg
        width={s.container}
        height={s.container}
        viewBox={`0 0 ${s.container} ${s.container}`}
        className="relative z-10"
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Golden glow filter */}
          <filter id={`glow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id={`glow-strong-${size}`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          {/* Gradient for rings */}
          <linearGradient id={`ring-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd700" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f5a623" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ff6b00" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id={`ring-grad-2-${size}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff6b00" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#ffd700" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f5a623" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* ═══ ROTATING RINGS ═══ */}
        {s.rings.map((r, i) => (
          <g key={i}>
            {/* Ring track (faint) */}
            <circle
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="rgba(245,166,35,0.08)"
              strokeWidth={i === 0 ? 1.5 : 1}
            />
            {/* Animated arc segment */}
            <circle
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke={`url(#ring-grad${i > 0 ? `-2` : ``}-${size})`}
              strokeWidth={i === 0 ? 2 : 1.5}
              strokeLinecap="round"
              strokeDasharray={`${Math.PI * r * 0.6} ${Math.PI * r * 1.4}`}
              filter={`url(#glow-${size})`}
              style={{
                transformOrigin: `${center}px ${center}px`,
                animation: `${i % 2 === 0 ? "reactor-spin" : "reactor-spin-reverse"} ${6 + i * 4}s linear infinite`,
              }}
            />
            {/* Second arc for visual richness */}
            <circle
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="rgba(255,215,0,0.2)"
              strokeWidth={0.8}
              strokeLinecap="round"
              strokeDasharray={`${Math.PI * r * 0.3} ${Math.PI * r * 1.7}`}
              style={{
                transformOrigin: `${center}px ${center}px`,
                animation: `${i % 2 === 0 ? "reactor-spin-reverse" : "reactor-spin"} ${8 + i * 3}s linear infinite`,
              }}
            />
          </g>
        ))}

        {/* ═══ ENERGY FILAMENTS ═══ */}
        {Array.from({ length: s.filaments }).map((_, i) => {
          const angle = (360 / s.filaments) * i;
          const innerR = s.core + 4;
          const outerR = s.rings[s.rings.length - 1] + 6;
          const rad = (angle * Math.PI) / 180;
          const x1 = center + Math.cos(rad) * innerR;
          const y1 = center + Math.sin(rad) * innerR;
          const x2 = center + Math.cos(rad) * outerR;
          const y2 = center + Math.sin(rad) * outerR;
          return (
            <line
              key={`f-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(245,166,35,0.2)"
              strokeWidth={0.5}
              style={{
                transformOrigin: `${center}px ${center}px`,
                animation: `reactor-filament-pulse ${2 + (i % 3) * 0.7}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          );
        })}

        {/* ═══ ORBITING PARTICLES ═══ */}
        {Array.from({ length: s.particles }).map((_, i) => {
          const ringIdx = i % s.rings.length;
          const orbitR = s.rings[ringIdx];
          const duration = 3 + (i % 4) * 1.5;
          const delay = i * (8 / s.particles);
          const startAngle = (360 / s.particles) * i;
          const particleSize = size === "hero" ? 2.5 : size === "lg" ? 2 : 1.5;
          return (
            <circle
              key={`p-${i}`}
              cx={center + orbitR}
              cy={center}
              r={particleSize}
              fill="#ffd700"
              filter={`url(#glow-${size})`}
              style={{
                transformOrigin: `${center}px ${center}px`,
                animation: `reactor-spin ${duration}s linear infinite`,
                animationDelay: `${-delay}s`,
                opacity: 0.8,
              }}
            />
          );
        })}

        {/* ═══ CORE ═══ */}
        {/* Core outer ring */}
        <circle
          cx={center}
          cy={center}
          r={s.core + 2}
          fill="none"
          stroke="rgba(245,166,35,0.3)"
          strokeWidth={1}
        />
        {/* Core glow */}
        <circle
          cx={center}
          cy={center}
          r={s.core}
          fill="rgba(245,166,35,0.15)"
          filter={`url(#glow-strong-${size})`}
        />
        {/* Core bright center */}
        <circle
          cx={center}
          cy={center}
          r={s.core * 0.6}
          fill="#f5a623"
          opacity={0.9}
          filter={`url(#glow-strong-${size})`}
        />
        {/* Core hot center */}
        <circle
          cx={center}
          cy={center}
          r={s.core * 0.3}
          fill="#fff5d6"
          opacity={0.95}
        />
      </svg>

      {/* CSS core pulse overlay (on top of SVG) */}
      <div
        className="absolute rounded-full z-20"
        style={{
          width: s.core * 1.2,
          height: s.core * 1.2,
          background: "radial-gradient(circle, rgba(255,245,214,0.4) 0%, rgba(245,166,35,0.2) 50%, transparent 70%)",
          animation: "reactor-pulse-core 3s ease-in-out infinite",
        }}
      />
    </div>
  );
}
