"use client";

import ArcReactorLogo from "./ArcReactorLogo";

export default function Footer() {
  return (
    <footer className="section border-t border-white/[0.04]">
      <div className="section-inner text-center">
        <div className="mb-4 flex justify-center">
          <ArcReactorLogo size="lg" />
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-1">F.R.I.D.A.Y.</h3>
        <p className="text-xs text-text-muted mb-6">
          Female Replacement Intelligent Digital Assistant Youth<br />
          Stark Industries — Advanced AI Division
        </p>
        <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
          <Stat label="Skills" value="6,502" />
          <span className="text-white/[0.08]">|</span>
          <Stat label="Agents" value="942" />
          <span className="text-white/[0.08]">|</span>
          <Stat label="Commands" value="966" />
          <span className="text-white/[0.08]">|</span>
          <Stat label="Uptime" value="99.97%" />
        </div>
        <div className="flex items-center justify-center gap-6 text-[10px] text-text-muted">
          <span>v2.0.0</span>
          <span>&middot;</span>
          <span>Powered by Claude Opus 4.6</span>
          <span>&middot;</span>
          <span>Deployed on Vercel Edge</span>
        </div>
      </div>
    </footer>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-sm font-bold text-primary">{value}</div>
      <div className="text-[10px] text-text-muted">{label}</div>
    </div>
  );
}
