/**
 * bmad_get_state — Return current project state.
 * Used by master agent and dashboard to understand project progress.
 */

import { Type } from "@sinclair/typebox";
import { readState } from "../lib/state.ts";
import type { ToolResult } from "../types.ts";

export const name = "bmad_get_state";
export const description =
  "Get the current BMad project state — active workflow, completed artifacts, phase, and step progress.";

export const parameters = Type.Object({
  projectPath: Type.String({
    description: "Absolute path to the project root directory",
  }),
});

export async function execute(
  _id: string,
  params: { projectPath: string }
): Promise<ToolResult> {
  const state = await readState(params.projectPath);
  if (!state) {
    return text("Error: Project not initialized. Run `bmad_init_project` first.");
  }

  const lines = [
    `## BMad Project: ${state.projectName}`,
    "",
    `**Phase:** ${state.currentPhase}`,
    `**Initialized:** ${state.createdAt}`,
    "",
  ];

  if (state.activeWorkflow) {
    const w = state.activeWorkflow;
    const stepLabel = w.totalSteps
      ? `${w.currentStep} of ${w.totalSteps}`
      : `${w.currentStep}`;
    lines.push("### Active Workflow");
    lines.push(`- **Workflow:** ${w.id}`);
    lines.push(`- **Agent:** ${w.agentName} (${w.agentId})`);
    lines.push(`- **Mode:** ${w.mode}`);
    lines.push(`- **Step:** ${stepLabel}`);
    lines.push(`- **Output:** ${w.outputFile || "not yet set"}`);
    lines.push(`- **Started:** ${w.startedAt}`);
    lines.push("");
  } else {
    lines.push("### Active Workflow");
    lines.push("None");
    lines.push("");
  }

  if (state.completedWorkflows.length > 0) {
    lines.push("### Completed Workflows");
    for (const w of state.completedWorkflows) {
      lines.push(
        `- **${w.id}** — ${w.completedAt} → \`${w.outputFile}\``
      );
    }
  } else {
    lines.push("### Completed Workflows");
    lines.push("None yet");
  }

  return text(lines.join("\n"));
}

function text(t: string): ToolResult {
  return { content: [{ type: "text", text: t }] };
}
