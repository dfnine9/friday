"use client";

import { useState, useEffect } from "react";
import { Clock, TrendingUp, TrendingDown, Cloud, Newspaper, Globe, Settings, Hexagon, Activity } from "lucide-react";
import { STATS } from "@/data/friday-data";

// ═══ LIVE CLOCK ═══
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <div className="glass-card p-6 text-center">
      <div className="text-4xl font-bold text-primary font-mono tracking-wider">
        {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
      </div>
      <div className="text-sm text-text-secondary mt-1">
        {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      </div>
      <div className="text-[10px] text-text-muted mt-1">{Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
    </div>
  );
}

// ═══ STOCK TICKER ═══
type Stock = { symbol: string; price: number; change: number; changePercent: number };

function StockWidget() {
  const [stocks, setStocks] = useState<Stock[]>([
    { symbol: "AAPL", price: 234.82, change: 2.41, changePercent: 1.04 },
    { symbol: "MSFT", price: 467.15, change: -1.23, changePercent: -0.26 },
    { symbol: "GOOGL", price: 178.92, change: 3.67, changePercent: 2.09 },
    { symbol: "NVDA", price: 142.56, change: 5.12, changePercent: 3.72 },
    { symbol: "TSLA", price: 312.45, change: -4.89, changePercent: -1.54 },
    { symbol: "AMZN", price: 198.73, change: 1.56, changePercent: 0.79 },
    { symbol: "META", price: 612.34, change: 8.21, changePercent: 1.36 },
    { symbol: "BTC-USD", price: 106842, change: 1247, changePercent: 1.18 },
  ]);

  // Simulate live price movement
  useEffect(() => {
    const id = setInterval(() => {
      setStocks((prev) => prev.map((s) => {
        const drift = (Math.random() - 0.48) * s.price * 0.002;
        const newPrice = +(s.price + drift).toFixed(2);
        const newChange = +(newPrice - (s.price - s.change)).toFixed(2);
        const newPct = +((newChange / (newPrice - newChange)) * 100).toFixed(2);
        return { ...s, price: newPrice, change: newChange, changePercent: newPct };
      }));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-primary" /> Market Watch
        </h3>
        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" title="Live" />
      </div>
      <div className="space-y-1.5">
        {stocks.map((s) => (
          <div key={s.symbol} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.02] transition-colors">
            <span className="text-xs font-bold text-text-primary font-mono w-20">{s.symbol}</span>
            <span className="text-xs font-bold text-text-primary font-mono">${s.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <div className={`flex items-center gap-1 text-[11px] font-bold ${s.change >= 0 ? "text-success" : "text-danger"}`}>
              {s.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {s.change >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ WEATHER ═══
function WeatherWidget() {
  const [weather, setWeather] = useState({ temp: 72, condition: "Partly Cloudy", humidity: 45, wind: 8, high: 78, low: 65, city: "Loading..." });
  useEffect(() => {
    // Try to get user's city from timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const city = tz.split("/").pop()?.replace(/_/g, " ") || "New York";
    const temp = 65 + Math.floor(Math.random() * 20);
    setWeather({ temp, condition: "Partly Cloudy", humidity: 40 + Math.floor(Math.random() * 30), wind: 5 + Math.floor(Math.random() * 15), high: temp + 6, low: temp - 7, city });
  }, []);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
          <Cloud className="w-3.5 h-3.5 text-primary" /> Weather
        </h3>
        <span className="text-[10px] text-text-muted">{weather.city}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-4xl font-bold text-text-primary">{weather.temp}°</div>
        <div>
          <div className="text-xs text-text-secondary font-medium">{weather.condition}</div>
          <div className="text-[10px] text-text-muted">H: {weather.high}° L: {weather.low}°</div>
          <div className="text-[10px] text-text-muted">Humidity: {weather.humidity}% · Wind: {weather.wind}mph</div>
        </div>
      </div>
    </div>
  );
}

// ═══ NEWS ═══
function NewsWidget() {
  const headlines = [
    { title: "AI Models Surpass Human Performance on Complex Reasoning Benchmarks", source: "TechCrunch", time: "2h ago", category: "AI" },
    { title: "Federal Reserve Holds Interest Rates Steady Amid Inflation Concerns", source: "Reuters", time: "3h ago", category: "Finance" },
    { title: "SpaceX Starship Completes Successful Orbital Flight and Landing", source: "Bloomberg", time: "4h ago", category: "Space" },
    { title: "Major Cybersecurity Vulnerability Found in Popular Open-Source Library", source: "Ars Technica", time: "5h ago", category: "Security" },
    { title: "Apple Announces Next-Generation AR Glasses at WWDC", source: "The Verge", time: "6h ago", category: "Tech" },
    { title: "Global Chip Shortage Expected to Ease by Q3 2026", source: "WSJ", time: "7h ago", category: "Tech" },
  ];

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
          <Newspaper className="w-3.5 h-3.5 text-primary" /> Headlines
        </h3>
        <Globe className="w-3 h-3 text-text-muted" />
      </div>
      <div className="space-y-2">
        {headlines.map((h, i) => (
          <div key={i} className="py-1.5 border-b border-white/[0.03] last:border-0">
            <p className="text-xs text-text-primary font-medium leading-relaxed">{h.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-text-muted">{h.source}</span>
              <span className="text-[9px] text-text-muted">·</span>
              <span className="text-[9px] text-text-muted">{h.time}</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">{h.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ SYSTEM STATUS MINI ═══
function SystemStatus() {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-primary" /> F.R.I.D.A.Y. Status
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-[9px] font-bold text-success">ALL NOMINAL</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Skills", value: STATS.totalSkills.toLocaleString(), color: "#1856FF" },
          { label: "Agents", value: STATS.totalAgents.toString(), color: "#7c3aed" },
          { label: "Uptime", value: STATS.uptime + "%", color: "#07CA6B" },
          { label: "Latency", value: STATS.avgResponseMs + "ms", color: "#E89558" },
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

// ═══ GREETING ═══
function Greeting() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="flex items-center gap-3 mb-6">
      <Hexagon className="w-8 h-8 text-primary" />
      <div>
        <h1 className="text-xl font-bold text-text-primary">{greeting}.</h1>
        <p className="text-xs text-text-muted">Friday is online. All systems operational.</p>
      </div>
    </div>
  );
}

export default function HomeTab() {
  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto px-6 py-6">
      <div className="max-w-6xl mx-auto">
        <Greeting />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-4">
            <StockWidget />
            <NewsWidget />
          </div>
          {/* Right column */}
          <div className="space-y-4">
            <LiveClock />
            <WeatherWidget />
            <SystemStatus />
          </div>
        </div>
      </div>
    </div>
  );
}
