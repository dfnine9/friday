# F.R.I.D.A.Y.

**Female Replacement Intelligent Digital Assistant Youth**

The autonomous AI desktop app. Voice-first. 9,510 skills. 996 agents. 12 real-time tools. Lives on your computer. Has access to everything.

Built with Tauri v2 + Next.js + Claude API + Fish Audio TTS.

## What Friday Can Do

- **Answer any question** — science, math, history, code, finance, health, relationships, literally anything
- **Real-time data** — live weather, stock prices, news, web search, Wikipedia, translations, sports scores
- **Voice interface** — tap the orb to talk, Friday speaks back with an Irish accent (Kerry Condon voice)
- **Streaming chat** — token-by-token responses with tool use indicators
- **Image analysis** — upload photos and screenshots for Claude vision
- **Full system access** (desktop app) — file operations, shell commands, Claude Code SDK with 9,510 skills
- **12 built-in tools** — web search, weather, stocks, news, math, time, Wikipedia, dictionary, translate, sports, URL fetch, unit conversion

## Quick Start

### Web Version (no install)
Visit **[jarvis-dashboard-steel.vercel.app](https://jarvis-dashboard-steel.vercel.app)**

### Desktop App (full power)

**Prerequisites:** Node.js 18+, Rust toolchain, VS Build Tools (Windows)

```bash
git clone https://github.com/dfnine9/friday.git
cd friday
npm install
cd sidecar && npm install && cd ..
npm run tauri:dev
```

### Run without Tauri
```bash
npm run sidecar:dev     # AI backend on port 3141
npm run dev             # Next.js frontend on port 3000
```

## Architecture

```
Tauri Window (WebView2)
 |
 +-- Next.js Static Export (Voice Orb, Chat, Dashboard)
 |
 +-- Node.js Sidecar (port 3141)
      |-- Claude API + 12 tools (streaming + blocking)
      |-- Fish Audio TTS (JARVIS voice)
      |-- Claude Code SDK (9,510 skills, 996 agents)
```

## Configuration

Create `sidecar/.env`:
```
ANTHROPIC_API_KEY=your-key-here
FISH_API_KEY=your-fish-audio-key
FISH_VOICE_ID=your-voice-id
```

## Tech Stack

- **Desktop:** Tauri v2 (Rust)
- **Frontend:** Next.js 16, React 19, TypeScript, TailwindCSS 4
- **3D:** Three.js (particle voice orb)
- **AI:** Claude Sonnet 4 via Anthropic API
- **Voice:** Fish Audio TTS (Kerry Condon JARVIS voice)
- **Charts:** Recharts

## Stats

| Metric | Value |
|--------|-------|
| Skills | 9,510 |
| Agents | 996 |
| Commands | 966 |
| Tools | 12 |
| Repositories | 45 |

## License

MIT
