/**
 * bmad_list_workflows — List available workflows for the current project state.
 * Phase-aware: only shows workflows whose prerequisites are met.
 */

import { Type } from "@sinclair/typebox";
import { readState } from "../lib/state.ts";
import { getAvailableWorkflows } from "../lib/workflow-registry.ts";
import type { ToolResult } from "../types.ts";

export const name = "bmad_list_workflows";
export const description =
  "List BMad workflows available for the current project state. Only shows workflows whose prerequisites are completed.";

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
    return text(
      "Error: Project not initialized. Run `bmad_init_project` first."
    );
  }

  const completedIds = state.completedWorkflows.map((w) => w.id);
  const available = getAvailableWorkflows(completedIds);

  if (state.activeWorkflow) {
    const lines = [
      `⚠️ Workflow in progress: **${state.activeWorkflow.id}** (step ${state.activeWorkflow.currentStep})`,
      `Agent: ${state.activeWorkflow.agentName}`,
      `Mode: ${state.activeWorkflow.mode}`,
      "",
      "Complete or cancel the current workflow before starting a new one.",
      "",
      "---",
      "",
    ];
    return text(lines.join("\n"));
  }

  if (available.length === 0) {
    return text(
      "🎉 All workflows completed! The project is fully planned and ready for implementation."
    );
  }

  // Group by phase
  const byPhase = new Map<string, typeof available>();
  for (const w of available) {
    const list = byPhase.get(w.phase) ?? [];
    list.push(w);
    byPhase.set(w.phase, list);
  }

  const lines: string[] = [
    `## Available Workflows for "${state.projectName}"`,
    `**Current phase:** ${state.currentPhase}`,
    `**Completed:** ${completedIds.join(", ") || "none"}`,
    "",
  ];

  const phaseOrder = ["analysis", "planning", "solutioning", "implementation"];
  for (const phase of phaseOrder) {
    const workflows = byPhase.get(phase);
    if (!workflows?.length) continue;

    lines.push(`### ${phase.charAt(0).toUpperCase() + phase.slice(1)}`);
    for (const w of workflows) {
      const done = completedIds.includes(w.id) ? " ✅" : "";
      lines.push(`- **${w.id}** — ${w.description}${done}`);
    }
    lines.push("");
  }

  lines.push(
    "Use `bmad_start_workflow` with a workflow ID and mode (normal/yolo) to begin."
  );

  return text(lines.join("\n"));
}

function text(t: string): ToolResult {
  return { content: [{ type: "text", text: t }] };
}
