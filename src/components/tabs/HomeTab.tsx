"use client";

import { useState, useEffect, useRef, memo, useCallback } from "react";
import {
  TrendingUp, TrendingDown, Cloud, Newspaper, Globe,
  Hexagon, Activity, X, Sun, Wind, Terminal, BarChart3,
  Mic, MessageCircle, GripVertical, Settings2,
} from "lucide-react";
import { STATS } from "@/data/friday-data";
import { type DashboardConfig, type WidgetId, ACCENT_COLORS, TICKER_SPEEDS, loadConfig, saveConfig, DEFAULT_CONFIG } from "@/lib/dashboard-config";
import CustomizePanel from "@/components/CustomizePanel";

// ─── Types ───────────────────────────────────────────────────────────────────
type Stock = {
  symbol: string; name: string; price: number; open: number;
  change: number; pct: number; history: number[];
  cat: "index" | "tech" | "crypto" | "finance";
};
type Cat = "all" | "index" | "tech" | "crypto" | "finance";

// ─── Base stock list (26 stocks) ─────────────────────────────────────────────
const BASE: { symbol: string; name: string; price: number; cat: Stock["cat"] }[] = [
  { symbol: "SPY",   name: "S&P 500 ETF",     price: 542.18,  cat: "index"   },
  { symbol: "QQQ",   name: "Nasdaq 100 ETF",  price: 468.34,  cat: "index"   },
  { symbol: "DIA",   name: "Dow Jones ETF",   price: 395.62,  cat: "index"   },
  { symbol: "IWM",   name: "Russell 2000",    price: 198.41,  cat: "index"   },
  { symbol: "AAPL",  name: "Apple",           price: 234.82,  cat: "tech"    },
  { symbol: "MSFT",  name: "Microsoft",       price: 467.15,  cat: "tech"    },
  { symbol: "GOOGL", name: "Alphabet",        price: 178.92,  cat: "tech"    },
  { symbol: "NVDA",  name: "Nvidia",          price: 142.56,  cat: "tech"    },
  { symbol: "META",  name: "Meta",            price: 612.34,  cat: "tech"    },
  { symbol: "AMZN",  name: "Amazon",          price: 198.73,  cat: "tech"    },
  { symbol: "TSLA",  name: "Tesla",           price: 312.45,  cat: "tech"    },
  { symbol: "AMD",   name: "AMD",             price: 98.67,   cat: "tech"    },
  { symbol: "NFLX",  name: "Netflix",         price: 1102.30, cat: "tech"    },
  { symbol: "PLTR",  name: "Palantir",        price: 28.45,   cat: "tech"    },
  { symbol: "CRM",   name: "Salesforce",      price: 312.88,  cat: "tech"    },
  { symbol: "SNOW",  name: "Snowflake",       price: 178.55,  cat: "tech"    },
  { symbol: "BTC",   name: "Bitcoin",         price: 106842,  cat: "crypto"  },
  { symbol: "ETH",   name: "Ethereum",        price: 3842.00, cat: "crypto"  },
  { symbol: "SOL",   name: "Solana",          price: 187.42,  cat: "crypto"  },
  { symbol: "BNB",   name: "BNB",             price: 612.34,  cat: "crypto"  },
  { symbol: "XRP",   name: "XRP",             price: 0.6821,  cat: "crypto"  },
  { symbol: "JPM",   name: "JPMorgan",        price: 242.67,  cat: "finance" },
  { symbol: "GS",    name: "Goldman Sachs",   price: 578.92,  cat: "finance" },
  { symbol: "BAC",   name: "Bank of America", price: 43.21,   cat: "finance" },
  { symbol: "COIN",  name: "Coinbase",        price: 243.18,  cat: "finance" },
  { symbol: "V",     name: "Visa",            price: 312.45,  cat: "finance" },
];

function buildStocks(): Stock[] {
  return BASE.map((b) => {
    const hist: number[] = [];
    let p = b.price * 0.985;
    for (let i = 0; i < 60; i++) {
      p += (Math.random() - 0.48) * b.price * 0.002;
      p = Math.max(p, b.price * 0.88);
      hist.push(+p.toFixed(b.price > 10 ? 2 : 4));
    }
    const open = hist[0];
    const current = hist[hist.length - 1];
    const change = +(current - open).toFixed(b.price > 10 ? 2 : 4);
    return { ...b, price: current, open, change, pct: +((change / open) * 100).toFixed(2), history: hist };
  });
}

function fmt(p: number) {
  if (p >= 1000) return "$" + p.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (p >= 1)    return "$" + p.toFixed(2);
  return "$" + p.toFixed(4);
}

// ─── Sparkline (memoized) ─────────────────────────────────────────────────────
const Sparkline = memo(function Sparkline({ history, isUp, id }: { history: number[]; isUp: boolean; id: string }) {
  const min = Math.min(...history); const max = Math.max(...history);
  const rng = max - min || 1; const W = 80; const H = 28;
  const pts = history.map((v, i) => `${(i / (history.length - 1)) * W},${H - ((v - min) / rng) * H}`).join(" ");
  const color = isUp ? "#07CA6B" : "#EA2143";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-20 h-6" preserveAspectRatio="none">
      <defs><linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.4" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill={`url(#sg-${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
});

// ─── Ticker Strip (memoized) ──────────────────────────────────────────────────
const TickerStrip = memo(function TickerStrip({ stocks, speed }: { stocks: Stock[]; speed?: string }) {
  const items = [...stocks, ...stocks];
  const dur = speed || "90s";
  return (
    <div className="overflow-hidden border-b border-white/[0.08] scrollbar-hide" style={{ height: 36, background: "rgba(10,12,28,0.95)", backdropFilter: "blur(8px)" }}>
      <div className="flex items-center gap-8 h-full whitespace-nowrap px-4" style={{ animation: `ticker-scroll ${dur} linear infinite`, width: "max-content" }}>
        {items.map((s, i) => {
          const isUp = s.change >= 0;
          return (<span key={`${s.symbol}-${i}`} className="inline-flex items-center gap-1.5 text-[11px] font-mono">
            <span className="text-text-muted font-bold tracking-wide">{s.symbol}</span>
            <span className="text-text-primary font-medium">{fmt(s.price)}</span>
            <span className={isUp ? "text-success" : "text-danger"}>{isUp ? "▲" : "▼"}{Math.abs(s.pct).toFixed(2)}%</span>
          </span>);
        })}
      </div>
    </div>
  );
});

// ─── Full Chart Modal ─────────────────────────────────────────────────────────
function FullChart({ stock, onClose }: { stock: Stock; onClose: () => void }) {
  const min = Math.min(...stock.history); const max = Math.max(...stock.history);
  const rng = max - min || 1; const W = 500; const H = 190;
  const PAD = { t: 16, b: 24, l: 52, r: 12 }; const cw = W - PAD.l - PAD.r; const ch = H - PAD.t - PAD.b;
  const isUp = stock.change >= 0; const color = isUp ? "#07CA6B" : "#EA2143";
  const pts = stock.history.map((v, i) => `${PAD.l + (i / (stock.history.length - 1)) * cw},${PAD.t + ch - ((v - min) / rng) * ch}`).join(" ");
  const openY = PAD.t + ch - ((stock.open - min) / rng) * ch;
  const lastX = PAD.l + cw; const lastY = PAD.t + ch - ((stock.history[stock.history.length - 1] - min) / rng) * ch;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.72)" }} onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-text-primary font-mono">{stock.symbol}</h3>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.06] text-text-muted font-bold uppercase tracking-wider">{stock.cat}</span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">{stock.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.04] text-text-muted transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-3xl font-bold text-text-primary font-mono">{fmt(stock.price)}</span>
          <span className={`text-sm font-bold ${isUp ? "text-success" : "text-danger"}`}>{isUp ? "+" : ""}{fmt(Math.abs(stock.change))} ({isUp ? "+" : ""}{stock.pct.toFixed(2)}%)</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <defs><linearGradient id={`fc-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.28" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
          {Array.from({ length: 5 }, (_, r) => { const y = PAD.t + (r / 4) * ch; const val = max - (r / 4) * rng; return (<g key={r}><line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="rgba(255,255,255,0.05)" /><text x={PAD.l - 5} y={y + 3.5} textAnchor="end" fontSize="8" fill="rgba(255,255,255,0.28)">{val >= 1000 ? (val / 1000).toFixed(1) + "k" : val.toFixed(val < 1 ? 3 : 0)}</text></g>); })}
          <line x1={PAD.l} y1={openY} x2={W - PAD.r} y2={openY} stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="4,3" />
          <polygon points={`${PAD.l},${PAD.t + ch} ${pts} ${lastX},${PAD.t + ch}`} fill={`url(#fc-${stock.symbol})`} />
          <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
          <circle cx={lastX} cy={lastY} r="4" fill={color} stroke="rgba(6,6,18,1)" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

// ─── Stock Card (memoized) ────────────────────────────────────────────────────
const StockCard = memo(function StockCard({ stock, onClick }: { stock: Stock; onClick: () => void }) {
  const isUp = stock.change >= 0;
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer group text-left border border-transparent hover:border-white/[0.05]">
      <div className="w-16 shrink-0">
        <div className="text-xs font-bold text-text-primary font-mono leading-tight">{stock.symbol}</div>
        <div className="text-[8px] text-text-muted truncate">{stock.name}</div>
      </div>
      <div className="flex-1 min-w-0"><Sparkline history={stock.history} isUp={isUp} id={stock.symbol} /></div>
      <div className="text-right shrink-0">
        <div className="text-xs font-bold text-text-primary font-mono">{fmt(stock.price)}</div>
        <div className={`text-[10px] font-bold ${isUp ? "text-success" : "text-danger"}`}>{isUp ? "+" : ""}{stock.pct.toFixed(2)}%</div>
      </div>
    </button>
  );
});

// ─── Market Overview ──────────────────────────────────────────────────────────
function MarketOverview({ stocks }: { stocks: Stock[] }) {
  const [cat, setCat] = useState<Cat>("all");
  const [selected, setSelected] = useState<Stock | null>(null);
  const filtered = cat === "all" ? stocks : stocks.filter((s) => s.cat === cat);
  const cats: Cat[] = ["all", "index", "tech", "crypto", "finance"];
  return (
    <>
      {selected && <FullChart stock={selected} onClose={() => setSelected(null)} />}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-primary" /> Market Watch
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" /><span className="text-[9px] font-bold text-success">LIVE</span></span>
          </h3>
          <div className="flex items-center gap-1">
            {cats.map((c) => (<button key={c} onClick={() => setCat(c)} className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide transition-all ${c === cat ? "bg-primary/20 text-primary" : "text-text-muted hover:text-text-secondary"}`}>{c}</button>))}
          </div>
        </div>
        <div className="space-y-0.5 max-h-[540px] overflow-y-auto scrollbar-hide">
          {filtered.map((s) => (<StockCard key={s.symbol} stock={s} onClick={() => setSelected(s)} />))}
        </div>
      </div>
    </>
  );
}

// ─── News ─────────────────────────────────────────────────────────────────────
const NEWS_POOL = [
  { title: "NVIDIA Unveils Next-Gen Blackwell Ultra GPUs with Record AI Performance", source: "TechCrunch", cat: "AI" },
  { title: "Federal Reserve Holds Rates Steady, Signals Cautious Path Ahead", source: "Reuters", cat: "Finance" },
  { title: "SpaceX Starship Completes Full Orbital Mission Successfully", source: "Bloomberg", cat: "Science" },
  { title: "Apple Intelligence Expands with Advanced On-Device Model Capabilities", source: "The Verge", cat: "AI" },
  { title: "Bitcoin Surges Past $110K as Institutional Adoption Accelerates", source: "CoinDesk", cat: "Crypto" },
  { title: "Google DeepMind Achieves Breakthrough in Protein Structure Prediction", source: "Nature", cat: "AI" },
  { title: "Microsoft Azure Announces New AI Inference Infrastructure Worldwide", source: "CNBC", cat: "Cloud" },
  { title: "Semiconductor Supply Chain Stabilizes as Demand for AI Chips Soars", source: "WSJ", cat: "Tech" },
  { title: "Ethereum ETF Inflows Surpass $2 Billion in Record Month", source: "CoinDesk", cat: "Crypto" },
  { title: "OpenAI Releases New Reasoning Model Surpassing Previous Benchmarks", source: "Ars Technica", cat: "AI" },
  { title: "Tesla Full Self-Driving Achieves Major Safety Milestone on Open Roads", source: "Bloomberg", cat: "Tech" },
  { title: "US GDP Growth Beats Forecasts Amid Strong Consumer Spending Data", source: "Reuters", cat: "Economy" },
  { title: "Meta Ray-Ban Smart Glasses Add AI Vision Features in Major Update", source: "The Verge", cat: "Tech" },
  { title: "Palantir Wins Multi-Billion Dollar Government AI Platform Contract", source: "CNBC", cat: "Finance" },
  { title: "Amazon AWS Launches Quantum Computing Service for Enterprise Clients", source: "TechCrunch", cat: "Cloud" },
  { title: "S&P 500 Reaches New All-Time High Driven by Tech Sector Gains", source: "WSJ", cat: "Finance" },
  { title: "Solana Network Processes Record 100M Transactions in 24-Hour Period", source: "CoinDesk", cat: "Crypto" },
  { title: "Anthropic Claude Achieves Highest Score on AGI Safety Evaluation Benchmarks", source: "Ars Technica", cat: "AI" },
  { title: "Taiwan Semiconductor Reports Record Revenue Driven by AI Chip Demand", source: "Reuters", cat: "Tech" },
  { title: "Global Carbon Capture Projects Scale Up with $8B New Investment Round", source: "Nature", cat: "Science" },
];
const NEWS_CATS = ["All", "AI", "Tech", "Crypto", "Finance", "Science", "Cloud", "Economy"];

function NewsWidget() {
  const [newsCat, setNewsCat] = useState("All");
  const [offset, setOffset] = useState(0);
  const filtered = newsCat === "All" ? NEWS_POOL : NEWS_POOL.filter((n) => n.cat === newsCat);
  const visible = filtered.slice(offset % filtered.length, (offset % filtered.length) + 6);
  useEffect(() => { const id = setInterval(() => setOffset((o) => o + 1), 8000); return () => clearInterval(id); }, []);
  useEffect(() => { setOffset(0); }, [newsCat]);
  const padded = visible.length < 6 ? [...visible, ...filtered.slice(0, 6 - visible.length)] : visible;
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2"><Newspaper className="w-3.5 h-3.5 text-primary" /> Live Headlines</h3>
        <Globe className="w-3 h-3 text-text-muted" />
      </div>
      <div className="flex items-center gap-1 mb-3 flex-wrap">
        {NEWS_CATS.map((c) => (<button key={c} onClick={() => setNewsCat(c)} className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wide transition-all ${c === newsCat ? "bg-primary/20 text-primary" : "text-text-muted hover:text-text-secondary"}`}>{c}</button>))}
      </div>
      <div className="space-y-0.5">
        {padded.map((h, i) => (
          <div key={`${h.title.slice(0, 20)}-${i}`} className="py-2 px-2 rounded-xl hover:bg-white/[0.03] transition-colors group border-b border-white/[0.02] last:border-0 cursor-pointer">
            <p className="text-[11px] text-text-primary font-medium leading-relaxed group-hover:text-primary transition-colors">{h.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] text-text-muted">{h.source}</span>
              <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">{h.cat}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Live Clock ───────────────────────────────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  const h = now.getHours();
  const greeting = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <Hexagon className="w-5 h-5 text-primary" />
        <div><h1 className="text-sm font-bold text-text-primary">{greeting}.</h1><p className="text-[9px] text-text-muted">Friday is online · All systems nominal</p></div>
      </div>
      <div className="text-3xl font-bold text-primary font-mono tracking-wider">{now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}</div>
      <div className="text-xs text-text-secondary mt-1">{now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
      <div className="text-[9px] text-text-muted mt-0.5">{Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
    </div>
  );
}

// ─── Weather (live-updating) ──────────────────────────────────────────────────
function WeatherWidget() {
  const [w, setW] = useState(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const city = tz.split("/").pop()?.replace(/_/g, " ") ?? "New York";
    const temp = 65 + Math.floor(Math.random() * 20);
    return { temp, condition: "Partly Cloudy", humidity: 40 + Math.floor(Math.random() * 30), wind: 5 + Math.floor(Math.random() * 15), high: temp + 6, low: temp - 7, city };
  });
  // Update weather every 30s with slight variations
  useEffect(() => {
    const conditions = ["Partly Cloudy", "Clear Skies", "Mostly Sunny", "Light Overcast", "Fair"];
    const id = setInterval(() => {
      setW((prev) => ({
        ...prev,
        temp: prev.temp + Math.floor(Math.random() * 3) - 1,
        humidity: Math.max(20, Math.min(90, prev.humidity + Math.floor(Math.random() * 5) - 2)),
        wind: Math.max(2, Math.min(25, prev.wind + Math.floor(Math.random() * 3) - 1)),
        condition: conditions[Math.floor(Math.random() * conditions.length)],
      }));
    }, 30000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2"><Cloud className="w-3.5 h-3.5 text-primary" /> Weather</h3>
        <span className="text-[9px] text-text-muted">{w.city}</span>
      </div>
      <div className="flex items-center gap-4">
        <Sun className="w-9 h-9 text-warning shrink-0" />
        <div><div className="text-2xl font-bold text-text-primary">{w.temp}°F</div><div className="text-[10px] text-text-secondary">{w.condition}</div></div>
        <div className="ml-auto text-right space-y-0.5">
          <div className="text-[9px] text-text-muted">H: {w.high}° L: {w.low}°</div>
          <div className="text-[9px] text-text-muted flex items-center gap-1 justify-end"><Wind className="w-2 h-2" /> {w.wind}mph</div>
          <div className="text-[9px] text-text-muted">Humidity {w.humidity}%</div>
        </div>
      </div>
    </div>
  );
}

// ─── System Status (live-updating) ────────────────────────────────────────────
function SystemStatus() {
  const [metrics, setMetrics] = useState({ latency: 40, conns: 150 });
  useEffect(() => { const id = setInterval(() => { setMetrics({ latency: 35 + Math.floor(Math.random() * 18), conns: 140 + Math.floor(Math.random() * 40) }); }, 4000); return () => clearInterval(id); }, []);
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-primary" /> System</h3>
        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success inline-block" /><span className="text-[9px] font-bold text-success">NOMINAL</span></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Skills", value: STATS.totalSkills.toLocaleString(), color: "#1856FF" },
          { label: "Agents", value: STATS.totalAgents.toString(), color: "#7c3aed" },
          { label: "Latency", value: metrics.latency + "ms", color: "#07CA6B" },
          { label: "Active", value: metrics.conns.toString(), color: "#E89558" },
        ].map((s) => (
          <div key={s.label} className="px-3 py-2 rounded-xl bg-white/[0.02]">
            <div className="text-[9px] text-text-muted">{s.label}</div>
            <div className="text-sm font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
function QuickActions() {
  const actions = [
    { label: "Talk to Friday", tab: "voice", icon: <Mic className="w-3.5 h-3.5" /> },
    { label: "Open Chat", tab: "chat", icon: <MessageCircle className="w-3.5 h-3.5" /> },
    { label: "Terminal", tab: "tools", icon: <Terminal className="w-3.5 h-3.5" /> },
    { label: "Analytics", tab: "analytics", icon: <BarChart3 className="w-3.5 h-3.5" /> },
  ];
  return (
    <div className="glass-card p-4">
      <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Quick Launch</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <button key={a.tab} onClick={() => window.dispatchEvent(new CustomEvent("switch-tab", { detail: a.tab }))}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left">
            <span className="text-primary">{a.icon}</span>
            <span className="text-[10px] font-semibold text-text-secondary">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WIDGET SYSTEM — config-driven customization
// ═══════════════════════════════════════════════════════════════════════════════

function WidgetRenderer({ id, stocks }: { id: WidgetId; stocks: Stock[] }) {
  switch (id) {
    case "market": return <MarketOverview stocks={stocks} />;
    case "news": return <NewsWidget />;
    case "clock": return <LiveClock />;
    case "weather": return <WeatherWidget />;
    case "system": return <SystemStatus />;
    case "actions": return <QuickActions />;
  }
}

// ─── Home Tab ─────────────────────────────────────────────────────────────────
export default function HomeTab() {
  const [mounted, setMounted] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_CONFIG);
  const dragItem = useRef<{ col: "left" | "right"; idx: number } | null>(null);
  const dragOver = useRef<{ col: "left" | "right"; idx: number } | null>(null);

  useEffect(() => { setStocks(buildStocks()); setMounted(true); setConfig(loadConfig()); }, []);

  // Live stock updates every 3 seconds
  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => {
      setStocks((prev) => prev.map((s) => {
        const drift = (Math.random() - 0.48) * s.price * 0.002;
        const newPrice = +(s.price + drift).toFixed(s.price > 10 ? 2 : 4);
        const newHist = [...s.history.slice(1), newPrice];
        const change = +(newPrice - s.open).toFixed(s.price > 10 ? 2 : 4);
        return { ...s, price: newPrice, change, pct: +((change / s.open) * 100).toFixed(2), history: newHist };
      }));
    }, 3000);
    return () => clearInterval(id);
  }, [mounted]);

  // Drag handlers for reordering
  const handleDragStart = useCallback((col: "left" | "right", idx: number) => { dragItem.current = { col, idx }; }, []);
  const handleDragEnter = useCallback((col: "left" | "right", idx: number) => { dragOver.current = { col, idx }; }, []);
  const handleDragEnd = useCallback(() => {
    if (!dragItem.current || !dragOver.current) return;
    const from = dragItem.current; const to = dragOver.current;
    setConfig((prev) => {
      const next = { ...prev, left: [...prev.left], right: [...prev.right] };
      const [removed] = next[from.col].splice(from.idx, 1);
      next[to.col].splice(to.idx, 0, removed);
      saveConfig(next);
      return next;
    });
    dragItem.current = null; dragOver.current = null;
  }, []);

  if (!mounted) return <div className="h-[calc(100vh-104px)]" />;

  const tickerDur = TICKER_SPEEDS[config.tickerSpeed]?.dur || "90s";
  const visibleLeft = config.left.filter((id) => !config.hiddenWidgets.includes(id));
  const visibleRight = config.right.filter((id) => !config.hiddenWidgets.includes(id));
  const isSingleCol = config.layoutMode === "one-col";
  const pad = config.compact ? "px-2 py-2" : "px-3 py-3";
  const gap = config.compact ? "gap-2" : "gap-4";
  const sideGap = config.compact ? "space-y-2" : "space-y-3";

  // Apply accent color as CSS variable
  const accentHex = ACCENT_COLORS[config.accentColor]?.hex || "#1856FF";

  function renderWidgets(widgets: WidgetId[], col: "left" | "right") {
    return widgets.map((id, idx) => (
      <div
        key={id}
        draggable
        onDragStart={() => handleDragStart(col, idx)}
        onDragEnter={() => handleDragEnter(col, idx)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => e.preventDefault()}
        className="cursor-grab active:cursor-grabbing"
      >
        <WidgetRenderer id={id} stocks={stocks} />
      </div>
    ));
  }

  return (
    <div className="h-[calc(100vh-104px)] overflow-y-auto" style={{ "--accent": accentHex } as React.CSSProperties}>
      <CustomizePanel open={showPanel} onClose={() => setShowPanel(false)} config={config} onChange={setConfig} />

      {config.tickerVisible && <TickerStrip stocks={stocks} speed={tickerDur} />}

      <div className={pad}>
        <div className="max-w-[1800px] mx-auto">
          {/* Customize button */}
          <div className="flex items-center justify-end mb-3">
            <button
              onClick={() => setShowPanel(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-white/[0.03] text-text-muted border border-white/[0.06] hover:text-primary hover:border-primary/20 transition-all"
            >
              <Settings2 className="w-3 h-3" /> Customize
            </button>
          </div>

          {isSingleCol ? (
            <div className={`space-y-4 max-w-4xl mx-auto`}>
              {renderWidgets([...visibleLeft, ...visibleRight], "left")}
            </div>
          ) : (
            <div className={`grid grid-cols-1 lg:grid-cols-12 ${gap}`}>
              <div className={`lg:col-span-8 space-y-4`}>{renderWidgets(visibleLeft, "left")}</div>
              <div className={`lg:col-span-4 ${sideGap}`}>{renderWidgets(visibleRight, "right")}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
