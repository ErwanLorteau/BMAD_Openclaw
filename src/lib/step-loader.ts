/**
 * Step file loader — reads and parses BMad step files with frontmatter.
 */

import { readFile, readdir } from "node:fs/promises";
import { join, basename } from "node:path";
import matter from "gray-matter";
import type { StepFile } from "../types.ts";

/**
 * Load a specific step file by path.
 */
export async function loadStepFile(filePath: string): Promise<StepFile> {
  const raw = await readFile(filePath, "utf-8");
  const { data: frontmatter, content } = matter(raw);

  const stepNumber = extractStepNumber(basename(filePath));

  return {
    stepNumber,
    name: (frontmatter.name as string) ?? "",
    description: (frontmatter.description as string) ?? "",
    nextStepFile: (frontmatter.nextStepFile as string) ?? null,
    outputFile: (frontmatter.outputFile as string) ?? null,
    content,
    frontmatter: frontmatter as Record<string, unknown>,
    filePath,
  };
}

/**
 * List all step files in a directory, sorted by step number.
 */
export async function listStepFiles(stepsDir: string): Promise<string[]> {
  const files = await readdir(stepsDir);
  return files
    .filter((f) => f.startsWith("step-") && f.endsWith(".md"))
    .sort((a, b) => extractStepNumber(a) - extractStepNumber(b));
}

/**
 * Find the first step file in a steps directory.
 */
export async function findFirstStep(stepsDir: string): Promise<string> {
  const files = await listStepFiles(stepsDir);
  if (files.length === 0) {
    throw new Error(`No step files found in: ${stepsDir}`);
  }
  return join(stepsDir, files[0]);
}

/**
 * Count total steps in a directory (excluding continuation steps like step-01b).
 */
export async function countSteps(stepsDir: string): Promise<number> {
  const files = await listStepFiles(stepsDir);
  // Count only primary steps, not variants (step-01b, step-v-02b, etc.)
  // Primary: step-01-foo.md, step-v-01-foo.md, step-e-01-foo.md
  // Variant: step-01b-foo.md, step-v-02b-foo.md
  return files.filter((f) => /^step-(?:[a-z]+-)?(\d+)(?:-|\.md$)/.test(f))
    .length;
}

/**
 * Extract step number from filename.
 * "step-01-init.md" → 1
 * "step-01b-continue.md" → 1
 * "step-12-complete.md" → 12
 * "step-v-01-discovery.md" → 1
 * "step-e-01-foo.md" → 1
 */
function extractStepNumber(filename: string): number {
  // Match step-01, step-v-01, step-e-01, step-c-01 etc.
  const match = filename.match(/^step-(?:[a-z]+-)?(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Resolve variable placeholders in step file paths.
 * e.g. {project-root} → actual project path
 */
export function resolveStepPath(
  pathTemplate: string,
  variables: Record<string, string>
): string {
  let resolved = pathTemplate;
  for (const [key, value] of Object.entries(variables)) {
    // Handle both {var} and {{var}} patterns (step files use both)
    resolved = resolved.replaceAll(`{{${key}}}`, value);
    resolved = resolved.replaceAll(`{${key}}`, value);
  }
  return resolved;
}
