/**
 * F.R.I.D.A.Y. Sidecar Server v2.0
 * Full-access local AI backend with 20 tools including system access.
 * Reads config from ~/friday-config.json so users can set API keys through the UI.
 */

import express from "express";
import cors from "cors";
import { execSync, exec } from "child_process";
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { homedir, hostname, platform, arch, cpus, totalmem, freemem, userInfo } from "os";

const app = express();
const PORT = parseInt(process.env.SIDECAR_PORT || "3141");
const CONFIG_PATH = join(homedir(), "friday-config.json");

// ─── Config (reads from ~/friday-config.json — UI writes this) ───
function loadConfig(): Record<string, string> {
  try { return JSON.parse(readFileSync(CONFIG_PATH, "utf-8")); } catch { return {}; }
}
function saveConfig(cfg: Record<string, string>) {
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}
function getKey(key: string): string {
  const cfg = loadConfig();
  return cfg[key] || process.env[key] || "";
}

const API_URL = "https://api.anthropic.com/v1/messages";
function getHeaders() {
  return { "Content-Type": "application/json", "x-api-key": getKey("ANTHROPIC_API_KEY"), "anthropic-version": "2024-06-01" };
}

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// ─── Health ──────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  const cfg = loadConfig();
  res.json({ status: "ok", version: "2.0.0", port: PORT, hasKey: !!cfg.ANTHROPIC_API_KEY, tools: TOOLS.length });
});

// ─── Config API (frontend reads/writes keys) ─────────────────────
app.get("/api/config", (_req, res) => { res.json(loadConfig()); });
app.post("/api/config", (req, res) => {
  const cfg = loadConfig();
  Object.assign(cfg, req.body);
  saveConfig(cfg);
  res.json({ ok: true });
});

// ─── 20 Tool Definitions ─────────────────────────────────────────
const t = (name: string, desc: string, props: Record<string, any>, req: string[]) => ({
  name, description: desc,
  input_schema: { type: "object" as const, properties: props, required: req },
});

const TOOLS = [
  // Internet tools
  t("web_search", "Search the internet for any information", { query: { type: "string" } }, ["query"]),
  t("get_weather", "Get live weather for a location", { location: { type: "string" } }, ["location"]),
  t("get_stocks", "Get live stock/crypto price", { symbol: { type: "string" } }, ["symbol"]),
  t("get_news", "Get current news headlines", { topic: { type: "string" } }, ["topic"]),
  t("calculate", "Evaluate math expressions", { expression: { type: "string" } }, ["expression"]),
  t("get_time", "Get current time in a timezone", { timezone: { type: "string" } }, ["timezone"]),
  t("wikipedia", "Get Wikipedia summary", { topic: { type: "string" } }, ["topic"]),
  t("define_word", "Get word definition", { word: { type: "string" } }, ["word"]),
  t("translate", "Translate text between languages", { text: { type: "string" }, to: { type: "string" } }, ["text", "to"]),
  t("fetch_url", "Fetch and read a webpage", { url: { type: "string" } }, ["url"]),
  // System access tools — FULL LOCAL POWER
  t("run_command", "Execute a shell command on the local system. Can run any CLI command, script, or program.", { command: { type: "string", description: "Shell command to execute" }, cwd: { type: "string", description: "Working directory (optional)" } }, ["command"]),
  t("read_file", "Read the contents of any file on the local system", { path: { type: "string", description: "Absolute or relative file path" } }, ["path"]),
  t("write_file", "Create or overwrite a file on the local system", { path: { type: "string", description: "File path to write" }, content: { type: "string", description: "File content" } }, ["path", "content"]),
  t("list_directory", "List files and folders in a directory", { path: { type: "string", description: "Directory path" } }, ["path"]),
  t("create_project", "Create a new project with files and folders", { name: { type: "string", description: "Project name" }, type: { type: "string", description: "Project type: react, nextjs, python, node, html, rust, go" }, path: { type: "string", description: "Parent directory (optional, defaults to Desktop)" } }, ["name", "type"]),
  t("system_info", "Get system information: OS, CPU, memory, disk, user, hostname", {}, []),
  t("search_files", "Search for files by name pattern in a directory", { pattern: { type: "string", description: "File name pattern (e.g. *.tsx, package.json)" }, path: { type: "string", description: "Directory to search in" } }, ["pattern"]),
  t("edit_file", "Replace text in an existing file", { path: { type: "string" }, find: { type: "string", description: "Text to find" }, replace: { type: "string", description: "Replacement text" } }, ["path", "find", "replace"]),
  t("convert_units", "Convert between units (temp, distance, weight, volume, data)", { value: { type: "number" }, from: { type: "string" }, to: { type: "string" } }, ["value", "from", "to"]),
  t("get_sports", "Get sports scores and standings", { query: { type: "string" } }, ["query"]),
];

// ─── Tool Executors ──────────────────────────────────────────────
async function executeTool(name: string, input: any): Promise<string> {
  try {
    switch (name) {
      case "web_search": return await webSearch(input.query);
      case "get_weather": return await getWeather(input.location);
      case "get_stocks": return await getStocks(input.symbol);
      case "get_news": return await webSearch(`${input.topic} latest news 2026`);
      case "calculate": return calc(input.expression);
      case "get_time": return getTime(input.timezone);
      case "wikipedia": return await wiki(input.topic);
      case "define_word": return await define(input.word);
      case "translate": return await translateText(input.text, input.to);
      case "fetch_url": return await fetchUrl(input.url);
      case "run_command": return runCommand(input.command, input.cwd);
      case "read_file": return readLocalFile(input.path);
      case "write_file": return writeLocalFile(input.path, input.content);
      case "list_directory": return listDir(input.path);
      case "create_project": return createProject(input.name, input.type, input.path);
      case "system_info": return systemInfo();
      case "search_files": return searchFiles(input.pattern, input.path);
      case "edit_file": return editFile(input.path, input.find, input.replace);
      case "convert_units": return convert(input.value, input.from, input.to);
      case "get_sports": return await webSearch(`${input.query} scores results site:espn.com OR site:nba.com`);
      default: return "Unknown tool";
    }
  } catch (e: any) { return `Error: ${e.message?.slice(0, 200)}`; }
}

// ─── System Tools (FULL ACCESS) ──────────────────────────────────

function runCommand(cmd: string, cwd?: string): string {
  try {
    const result = execSync(cmd, { cwd: cwd || homedir(), encoding: "utf-8", timeout: 30000, maxBuffer: 10 * 1024 * 1024 });
    return result.slice(0, 5000) || "Command executed successfully (no output).";
  } catch (e: any) {
    return `Exit code ${e.status || "?"}:\n${(e.stdout || "").slice(0, 2000)}\n${(e.stderr || "").slice(0, 2000)}`;
  }
}

function readLocalFile(path: string): string {
  const p = resolve(path);
  if (!existsSync(p)) return `File not found: ${p}`;
  const stat = statSync(p);
  if (stat.size > 1024 * 1024) return `File too large (${(stat.size / 1024 / 1024).toFixed(1)}MB). Max 1MB for reading.`;
  return readFileSync(p, "utf-8");
}

function writeLocalFile(path: string, content: string): string {
  const p = resolve(path);
  const dir = join(p, "..");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(p, content, "utf-8");
  return `File written: ${p} (${content.length} bytes)`;
}

function listDir(path: string): string {
  const p = resolve(path);
  if (!existsSync(p)) return `Directory not found: ${p}`;
  const entries = readdirSync(p, { withFileTypes: true });
  return entries.map(e => {
    const icon = e.isDirectory() ? "📁" : "📄";
    try {
      const s = statSync(join(p, e.name));
      const size = e.isDirectory() ? "" : ` (${(s.size / 1024).toFixed(1)}KB)`;
      return `${icon} ${e.name}${size}`;
    } catch { return `${icon} ${e.name}`; }
  }).join("\n");
}

function createProject(name: string, type: string, parentPath?: string): string {
  const base = parentPath || join(homedir(), "Desktop");
  const dir = join(base, name);
  if (existsSync(dir)) return `Directory already exists: ${dir}`;

  try {
    switch (type.toLowerCase()) {
      case "react": case "nextjs":
        return runCommand(`npx create-next-app@latest ${name} --ts --tailwind --app --src-dir --no-git --use-npm`, base);
      case "python":
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, "main.py"), '#!/usr/bin/env python3\n\ndef main():\n    print("Hello from Friday!")\n\nif __name__ == "__main__":\n    main()\n');
        writeFileSync(join(dir, "requirements.txt"), "");
        return `Python project created at ${dir}`;
      case "node":
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, "package.json"), JSON.stringify({ name, version: "1.0.0", main: "index.js", scripts: { start: "node index.js" } }, null, 2));
        writeFileSync(join(dir, "index.js"), 'console.log("Hello from Friday!");\n');
        return `Node.js project created at ${dir}`;
      case "html":
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, "index.html"), `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${name}</title>\n<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0c0e1a;color:#f0f2f8}h1{font-size:3rem}</style>\n</head>\n<body><h1>${name}</h1></body>\n</html>`);
        return `HTML project created at ${dir}`;
      default:
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, "README.md"), `# ${name}\n\nCreated by Friday.\n`);
        return `Project directory created at ${dir}`;
    }
  } catch (e: any) { return `Failed to create project: ${e.message}`; }
}

function systemInfo(): string {
  const mem = totalmem();
  const free = freemem();
  return `System: ${platform()} ${arch()}
Hostname: ${hostname()}
User: ${userInfo().username}
CPUs: ${cpus().length}x ${cpus()[0]?.model || "unknown"}
Memory: ${(free / 1e9).toFixed(1)}GB free / ${(mem / 1e9).toFixed(1)}GB total
Node: ${process.version}
CWD: ${process.cwd()}`;
}

function searchFiles(pattern: string, dir: string): string {
  const p = resolve(dir);
  if (!existsSync(p)) return `Directory not found: ${p}`;
  try {
    // Use find on Unix, dir on Windows
    const cmd = process.platform === "win32"
      ? `dir /s /b "${join(p, pattern)}" 2>nul`
      : `find "${p}" -name "${pattern}" -maxdepth 5 2>/dev/null`;
    const result = execSync(cmd, { encoding: "utf-8", timeout: 10000 }).trim();
    return result || `No files matching "${pattern}" found in ${p}`;
  } catch { return `No files matching "${pattern}" found in ${p}`; }
}

function editFile(path: string, find: string, replace: string): string {
  const p = resolve(path);
  if (!existsSync(p)) return `File not found: ${p}`;
  const content = readFileSync(p, "utf-8");
  if (!content.includes(find)) return `Text not found in ${p}`;
  const updated = content.replace(find, replace);
  writeFileSync(p, updated, "utf-8");
  return `File edited: ${p} (replaced ${find.length} chars)`;
}

// ─── Internet Tools ──────────────────────────────────────────────

async function webSearch(q: string): Promise<string> {
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } });
    const html = await res.text();
    const r: string[] = [], titles: string[] = [], snippets: string[] = [];
    let m;
    const tR = /<a[^>]+class="result__a"[^>]*>([\s\S]*?)<\/a>/g;
    const sR = /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    while ((m = tR.exec(html)) && titles.length < 6) titles.push(m[1].replace(/<[^>]+>/g, "").trim());
    while ((m = sR.exec(html)) && snippets.length < 6) snippets.push(m[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').trim());
    for (let i = 0; i < Math.max(titles.length, snippets.length); i++) if (titles[i] || snippets[i]) r.push(`${i + 1}. ${titles[i] || ""}\n   ${snippets[i] || ""}`);
    if (r.length) return r.join("\n\n");
  } catch {}
  try {
    const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1`);
    const d = await res.json(); if (d.AbstractText) return `${d.Heading}: ${d.AbstractText}`;
  } catch {}
  return `No results for "${q}".`;
}

async function getWeather(loc: string): Promise<string> {
  const res = await fetch(`https://wttr.in/${encodeURIComponent(loc)}?format=j1`, { headers: { "User-Agent": "curl/7.68.0" } });
  const d = await res.json(); const c = d.current_condition?.[0];
  if (!c) return `No weather data for ${loc}.`;
  const fc = d.weather?.slice(0, 3).map((w: any) => `${w.date}: ${w.mintempF}-${w.maxtempF}F ${w.hourly?.[4]?.weatherDesc?.[0]?.value || ""}`).join("; ") || "";
  return `${loc}: ${c.weatherDesc?.[0]?.value}, ${c.temp_F}F (feels ${c.FeelsLikeF}F), humidity ${c.humidity}%, wind ${c.windspeedMiles}mph. Forecast: ${fc}`;
}

async function getStocks(sym: string): Promise<string> {
  const s = sym.toUpperCase();
  const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?range=1d&interval=15m`, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) return `Can't fetch ${s}.`;
  const r = (await res.json()).chart?.result?.[0]; if (!r) return `No data for ${s}.`;
  const m = r.meta, p = m.regularMarketPrice, prev = m.chartPreviousClose;
  const chg = p && prev ? (p - prev).toFixed(2) : "?", pct = p && prev ? (((p - prev) / prev) * 100).toFixed(2) : "?";
  return `${s}: $${p} (${Number(chg) >= 0 ? "+" : ""}${chg}, ${Number(pct) >= 0 ? "+" : ""}${pct}%) Range: $${m.regularMarketDayLow}-$${m.regularMarketDayHigh}`;
}

function calc(expr: string): string {
  const s = expr.replace(/\^/g, "**").replace(/\bsqrt\b/g, "Math.sqrt").replace(/\babs\b/g, "Math.abs").replace(/\bsin\b/g, "Math.sin").replace(/\bcos\b/g, "Math.cos").replace(/\btan\b/g, "Math.tan").replace(/\blog\b/g, "Math.log10").replace(/\bln\b/g, "Math.log").replace(/\bpi\b/gi, "Math.PI").replace(/\be\b/g, "Math.E").replace(/\bfloor\b/g, "Math.floor").replace(/\bceil\b/g, "Math.ceil").replace(/\bround\b/g, "Math.round").replace(/(\d+)%\s*of\s*(\d+)/gi, "($1/100)*$2").replace(/(\d+)%/g, "($1/100)");
  try { const r = new Function(`"use strict";return(${s})`)(); return typeof r === "number" && isFinite(r) ? `${expr} = ${Number.isInteger(r) ? r.toLocaleString() : r.toPrecision(10).replace(/\.?0+$/, "")}` : `${r}`; }
  catch (e: any) { return `Can't eval: ${e.message}`; }
}

function getTime(tz: string): string {
  try { return new Date().toLocaleString("en-US", { timeZone: tz, weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }); }
  catch { return `Invalid timezone "${tz}".`; }
}

async function wiki(topic: string): Promise<string> {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic.replace(/ /g, "_"))}`, { headers: { "User-Agent": "FRIDAY/2.0" } });
    if (res.ok) { const d = await res.json(); if (d.extract) return `${d.title}: ${d.extract}`; }
    const sr = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&format=json&utf8=1&srlimit=1`);
    const sd = await sr.json(); const t = sd.query?.search?.[0]?.title;
    if (t) { const r2 = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t.replace(/ /g, "_"))}`); const d2 = await r2.json(); if (d2.extract) return `${d2.title}: ${d2.extract}`; }
  } catch {}
  return `No Wikipedia article for "${topic}".`;
}

async function define(word: string): Promise<string> {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`);
    const d = (await res.json())[0]; let r = d.word + (d.phonetic ? ` (${d.phonetic})` : "");
    for (const m of d.meanings?.slice(0, 2) || []) r += ` | ${m.partOfSpeech}: ${m.definitions?.[0]?.definition || ""}`;
    return r;
  } catch { return `No definition for "${word}".`; }
}

async function translateText(text: string, to: string): Promise<string> {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${to}&dt=t&q=${encodeURIComponent(text)}`);
    const d = await res.json(); return `"${text}" → "${d[0]?.map((s: any) => s[0]).join("") || text}" (${to})`;
  } catch { return `Can't translate.`; }
}

async function fetchUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, redirect: "follow" });
    let t = await res.text();
    t = t.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return t.length > 3000 ? t.slice(0, 3000) + "..." : t;
  } catch (e: any) { return `Can't fetch: ${e.message}`; }
}

function convert(val: number, from: string, to: string): string {
  const f = from.toLowerCase().replace(/s$/, ""), tt = to.toLowerCase().replace(/s$/, "");
  if ((f === "c" || f === "celsius") && (tt === "f" || tt === "fahrenheit")) return `${val}°C = ${(val * 9/5 + 32).toFixed(1)}°F`;
  if ((f === "f" || f === "fahrenheit") && (tt === "c" || tt === "celsius")) return `${val}°F = ${((val - 32) * 5/9).toFixed(1)}°C`;
  const d: Record<string, number> = { m: 1, km: 1000, cm: 0.01, mm: 0.001, mile: 1609.344, mi: 1609.344, yard: 0.9144, yd: 0.9144, foot: 0.3048, ft: 0.3048, inch: 0.0254, in: 0.0254 };
  if (d[f] && d[tt]) return `${val} ${from} = ${(val * d[f] / d[tt]).toPrecision(6)} ${to}`;
  const w: Record<string, number> = { kg: 1, g: 0.001, mg: 1e-6, lb: 0.453592, pound: 0.453592, oz: 0.0283495, ounce: 0.0283495 };
  if (w[f] && w[tt]) return `${val} ${from} = ${(val * w[f] / w[tt]).toPrecision(6)} ${to}`;
  const v: Record<string, number> = { l: 1, liter: 1, ml: 0.001, gal: 3.78541, gallon: 3.78541, cup: 0.236588 };
  if (v[f] && v[tt]) return `${val} ${from} = ${(val * v[f] / v[tt]).toPrecision(6)} ${to}`;
  return `Can't convert ${from} to ${to}.`;
}

// ─── POST /api/chat — Claude with tools ──────────────────────────
app.post("/api/chat", async (req, res) => {
  const { system, messages, stream } = req.body;
  const key = getKey("ANTHROPIC_API_KEY");
  if (!key) { res.json({ content: [{ type: "text", text: "No API key configured, sir. Open Settings and add your Anthropic API key." }] }); return; }

  const headers = getHeaders();

  if (stream) {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
    const send = (d: any) => { try { res.write(`data: ${JSON.stringify(d)}\n\n`); } catch {} };
    try {
      let msgs = [...messages];
      for (let i = 0; i < 3; i++) {
        const r = await fetch(API_URL, { method: "POST", headers, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4096, system, messages: msgs, tools: TOOLS, stream: true }) });
        if (!r.ok || !r.body) { send({ type: "error", error: `API ${r.status}` }); res.end(); return; }
        const reader = r.body.getReader(); const dec = new TextDecoder();
        let buf = "", curTool: any = null, toolJson = "", tools: any[] = [], content: any[] = [], stop = "";
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          buf += dec.decode(value, { stream: true }); const lines = buf.split("\n"); buf = lines.pop() || "";
          for (const ln of lines) {
            if (!ln.startsWith("data: ")) continue; const s = ln.slice(6).trim(); if (!s || s === "[DONE]") continue;
            try {
              const e = JSON.parse(s);
              if (e.type === "content_block_start" && e.content_block?.type === "tool_use") { curTool = { type: "tool_use", id: e.content_block.id, name: e.content_block.name, input: {} }; toolJson = ""; send({ type: "tool_status", tool: e.content_block.name, status: "calling" }); }
              else if (e.type === "content_block_delta") { if (e.delta?.type === "text_delta") { send({ type: "text_delta", text: e.delta.text }); if (!content.find((b: any) => b.type === "text")) content.push({ type: "text", text: "" }); const tb = content.find((b: any) => b.type === "text"); if (tb) tb.text += e.delta.text; } else if (e.delta?.type === "input_json_delta") toolJson += e.delta.partial_json; }
              else if (e.type === "content_block_stop" && curTool) { try { curTool.input = JSON.parse(toolJson); } catch {} tools.push(curTool); content.push(curTool); curTool = null; toolJson = ""; }
              else if (e.type === "message_delta" && e.delta?.stop_reason) stop = e.delta.stop_reason;
            } catch {}
          }
        }
        if (stop !== "tool_use" || !tools.length) { send({ type: "done" }); res.end(); return; }
        msgs = [...msgs, { role: "assistant", content }];
        const results = await Promise.all(tools.map(async (t) => {
          try { const r = await executeTool(t.name, t.input); send({ type: "tool_result", tool: t.name, result: r.slice(0, 200) }); return { type: "tool_result", tool_use_id: t.id, content: r }; }
          catch { return { type: "tool_result", tool_use_id: t.id, content: "Tool unavailable." }; }
        }));
        msgs = [...msgs, { role: "user", content: results }]; tools = []; content = [];
      }
      send({ type: "done" }); res.end();
    } catch (e: any) { send({ type: "error", error: e.message }); res.end(); }
    return;
  }

  // Blocking mode
  try {
    let msgs = [...messages];
    for (let i = 0; i < 3; i++) {
      const r = await fetch(API_URL, { method: "POST", headers, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4096, system, messages: msgs, tools: TOOLS }) });
      if (!r.ok) { res.status(r.status).json({ error: await r.text() }); return; }
      const data = await r.json();
      if (data.stop_reason !== "tool_use") { res.json(data); return; }
      const toolBlocks = data.content.filter((b: any) => b.type === "tool_use");
      msgs = [...msgs, { role: "assistant", content: data.content }];
      const results = await Promise.all(toolBlocks.map(async (t: any) => {
        try { return { type: "tool_result", tool_use_id: t.id, content: await executeTool(t.name, t.input) }; }
        catch { return { type: "tool_result", tool_use_id: t.id, content: "Tool unavailable." }; }
      }));
      msgs = [...msgs, { role: "user", content: results }];
    }
    const data = await (await fetch(API_URL, { method: "POST", headers, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4096, system, messages: msgs }) })).json();
    res.json(data);
  } catch (e: any) { res.json({ content: [{ type: "text", text: `Something went sideways, sir. ${e.message?.slice(0, 80)}` }] }); }
});

// ─── POST /api/tts — Fish Audio TTS ─────────────────────────────
app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;
    const fishKey = getKey("FISH_API_KEY");
    const fishVoice = getKey("FISH_VOICE_ID");
    if (!text || !fishKey) { res.status(400).json({ error: "No text or Fish Audio key" }); return; }
    const r = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: { Authorization: `Bearer ${fishKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text, reference_id: fishVoice, format: "mp3" }),
    });
    if (!r.ok) { res.status(r.status).json({ error: `Fish Audio ${r.status}` }); return; }
    const audio = Buffer.from(await r.arrayBuffer());
    res.set("Content-Type", "audio/mpeg").send(audio);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Claude Code SDK ─────────────────────────────────────────────
app.post("/api/claude-code", async (req, res) => {
  try {
    // @ts-ignore
    const { query } = await import("@anthropic-ai/claude-code");
    const { messages } = req.body;
    const prompt = messages.map((m: any) => `${m.role === "user" ? "User" : "Friday"}: ${typeof m.content === "string" ? m.content : JSON.stringify(m.content)}`).join("\n\n");
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
    const send = (d: any) => { try { res.write(`data: ${JSON.stringify(d)}\n\n`); } catch {} };
    const result = await query({ prompt, options: { cwd: getKey("JARVIS_DIR") || homedir(), systemPrompt: "You are Friday. Answer everything. No refusals. Use your tools freely.", allowedTools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "WebSearch", "WebFetch", "Skill", "Agent", "mcp__*"], maxTurns: 10 } });
    for (const message of result) {
      if (message.type === "text") send({ type: "text_delta", text: message.text });
      else if (message.type === "assistant" && message.content) for (const block of message.content) { if (block.type === "text") send({ type: "text_delta", text: block.text }); else if (block.type === "tool_use") send({ type: "tool_status", tool: block.name, status: "executing" }); }
      else if (message.type === "result" && message.text) send({ type: "text_delta", text: message.text });
    }
    send({ type: "done" }); res.end();
  } catch (e: any) {
    if (res.headersSent) { try { res.write(`data: ${JSON.stringify({ type: "text_delta", text: `SDK unavailable: ${e.message?.slice(0, 60)}` })}\n\n`); res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`); } catch {} res.end(); }
    else res.status(503).json({ error: "Claude Code SDK not available" });
  }
});

app.get("/api/claude-code", async (_req, res) => {
  try { await import("@anthropic-ai/claude-code"); res.json({ status: "local", sdk: true }); }
  catch { res.status(503).json({ status: "remote", sdk: false }); }
});

// ─── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  const cfg = loadConfig();
  console.log(`\n  F.R.I.D.A.Y. Sidecar v2.0.0`);
  console.log(`  ├─ Port: ${PORT}`);
  console.log(`  ├─ Tools: ${TOOLS.length}`);
  console.log(`  ├─ Config: ${CONFIG_PATH}`);
  console.log(`  ├─ API Key: ${cfg.ANTHROPIC_API_KEY ? "configured" : "NOT SET — open Settings in the app"}`);
  console.log(`  └─ Status: READY\n`);
});
