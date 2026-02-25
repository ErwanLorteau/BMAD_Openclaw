/**
 * bmad_load_step — Load the next step in the active workflow.
 * Resolves the next step file path from the current step's frontmatter.
 * The master should call this after completing each step.
 */

import { Type } from "@sinclair/typebox";
import { readState, writeState } from "../lib/state.ts";
import { loadStepFile, listStepFiles, resolveStepPath } from "../lib/step-loader.ts";
import { join, dirname } from "node:path";
import type { ToolResult } from "../types.ts";

export const name = "bmad_load_step";
export const description =
  "Load the next step in the active BMad workflow. Call this after completing the current step.";

export const parameters = Type.Object({
  projectPath: Type.String({
    description: "Absolute path to the project root directory",
  }),
  step: Type.Optional(
    Type.Number({
      description:
        "Specific step number to load (optional — defaults to next step)",
    })
  ),
});

export async function execute(
  _id: string,
  params: { projectPath: string; step?: number },
  context: { bmadMethodPath: string }
): Promise<ToolResult> {
  const { projectPath } = params;

  const state = await readState(projectPath);
  if (!state) {
    return text("Error: Project not initialized.");
  }
  if (!state.activeWorkflow) {
    return text("Error: No active workflow. Start one with `bmad_start_workflow`.");
  }

  const active = state.activeWorkflow;

  // Load current step to find the next step path
  const currentStep = await loadStepFile(active.currentStepFile);

  // Bug B fix: auto-discover next step if frontmatter has no nextStepFile
  let nextStepFileValue = currentStep.nextStepFile;
  if (!nextStepFileValue) {
    const currentDir = dirname(active.currentStepFile);
    const allSteps = await listStepFiles(currentDir);
    const currentBasename = active.currentStepFile.split("/").pop() ?? "";
    const currentIdx = allSteps.indexOf(currentBasename);
    if (currentIdx >= 0 && currentIdx < allSteps.length - 1) {
      nextStepFileValue = "./" + allSteps[currentIdx + 1];
    }
  }

  if (!nextStepFileValue) {
    return text(
      `This is the final step of the "${active.id}" workflow.\n` +
        `Call \`bmad_complete_workflow\` to finalize.`
    );
  }

  // Resolve the next step path
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

  let nextStepPath = resolveStepPath(nextStepFileValue, vars);

  // Bug A fix: resolve relative paths against current step's directory,
  // not bmadMethodPath. Only fall back to bmadMethodPath for paths that
  // look like bmm/ or core/ prefixed method-relative paths.
  if (!nextStepPath.startsWith("/")) {
    if (nextStepPath.startsWith("./") || nextStepPath.startsWith("../")) {
      nextStepPath = join(dirname(active.currentStepFile), nextStepPath);
    } else if (nextStepPath.startsWith("bmm/") || nextStepPath.startsWith("core/")) {
      nextStepPath = join(context.bmadMethodPath, nextStepPath);
    } else {
      // Default: resolve relative to current step directory
      nextStepPath = join(dirname(active.currentStepFile), nextStepPath);
    }
  }

  // Load the next step
  let nextStep;
  try {
    nextStep = await loadStepFile(nextStepPath);
  } catch (err) {
    return text(
      `Error loading next step file: ${nextStepPath}\n${err instanceof Error ? err.message : String(err)}`
    );
  }

  // Resolve variables in step content (handle both {var} and {{var}} patterns)
  let resolvedContent = nextStep.content;
  for (const [key, value] of Object.entries(vars)) {
    resolvedContent = resolvedContent.replaceAll(`{{${key}}}`, value);
    resolvedContent = resolvedContent.replaceAll(`{${key}}`, value);
  }

  // Update state
  active.currentStep = nextStep.stepNumber;
  active.currentStepFile = nextStepPath;
  if (nextStep.outputFile) {
    active.outputFile = resolveStepPath(nextStep.outputFile, vars);
  }
  await writeState(projectPath, state);

  const stepLabel = active.totalSteps
    ? `${nextStep.stepNumber} of ${active.totalSteps}`
    : `${nextStep.stepNumber}`;

  const output = [
    `## Step ${stepLabel}: ${nextStep.name || nextStep.description}`,
    "",
    resolvedContent,
    "",
    "---",
    "",
    nextStep.nextStepFile
      ? `**When complete:** Call \`bmad_save_artifact\` to save this step's output, then \`bmad_load_step\` for the next step.`
      : `**This is the final step.** Call \`bmad_save_artifact\` to save output, then \`bmad_complete_workflow\` to finalize.`,
  ];

  return text(output.join("\n"));
}

function text(t: string): ToolResult {
  return { content: [{ type: "text", text: t }] };
}
