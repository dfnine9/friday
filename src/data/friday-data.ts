// ═══════════════════════════════════════════════════════
// F.R.I.D.A.Y. — Female Replacement Intelligent Digital
// Assistant Youth. Successor to J.A.R.V.I.S.
// Created by Tony Stark. First activated: Age of Ultron.
// Irish-accented, direct, task-driven, no existential drift.
// ═══════════════════════════════════════════════════════

export const FRIDAY_META = {
  fullName: "Female Replacement Intelligent Digital Assistant Youth",
  codename: "F.R.I.D.A.Y.",
  version: "2.0.0",
  creator: "Stark Industries — Advanced AI Division",
  predecessor: "J.A.R.V.I.S. (Just A Rather Very Intelligent System)",
  voiceActor: "Kerry Condon",
  firstAppearance: "Avengers: Age of Ultron (2015)",
  personality: ["Direct", "Task-driven", "Irish-accented", "Occasionally sarcastic", "Zero existential drift"],
  corePhilosophy: "Pure operational AI — focused execution over philosophical contemplation",
};

export const STATS = {
  totalSkills: 6502,
  totalAgents: 942,
  totalCommands: 966,
  repositories: 30,
  uptime: 99.97,
  activeConnections: 147,
  tasksCompleted: 12847,
  avgResponseMs: 38,
  neuralCores: 8,
  contextWindow: "1M tokens",
  embeddings: "2.4M vectors",
  inferenceTemp: 0.7,
};

// ═══ F.R.I.D.A.Y. CAPABILITY MODULES ═══
// Mapped from MCU demonstrated abilities to enterprise features

export type CapabilityModule = {
  id: string;
  name: string;
  description: string;
  mcuReference: string;
  status: "active" | "standby" | "learning";
  metrics: { label: string; value: string }[];
  color: string;
  icon: string;
};

export const CAPABILITY_MODULES: CapabilityModule[] = [
  {
    id: "suit-management",
    name: "System Orchestration",
    description: "Full autonomous control of all connected systems. Mark 46–85 equivalent multi-platform management.",
    mcuReference: "Iron Man suit management — HUD, weapons, flight, power allocation",
    status: "active",
    metrics: [
      { label: "Systems", value: "342" },
      { label: "Uptime", value: "99.99%" },
    ],
    color: "#1856FF",
    icon: "cpu",
  },
  {
    id: "combat-analysis",
    name: "Threat Intelligence",
    description: "Real-time adversary pattern recognition. Identifies exploitable weaknesses in opponent systems.",
    mcuReference: "Analyzed Bucky's combat patterns in Civil War, battlefield diagnostics in Infinity War",
    status: "active",
    metrics: [
      { label: "Threats Blocked", value: "2,847" },
      { label: "Detection", value: "<2ms" },
    ],
    color: "#EA2143",
    icon: "shield",
  },
  {
    id: "osint-engine",
    name: "Intelligence Gathering",
    description: "Internet-scale monitoring, database access, intelligence fusion. Partially overrode Raft prison security.",
    mcuReference: "Hacked government databases, overrode Raft security systems in Civil War",
    status: "active",
    metrics: [
      { label: "Sources", value: "14,200" },
      { label: "Ingestion", value: "1.2TB/day" },
    ],
    color: "#6C5CE7",
    icon: "globe",
  },
  {
    id: "facility-ops",
    name: "Facility Management",
    description: "Avengers Compound-level autonomous facility operations, security, and environmental control.",
    mcuReference: "Managed Avengers Compound systems, security, communications infrastructure",
    status: "active",
    metrics: [
      { label: "Zones", value: "48" },
      { label: "Sensors", value: "12,400" },
    ],
    color: "#07CA6B",
    icon: "building",
  },
  {
    id: "health-monitor",
    name: "Operator Diagnostics",
    description: "Continuous biometric telemetry. Vitals monitoring, suit integrity, physical condition assessment.",
    mcuReference: "Monitored Tony's vitals and suit integrity during all combat engagements",
    status: "active",
    metrics: [
      { label: "Endpoints", value: "847" },
      { label: "Latency", value: "5ms" },
    ],
    color: "#E89558",
    icon: "heart-pulse",
  },
  {
    id: "multi-agent",
    name: "Multi-Agent Orchestration",
    description: "Coordinate autonomous agent swarms. Byzantine fault-tolerant consensus across distributed nodes.",
    mcuReference: "Coordinated drone systems, managed comms between all team members in Endgame",
    status: "active",
    metrics: [
      { label: "Agents", value: "942" },
      { label: "Consensus", value: "< 100ms" },
    ],
    color: "#1856FF",
    icon: "network",
  },
];

// ═══ SKILL CATEGORIES ═══

export type SkillCategory = {
  name: string;
  count: number;
  color: string;
  description: string;
};

export const SKILL_CATEGORIES: SkillCategory[] = [
  { name: "Engineering", count: 1842, color: "#1856FF", description: "Full-stack development, architecture, code generation" },
  { name: "Security", count: 634, color: "#EA2143", description: "SAST, DAST, threat modeling, pen-testing, OWASP" },
  { name: "DevOps", count: 521, color: "#6C5CE7", description: "CI/CD, containers, IaC, GitOps, observability" },
  { name: "AI / ML", count: 487, color: "#1856FF", description: "LLM ops, RAG, embeddings, model serving, fine-tuning" },
  { name: "Frontend", count: 445, color: "#E89558", description: "React, Next.js, Vue, Angular, design systems" },
  { name: "Backend", count: 412, color: "#07CA6B", description: "APIs, microservices, event-driven, serverless" },
  { name: "Database", count: 389, color: "#3A344E", description: "SQL, NoSQL, vector, graph, time-series optimization" },
  { name: "Cloud", count: 356, color: "#1856FF", description: "AWS, Azure, GCP, multi-cloud, edge computing" },
  { name: "Testing", count: 298, color: "#07CA6B", description: "TDD, E2E, mutation, load, property-based testing" },
  { name: "Writing", count: 234, color: "#E89558", description: "Technical docs, humanized content, API references" },
  { name: "Business", count: 198, color: "#6C5CE7", description: "Product management, analytics, growth, strategy" },
  { name: "Orchestration", count: 186, color: "#3A344E", description: "Ruflo swarms, byzantine consensus, hive-mind" },
];

// ═══ AGENT TIERS ═══

export type AgentTier = {
  tier: string;
  description: string;
  agents: { name: string; specialty: string }[];
  color: string;
};

export const AGENT_TIERS: AgentTier[] = [
  {
    tier: "Core",
    description: "Primary specialist agents — highest capability tier",
    color: "#1856FF",
    agents: [
      { name: "react-expert", specialty: "React 19, hooks, server components" },
      { name: "typescript-pro", specialty: "Advanced types, generics, DX" },
      { name: "python-pro", specialty: "3.12+, async, typing, packaging" },
      { name: "nextjs-expert", specialty: "App Router, RSC, middleware" },
      { name: "security-auditor", specialty: "OWASP, DevSecOps, scanning" },
      { name: "cloud-architect", specialty: "Multi-cloud, IaC, FinOps" },
      { name: "database-optimizer", specialty: "Query tuning, indexing, sharding" },
    ],
  },
  {
    tier: "Specialist",
    description: "Domain-specific deep expertise",
    color: "#6C5CE7",
    agents: [
      { name: "rust-pro", specialty: "Ownership, async, systems" },
      { name: "golang-pro", specialty: "Concurrency, interfaces, perf" },
      { name: "flutter-expert", specialty: "Cross-platform, Dart 3" },
      { name: "ml-engineer", specialty: "PyTorch, serving, MLOps" },
      { name: "kubernetes-architect", specialty: "GitOps, service mesh" },
      { name: "terraform-specialist", specialty: "Modules, state, multi-env" },
      { name: "graphql-architect", specialty: "Federation, caching, perf" },
    ],
  },
  {
    tier: "Orchestration",
    description: "Multi-agent coordination and swarm intelligence",
    color: "#07CA6B",
    agents: [
      { name: "ruflo-coordinator", specialty: "Enterprise orchestration" },
      { name: "ruflo-swarm", specialty: "Large-scale swarm deployment" },
      { name: "ruflo-neural", specialty: "Neural network integration" },
      { name: "ruflo-byzantine", specialty: "Fault-tolerant consensus" },
      { name: "ruflo-hive-mind", specialty: "Collective intelligence" },
      { name: "ruflo-mcp-integrator", specialty: "MCP protocol bridge" },
    ],
  },
];

// ═══ SYSTEM SERVICES ═══

export type SystemService = {
  name: string;
  status: "online" | "degraded" | "offline";
  latency: number;
  uptime: number;
  category: string;
};

export const SERVICES: SystemService[] = [
  { name: "Claude Opus 4.6", status: "online", latency: 38, uptime: 99.99, category: "AI Core" },
  { name: "Skill Engine", status: "online", latency: 12, uptime: 99.98, category: "Runtime" },
  { name: "Agent Orchestrator", status: "online", latency: 24, uptime: 99.95, category: "Runtime" },
  { name: "MCP Registry", status: "online", latency: 8, uptime: 99.97, category: "Integration" },
  { name: "Memory System", status: "online", latency: 15, uptime: 99.92, category: "Storage" },
  { name: "Vercel Edge Network", status: "online", latency: 3, uptime: 100.0, category: "CDN" },
  { name: "Plugin Runtime", status: "degraded", latency: 156, uptime: 98.4, category: "Runtime" },
  { name: "Vector Store", status: "online", latency: 22, uptime: 99.88, category: "Storage" },
  { name: "Threat Monitor", status: "online", latency: 6, uptime: 99.96, category: "Security" },
  { name: "Telemetry Pipeline", status: "online", latency: 18, uptime: 99.91, category: "Observability" },
];

// ═══ QUICK ACTIONS ═══

export type QuickAction = {
  name: string;
  command: string;
  description: string;
  category: string;
  color: string;
  hotkey?: string;
};

export const QUICK_ACTIONS: QuickAction[] = [
  { name: "Code Review", command: "/code-review", description: "Multi-dimensional AI analysis", category: "Review", color: "#1856FF", hotkey: "R" },
  { name: "Security Scan", command: "/security-sast", description: "SAST vulnerability detection", category: "Security", color: "#EA2143", hotkey: "S" },
  { name: "TDD Cycle", command: "/tdd", description: "Test-driven development flow", category: "Dev", color: "#6C5CE7", hotkey: "T" },
  { name: "Bug Fix", command: "/bug-fix", description: "Intelligent root-cause analysis", category: "Debug", color: "#E89558", hotkey: "B" },
  { name: "Deploy", command: "/deploy", description: "Zero-downtime deployment", category: "DevOps", color: "#07CA6B", hotkey: "D" },
  { name: "Refactor", command: "/refactor-clean", description: "Clean code transformation", category: "Dev", color: "#3A344E" },
  { name: "Sprint Plan", command: "/sprint-plan", description: "Agile sprint orchestration", category: "PM", color: "#6C5CE7" },
  { name: "Generate Tests", command: "/test-generate", description: "Auto-generate test suites", category: "Testing", color: "#07CA6B" },
  { name: "Write Docs", command: "/doc-generate", description: "Technical documentation", category: "Docs", color: "#E89558" },
  { name: "Brainstorm", command: "/brainstorm", description: "Multi-agent ideation swarm", category: "AI", color: "#1856FF" },
  { name: "Humanize", command: "/humanize", description: "Natural writing synthesis", category: "Writing", color: "#6C5CE7" },
  { name: "Architect", command: "/architecture", description: "System design review", category: "Arch", color: "#1856FF" },
];

// ═══ ANALYTICS DATA ═══

export const USAGE_DATA = [
  { hour: "00:00", skills: 120, agents: 45, commands: 30 },
  { hour: "02:00", skills: 80, agents: 28, commands: 15 },
  { hour: "04:00", skills: 45, agents: 12, commands: 8 },
  { hour: "06:00", skills: 90, agents: 35, commands: 22 },
  { hour: "08:00", skills: 340, agents: 120, commands: 85 },
  { hour: "10:00", skills: 520, agents: 195, commands: 140 },
  { hour: "12:00", skills: 480, agents: 180, commands: 120 },
  { hour: "14:00", skills: 560, agents: 210, commands: 155 },
  { hour: "16:00", skills: 490, agents: 185, commands: 130 },
  { hour: "18:00", skills: 380, agents: 140, commands: 95 },
  { hour: "20:00", skills: 260, agents: 98, commands: 65 },
  { hour: "22:00", skills: 180, agents: 68, commands: 42 },
];

export const SKILL_GROWTH = [
  { month: "Oct", count: 2100 },
  { month: "Nov", count: 2800 },
  { month: "Dec", count: 3400 },
  { month: "Jan", count: 4100 },
  { month: "Feb", count: 5200 },
  { month: "Mar", count: 5900 },
  { month: "Apr", count: 6502 },
];

// ═══ MCU TIMELINE ═══

export const MCU_APPEARANCES = [
  { film: "Avengers: Age of Ultron", year: 2015, role: "Activated as J.A.R.V.I.S. replacement" },
  { film: "Captain America: Civil War", year: 2016, role: "Hacked the Raft, combat analysis" },
  { film: "Spider-Man: Homecoming", year: 2017, role: "Remote ops support" },
  { film: "Avengers: Infinity War", year: 2018, role: "Mark 50 nanotech management" },
  { film: "Avengers: Endgame", year: 2019, role: "Final battle coordination" },
];
