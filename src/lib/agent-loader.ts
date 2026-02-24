/**
 * Agent loader — reads agent persona YAML files and parses them.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import type { AgentPersona } from "../types.ts";

/**
 * Agent ID to filename mapping.
 * Some agents have nested directories (tech-writer).
 */
const AGENT_FILES: Record<string, string> = {
  "bmad-master": "core/agents/bmad-master.agent.yaml",
  analyst: "bmm/agents/analyst.agent.yaml",
  architect: "bmm/agents/architect.agent.yaml",
  pm: "bmm/agents/pm.agent.yaml",
  sm: "bmm/agents/sm.agent.yaml",
  dev: "bmm/agents/dev.agent.yaml",
  qa: "bmm/agents/qa.agent.yaml",
  "ux-designer": "bmm/agents/ux-designer.agent.yaml",
  "quick-flow-solo-dev": "bmm/agents/quick-flow-solo-dev.agent.yaml",
  "tech-writer": "bmm/agents/tech-writer/tech-writer.agent.yaml",
};

/**
 * Load an agent persona from the BMad method files.
 */
export async function loadAgentPersona(
  bmadMethodPath: string,
  agentId: string
): Promise<AgentPersona> {
  const filename = AGENT_FILES[agentId];
  if (!filename) {
    throw new Error(`Unknown agent ID: ${agentId}`);
  }

  const filePath = join(bmadMethodPath, filename);
  const raw = await readFile(filePath, "utf-8");
  const parsed = parseYaml(raw);

  const agent = parsed.agent;
  if (!agent) {
    throw new Error(`Invalid agent file (no 'agent' root key): ${filePath}`);
  }

  return {
    id: agentId,
    name: agent.metadata?.name ?? agentId,
    title: agent.metadata?.title ?? "",
    role: agent.persona?.role ?? "",
    identity: agent.persona?.identity ?? "",
    communicationStyle: agent.persona?.communication_style ?? "",
    principles: agent.persona?.principles ?? "",
  };
}

/**
 * Format an agent persona into a system prompt section.
 */
export function formatPersonaPrompt(persona: AgentPersona): string {
  return `## Your Role: ${persona.name} — ${persona.title}

**Identity:** ${persona.identity}

**Communication Style:** ${persona.communicationStyle}

**Principles:**
${persona.principles}`;
}
