/**
 * bmad_start_workflow — Start a BMad workflow.
 * Loads the agent persona + first step file + orchestrator rules.
 * Returns a task prompt for the master to pass to sessions_spawn.
 * Also updates state.json with the active workflow.
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
import { readFile, access } from "node:fs/promises";
import type { ToolResult } from "../types.ts";

export const name = "bmad_start_workflow";
export const description =
  "Start a BMad workflow. Returns a task prompt to pass directly to sessions_spawn. Updates state.json with the active workflow.";

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

  // Verify proper initialization (symlinks + config must exist from bmad_init_project)
  const bmad = join(projectPath, "_bmad");
  const requiredPaths = [
    join(bmad, "config.yaml"),
    join(bmad, "core"),
    join(bmad, "bmm"),
  ];
  for (const p of requiredPaths) {
    try {
      await access(p);
    } catch {
      return text(
        `Error: Project structure is incomplete — missing \`${p.replace(projectPath + "/", "")}\`. ` +
          `Run \`bmad_init_project\` to properly initialize the project. ` +
          `Do NOT create project directories manually.`
      );
    }
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
  // These match the variables from BMad module.yaml + core config
  const vars: Record<string, string> = {
    "project-root": projectPath,
    project_name: state.projectName,
    user_name: "User",
    communication_language: "english",
    document_output_language: "english",
    user_skill_level: "expert",
    output_folder: "_bmad-output",
    planning_artifacts: join(projectPath, "_bmad-output/planning-artifacts"),
    implementation_artifacts: join(projectPath, "_bmad-output/implementation-artifacts"),
    product_knowledge: join(projectPath, "docs"),
  };

  // Resolve variables in step content (handle both {var} and {{var}} patterns)
  let resolvedContent = stepContent;
  for (const [key, value] of Object.entries(vars)) {
    resolvedContent = resolvedContent.replaceAll(`{{${key}}}`, value);
    resolvedContent = resolvedContent.replaceAll(`{${key}}`, value);
  }

  const interactiveInstructions = mode === "normal" ? `
## Interactive Mode Rules
After completing each step:
1. Call \`bmad_save_artifact\` to save your output
2. Present a summary of what you produced
3. Say: "Step N complete. Awaiting your feedback before proceeding to step N+1."
4. STOP and wait for user input before continuing
5. When feedback arrives, incorporate it and continue to the next step via \`bmad_load_step\`
` : "";

  const output = [
    `# BMad Workflow Agent: ${persona.name}`,
    "",
    `You are a dedicated workflow agent. Complete this workflow and stop.`,
    "",
    formatPersonaPrompt(persona),
    "",
    "---",
    "",
    ORCHESTRATOR_RULES,
    modeRules,
    interactiveInstructions,
    "---",
    "",
    `## Workflow Context`,
    "",
    `**Project:** ${state.projectName} at \`${projectPath}\``,
    `**Workflow:** ${workflowDef.name} (${workflowId})`,
    `**Mode:** ${mode}`,
    `**Steps:** ${totalSteps ?? "unknown"}`,
    "",
    "---",
    "",
    `## Step 1 — Execute Now`,
    "",
    resolvedContent,
    "",
    "---",
    "",
    `**After each step:** Call \`bmad_save_artifact\` with projectPath="${projectPath}" to save output, then \`bmad_load_step\` with projectPath="${projectPath}" for the next step.`,
    `**Final step:** Call \`bmad_save_artifact\`, then \`bmad_complete_workflow\` with projectPath="${projectPath}".`,
    `**Do NOT start additional workflows.** Complete this one and stop.`,
  ];

  return text(output.join("\n"));
}

function text(t: string): ToolResult {
  return { content: [{ type: "text", text: t }] };
}
