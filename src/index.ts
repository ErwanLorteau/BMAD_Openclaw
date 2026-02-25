/**
 * BMad Method Plugin for OpenClaw
 *
 * Registers agent tools for BMad workflow orchestration.
 * The BMad Master agent calls these tools to execute workflows step-by-step.
 *
 * Architecture (V3 — multi-agent):
 * - BMad Master is a top-level agent that orchestrates workflows
 * - Each workflow spawns a sub-agent (Analyst, PM, Architect, etc.)
 * - Plugin tools handle step loading, persona injection, state tracking, artifact saving
 * - YOLO mode: sub-agent runs autonomously
 * - Interactive mode: sub-agent pauses per step for user feedback
 */

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import * as bmadInitProject from "./tools/bmad-init-project.ts";
import * as bmadListWorkflows from "./tools/bmad-list-workflows.ts";
import * as bmadStartWorkflow from "./tools/bmad-start-workflow.ts";
import * as bmadLoadStep from "./tools/bmad-load-step.ts";
import * as bmadSaveArtifact from "./tools/bmad-save-artifact.ts";
import * as bmadCompleteWorkflow from "./tools/bmad-complete-workflow.ts";
import * as bmadGetState from "./tools/bmad-get-state.ts";
/** All tool modules */
const TOOLS = [
  bmadInitProject,
  bmadListWorkflows,
  bmadStartWorkflow,
  bmadLoadStep,
  bmadSaveArtifact,
  bmadCompleteWorkflow,
  bmadGetState,
] as const;

/**
 * Resolve the path to bundled BMad method files.
 * Default: <plugin-root>/bmad-method/
 */
function resolveBmadMethodPath(pluginConfig: Record<string, unknown>): string {
  if (
    typeof pluginConfig?.bmadMethodPath === "string" &&
    pluginConfig.bmadMethodPath.length > 0
  ) {
    return pluginConfig.bmadMethodPath;
  }
  // Default to bundled method files
  const pluginRoot = dirname(dirname(fileURLToPath(import.meta.url)));
  return join(pluginRoot, "bmad-method");
}

/**
 * Plugin registration function — called by OpenClaw on load.
 */
export default function register(api: {
  registerTool: (
    tool: {
      name: string;
      description: string;
      parameters: unknown;
      execute: (id: string, params: Record<string, unknown>) => Promise<unknown>;
    },
    options?: { optional?: boolean }
  ) => void;
  config: Record<string, unknown>;
  logger: { info: (msg: string) => void; warn: (msg: string) => void };
}) {
  const pluginConfig =
    (api.config as { plugins?: { entries?: { "bmad-method"?: { config?: Record<string, unknown> } } } })
      ?.plugins?.entries?.["bmad-method"]?.config ?? {};

  const bmadMethodPath = resolveBmadMethodPath(pluginConfig);

  api.logger.info(`BMad Method plugin loaded. Method path: ${bmadMethodPath}`);

  // Context passed to tool execute functions
  const toolContext = { bmadMethodPath };

  for (const tool of TOOLS) {
    api.registerTool(
      {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
        execute: async (id: string, params: Record<string, unknown>) => {
          return tool.execute(id, params as never, toolContext as never);
        },
      },
      { optional: true }
    );
  }

  api.logger.info(
    `BMad Method: registered ${TOOLS.length} tools (${TOOLS.map((t) => t.name).join(", ")})`
  );
}
