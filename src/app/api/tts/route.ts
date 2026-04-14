import { NextRequest, NextResponse } from "next/server";

const FISH_API_KEY = process.env.FISH_API_KEY || "";
const FISH_VOICE_ID = process.env.FISH_VOICE_ID || "";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "No text" }, { status: 400 });
    const res = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: { Authorization: `Bearer ${FISH_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text, reference_id: FISH_VOICE_ID, format: "mp3" }),
    });
    if (!res.ok) return NextResponse.json({ error: `Fish Audio ${res.status}` }, { status: res.status });
    const audio = await res.arrayBuffer();
    return new NextResponse(audio, { headers: { "Content-Type": "audio/mpeg" } });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
