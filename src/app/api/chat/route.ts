import { NextRequest, NextResponse } from "next/server";
import { TOOL_DEFINITIONS, executeTool } from "./tools";

const API_KEY = process.env.ANTHROPIC_API_KEY || "";
const URL = "https://api.anthropic.com/v1/messages";

async function callClaude(body: any): Promise<any> {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function POST(req: NextRequest) {
  const { system, messages, stream } = await req.json();
  if (stream) return handleStream(system, messages);
  return handleBlocking(system, messages);
}

async function handleBlocking(system: string, msgs: any[]) {
  try {
    let messages = [...msgs];
    for (let i = 0; i < 3; i++) {
      const data = await callClaude({ model: "claude-sonnet-4-20250514", max_tokens: 4096, system, messages, tools: TOOL_DEFINITIONS });
      if (data.stop_reason !== "tool_use") return NextResponse.json(data);
      const toolBlocks = data.content.filter((b: any) => b.type === "tool_use");
      messages = [...messages, { role: "assistant", content: data.content }];
      const results = await Promise.all(toolBlocks.map(async (t: any) => {
        try { return { type: "tool_result", tool_use_id: t.id, content: await executeTool(t.name, t.input) }; }
        catch { return { type: "tool_result", tool_use_id: t.id, content: "Tool unavailable." }; }
      }));
      messages = [...messages, { role: "user", content: results }];
    }
    const data = await callClaude({ model: "claude-sonnet-4-20250514", max_tokens: 4096, system, messages });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ content: [{ type: "text", text: `Something went sideways, sir. ${e.message?.slice(0, 80)}` }] });
  }
}

async function handleStream(system: string, msgs: any[]) {
  const enc = new TextEncoder();
  const send = (ctrl: ReadableStreamDefaultController, d: any) => { try { ctrl.enqueue(enc.encode(`data: ${JSON.stringify(d)}\n\n`)); } catch {} };
  return new Response(new ReadableStream({
    async start(ctrl) {
      try {
        let messages = [...msgs];
        for (let i = 0; i < 3; i++) {
          const res = await fetch(URL, { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4096, system, messages, tools: TOOL_DEFINITIONS, stream: true }) });
          if (!res.ok || !res.body) { send(ctrl, { type: "error", error: `API ${res.status}` }); ctrl.close(); return; }
          const reader = res.body.getReader(); const dec = new TextDecoder();
          let buf = "", curTool: any = null, toolJson = "", tools: any[] = [], content: any[] = [], stop = "";
          while (true) {
            const { done, value } = await reader.read(); if (done) break;
            buf += dec.decode(value, { stream: true }); const lines = buf.split("\n"); buf = lines.pop() || "";
            for (const ln of lines) {
              if (!ln.startsWith("data: ")) continue; const s = ln.slice(6).trim(); if (!s || s === "[DONE]") continue;
              try {
                const e = JSON.parse(s);
                if (e.type === "content_block_start" && e.content_block?.type === "tool_use") { curTool = { type: "tool_use", id: e.content_block.id, name: e.content_block.name, input: {} }; toolJson = ""; send(ctrl, { type: "tool_status", tool: e.content_block.name, status: "calling" }); }
                else if (e.type === "content_block_delta") { if (e.delta?.type === "text_delta") { send(ctrl, { type: "text_delta", text: e.delta.text }); if (!content.find((b: any) => b.type === "text")) content.push({ type: "text", text: "" }); const tb = content.find((b: any) => b.type === "text"); if (tb) tb.text += e.delta.text; } else if (e.delta?.type === "input_json_delta") toolJson += e.delta.partial_json; }
                else if (e.type === "content_block_stop" && curTool) { try { curTool.input = JSON.parse(toolJson); } catch {} tools.push(curTool); content.push(curTool); curTool = null; toolJson = ""; }
                else if (e.type === "message_delta" && e.delta?.stop_reason) stop = e.delta.stop_reason;
              } catch {}
            }
          }
          if (stop !== "tool_use" || !tools.length) { send(ctrl, { type: "done" }); ctrl.close(); return; }
          messages = [...messages, { role: "assistant", content }];
          const results = await Promise.all(tools.map(async (t) => { try { const r = await executeTool(t.name, t.input); send(ctrl, { type: "tool_result", tool: t.name, result: r.slice(0, 200) }); return { type: "tool_result", tool_use_id: t.id, content: r }; } catch { return { type: "tool_result", tool_use_id: t.id, content: "Tool unavailable." }; } }));
          messages = [...messages, { role: "user", content: results }]; tools = []; content = [];
        }
        send(ctrl, { type: "done" }); ctrl.close();
      } catch (e: any) { send(ctrl, { type: "error", error: e.message }); ctrl.close(); }
    }
  }), { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } });
}
