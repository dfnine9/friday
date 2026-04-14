// Shared tools — same as sidecar/server.ts tools section
// This copy exists for the Vercel web deployment

const t = (name: string, desc: string, props: Record<string, any>, req: string[]) => ({
  name, description: desc,
  input_schema: { type: "object" as const, properties: props, required: req },
});

export const TOOL_DEFINITIONS = [
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

export async function executeTool(name: string, input: any): Promise<string> {
  try {
    switch (name) {
      case "web_search": case "get_news": case "get_sports": {
        const q = name === "web_search" ? input.query : name === "get_news" ? `${input.topic} latest news` : `${input.query} scores site:espn.com`;
        const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, { headers: { "User-Agent": "Mozilla/5.0" } });
        const html = await res.text();
        const r: string[] = [], titles: string[] = [], snippets: string[] = [];
        let m;
        const tR = /<a[^>]+class="result__a"[^>]*>([\s\S]*?)<\/a>/g;
        const sR = /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
        while ((m = tR.exec(html)) && titles.length < 6) titles.push(m[1].replace(/<[^>]+>/g, "").trim());
        while ((m = sR.exec(html)) && snippets.length < 6) snippets.push(m[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").trim());
        for (let i = 0; i < Math.max(titles.length, snippets.length); i++) if (titles[i] || snippets[i]) r.push(`${i + 1}. ${titles[i] || ""}\n   ${snippets[i] || ""}`);
        return r.length ? r.join("\n\n") : `No results.`;
      }
      case "get_weather": {
        const res = await fetch(`https://wttr.in/${encodeURIComponent(input.location)}?format=j1`, { headers: { "User-Agent": "curl/7.68.0" } });
        const d = await res.json(); const c = d.current_condition?.[0];
        return c ? `${input.location}: ${c.weatherDesc?.[0]?.value}, ${c.temp_F}F, humidity ${c.humidity}%` : "No data.";
      }
      case "get_stocks": {
        const s = input.symbol.toUpperCase();
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${s}?range=1d&interval=15m`, { headers: { "User-Agent": "Mozilla/5.0" } });
        const r = (await res.json()).chart?.result?.[0]; if (!r) return `No data for ${s}.`;
        const m = r.meta; return `${s}: $${m.regularMarketPrice}`;
      }
      case "calculate": {
        const s = input.expression.replace(/\^/g, "**").replace(/\bsqrt\b/g, "Math.sqrt").replace(/\bpi\b/gi, "Math.PI");
        const r = new Function(`"use strict";return(${s})`)();
        return `${input.expression} = ${r}`;
      }
      case "get_time": return new Date().toLocaleString("en-US", { timeZone: input.timezone, weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
      case "wikipedia": {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(input.topic.replace(/ /g, "_"))}`);
        const d = await res.json(); return d.extract || "No article found.";
      }
      case "define_word": {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${input.word.toLowerCase()}`);
        const d = (await res.json())[0]; return `${d.word}: ${d.meanings?.[0]?.definitions?.[0]?.definition || ""}`;
      }
      case "translate": {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${input.to}&dt=t&q=${encodeURIComponent(input.text)}`);
        const d = await res.json(); return `"${input.text}" → "${d[0]?.map((s: any) => s[0]).join("")}" (${input.to})`;
      }
      case "fetch_url": {
        const res = await fetch(input.url, { headers: { "User-Agent": "Mozilla/5.0" } });
        let t = await res.text();
        t = t.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        return t.slice(0, 3000);
      }
      case "convert_units": {
        const f = input.from.toLowerCase(), tt = input.to.toLowerCase();
        if (f.startsWith("c") && tt.startsWith("f")) return `${input.value}°C = ${(input.value * 9/5 + 32).toFixed(1)}°F`;
        if (f.startsWith("f") && tt.startsWith("c")) return `${input.value}°F = ${((input.value - 32) * 5/9).toFixed(1)}°C`;
        return `${input.value} ${input.from} → ${input.to}`;
      }
      default: return "Unknown tool";
    }
  } catch (e: any) { return `Unavailable: ${e.message?.slice(0, 60)}`; }
}
