/**
 * bmad_save_artifact — Save workflow output to disk.
 * Validates content is non-empty, writes to the output path,
 * updates stepsCompleted in frontmatter.
 */

import { Type } from "@sinclair/typebox";
import { readState, writeState } from "../lib/state.ts";
import { writeFile, readFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ToolResult } from "../types.ts";

export const name = "bmad_save_artifact";
export const description =
  "Save workflow artifact output to disk. Writes content to the specified output file path.";

export const parameters = Type.Object({
  projectPath: Type.String({
    description: "Absolute path to the project root directory",
  }),
  content: Type.String({
    description: "Full markdown content to write to the output file",
  }),
  outputFile: Type.Optional(
    Type.String({
      description:
        "Output file path (absolute or relative to project root). Defaults to the workflow's configured output file.",
    })
  ),
  append: Type.Optional(
    Type.Boolean({
      description:
        "If true, append content to existing file instead of overwriting. Use for multi-step workflows where each step adds a section. Defaults to false.",
    })
  ),
});

export async function execute(
  _id: string,
  params: { projectPath: string; content: string; outputFile?: string; append?: boolean }
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

  // Ensure directory exists
  await mkdir(dirname(outputPath), { recursive: true });

  // Write or append to the file
  if (params.append) {
    let existing = "";
    try {
      existing = await readFile(outputPath, "utf-8");
    } catch {
      // File doesn't exist yet, start fresh
    }
    const separator = existing.length > 0 ? "\n\n" : "";
    await writeFile(outputPath, existing + separator + content, "utf-8");
  } else {
    await writeFile(outputPath, content, "utf-8");
  }

  // Update active workflow output file reference
  if (state.activeWorkflow) {
    state.activeWorkflow.outputFile = outputPath;
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
