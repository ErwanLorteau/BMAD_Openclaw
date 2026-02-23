/**
 * bmad_init_project — Initialize a BMad project.
 * Creates _bmad/ directory structure, copies method files reference, creates state.json.
 */

import { Type } from "@sinclair/typebox";
import { mkdir, access, readdir, copyFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { createInitialState, writeState, readState, bmadDir } from "../lib/state.ts";
import type { ToolResult } from "../types.ts";

export const name = "bmad_init_project";
export const description =
  "Initialize a new BMad Method project. Creates _bmad/ directory and state tracking. Run once per project.";

export const parameters = Type.Object({
  projectPath: Type.String({
    description: "Absolute path to the project root directory",
  }),
  projectName: Type.String({
    description: "Human-readable project name",
  }),
});

export async function execute(
  _id: string,
  params: { projectPath: string; projectName: string },
  context: { bmadMethodPath: string }
): Promise<ToolResult> {
  const { projectPath, projectName } = params;

  // Check if already initialized
  const existing = await readState(projectPath);
  if (existing) {
    return text(
      `Project "${existing.projectName}" is already initialized at ${projectPath}.\n` +
        `Current phase: ${existing.currentPhase}\n` +
        `Active workflow: ${existing.activeWorkflow?.id ?? "none"}\n` +
        `Completed workflows: ${existing.completedWorkflows.map((w) => w.id).join(", ") || "none"}`
    );
  }

  // Verify project directory exists
  try {
    await access(projectPath);
  } catch {
    return text(`Error: Project directory does not exist: ${projectPath}`);
  }

  // Create _bmad directory structure
  const bmad = bmadDir(projectPath);
  await mkdir(join(bmad, "bmm"), { recursive: true });

  // Create symlink or copy reference to method files
  // We store the path to method files in state so tools can find them
  const state = createInitialState(projectPath, projectName);
  await writeState(projectPath, state);

  // Create output directories (matching BMad module.yaml conventions)
  const outputDir = join(projectPath, "_bmad-output");
  const planningDir = join(outputDir, "planning-artifacts");
  const implDir = join(outputDir, "implementation-artifacts");
  await mkdir(planningDir, { recursive: true });
  await mkdir(implDir, { recursive: true });

  return text(
    `✅ BMad project "${projectName}" initialized.\n\n` +
      `**Created:**\n` +
      `- \`_bmad/state.json\` — project state tracking\n` +
      `- \`_bmad-output/planning-artifacts/\` — briefs, PRDs, architecture docs\n` +
      `- \`_bmad-output/implementation-artifacts/\` — sprint status, stories, reviews\n\n` +
      `**Next step:** Run \`bmad_list_workflows\` to see available workflows, or start with "Create Product Brief".`
  );
}

function text(t: string): ToolResult {
  return { content: [{ type: "text", text: t }] };
}
