export const STATS = {
  totalSkills: 6502,
  totalAgents: 942,
  totalCommands: 966,
  repositories: 30,
  uptime: 99.97,
  activeConnections: 147,
  tasksCompleted: 12847,
  avgResponseMs: 42,
};

export type SkillCategory = {
  name: string;
  count: number;
  icon: string;
  color: string;
};

export const SKILL_CATEGORIES: SkillCategory[] = [
  { name: "Engineering", count: 1842, icon: "code", color: "#00BD7D" },
  { name: "Security", count: 634, icon: "shield", color: "#DC2626" },
  { name: "DevOps", count: 521, icon: "container", color: "#60a5fa" },
  { name: "AI / ML", count: 487, icon: "brain", color: "#a78bfa" },
  { name: "Frontend", count: 445, icon: "layout", color: "#f59e0b" },
  { name: "Backend", count: 412, icon: "server", color: "#14b8a6" },
  { name: "Database", count: 389, icon: "database", color: "#f472b6" },
  { name: "Cloud", count: 356, icon: "cloud", color: "#38bdf8" },
  { name: "Testing", count: 298, icon: "check-circle", color: "#22c55e" },
  { name: "Writing", count: 234, icon: "pen-tool", color: "#fb923c" },
  { name: "Business", count: 198, icon: "briefcase", color: "#e879f9" },
  { name: "Orchestration", count: 186, icon: "network", color: "#06b6d4" },
];

export type AgentTier = {
  tier: string;
  agents: string[];
  color: string;
};

export const TOP_AGENTS: AgentTier[] = [
  {
    tier: "Core",
    color: "#00BD7D",
    agents: [
      "react-expert", "typescript-pro", "python-pro", "nextjs-expert",
      "security-auditor", "cloud-architect", "database-optimizer",
    ],
  },
  {
    tier: "Specialist",
    color: "#60a5fa",
    agents: [
      "rust-pro", "golang-pro", "flutter-expert", "ml-engineer",
      "kubernetes-architect", "terraform-specialist", "graphql-architect",
    ],
  },
  {
    tier: "Orchestration",
    color: "#a78bfa",
    agents: [
      "ruflo-coordinator", "ruflo-swarm", "ruflo-neural",
      "ruflo-byzantine-coordinator", "ruflo-hive-mind", "ruflo-mcp-integrator",
    ],
  },
];

export type SystemService = {
  name: string;
  status: "online" | "degraded" | "offline";
  latency: number;
  uptime: number;
};

export const SERVICES: SystemService[] = [
  { name: "Claude Opus 4.6", status: "online", latency: 38, uptime: 99.99 },
  { name: "Skill Engine", status: "online", latency: 12, uptime: 99.98 },
  { name: "Agent Orchestrator", status: "online", latency: 24, uptime: 99.95 },
  { name: "MCP Registry", status: "online", latency: 8, uptime: 99.97 },
  { name: "Memory System", status: "online", latency: 15, uptime: 99.92 },
  { name: "Vercel Edge", status: "online", latency: 3, uptime: 100.0 },
  { name: "Plugin Runtime", status: "degraded", latency: 156, uptime: 98.4 },
  { name: "Vector Store", status: "online", latency: 22, uptime: 99.88 },
];

export type QuickAction = {
  name: string;
  command: string;
  description: string;
  category: string;
  color: string;
};

export const QUICK_ACTIONS: QuickAction[] = [
  { name: "Code Review", command: "/code-review", description: "AI-powered code analysis", category: "Review", color: "#00BD7D" },
  { name: "Security Scan", command: "/security-sast", description: "SAST vulnerability scan", category: "Security", color: "#DC2626" },
  { name: "TDD Cycle", command: "/tdd", description: "Test-driven development flow", category: "Dev", color: "#60a5fa" },
  { name: "Bug Fix", command: "/bug-fix", description: "Intelligent bug resolution", category: "Debug", color: "#f59e0b" },
  { name: "Deploy", command: "/deploy", description: "Production deployment", category: "DevOps", color: "#14b8a6" },
  { name: "Refactor", command: "/refactor-clean", description: "Clean code refactoring", category: "Dev", color: "#a78bfa" },
  { name: "Sprint Plan", command: "/sprint-plan", description: "Agile sprint planning", category: "PM", color: "#e879f9" },
  { name: "Generate Tests", command: "/test-generate", description: "Auto-generate test suites", category: "Testing", color: "#22c55e" },
  { name: "Write Docs", command: "/doc-generate", description: "Technical documentation", category: "Docs", color: "#fb923c" },
  { name: "Brainstorm", command: "/brainstorm", description: "Multi-agent ideation", category: "AI", color: "#06b6d4" },
  { name: "Humanize", command: "/humanize", description: "Natural writing style", category: "Writing", color: "#f472b6" },
  { name: "Architect", command: "/architecture", description: "System design review", category: "Arch", color: "#38bdf8" },
];

export const USAGE_DATA = [
  { hour: "00", skills: 120, agents: 45, commands: 30 },
  { hour: "02", skills: 80, agents: 28, commands: 15 },
  { hour: "04", skills: 45, agents: 12, commands: 8 },
  { hour: "06", skills: 90, agents: 35, commands: 22 },
  { hour: "08", skills: 340, agents: 120, commands: 85 },
  { hour: "10", skills: 520, agents: 195, commands: 140 },
  { hour: "12", skills: 480, agents: 180, commands: 120 },
  { hour: "14", skills: 560, agents: 210, commands: 155 },
  { hour: "16", skills: 490, agents: 185, commands: 130 },
  { hour: "18", skills: 380, agents: 140, commands: 95 },
  { hour: "20", skills: 260, agents: 98, commands: 65 },
  { hour: "22", skills: 180, agents: 68, commands: 42 },
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
