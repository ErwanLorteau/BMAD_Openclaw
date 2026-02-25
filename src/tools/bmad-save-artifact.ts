/**
 * bmad_save_artifact — Save workflow output to disk.
 * Always appends to the artifact file (multi-step workflows build incrementally).
 * Safeguards prevent double-saves and detect full-doc duplicates.
 */

import { Type } from "@sinclair/typebox";
import { readState, writeState } from "../lib/state.ts";
import { writeFile, readFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ToolResult } from "../types.ts";

export const name = "bmad_save_artifact";
export const description =
  "Save workflow artifact output to disk. Appends content to the output file (each step adds its section incrementally).";

export const parameters = Type.Object({
  projectPath: Type.String({
    description: "Absolute path to the project root directory",
  }),
  content: Type.String({
    description: "Markdown content for the current step's output section",
  }),
  outputFile: Type.Optional(
    Type.String({
      description:
        "Output file path (absolute or relative to project root). Defaults to the workflow's configured output file.",
    })
  ),
});

export async function execute(
  _id: string,
  params: { projectPath: string; content: string; outputFile?: string }
): Promise<ToolResult> {
  const { projectPath, content } = params;

  const state = await readState(projectPath);
  if (!state) {
    return text("Error: Project not initialized.");
  }

  // Determine output path
  let outputPath = params.outputFile;
  if (!outputPath && state.activeWorkflow?.outputFile) {
    outputPath = state.activeWorkflow.outputFile;
  }
  if (!outputPath) {
    return text(
      "Error: No output file specified. Provide `outputFile` parameter or ensure the workflow step defines one."
    );
  }

  // Make relative paths absolute
  if (!outputPath.startsWith("/")) {
    outputPath = join(projectPath, outputPath);
  }

  // Validate content
  if (!content || content.trim().length === 0) {
    return text("Error: Content is empty. Cannot save an empty artifact.");
  }

  // Safeguard: prevent double-save for the same step
  const active = state.activeWorkflow;
  if (active) {
    if (active.lastSavedStep != null && active.lastSavedStep >= active.currentStep) {
      return text(
        `Error: Step ${active.currentStep} was already saved. ` +
          `Call \`bmad_load_step\` to advance to the next step before saving again.`
      );
    }
  }

  // Ensure directory exists
  await mkdir(dirname(outputPath), { recursive: true });

  // Read existing content (if any)
  let existing = "";
  try {
    existing = await readFile(outputPath, "utf-8");
  } catch {
    // File doesn't exist yet, start fresh
  }

  // Safeguard: detect if content contains the existing text (LLM sent full doc instead of delta)
  if (existing.length > 0 && content.includes(existing.trim())) {
    // LLM sent the full accumulated document — use it as-is instead of appending
    await writeFile(outputPath, content, "utf-8");
  } else {
    const separator = existing.length > 0 ? "\n\n" : "";
    await writeFile(outputPath, existing + separator + content, "utf-8");
  }

  // Update active workflow output file reference and track saved step
  if (active) {
    active.outputFile = outputPath;
    active.lastSavedStep = active.currentStep;
    await writeState(projectPath, state);
  }

  const relPath = outputPath.startsWith(projectPath)
    ? outputPath.slice(projectPath.length + 1)
    : outputPath;

  return text(
    `✅ Artifact saved: \`${relPath}\` (${content.length} bytes)\n\n` +
      `${state.activeWorkflow ? `Step ${state.activeWorkflow.currentStep} output persisted.` : "Output persisted."}`
  );
}

function text(t: string): ToolResult {
  return { content: [{ type: "text", text: t }] };
}
