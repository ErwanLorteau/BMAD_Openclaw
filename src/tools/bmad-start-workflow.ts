/**
 * bmad_start_workflow — Start a BMad workflow.
 * Loads the agent persona + first step file + orchestrator rules.
 * Returns everything the master needs to role-play as the agent.
 */

import { Type } from "@sinclair/typebox";
import { readState, writeState } from "../lib/state.ts";
import { getWorkflow } from "../lib/workflow-registry.ts";
import { loadAgentPersona, formatPersonaPrompt } from "../lib/agent-loader.ts";
import { findFirstStep, loadStepFile, countSteps } from "../lib/step-loader.ts";
import {
  ORCHESTRATOR_RULES,
  YOLO_MODE_RULES,
  NORMAL_MODE_RULES,
} from "../lib/orchestrator-rules.ts";
import { join } from "node:path";
import { readFile } from "node:fs/promises";
import type { ToolResult } from "../types.ts";

export const name = "bmad_start_workflow";
export const description =
  "Start a BMad workflow. Returns agent persona, orchestrator rules, and first step content for the master to execute.";

export const parameters = Type.Object({
  projectPath: Type.String({
    description: "Absolute path to the project root directory",
  }),
  workflow: Type.String({
    description:
      'Workflow ID (e.g. "create-product-brief", "create-prd")',
  }),
  mode: Type.Union([Type.Literal("normal"), Type.Literal("yolo")], {
    description: "Execution mode: normal (interactive) or yolo (autonomous)",
  }),
});

export async function execute(
  _id: string,
  params: { projectPath: string; workflow: string; mode: "normal" | "yolo" },
  context: { bmadMethodPath: string }
): Promise<ToolResult> {
  const { projectPath, workflow: workflowId, mode } = params;

  // Validate state
  const state = await readState(projectPath);
  if (!state) {
    return text("Error: Project not initialized. Run `bmad_init_project` first.");
  }
  if (state.activeWorkflow) {
    return text(
      `Error: Workflow "${state.activeWorkflow.id}" is already in progress (step ${state.activeWorkflow.currentStep}). ` +
        `Complete it with \`bmad_complete_workflow\` or cancel it first.`
    );
  }

  // Find workflow definition
  const workflowDef = getWorkflow(workflowId);
  if (!workflowDef) {
    return text(`Error: Unknown workflow "${workflowId}". Use \`bmad_list_workflows\` to see available options.`);
  }

  // Check prerequisites
  const completedIds = state.completedWorkflows.map((w) => w.id);
  const unmet = workflowDef.requires.filter((r) => !completedIds.includes(r));
  if (unmet.length > 0) {
    return text(
      `Error: Missing prerequisites for "${workflowId}": ${unmet.join(", ")}. ` +
        `Complete those workflows first.`
    );
  }

  // Load agent persona
  const persona = await loadAgentPersona(context.bmadMethodPath, workflowDef.agentId);

  // Load workflow file for context
  const workflowFilePath = join(context.bmadMethodPath, workflowDef.workflowFile);
  const workflowContent = await readFile(workflowFilePath, "utf-8");

  // Load first step
  let stepContent = "";
  let firstStepPath = "";
  let totalSteps: number | null = null;

  if (workflowDef.stepsDir) {
    const stepsDir = join(context.bmadMethodPath, workflowDef.stepsDir);
    firstStepPath = await findFirstStep(stepsDir);
    const step = await loadStepFile(firstStepPath);
    stepContent = step.content;
    totalSteps = await countSteps(stepsDir);
  } else {
    // Workflow without step files — use instructions from workflow YAML
    stepContent = workflowContent;
    firstStepPath = workflowFilePath;
  }

  // Update state
  state.activeWorkflow = {
    id: workflowId,
    agentId: workflowDef.agentId,
    agentName: persona.name,
    mode,
    currentStep: 1,
    totalSteps,
    currentStepFile: firstStepPath,
    outputFile: "", // Will be set by step-01 init
    startedAt: new Date().toISOString(),
  };
  await writeState(projectPath, state);

  // Build the full context for the master
  const modeRules = mode === "yolo" ? YOLO_MODE_RULES : NORMAL_MODE_RULES;

  // Variable resolution map for step content
  const vars: Record<string, string> = {
    "project-root": projectPath,
    project_name: state.projectName,
    user_name: "User",
    output_folder: "_bmad-output",
    planning_artifacts: join(projectPath, "_bmad-output/planning-artifacts"),
    implementation_artifacts: join(projectPath, "_bmad-output/implementation-artifacts"),
    product_knowledge: join(projectPath, "docs"),
  };

  // Resolve variables in step content
  let resolvedContent = stepContent;
  for (const [key, value] of Object.entries(vars)) {
    resolvedContent = resolvedContent.replaceAll(`{${key}}`, value);
  }

  const output = [
    `# BMad Workflow: ${workflowDef.name}`,
    "",
    formatPersonaPrompt(persona),
    "",
    "---",
    "",
    ORCHESTRATOR_RULES,
    modeRules,
    "---",
    "",
    `## Workflow Context`,
    "",
    `**Project:** ${state.projectName}`,
    `**Workflow:** ${workflowDef.name} (${workflowId})`,
    `**Mode:** ${mode}`,
    `**Step:** 1 of ${totalSteps ?? "unknown"}`,
    "",
    "---",
    "",
    `## Step 1 — Execute Now`,
    "",
    resolvedContent,
    "",
    "---",
    "",
    `**IMPORTANT:** When this step is complete, call \`bmad_save_artifact\` to save output, then call \`bmad_load_step\` to get the next step. Do NOT read step files directly.`,
  ];

  return text(output.join("\n"));
}

function text(t: string): ToolResult {
  return { content: [{ type: "text", text: t }] };
}
