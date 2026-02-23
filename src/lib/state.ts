/**
 * State management — reads/writes {projectRoot}/_bmad/state.json
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { BmadState } from "../types.ts";

const BMAD_DIR = "_bmad";
const STATE_FILE = "state.json";

export function bmadDir(projectPath: string): string {
  return join(projectPath, BMAD_DIR);
}

export function statePath(projectPath: string): string {
  return join(projectPath, BMAD_DIR, STATE_FILE);
}

export async function readState(projectPath: string): Promise<BmadState | null> {
  try {
    const raw = await readFile(statePath(projectPath), "utf-8");
    return JSON.parse(raw) as BmadState;
  } catch {
    return null;
  }
}

export async function writeState(
  projectPath: string,
  state: BmadState
): Promise<void> {
  const dir = bmadDir(projectPath);
  await mkdir(dir, { recursive: true });
  await writeFile(statePath(projectPath), JSON.stringify(state, null, 2), "utf-8");
}

export function createInitialState(
  projectPath: string,
  projectName: string
): BmadState {
  return {
    projectName,
    projectPath,
    createdAt: new Date().toISOString(),
    currentPhase: "analysis",
    activeWorkflow: null,
    completedWorkflows: [],
  };
}
