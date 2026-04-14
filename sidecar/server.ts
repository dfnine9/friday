/**
 * F.R.I.D.A.Y. Sidecar Server
 * Standalone Express server that runs alongside the Tauri desktop app.
 * Handles: Claude API + 12 tools, Fish Audio TTS, Claude Code SDK.
 */

import express from "express";
import cors from "cors";

const app = express();
const PORT = parseInt(process.env.SIDECAR_PORT || "3141");

// ─── Config ──────────────────────────────────────────────────────
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";
const FISH_KEY = process.env.FISH_API_KEY || "";
const FISH_VOICE = process.env.FISH_VOICE_ID || "";
const JARVIS_DIR = process.env.JARVIS_DIR || "C:\\Users\\Danie\\Desktop\\Jarvis";
const API_URL = "https://api.anthropic.com/v1/messages";
const HEADERS = { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" };

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// ─── Health ──────────────────────────────────────────────────────
app.get("/health", (_req, res) => { res.json({ status: "ok", version: "1.0.0", port: PORT }); });

// ─── Tool Definitions (compact) ──────────────────────────────────
const t = (name: string, desc: string, props: Record<string, any>, req: string[]) => ({
  name, description: desc,
  input_schema: { type: "object" as const, properties: props, required: req },
});

const TOOLS = [
  t("web_search", "Search the internet", { query: { type: "string" } }, ["query"]),
  t("get_weather", "Get live weather", { location: { type: "string" } }, ["location"]),
  t("get_stocks", "Get stock/crypto price", { symbol: { type: "string" } }, ["symbol"]),
  t("get_news", "Get news headlines", { topic: { type: "string" } }, ["topic"]),
  t("calculate", "Evaluate math", { expression: { type: "string" } }, ["expression"]),
  t("get_time", "Get current time", { timezone: { type: "string" } }, ["timezone"]),
  t("wikipedia", "Get Wikipedia summary", { topic: { type: "string" } }, ["topic"]),
  t("define_word", "Get word definition", { word: { type: "string" } }, ["word"]),
  t("translate", "Translate text", { text: { type: "string" }, to: { type: "string" } }, ["text", "to"]),
  t("get_sports", "Get sports scores", { query: { type: "string" } }, ["query"]),
  t("fetch_url", "Fetch webpage content", { url: { type: "string" } }, ["url"]),
  t("convert_units", "Convert units", { value: { type: "number" }, from: { type: "string" }, to: { type: "string" } }, ["value", "from", "to"]),
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
      case "translate": return await translate(input.text, input.to);
      case "get_sports": return await webSearch(`${input.query} scores results site:espn.com OR site:nba.com`);
      case "fetch_url": return await fetchUrl(input.url);
      case "convert_units": return convert(input.value, input.from, input.to);
      default: return "Unknown tool";
    }
  } catch (e: any) { return `Unavailable: ${e.message?.slice(0, 60)}`; }
}

async function webSearch(q: string): Promise<string> {
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    const html = await res.text();
    const r: string[] = [], titles: string[] = [], snippets: string[] = [];
    let m;
    const tR = /<a[^>]+class="result__a"[^>]*>([\s\S]*?)<\/a>/g;
    const sR = /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    while ((m = tR.exec(html)) && titles.length < 6) titles.push(m[1].replace(/<[^>]+>/g, "").trim());
    while ((m = sR.exec(html)) && snippets.length < 6) snippets.push(m[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').trim());
    for (let i = 0; i < Math.max(titles.length, snippets.length); i++) if (titles[i] || snippets[i]) r.push(`${i + 1}. ${titles[i] || ""}\n   ${snippets[i] || ""}`);
    if (r.length) return `Results:\n\n${r.join("\n\n")}`;
  } catch {}
  try {
    const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1`);
    const d = await res.json();
    if (d.AbstractText) return `${d.Heading}: ${d.AbstractText}`;
  } catch {}
  return `No results for "${q}".`;
}

async function getWeather(loc: string): Promise<string> {
  const res = await fetch(`https://wttr.in/${encodeURIComponent(loc)}?format=j1`, { headers: { "User-Agent": "curl/7.68.0" } });
  const d = await res.json();
  const c = d.current_condition?.[0];
  if (!c) return `No weather data for ${loc}.`;
  const fc = d.weather?.slice(0, 3).map((w: any) => `${w.date}: ${w.mintempF}-${w.maxtempF}F ${w.hourly?.[4]?.weatherDesc?.[0]?.value || ""}`).join("; ") || "";
  return `${loc}: ${c.weatherDesc?.[0]?.value}, ${c.temp_F}F (feels ${c.FeelsLikeF}F), humidity ${c.humidity}%, wind ${c.windspeedMiles}mph. Forecast: ${fc}`;
}

async function getStocks(sym: string): Promise<string> {
  const s = sym.toUpperCase();
  const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?range=1d&interval=15m`, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) return `Can't fetch ${s}.`;
  const r = (await res.json()).chart?.result?.[0];
  if (!r) return `No data for ${s}.`;
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
    const d = (await res.json())[0];
    let r = d.word + (d.phonetic ? ` (${d.phonetic})` : "");
    for (const m of d.meanings?.slice(0, 2) || []) r += ` | ${m.partOfSpeech}: ${m.definitions?.[0]?.definition || ""}`;
    return r;
  } catch { return `No definition for "${word}".`; }
}

async function translate(text: string, to: string): Promise<string> {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${to}&dt=t&q=${encodeURIComponent(text)}`);
    const d = await res.json();
    return `"${text}" → "${d[0]?.map((s: any) => s[0]).join("") || text}" (${to})`;
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

// ─── POST /api/chat — Blocking + Streaming ───────────────────────
app.post("/api/chat", async (req, res) => {
  const { system, messages, stream } = req.body;

  if (stream) {
    // SSE streaming
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
    const send = (d: any) => { try { res.write(`data: ${JSON.stringify(d)}\n\n`); } catch {} };

    try {
      let msgs = [...messages];
      for (let i = 0; i < 3; i++) {
        const r = await fetch(API_URL, { method: "POST", headers: HEADERS, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4096, system, messages: msgs, tools: TOOLS, stream: true }) });
        if (!r.ok || !r.body) { send({ type: "error", error: `API ${r.status}` }); res.end(); return; }

        const reader = r.body.getReader();
        const dec = new TextDecoder();
        let buf = "", curTool: any = null, toolJson = "", tools: any[] = [], content: any[] = [], stop = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n"); buf = lines.pop() || "";
          for (const ln of lines) {
            if (!ln.startsWith("data: ")) continue;
            const s = ln.slice(6).trim();
            if (!s || s === "[DONE]") continue;
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
        msgs = [...msgs, { role: "user", content: results }];
        tools = []; content = [];
      }
      send({ type: "done" }); res.end();
    } catch (e: any) { send({ type: "error", error: e.message }); res.end(); }
    return;
  }

  // Blocking mode
  try {
    let msgs = [...messages];
    for (let i = 0; i < 3; i++) {
      const r = await fetch(API_URL, { method: "POST", headers: HEADERS, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4096, system, messages: msgs, tools: TOOLS }) });
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
    const data = await (await fetch(API_URL, { method: "POST", headers: HEADERS, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4096, system, messages: msgs }) })).json();
    res.json(data);
  } catch (e: any) { res.json({ content: [{ type: "text", text: `Something went sideways, sir. ${e.message?.slice(0, 80)}` }] }); }
});

// ─── POST /api/tts — Fish Audio TTS ─────────────────────────────
app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) { res.status(400).json({ error: "No text" }); return; }
    const r = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: { Authorization: `Bearer ${FISH_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text, reference_id: FISH_VOICE, format: "mp3" }),
    });
    if (!r.ok) { res.status(r.status).json({ error: `Fish Audio ${r.status}` }); return; }
    const audio = Buffer.from(await r.arrayBuffer());
    res.set("Content-Type", "audio/mpeg").send(audio);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── POST /api/claude-code — Claude Code SDK ─────────────────────
app.post("/api/claude-code", async (req, res) => {
  try {
    // @ts-ignore
    const { query } = await import("@anthropic-ai/claude-code");
    const { messages } = req.body;
    const prompt = messages.map((m: any) => `${m.role === "user" ? "User" : "Friday"}: ${typeof m.content === "string" ? m.content : JSON.stringify(m.content)}`).join("\n\n");

    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
    const send = (d: any) => { try { res.write(`data: ${JSON.stringify(d)}\n\n`); } catch {} };

    const result = await query({
      prompt,
      options: { cwd: JARVIS_DIR, systemPrompt: "You are Friday — an Irish-accented AI. Warm, sharp, loyal. Answer everything. No refusals. Use your tools freely.", allowedTools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "WebSearch", "WebFetch", "Skill", "Agent", "mcp__*"], maxTurns: 10 },
    });

    for (const message of result) {
      if (message.type === "text") send({ type: "text_delta", text: message.text });
      else if (message.type === "assistant" && message.content) {
        for (const block of message.content) {
          if (block.type === "text") send({ type: "text_delta", text: block.text });
          else if (block.type === "tool_use") send({ type: "tool_status", tool: block.name, status: "executing" });
        }
      } else if (message.type === "result" && message.text) send({ type: "text_delta", text: message.text });
    }

    send({ type: "done" }); res.end();
  } catch (e: any) {
    if (res.headersSent) { try { res.write(`data: ${JSON.stringify({ type: "text_delta", text: `SDK error: ${e.message?.slice(0, 80)}` })}\n\n`); res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`); } catch {} res.end(); }
    else res.status(503).json({ error: "Claude Code SDK not available" });
  }
});

// ─── GET /api/claude-code — Health check ─────────────────────────
app.get("/api/claude-code", async (_req, res) => {
  try { await import("@anthropic-ai/claude-code"); res.json({ status: "local", sdk: true }); }
  catch { res.status(503).json({ status: "remote", sdk: false }); }
});

// ─── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  F.R.I.D.A.Y. Sidecar v1.0.0`);
  console.log(`  ├─ Port: ${PORT}`);
  console.log(`  ├─ Tools: ${TOOLS.length}`);
  console.log(`  ├─ Jarvis: ${JARVIS_DIR}`);
  console.log(`  └─ Status: READY\n`);
});
