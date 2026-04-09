"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, TrendingUp, TrendingDown, Cloud, Newspaper, Globe, Hexagon, Activity, ChevronRight, X, Sun, CloudRain, Wind } from "lucide-react";
import { STATS } from "@/data/friday-data";

// ═══ LIVE CLOCK ═══
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <Hexagon className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-lg font-bold text-text-primary">{greeting}.</h1>
          <p className="text-[10px] text-text-muted">Friday is online · All systems nominal</p>
        </div>
      </div>
      <div className="text-3xl font-bold text-primary font-mono tracking-wider">
        {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
      </div>
      <div className="text-xs text-text-secondary mt-1">
        {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      </div>
      <div className="text-[9px] text-text-muted mt-0.5">{Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
    </div>
  );
}

// ═══ STOCK CHART MODAL ═══
type Stock = { symbol: string; price: number; change: number; changePercent: number; history: number[] };

function StockChart({ stock, onClose }: { stock: Stock; onClose: () => void }) {
  const min = Math.min(...stock.history);
  const max = Math.max(...stock.history);
  const range = max - min || 1;
  const w = 400;
  const h = 150;
  const points = stock.history.map((v, i) => `${(i / (stock.history.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  const isUp = stock.change >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary font-mono">{stock.symbol}</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-text-primary">${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span className={`text-sm font-bold ${isUp ? "text-success" : "text-danger"}`}>
                {isUp ? "+" : ""}{stock.change.toFixed(2)} ({isUp ? "+" : ""}{stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.04] text-text-muted"><X className="w-4 h-4" /></button>
        </div>
        <svg viewBox={`-10 -10 ${w + 20} ${h + 20}`} className="w-full">
          <polyline points={points} fill="none" stroke={isUp ? "#07CA6B" : "#EA2143"} strokeWidth="2" strokeLinejoin="round" />
          <polyline points={`0,${h} ${points} ${w},${h}`} fill={isUp ? "rgba(7,202,107,0.1)" : "rgba(234,33,67,0.1)"} stroke="none" />
        </svg>
        <div className="flex justify-between text-[9px] text-text-muted mt-1">
          <span>24h ago</span><span>12h ago</span><span>Now</span>
        </div>
      </div>
    </div>
  );
}

// ═══ STOCKS ═══
function StockWidget() {
  const [stocks, setStocks] = useState<Stock[]>(() => {
    const base = [
      { symbol: "AAPL", price: 234.82 }, { symbol: "MSFT", price: 467.15 },
      { symbol: "GOOGL", price: 178.92 }, { symbol: "NVDA", price: 142.56 },
      { symbol: "TSLA", price: 312.45 }, { symbol: "AMZN", price: 198.73 },
      { symbol: "META", price: 612.34 }, { symbol: "BTC", price: 106842 },
      { symbol: "ETH", price: 3842 }, { symbol: "SPY", price: 542.18 },
    ];
    return base.map((b) => {
      const hist: number[] = [];
      let p = b.price;
      for (let i = 0; i < 48; i++) { p += (Math.random() - 0.48) * b.price * 0.003; hist.push(+p.toFixed(2)); }
      const change = +(hist[hist.length - 1] - hist[0]).toFixed(2);
      return { ...b, price: hist[hist.length - 1], change, changePercent: +((change / hist[0]) * 100).toFixed(2), history: hist };
    });
  });
  const [selected, setSelected] = useState<Stock | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setStocks((prev) => prev.map((s) => {
        const drift = (Math.random() - 0.48) * s.price * 0.002;
        const newPrice = +(s.price + drift).toFixed(2);
        const newHist = [...s.history.slice(1), newPrice];
        const newChange = +(newPrice - newHist[0]).toFixed(2);
        return { ...s, price: newPrice, change: newChange, changePercent: +((newChange / newHist[0]) * 100).toFixed(2), history: newHist };
      }));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {selected && <StockChart stock={selected} onClose={() => setSelected(null)} />}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-primary" /> Market Watch
          </h3>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[9px] font-bold text-success">LIVE</span>
          </div>
        </div>
        <div className="space-y-0.5">
          {stocks.map((s) => {
            const isUp = s.change >= 0;
            // Mini sparkline
            const hist = s.history.slice(-12);
            const min = Math.min(...hist); const max = Math.max(...hist); const rng = max - min || 1;
            const sparkPoints = hist.map((v, i) => `${i * 4},${20 - ((v - min) / rng) * 20}`).join(" ");
            return (
              <button key={s.symbol} onClick={() => setSelected(s)}
                className="w-full flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/[0.03] transition-colors group text-left">
                <span className="text-xs font-bold text-text-primary font-mono w-12">{s.symbol}</span>
                <svg viewBox="0 0 48 22" className="w-12 h-5 shrink-0">
                  <polyline points={sparkPoints} fill="none" stroke={isUp ? "#07CA6B" : "#EA2143"} strokeWidth="1.5" />
                </svg>
                <span className="text-xs font-bold text-text-primary font-mono w-20 text-right">
                  ${s.price < 1000 ? s.price.toFixed(2) : s.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <div className={`flex items-center gap-0.5 text-[10px] font-bold w-16 justify-end ${isUp ? "text-success" : "text-danger"}`}>
                  {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {isUp ? "+" : ""}{s.changePercent.toFixed(2)}%
                </div>
                <ChevronRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ═══ WEATHER ═══
function WeatherWidget() {
  const [weather] = useState(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const city = tz.split("/").pop()?.replace(/_/g, " ") || "New York";
    const temp = 65 + Math.floor(Math.random() * 20);
    return { temp, condition: "Partly Cloudy", humidity: 40 + Math.floor(Math.random() * 30), wind: 5 + Math.floor(Math.random() * 15), high: temp + 6, low: temp - 7, city };
  });

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
          <Cloud className="w-3.5 h-3.5 text-primary" /> Weather
        </h3>
        <span className="text-[10px] text-text-muted">{weather.city}</span>
      </div>
      <div className="flex items-center gap-4">
        <div>
          <Sun className="w-10 h-10 text-warning" />
        </div>
        <div>
          <div className="text-3xl font-bold text-text-primary">{weather.temp}°F</div>
          <div className="text-xs text-text-secondary">{weather.condition}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[10px] text-text-muted flex items-center gap-1 justify-end"><TrendingUp className="w-2.5 h-2.5" /> H: {weather.high}°</div>
          <div className="text-[10px] text-text-muted flex items-center gap-1 justify-end"><TrendingDown className="w-2.5 h-2.5" /> L: {weather.low}°</div>
          <div className="text-[10px] text-text-muted flex items-center gap-1 justify-end"><Wind className="w-2.5 h-2.5" /> {weather.wind}mph</div>
        </div>
      </div>
    </div>
  );
}

// ═══ NEWS ═══
function NewsWidget() {
  const headlines = [
    { title: "AI Models Push Boundaries of Complex Reasoning and Code Generation", source: "TechCrunch", time: "2h", url: "https://techcrunch.com", cat: "AI" },
    { title: "Federal Reserve Signals Cautious Approach on Interest Rate Decisions", source: "Reuters", time: "3h", url: "https://reuters.com", cat: "Finance" },
    { title: "SpaceX Achieves New Milestones with Starship Test Flight Program", source: "Bloomberg", time: "4h", url: "https://bloomberg.com", cat: "Space" },
    { title: "Critical Security Vulnerability Discovered in Widely-Used Software Library", source: "Ars Technica", time: "5h", url: "https://arstechnica.com", cat: "Security" },
    { title: "Apple Previews Next-Generation Computing Platform at Developer Conference", source: "The Verge", time: "6h", url: "https://theverge.com", cat: "Tech" },
    { title: "Global Semiconductor Supply Chain Shows Signs of Stabilization", source: "WSJ", time: "7h", url: "https://wsj.com", cat: "Tech" },
    { title: "Breakthrough in Quantum Computing Achieves New Error Correction Record", source: "Nature", time: "8h", url: "https://nature.com", cat: "Science" },
    { title: "Major Cloud Providers Expand Data Center Infrastructure Worldwide", source: "CNBC", time: "9h", url: "https://cnbc.com", cat: "Cloud" },
  ];

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
          <Newspaper className="w-3.5 h-3.5 text-primary" /> Headlines
        </h3>
        <Globe className="w-3 h-3 text-text-muted" />
      </div>
      <div className="space-y-1">
        {headlines.map((h, i) => (
          <a key={i} href={h.url} target="_blank" rel="noopener noreferrer"
            className="block py-2 px-2 rounded-lg hover:bg-white/[0.03] transition-colors group cursor-pointer border-b border-white/[0.02] last:border-0">
            <p className="text-xs text-text-primary font-medium leading-relaxed group-hover:text-primary transition-colors">{h.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] text-text-muted">{h.source} · {h.time}</span>
              <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">{h.cat}</span>
              <ChevronRight className="w-2.5 h-2.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ═══ SYSTEM STATUS ═══
function SystemStatus() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 5000); return () => clearInterval(id); }, []);
  const latency = 35 + Math.floor(Math.random() * 10);
  const connections = 140 + Math.floor(Math.random() * 20);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-primary" /> System
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-[9px] font-bold text-success">NOMINAL</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Skills", value: STATS.totalSkills.toLocaleString(), color: "#1856FF" },
          { label: "Agents", value: STATS.totalAgents.toString(), color: "#7c3aed" },
          { label: "Latency", value: latency + "ms", color: "#07CA6B" },
          { label: "Active", value: connections.toString(), color: "#E89558" },
        ].map((s) => (
          <div key={s.label} className="px-3 py-2 rounded-lg bg-white/[0.02]">
            <div className="text-[9px] text-text-muted">{s.label}</div>
            <div className="text-sm font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ QUICK ACTIONS ═══
function QuickActions({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const actions = [
    { label: "Talk to Friday", tab: "voice", icon: "🎙️" },
    { label: "Open Chat", tab: "chat", icon: "💬" },
    { label: "Terminal", tab: "tools", icon: "⌨️" },
    { label: "Analytics", tab: "analytics", icon: "📊" },
  ];
  return (
    <div className="glass-card p-4">
      <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Quick Launch</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <button key={a.tab} onClick={() => {
            // Dispatch custom event to switch tabs
            window.dispatchEvent(new CustomEvent("switch-tab", { detail: a.tab }));
          }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left">
            <span className="text-base">{a.icon}</span>
            <span className="text-[11px] font-semibold text-text-secondary">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function HomeTab() {
  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left — stocks + news (main content) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StockWidget />
              <NewsWidget />
            </div>
          </div>
          {/* Right sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <LiveClock />
            <WeatherWidget />
            <SystemStatus />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
