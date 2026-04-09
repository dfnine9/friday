"use client";

import { useState, useEffect, useRef } from "react";
import { TERMINAL_LINES } from "@/data/friday-data";
import clsx from "clsx";

export default function TerminalSection() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= TERMINAL_LINES.length) clearInterval(interval);
    }, 400);
    return () => clearInterval(interval);
  }, [started]);

  return (
    <section id="terminal" className="section" ref={ref}>
      <div className="section-inner">
        <div className="section-header">
          <h2>Live Terminal</h2>
          <p>Real-time command execution interface — watch F.R.I.D.A.Y. process operations</p>
        </div>
        <div className="glass-card luminous-border overflow-hidden max-w-3xl mx-auto">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-danger/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
            </div>
            <span className="text-[10px] text-text-muted font-mono ml-3">friday@stark-tower ~ %</span>
          </div>
          {/* Terminal body */}
          <div className="p-5 font-mono text-xs space-y-1.5 min-h-[320px]">
            {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
              <div
                key={i}
                className={clsx(
                  "animate-fade-in",
                  line.type === "input" && "text-primary font-bold",
                  line.type === "output" && "text-text-secondary",
                  line.type === "success" && "text-success font-semibold"
                )}
              >
                {line.type === "input" && <span className="text-text-muted mr-2">$</span>}
                {line.text}
              </div>
            ))}
            {visibleLines < TERMINAL_LINES.length && (
              <div className="flex items-center gap-1">
                <span className="text-text-muted">$</span>
                <div className="w-2 h-4 bg-primary animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
