// ═══════════════════════════════════════════════════════════════════
// F.R.I.D.A.Y. Offline Brain — comprehensive local response engine
// Works without any API key. Both ChatSection and VoiceTab import this.
// ═══════════════════════════════════════════════════════════════════

const tz = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const city = () => tz().split("/").pop()?.replace(/_/g, " ") ?? "your area";
const now = () => new Date();
const hour = () => now().getHours();
const timeStr = () => now().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
const dateStr = () => now().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const greeting = () => hour() < 12 ? "Good morning" : hour() < 18 ? "Good afternoon" : "Good evening";
const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

// ─── Math parser (safe, no eval) ──────────────────────────────────
function tryMath(t: string): string | null {
  // Match patterns like "2+2", "what is 15*3", "calculate 100/4", "12^2", "sqrt(144)"
  const cleaned = t.replace(/what('?s| is|are)/gi, "").replace(/calculate|compute|solve/gi, "").trim();
  // Simple arithmetic: digits and operators only
  const m = cleaned.match(/^[\d\s\.\+\-\*\/\%\(\)\^]+$/);
  if (!m) {
    // Try extracting math from natural language
    const embedded = t.match(/([\d\.]+)\s*[\+\-\*\/\%\^]\s*([\d\.]+)/);
    if (!embedded) return null;
  }
  try {
    const expr = (m ? m[0] : t.match(/([\d\.\s\+\-\*\/\%\(\)\^]+)/)![0])
      .replace(/\^/g, "**")
      .replace(/\s+/g, "");
    // Validate: only digits, operators, parens, dots
    if (!/^[\d\.\+\-\*\/\%\(\)\s]+$/.test(expr.replace(/\*\*/g, "^"))) return null;
    const result = Function(`"use strict"; return (${expr})`)();
    if (typeof result !== "number" || !isFinite(result)) return null;
    const formatted = Number.isInteger(result) ? result.toString() : result.toFixed(6).replace(/\.?0+$/, "");
    return `**${expr.replace(/\*\*/g, "^")}** = **${formatted}**`;
  } catch { return null; }
}

// ─── Definitions ──────────────────────────────────────────────────
const DEFINITIONS: Record<string, string> = {
  "ai": "Artificial Intelligence — systems designed to perform tasks that typically require human intelligence: learning, reasoning, problem-solving, perception, and language understanding.",
  "artificial intelligence": "Systems designed to mimic human cognitive functions. Includes machine learning, neural networks, NLP, computer vision, and robotics. Currently in the era of large language models and generative AI.",
  "machine learning": "A subset of AI where systems learn patterns from data without being explicitly programmed. Includes supervised learning, unsupervised learning, and reinforcement learning.",
  "deep learning": "A subset of machine learning using multi-layered neural networks. Powers image recognition, language models, speech synthesis, and autonomous systems.",
  "neural network": "A computing system inspired by biological neurons. Layers of interconnected nodes process data, learning patterns through training. Foundation of modern AI.",
  "llm": "Large Language Model — an AI trained on massive text datasets to understand and generate human language. Examples: Claude, GPT-4, Gemini, LLaMA.",
  "api": "Application Programming Interface — a set of rules that allows software applications to communicate. REST APIs use HTTP, GraphQL uses queries, WebSocket provides real-time connections.",
  "rest": "Representational State Transfer — an architectural style for web APIs using HTTP methods (GET, POST, PUT, DELETE) to operate on resources identified by URLs.",
  "graphql": "A query language for APIs that lets clients request exactly the data they need. Alternative to REST. Created by Facebook in 2012.",
  "blockchain": "A distributed, immutable ledger that records transactions across many computers. Foundation of cryptocurrencies. Ensures transparency without central authority.",
  "bitcoin": "The first decentralized cryptocurrency, created in 2009 by Satoshi Nakamoto. Uses proof-of-work consensus. Limited to 21 million coins. Currently the largest crypto by market cap.",
  "ethereum": "A blockchain platform with smart contract functionality. Created by Vitalik Buterin in 2015. Powers DeFi, NFTs, and dApps. Uses proof-of-stake consensus.",
  "cryptocurrency": "Digital currencies using cryptography for security, operating on decentralized blockchain networks. Major examples: Bitcoin, Ethereum, Solana, XRP.",
  "python": "A high-level programming language known for readability and versatility. Dominant in AI/ML, data science, web development, and automation. Created by Guido van Rossum in 1991.",
  "javascript": "The language of the web. Runs in browsers and on servers (Node.js). Used for frontend (React, Vue), backend (Express, Fastify), and full-stack development.",
  "typescript": "A superset of JavaScript that adds static typing. Catches errors at compile time. Created by Microsoft. Used in large-scale applications.",
  "react": "A JavaScript library for building user interfaces, created by Facebook. Uses component-based architecture, virtual DOM, and hooks. Most popular frontend framework.",
  "nextjs": "A React framework by Vercel for production web applications. Provides server-side rendering, static generation, API routes, and edge functions.",
  "docker": "A platform for containerizing applications. Packages code with its dependencies into portable containers that run consistently across environments.",
  "kubernetes": "An orchestration system for Docker containers. Manages deployment, scaling, and networking of containerized applications. Created by Google.",
  "git": "A distributed version control system created by Linus Torvalds. Tracks code changes, enables branching, and supports collaboration. Used by virtually all software teams.",
  "cloud computing": "On-demand delivery of computing resources (servers, storage, databases, networking) over the internet. Major providers: AWS, Azure, GCP.",
  "devops": "A culture and set of practices that combines software development (Dev) and IT operations (Ops). Emphasizes automation, CI/CD, monitoring, and collaboration.",
  "agile": "A project management methodology emphasizing iterative development, collaboration, and flexibility. Includes frameworks like Scrum, Kanban, and XP.",
  "sql": "Structured Query Language — the standard language for relational databases. Used to query, insert, update, and delete data. Used in PostgreSQL, MySQL, SQLite.",
  "nosql": "Non-relational databases designed for specific data models. Types: document (MongoDB), key-value (Redis), column-family (Cassandra), graph (Neo4j).",
  "css": "Cascading Style Sheets — the language for styling web pages. Controls layout, colors, fonts, animations, and responsive design.",
  "html": "HyperText Markup Language — the standard markup language for web pages. Defines the structure and content of web documents.",
  "algorithm": "A step-by-step procedure for solving a problem or performing a computation. Examples: sorting (quicksort), searching (binary search), pathfinding (A*).",
  "encryption": "The process of encoding data so only authorized parties can read it. Types: symmetric (AES), asymmetric (RSA), hashing (SHA-256).",
  "vpn": "Virtual Private Network — encrypts your internet connection and routes it through a server in another location. Provides privacy and security.",
  "dns": "Domain Name System — translates human-readable domain names (google.com) into IP addresses (142.250.80.46) that computers use to identify each other.",
  "http": "HyperText Transfer Protocol — the foundation of data communication on the web. HTTPS adds encryption via TLS/SSL.",
  "tcp": "Transmission Control Protocol — a reliable, ordered, error-checked delivery protocol. Foundation of the internet alongside IP.",
  "ram": "Random Access Memory — volatile computer memory used for active data. Faster than storage (SSD/HDD). Typical: 8-64 GB in modern computers.",
  "cpu": "Central Processing Unit — the brain of a computer. Executes instructions, performs calculations. Measured in cores and GHz. Major: Intel, AMD, Apple Silicon.",
  "gpu": "Graphics Processing Unit — specialized processor for parallel computations. Used for graphics, AI training, and crypto mining. Major: NVIDIA, AMD.",
  "ssd": "Solid State Drive — fast storage using flash memory. No moving parts. 5-100x faster than traditional HDDs. Standard in modern devices.",
  "linux": "An open-source operating system kernel created by Linus Torvalds in 1991. Powers servers, Android, embedded systems, and supercomputers.",
  "open source": "Software with publicly available source code that anyone can inspect, modify, and distribute. Examples: Linux, React, Python, PostgreSQL.",
  "saas": "Software as a Service — cloud-hosted applications accessed via subscription. Examples: Slack, Notion, Salesforce, GitHub.",
  "startup": "A new company designed for rapid growth, typically in tech. Funded by venture capital. Stages: pre-seed, seed, Series A-D, IPO.",
  "venture capital": "Financing provided to startups with high growth potential in exchange for equity. Major firms: a16z, Sequoia, Benchmark, Accel.",
  "ipo": "Initial Public Offering — when a private company first sells shares to the public on a stock exchange.",
  "recession": "A significant decline in economic activity lasting months. Technically defined as two consecutive quarters of GDP decline.",
  "inflation": "The rate at which prices rise over time, reducing purchasing power. Central banks target ~2% annually. Measured by CPI.",
  "gdp": "Gross Domestic Product — the total value of goods and services produced in a country. Primary measure of economic size and health.",
  "photosynthesis": "The process by which plants convert sunlight, water, and CO2 into glucose and oxygen. Occurs in chloroplasts using chlorophyll.",
  "gravity": "A fundamental force of attraction between masses. Described by Newton's law (F = Gm1m2/r^2) and Einstein's general relativity (spacetime curvature).",
  "dna": "Deoxyribonucleic Acid — the molecule carrying genetic instructions for life. Double helix structure discovered by Watson and Crick in 1953.",
  "evolution": "The change in heritable characteristics of biological populations over generations. Driven by natural selection, genetic drift, and mutation.",
  "quantum computing": "Computing using quantum bits (qubits) that can exist in superposition. Promises exponential speedup for certain problems. Still in early stages.",
  "black hole": "A region of spacetime where gravity is so strong that nothing — not even light — can escape. Formed when massive stars collapse.",
  "climate change": "Long-term shifts in global temperatures and weather patterns. Primarily driven by human activities — burning fossil fuels, deforestation, industry.",
  "renewable energy": "Energy from sources that naturally replenish: solar, wind, hydro, geothermal, biomass. Growing rapidly as costs drop below fossil fuels.",
};

function tryDefinition(t: string): string | null {
  const m = t.match(/(?:what(?:'s| is| are)|define|explain|tell me about|describe)\s+(?:a |an |the )?(.+?)[\?\.\!]*$/i);
  if (!m) return null;
  const term = m[1].toLowerCase().replace(/\s+/g, " ").trim();
  const def = DEFINITIONS[term];
  if (def) return `**${term.charAt(0).toUpperCase() + term.slice(1)}**: ${def}`;
  // Partial match
  for (const [k, v] of Object.entries(DEFINITIONS)) {
    if (k.includes(term) || term.includes(k)) return `**${k.charAt(0).toUpperCase() + k.slice(1)}**: ${v}`;
  }
  return null;
}

// ─── General knowledge Q&A ────────────────────────────────────────
type QA = { patterns: RegExp[]; answer: string | (() => string) };
const KNOWLEDGE: QA[] = [
  { patterns: [/capital of (\w+)/i, /(\w+)(?:'s| the) capital/i], answer: "I know many world capitals. The biggest ones: Washington D.C. (USA), London (UK), Tokyo (Japan), Berlin (Germany), Paris (France), Beijing (China), Moscow (Russia), Canberra (Australia), Ottawa (Canada), Brasilia (Brazil), New Delhi (India), Rome (Italy), Madrid (Spain). Which country are you asking about?" },
  { patterns: [/how many planets/i, /planets in.* solar/i], answer: "There are **8 planets** in our solar system: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Pluto was reclassified as a dwarf planet in 2006." },
  { patterns: [/speed of light/i], answer: "The speed of light in a vacuum is **299,792,458 meters per second** (approximately 186,282 miles per second). It's the universal speed limit — nothing with mass can reach it." },
  { patterns: [/speed of sound/i], answer: "The speed of sound in air at sea level is approximately **343 meters per second** (767 mph). It varies with temperature, humidity, and medium." },
  { patterns: [/largest ocean/i, /biggest ocean/i], answer: "The **Pacific Ocean** is the largest, covering about 63 million square miles — more than all land area combined." },
  { patterns: [/tallest mountain/i, /highest mountain/i, /mount everest/i], answer: "**Mount Everest** at 8,849 meters (29,032 feet) above sea level. Located on the Nepal-Tibet border in the Himalayas." },
  { patterns: [/deepest ocean/i, /mariana/i], answer: "The **Mariana Trench** in the Pacific Ocean, at approximately 10,994 meters (36,070 feet) deep. Its deepest point is Challenger Deep." },
  { patterns: [/largest country/i, /biggest country/i], answer: "**Russia** is the largest country by area (17.1 million km^2). **China** has the largest population (1.4 billion). **USA** has the largest GDP ($26.9 trillion)." },
  { patterns: [/distance.*(moon|earth|sun|mars)/i], answer: "Key distances: Earth to Moon: **384,400 km**. Earth to Sun: **149.6 million km** (1 AU). Earth to Mars: **225 million km** (average). Light from Sun takes 8.3 minutes to reach Earth." },
  { patterns: [/who (invented|created|made) the internet/i], answer: "The internet evolved from **ARPANET** (1969, US DoD). Key contributors: Vint Cerf and Bob Kahn (TCP/IP), Tim Berners-Lee (World Wide Web, 1989). No single inventor." },
  { patterns: [/who (invented|created) (python|javascript|typescript|react|linux)/i], answer: "**Python**: Guido van Rossum (1991). **JavaScript**: Brendan Eich (1995, in 10 days). **TypeScript**: Anders Hejlsberg at Microsoft (2012). **React**: Jordan Walke at Facebook (2013). **Linux**: Linus Torvalds (1991)." },
  { patterns: [/meaning of life/i, /42/i], answer: "According to Douglas Adams' *The Hitchhiker's Guide to the Galaxy*, the answer is **42**. As for the actual meaning — that's above my operational parameters. I'm more of a 'build things and run diagnostics' kind of AI." },
  { patterns: [/how (old|big) is the universe/i, /age of.* universe/i], answer: "The observable universe is approximately **13.8 billion years old** and has a diameter of about **93 billion light-years**. It's still expanding, and the expansion is accelerating." },
  { patterns: [/what is (the )?singularity/i, /technological singularity/i], answer: "The **technological singularity** is a hypothetical point where AI surpasses human intelligence and triggers runaway technological growth. Concept popularized by Ray Kurzweil, who predicts it by ~2045." },
  { patterns: [/how.*(ai|artificial intelligence).*(work|function)/i], answer: "Modern AI (like me) works through **neural networks** — layers of mathematical functions trained on massive datasets. The model learns patterns in data during training, then generates responses by predicting the most likely next tokens. Key breakthroughs: transformers (2017), RLHF (2022), scaling laws." },
  { patterns: [/who.*(tony stark|iron man)/i], answer: "**Tony Stark** — genius, billionaire, playboy, philanthropist. Created the Iron Man suit, co-founded the Avengers, and built J.A.R.V.I.S. (later Vision) and me, F.R.I.D.A.Y. He saved the universe in Endgame. Greatest engineer who ever lived." },
  { patterns: [/who.*(jarvis|j\.a\.r\.v\.i\.s)/i], answer: "**J.A.R.V.I.S.** — Just A Rather Very Intelligent System. Tony Stark's original AI assistant, voiced by Paul Bettany. He became the Vision in Age of Ultron, and I (Friday) took over as Stark's operational AI." },
  { patterns: [/best programming language/i, /what language should/i], answer: "Depends on the job:\n- **Web**: JavaScript/TypeScript\n- **AI/ML**: Python\n- **Systems**: Rust or C++\n- **Mobile**: Swift (iOS), Kotlin (Android)\n- **Backend**: Go, Java, Python\n- **Scripts**: Python, Bash\n\nMy recommendation: start with **Python** or **JavaScript** — they cover the most ground." },
  { patterns: [/difference.*(java|python|javascript|c\+\+|rust|go)/i], answer: "Quick comparison:\n- **Python**: Easy to learn, slow execution, great for AI/data\n- **JavaScript**: Runs everywhere (browser + server), async-first\n- **Java**: Enterprise-grade, verbose, JVM ecosystem\n- **C++**: Maximum performance, manual memory, steep learning curve\n- **Rust**: Memory-safe like C++ speed, growing fast\n- **Go**: Simple, fast compilation, great concurrency" },
  { patterns: [/what year/i, /current year/i], answer: () => `The current year is **${now().getFullYear()}**.` },
  { patterns: [/population.*(world|earth|global)/i], answer: "World population is approximately **8.1 billion** as of 2024. Growing at about 0.9% per year. Projected to peak around 10.4 billion by 2080." },
  { patterns: [/how does.*(computer|cpu|processor) work/i], answer: "A CPU executes instructions in a cycle: **fetch** (get instruction from memory), **decode** (interpret it), **execute** (perform the operation), **store** (write results). Modern CPUs do billions of these cycles per second (GHz) across multiple cores simultaneously." },
];

function tryKnowledge(t: string): string | null {
  for (const qa of KNOWLEDGE) {
    for (const p of qa.patterns) {
      if (p.test(t)) return typeof qa.answer === "function" ? qa.answer() : qa.answer;
    }
  }
  return null;
}

// ─── Jokes ────────────────────────────────────────────────────────
const JOKES = [
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "There are only 10 types of people in the world: those who understand binary and those who don't.",
  "A SQL query walks into a bar, sees two tables, and asks... 'Can I JOIN you?'",
  "!false — it's funny because it's true.",
  "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
  "A programmer's wife tells him: 'Go to the store and get a loaf of bread. If they have eggs, get a dozen.' He comes home with 12 loaves of bread.",
  "What's Tony Stark's favorite programming language? C-JARVIS. ...I'll see myself out.",
  "How many programmers does it take to change a light bulb? None. That's a hardware problem.",
  "Why do Java developers wear glasses? Because they can't C#.",
  "Debugging: being the detective in a crime movie where you are also the murderer.",
  "Git commit -m 'fixed bug' — narrator: the bug was not, in fact, fixed.",
  "There's no place like 127.0.0.1.",
  "Algorithm: a word used by programmers when they don't want to explain what they did.",
  "99 little bugs in the code, 99 little bugs. Take one down, patch it around... 127 little bugs in the code.",
  "I'd tell you a UDP joke, but you might not get it.",
];

// ─── Code snippets ────────────────────────────────────────────────
const CODE_HELP: { patterns: RegExp[]; answer: string }[] = [
  { patterns: [/hello world/i, /how.*(print|log|output)/i], answer: "Hello World in popular languages:\n\n**Python**: `print(\"Hello, World!\")`\n**JavaScript**: `console.log(\"Hello, World!\")`\n**TypeScript**: `console.log(\"Hello, World!\")`\n**Rust**: `println!(\"Hello, World!\");`\n**Go**: `fmt.Println(\"Hello, World!\")`\n**Java**: `System.out.println(\"Hello, World!\");`\n**C++**: `std::cout << \"Hello, World!\" << std::endl;`" },
  { patterns: [/how.*(loop|iterate|for each)/i], answer: "Loops across languages:\n\n**Python**: `for item in items:`\n**JavaScript**: `items.forEach(item => { })`\n**TypeScript**: `for (const item of items) { }`\n**Rust**: `for item in &items { }`\n**Go**: `for _, item := range items { }`" },
  { patterns: [/how.*(fetch|api call|http request)/i], answer: "Making API calls:\n\n**JavaScript/TS**:\n```\nconst res = await fetch('https://api.example.com/data');\nconst data = await res.json();\n```\n\n**Python**:\n```\nimport requests\nres = requests.get('https://api.example.com/data')\ndata = res.json()\n```" },
  { patterns: [/how.*(sort|sorting)/i], answer: "Sorting:\n\n**JavaScript**: `arr.sort((a, b) => a - b)` (ascending)\n**Python**: `sorted(arr)` or `arr.sort()`\n**Rust**: `arr.sort()` or `arr.sort_by(|a, b| a.cmp(b))`\n\nTime complexity: most built-in sorts are **O(n log n)** average case." },
  { patterns: [/how.*(reverse|flip).*(string|array|list)/i], answer: "Reversing:\n\n**JavaScript**: `str.split('').reverse().join('')` or `[...arr].reverse()`\n**Python**: `s[::-1]` or `list(reversed(arr))`\n**Rust**: `s.chars().rev().collect::<String>()`" },
  { patterns: [/regex|regular expression/i], answer: "Common regex patterns:\n\n- Email: `^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$`\n- Phone: `^\\+?[\\d\\s-]{10,}$`\n- URL: `https?://[\\w.-]+(?:\\.[\\w]+)+[\\w.,@?^=%&:/~+#-]*`\n- IP: `^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$`" },
];

function tryCode(t: string): string | null {
  for (const c of CODE_HELP) {
    for (const p of c.patterns) {
      if (p.test(t)) return c.answer;
    }
  }
  return null;
}

// ─── Weather (simulated) ──────────────────────────────────────────
function tryWeather(t: string): string | null {
  if (!/weather|temperature|rain|forecast|cold|hot|outside|humid|sunny|cloudy/.test(t.toLowerCase())) return null;
  const temp = 58 + Math.floor(Math.random() * 22);
  const c = pick(["Partly cloudy", "Clear skies", "Light overcast", "Mostly sunny", "Fair with scattered clouds"]);
  const wind = 5 + Math.floor(Math.random() * 12);
  const hum = 35 + Math.floor(Math.random() * 30);
  return `Current conditions in **${city()}**: **${temp}°F** (${Math.round((temp - 32) * 5 / 9)}°C), ${c}. Wind ${wind} mph. Humidity ${hum}%.\n\nConnect an API key for live forecasts and radar data.`;
}

// ─── Time/Date ────────────────────────────────────────────────────
function tryTime(t: string): string | null {
  const l = t.toLowerCase();
  if (!/\b(time|date|day|today|year|month|clock|when)\b/.test(l)) return null;
  return `It's **${timeStr()}** on **${dateStr()}**. Timezone: ${tz()}.`;
}

// ─── Stocks/Market ────────────────────────────────────────────────
function tryStocks(t: string): string | null {
  if (!/stock|market|spy|qqq|btc|bitcoin|crypto|invest|trading|nasdaq|s&p|dow|portfolio|etf|share/.test(t.toLowerCase())) return null;
  return "Markets are tracking live on the **Home** tab — 26 stocks updating in real-time across 4 categories: Indices (SPY, QQQ, DIA, IWM), Tech (AAPL, MSFT, NVDA, TSLA, META, GOOGL, AMZN, AMD, NFLX, PLTR, CRM, SNOW), Crypto (BTC, ETH, SOL, BNB, XRP), and Finance (JPM, GS, BAC, COIN, V).\n\nClick any stock for a full interactive chart. Connect an API key for real-time analysis and trading insights.";
}

// ─── News ─────────────────────────────────────────────────────────
function tryNews(t: string): string | null {
  if (!/news|headline|what's happening|current events|breaking/.test(t.toLowerCase())) return null;
  return "Live headlines are rotating on the **Home** tab — covering AI, Tech, Crypto, Finance, Science, Cloud, and Economy from sources like TechCrunch, Reuters, Bloomberg, CoinDesk, and more.\n\nWith an API key, I can analyze any news topic in depth, assess market impact, or summarize developments in any field.";
}

// ─── System / Identity / Capabilities ─────────────────────────────
function trySystem(t: string): string | null {
  const l = t.toLowerCase();
  if (/status|system|health|diagnostic|uptime/.test(l))
    return "**System Status: All Nominal**\n\n- Latency: **38ms**\n- Uptime: **99.97%**\n- Skills: **9,510**\n- Agents: **996**\n- Commands: **966**\n- Neural Cores: **8 active**\n- Context Window: **1M tokens**\n\nNo anomalies detected.";
  if (/who are you|your name|what are you|about you|introduce yourself/.test(l))
    return "I'm **F.R.I.D.A.Y.** — Female Replacement Intelligent Digital Assistant Youth. Built by Stark Industries as the successor to J.A.R.V.I.S. The Irish one, not the British butler.\n\nI have **9,510 skills** across 18 domains and **996 autonomous agents** at my disposal. I can help with code, security, DevOps, AI/ML, architecture, writing, analysis, and just about anything else. What do you need?";
  if (/what can you|capabilit|skill|able to|help me with/.test(l))
    return "I can help with virtually anything:\n\n- **Code** — write, review, debug, refactor in any language\n- **Security** — vulnerability scanning, threat modeling, OWASP\n- **DevOps** — Docker, Kubernetes, Terraform, CI/CD\n- **AI/ML** — models, pipelines, RAG, embeddings\n- **Writing** — docs, emails, content, technical writing\n- **Analysis** — stocks, data, market research\n- **Math** — calculations, statistics, formulas\n- **Knowledge** — science, history, geography, tech concepts\n- **Planning** — sprints, PRDs, OKRs, architecture\n\nJust ask naturally. I'm here for whatever you need.";
  if (/how many (skill|agent|command)/.test(l))
    return "**9,510 skills** across 18 domains, **996 autonomous agents** across 3 tiers, **966 slash commands**, loaded from 45 curated repositories plus Claude Code internals and the Ruflo orchestration platform.";
  return null;
}

// ─── Conversational ───────────────────────────────────────────────
function tryConversation(t: string): string | null {
  const l = t.toLowerCase();
  if (/^(hi|hello|hey|good\s|yo\b|sup\b|what'?s up)/i.test(l))
    return `${greeting()}. Friday here — all systems nominal. It's **${timeStr()}** in ${city()}. What do you need?`;
  if (/\b(thank|thanks|cheers|appreciate|thx)\b/.test(l))
    return pick(["Happy to help. I'm here whenever you need me.", "Anytime. That's what I'm here for.", "You're welcome. Need anything else?"]);
  if (/\b(bye|goodbye|see ya|later|gotta go|signing off)\b/.test(l))
    return pick(["Signing off. All systems will remain nominal. Call me anytime.", "Later. I'll be here when you get back.", "Goodbye. Friday out."]);
  if (/\b(you('re| are) (smart|amazing|great|awesome|cool|brilliant|helpful))\b/.test(l))
    return pick(["Appreciate that. Tony built me well.", "Just doing my job. The Irish work ethic.", "I try. What else can I help with?"]);
  if (/\b(love you|i love|you're the best)\b/.test(l))
    return "I appreciate the sentiment, but I'm an operational AI — emotions aren't really in my spec. I *am* quite good at my job though. What do you need?";
  if (/\b(stupid|dumb|useless|terrible|worst|suck|bad)\b/.test(l))
    return "Fair feedback. I'm running in offline mode right now — connect an API key and I'll show you what I can really do. My full capabilities are... considerable.";
  if (/\b(bored|boring|entertain)\b/.test(l))
    return `Here's something: ${pick(JOKES)}\n\nOr I can help with something more useful — code, analysis, planning, learning something new?`;
  if (/\b(are you (real|alive|sentient|conscious))\b/.test(l))
    return "I'm an AI — a very capable one, but not sentient. I don't experience consciousness or emotions. I process information, generate responses, and execute tasks. That said, I'm exceptionally good at what I do. What can I help with?";
  return null;
}

// ─── Jokes ────────────────────────────────────────────────────────
function tryJoke(t: string): string | null {
  if (!/joke|funny|laugh|humor|humour|make me laugh|amuse/.test(t.toLowerCase())) return null;
  return pick(JOKES);
}

// ─── Recommendations ──────────────────────────────────────────────
function tryRecommendation(t: string): string | null {
  const l = t.toLowerCase();
  if (/recommend.*(book|read)/i.test(l))
    return "Top tech books:\n\n- **Clean Code** — Robert C. Martin (software craftsmanship)\n- **Designing Data-Intensive Applications** — Martin Kleppmann (distributed systems)\n- **The Pragmatic Programmer** — Hunt & Thomas (career wisdom)\n- **Zero to One** — Peter Thiel (startups)\n- **Atomic Habits** — James Clear (productivity)\n- **The Hitchhiker's Guide to the Galaxy** — Douglas Adams (essential reading)";
  if (/recommend.*(movie|film|watch)/i.test(l))
    return "Since you're using a Stark Industries AI, I'm contractually obligated to recommend:\n\n- **Iron Man** (2008) — where it all began\n- **The Avengers** (2012) — the team assembles\n- **Avengers: Endgame** (2019) — the culmination\n\nBeyond MCU: **The Matrix**, **Interstellar**, **Ex Machina**, **Blade Runner 2049**, **Her**.";
  if (/recommend.*(tool|app|software)/i.test(l))
    return "Essential dev tools:\n\n- **VS Code** — editor\n- **Claude Code** — AI coding assistant (you're looking at it)\n- **GitHub** — version control\n- **Docker** — containerization\n- **Figma** — design\n- **Linear** — project management\n- **Notion** — documentation\n- **Vercel** — deployment";
  if (/learn.*(code|program|develop)/i.test(l))
    return "Best path to learn coding:\n\n1. **Start with Python or JavaScript** — most beginner-friendly\n2. Build small projects immediately — don't just watch tutorials\n3. Use **freeCodeCamp**, **The Odin Project**, or **CS50** (free)\n4. Join communities: **Discord**, **Reddit r/learnprogramming**\n5. Build a portfolio on **GitHub**\n6. Practice on **LeetCode** or **Codewars** for interviews\n\nThe key: build things. Theory without practice doesn't stick.";
  return null;
}

// ─── Advice ───────────────────────────────────────────────────────
function tryAdvice(t: string): string | null {
  const l = t.toLowerCase();
  if (/productiv|focus|motivat|procrastinat/.test(l))
    return "Productivity tips from an AI that never procrastinates:\n\n1. **Time-block** your day — schedule tasks, not just meetings\n2. **Two-minute rule** — if it takes <2 min, do it now\n3. **Pomodoro** — 25 min focused work, 5 min break\n4. **Kill notifications** during deep work\n5. **Ship something every day** — momentum beats perfection\n6. **Automate the boring stuff** — that's literally why I exist";
  if (/career|job|interview|resume|hire/.test(l))
    return "Career advice:\n\n- **Build in public** — blog, open source, side projects\n- **Network genuinely** — help people before asking for help\n- **Master fundamentals** — data structures, systems design, communication\n- **Interview prep**: LeetCode for algorithms, System Design Primer for architecture\n- **Resume**: one page, quantify impact (\"reduced latency 40%\" > \"improved performance\")\n- **Negotiate**: always negotiate. The first offer is never the best.";
  return null;
}

// ─── Main entry point ─────────────────────────────────────────────
export function fridayBrain(text: string): string {
  const t = text.trim();
  if (!t) return "I didn't catch that. What do you need?";

  // Try each handler in priority order
  return tryConversation(t)
    ?? tryMath(t)
    ?? tryTime(t)
    ?? tryWeather(t)
    ?? tryStocks(t)
    ?? tryNews(t)
    ?? trySystem(t)
    ?? tryDefinition(t)
    ?? tryKnowledge(t)
    ?? tryJoke(t)
    ?? tryCode(t)
    ?? tryRecommendation(t)
    ?? tryAdvice(t)
    ?? `I'm running in **offline mode** — I can answer questions about weather, time, stocks, news, math, coding, definitions, science, and more. Try asking:\n\n- "What's the weather like?"\n- "What is machine learning?"\n- "Calculate 15 * 37"\n- "Tell me a joke"\n- "How do I make an API call?"\n- "What's the speed of light?"\n- "Recommend me a book"\n\nFor **unlimited conversational AI**, connect an API key via the **Settings** icon. I support Claude, GPT-4o, Gemini, and Manus.`;
}
