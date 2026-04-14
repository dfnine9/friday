import { NextRequest } from "next/server";

const JARVIS_DIR = process.env.JARVIS_DIR || "C:\\Users\\Danie\\Desktop\\Jarvis";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    // @ts-ignore
    const { query } = await import("@anthropic-ai/claude-code") as any;
    const prompt = messages.map((m: any) => `${m.role === "user" ? "User" : "Friday"}: ${typeof m.content === "string" ? m.content : JSON.stringify(m.content)}`).join("\n\n");
    const encoder = new TextEncoder();
    return new Response(new ReadableStream({
      async start(ctrl) {
        const send = (d: any) => { try { ctrl.enqueue(encoder.encode(`data: ${JSON.stringify(d)}\n\n`)); } catch {} };
        try {
          const result = await query({ prompt, options: { cwd: JARVIS_DIR, systemPrompt: "You are Friday. Answer everything.", allowedTools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "WebSearch", "WebFetch", "Skill", "Agent", "mcp__*"], maxTurns: 10 } });
          for (const message of result) {
            if (message.type === "text") send({ type: "text_delta", text: message.text });
            else if (message.type === "assistant" && message.content) for (const block of message.content) { if (block.type === "text") send({ type: "text_delta", text: block.text }); }
            else if (message.type === "result" && message.text) send({ type: "text_delta", text: message.text });
          }
          send({ type: "done" }); ctrl.close();
        } catch (e: any) { send({ type: "text_delta", text: `SDK error: ${e.message?.slice(0, 80)}` }); send({ type: "done" }); ctrl.close(); }
      }
    }), { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } });
  } catch { return new Response(JSON.stringify({ error: "SDK not available" }), { status: 503, headers: { "Content-Type": "application/json" } }); }
}

export async function GET() {
  try { // @ts-ignore
    await import("@anthropic-ai/claude-code"); return new Response(JSON.stringify({ status: "local", sdk: true }), { headers: { "Content-Type": "application/json" } });
  } catch { return new Response(JSON.stringify({ status: "remote", sdk: false }), { status: 503, headers: { "Content-Type": "application/json" } }); }
}
