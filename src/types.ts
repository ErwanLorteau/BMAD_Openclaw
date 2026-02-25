/**
 * BMad Method Plugin — Core Types
 */

// ── State ────────────────────────────────────────────────────────────────────

export interface BmadState {
  projectName: string;
  projectPath: string;
  /** ISO timestamp of project init */
  createdAt: string;
  /** Current BMad phase: analysis | planning | solutioning | implementation */
  currentPhase: BmadPhase;
  /** Currently active workflow, if any */
  activeWorkflow: ActiveWorkflow | null;
  /** Completed workflows with their output artifacts */
  completedWorkflows: CompletedWorkflow[];
}

export type BmadPhase =
  | "analysis"
  | "planning"
  | "solutioning"
  | "implementation";

export interface ActiveWorkflow {
  /** Workflow ID, e.g. "create-product-brief" */
  id: string;
  /** Agent persona currently active */
  agentId: string;
  /** Agent display name */
  agentName: string;
  /** Execution mode */
  mode: "normal" | "yolo";
  /** Current step number (1-based) */
  currentStep: number;
  /** Total steps in this workflow (if known) */
  totalSteps: number | null;
  /** Path to the current step file */
  currentStepFile: string;
  /** Path to the workflow output file */
  outputFile: string;
  /** Last step number that was saved (for duplicate-save protection) */
  lastSavedStep?: number;
  /** ISO timestamp when workflow started */
  startedAt: string;
}

export interface CompletedWorkflow {
  id: string;
  agentId: string;
  outputFile: string;
  completedAt: string;
}

// ── Workflow Registry ────────────────────────────────────────────────────────

export interface WorkflowDefinition {
  /** Unique workflow ID */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Which phase this belongs to */
  phase: BmadPhase;
  /** Agent that runs this workflow */
  agentId: string;
  /** Relative path to workflow.md or workflow.yaml from bmad-method root */
  workflowFile: string;
  /** Relative path to the steps directory (if step-file architecture) */
  stepsDir: string | null;
  /** Required input artifacts (workflow IDs that must be completed first) */
  requires: string[];
}

export interface AgentPersona {
  id: string;
  name: string;
  title: string;
  role: string;
  identity: string;
  communicationStyle: string;
  principles: string;
}

// ── Step file parsed data ────────────────────────────────────────────────────

export interface StepFile {
  /** Step number (extracted from filename) */
  stepNumber: number;
  /** Step name from frontmatter */
  name: string;
  /** Step description from frontmatter */
  description: string;
  /** Path to the next step file (from frontmatter) */
  nextStepFile: string | null;
  /** Path to the output file (from frontmatter) */
  outputFile: string | null;
  /** Full markdown content (without frontmatter) */
  content: string;
  /** Raw frontmatter data */
  frontmatter: Record<string, unknown>;
  /** Absolute path to this step file */
  filePath: string;
}

// ── Plugin API types (minimal interface for what we need from OpenClaw) ──────

export interface PluginApi {
  registerTool(
    tool: ToolDefinition,
    options?: { optional?: boolean }
  ): void;
  config: Record<string, unknown>;
  logger: {
    info(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
  };
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: unknown;
  execute(id: string, params: Record<string, unknown>): Promise<ToolResult>;
}

export interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
}
