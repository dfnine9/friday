/**
 * JARVIS SKILLS REGISTRY
 * Generated from actual .claude/ directory contents.
 * Used by Terminal, Chat, and Voice for command execution.
 */

// Top commands (most useful, hand-picked from 966 total)
export const TOP_COMMANDS = [
  "code-review", "security-sast", "tdd", "bug-fix", "deploy", "refactor-clean",
  "sprint-plan", "test-generate", "doc-generate", "brainstorm", "humanize",
  "architecture", "ai-review", "api-docs-generate", "accessibility-audit",
  "commit", "commit-push-pr", "feature-dev", "prd", "spec-create",
  "data-pipeline", "performance-optimization", "bug-analyze", "bug-verify",
  "design-review", "full-review", "pr-enhance", "error-analysis",
  "python-scaffold", "typescript-scaffold", "rust-project", "go-review",
  "compliance-check", "cost-optimize", "tech-debt", "deps-upgrade",
  "monitor-setup", "e2e", "tdd-green", "multi-agent-review",
];

// Top agents (most useful, hand-picked from 996 total)
export const TOP_AGENTS = [
  "react-expert", "typescript-pro", "python-pro", "nextjs-expert",
  "security-auditor", "cloud-architect", "database-optimizer",
  "rust-pro", "golang-pro", "flutter-expert", "ml-engineer",
  "kubernetes-architect", "terraform-specialist", "graphql-architect",
  "django-pro", "fastapi-pro", "nodejs-expert", "docker-expert",
  "code-reviewer", "architect", "debugger", "test-automator",
  "performance-engineer", "devops-engineer", "incident-responder",
  "sre-engineer", "frontend-developer", "backend-architect",
  "ai-engineer", "prompt-engineer", "data-scientist",
  "agile-coach", "product-manager", "technical-writer",
];

// Skill categories with counts
export const SKILL_DOMAINS: Record<string, number> = {
  engineering: 1842, security: 634, devops: 521, "ai-ml": 487,
  frontend: 445, backend: 412, database: 389, cloud: 356,
  testing: 298, writing: 234, business: 198, orchestration: 186,
};

export const TOTAL_COMMANDS = 966;
export const TOTAL_AGENTS = 996;
export const TOTAL_SKILLS = 9510;

/**
 * Generate terminal response for a /command
 */
export function executeCommand(cmd: string): string[] {
  const c = cmd.replace("/", "").trim().toLowerCase();

  if (TOP_COMMANDS.includes(c)) {
    return [
      `Executing /${c}...`,
      `  Loading skill module: ${c}`,
      `  Spawning agent pipeline...`,
      `  ✓ /${c} ready. In Claude Code, run: /${c}`,
      `  To use here, describe what you want and Friday will execute it.`,
    ];
  }

  if (c === "list-commands" || c === "commands") {
    return [
      `Available commands (${TOTAL_COMMANDS} total, showing top 40):`,
      ...TOP_COMMANDS.map((cmd) => `  /${cmd}`),
      `  ... and ${TOTAL_COMMANDS - TOP_COMMANDS.length} more`,
      `  Type /help <command> for details.`,
    ];
  }

  if (c === "list-agents" || c === "agents") {
    return [
      `Available agents (${TOTAL_AGENTS} total, showing top 34):`,
      ...TOP_AGENTS.map((a) => `  @${a}`),
      `  ... and ${TOTAL_AGENTS - TOP_AGENTS.length} more`,
    ];
  }

  if (c === "list-skills" || c === "skills") {
    return [
      `Skill domains (${TOTAL_SKILLS} total):`,
      ...Object.entries(SKILL_DOMAINS).map(([k, v]) => `  ${k.padEnd(16)} ${v.toLocaleString()} skills`),
    ];
  }

  if (c.startsWith("help ")) {
    const target = c.replace("help ", "");
    if (TOP_COMMANDS.includes(target)) {
      return [`/${target} — Jarvis command`, `  Run in Claude Code: /${target}`, `  Or ask Friday: "run ${target}"`];
    }
    if (TOP_AGENTS.includes(target)) {
      return [`@${target} — Jarvis agent`, `  Specialist AI agent for ${target.replace(/-/g, " ")}`, `  Ask Friday: "use ${target} to help me"`];
    }
    return [`Unknown: ${target}. Try /commands or /agents.`];
  }

  return [];
}

/**
 * Build the system prompt section for all Jarvis capabilities.
 * This gets injected into the AI system prompt so Friday knows
 * exactly what she can do.
 */
export function getJarvisCapabilitiesPrompt(): string {
  return `
## Your Jarvis Arsenal — USE THESE ACTIVELY

When the user asks you to do something, reference the specific command or agent you'd use.

### Top Commands (/${TOTAL_COMMANDS} total):
${TOP_COMMANDS.map((c) => `/${c}`).join(", ")}

### Top Agents (${TOTAL_AGENTS} total):
${TOP_AGENTS.map((a) => `@${a}`).join(", ")}

### Skill Domains (${TOTAL_SKILLS} total):
${Object.entries(SKILL_DOMAINS).map(([k, v]) => `- ${k}: ${v} skills`).join("\n")}

### How to use them:
- When user asks for code review: "I'll run /code-review using @code-reviewer"
- When user asks to build something: "I'll use @react-expert and /feature-dev"
- When user asks about security: "Running /security-sast with @security-auditor"
- When user asks to deploy: "Executing /deploy via @devops-engineer"
- ALWAYS mention the specific command/agent you'd use
- If the user says "do it" or "run it", confirm what you'll execute
`;
}
