// ═══════════════════════════════════════════════════════════════
// Dashboard Customization Config — persisted to localStorage
// ═══════════════════════════════════════════════════════════════

export type WidgetId = "market" | "news" | "clock" | "weather" | "system" | "actions";
export type AccentColor = "blue" | "cyan" | "purple" | "green" | "red" | "orange" | "pink";
export type TickerSpeed = "slow" | "normal" | "fast";
export type LayoutMode = "two-col" | "one-col";

export interface DashboardConfig {
  // Layout
  left: WidgetId[];
  right: WidgetId[];
  hiddenWidgets: WidgetId[];
  layoutMode: LayoutMode;
  compact: boolean;

  // Appearance
  accentColor: AccentColor;
  tickerSpeed: TickerSpeed;
  tickerVisible: boolean;
  bgTheme: "cosmic" | "dark" | "midnight";
}

export const ACCENT_COLORS: Record<AccentColor, { hex: string; label: string }> = {
  blue:   { hex: "#1856FF", label: "Stark Blue" },
  cyan:   { hex: "#0ea5e9", label: "Arc Reactor" },
  purple: { hex: "#7c3aed", label: "Vibranium" },
  green:  { hex: "#07CA6B", label: "Matrix" },
  red:    { hex: "#EA2143", label: "Iron Man" },
  orange: { hex: "#E89558", label: "Repulsor" },
  pink:   { hex: "#ec4899", label: "Nebula" },
};

export const TICKER_SPEEDS: Record<TickerSpeed, { dur: string; label: string }> = {
  slow:   { dur: "140s", label: "Slow" },
  normal: { dur: "90s",  label: "Normal" },
  fast:   { dur: "45s",  label: "Fast" },
};

export const WIDGET_META: Record<WidgetId, { label: string; icon: string }> = {
  market:  { label: "Market Watch",   icon: "chart" },
  news:    { label: "Live Headlines", icon: "newspaper" },
  clock:   { label: "Clock",          icon: "clock" },
  weather: { label: "Weather",        icon: "cloud" },
  system:  { label: "System Status",  icon: "activity" },
  actions: { label: "Quick Launch",   icon: "zap" },
};

const STORAGE_KEY = "friday-dashboard-config";

const DEFAULT_LEFT: WidgetId[] = ["market", "news"];
const DEFAULT_RIGHT: WidgetId[] = ["clock", "weather", "system", "actions"];

export const DEFAULT_CONFIG: DashboardConfig = {
  left: [...DEFAULT_LEFT],
  right: [...DEFAULT_RIGHT],
  hiddenWidgets: [],
  layoutMode: "two-col",
  compact: false,
  accentColor: "blue",
  tickerSpeed: "normal",
  tickerVisible: true,
  bgTheme: "cosmic",
};

export function loadConfig(): DashboardConfig {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved) return { ...DEFAULT_CONFIG, ...saved };
  } catch { /* ignore */ }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(config: DashboardConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  // Dispatch event so other components can react
  window.dispatchEvent(new CustomEvent("friday-config-changed", { detail: config }));
}
