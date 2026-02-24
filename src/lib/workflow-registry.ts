/**
 * Workflow registry — maps workflow IDs to their definitions.
 * Built from the actual BMad method file structure.
 */

import type { WorkflowDefinition, BmadPhase } from "../types.ts";

/**
 * All BMad Method workflows, registered statically from the method file structure.
 * Paths are relative to the bmad-method root directory.
 */
export const WORKFLOW_REGISTRY: WorkflowDefinition[] = [
  // ── Phase 1: Analysis ──────────────────────────────────────────────────
  {
    id: "create-product-brief",
    name: "Create Product Brief",
    description:
      "Guided experience to nail down your product idea into an executive brief",
    phase: "analysis",
    agentId: "analyst",
    workflowFile:
      "bmm/workflows/1-analysis/create-product-brief/workflow.md",
    stepsDir:
      "bmm/workflows/1-analysis/create-product-brief/steps",
    requires: [],
  },
  {
    id: "market-research",
    name: "Market Research",
    description:
      "Market analysis, competitive landscape, customer needs and trends",
    phase: "analysis",
    agentId: "analyst",
    workflowFile:
      "bmm/workflows/1-analysis/research/workflow-market-research.md",
    stepsDir:
      "bmm/workflows/1-analysis/research/market-steps",
    requires: [],
  },
  {
    id: "domain-research",
    name: "Domain Research",
    description:
      "Industry domain deep dive, subject matter expertise and terminology",
    phase: "analysis",
    agentId: "analyst",
    workflowFile:
      "bmm/workflows/1-analysis/research/workflow-domain-research.md",
    stepsDir:
      "bmm/workflows/1-analysis/research/domain-steps",
    requires: [],
  },
  {
    id: "technical-research",
    name: "Technical Research",
    description:
      "Technical feasibility, architecture options and implementation approaches",
    phase: "analysis",
    agentId: "analyst",
    workflowFile:
      "bmm/workflows/1-analysis/research/workflow-technical-research.md",
    stepsDir:
      "bmm/workflows/1-analysis/research/technical-steps",
    requires: [],
  },

  // ── Phase 2: Planning ──────────────────────────────────────────────────
  {
    id: "create-prd",
    name: "Create PRD",
    description:
      "Produce Product Requirements Document through structured facilitation",
    phase: "planning",
    agentId: "pm",
    workflowFile:
      "bmm/workflows/2-plan-workflows/create-prd/workflow-create-prd.md",
    stepsDir:
      "bmm/workflows/2-plan-workflows/create-prd/steps-c",
    requires: ["create-product-brief"],
  },
  {
    id: "validate-prd",
    name: "Validate PRD",
    description:
      "Validate PRD is comprehensive, lean, well organized and cohesive",
    phase: "planning",
    agentId: "pm",
    workflowFile:
      "bmm/workflows/2-plan-workflows/create-prd/workflow-validate-prd.md",
    stepsDir:
      "bmm/workflows/2-plan-workflows/create-prd/steps-v",
    requires: ["create-prd"],
  },
  {
    id: "edit-prd",
    name: "Edit PRD",
    description: "Update an existing PRD",
    phase: "planning",
    agentId: "pm",
    workflowFile:
      "bmm/workflows/2-plan-workflows/create-prd/workflow-edit-prd.md",
    stepsDir:
      "bmm/workflows/2-plan-workflows/create-prd/steps-e",
    requires: ["create-prd"],
  },
  {
    id: "create-ux-design",
    name: "Create UX Design",
    description:
      "Plan UX patterns, look and feel to inform architecture and implementation",
    phase: "planning",
    agentId: "ux-designer",
    workflowFile:
      "bmm/workflows/2-plan-workflows/create-ux-design/workflow.md",
    stepsDir:
      "bmm/workflows/2-plan-workflows/create-ux-design/steps",
    requires: ["create-prd"],
  },

  // ── Phase 3: Solutioning ───────────────────────────────────────────────
  {
    id: "create-architecture",
    name: "Create Architecture",
    description:
      "Document technical decisions for implementation consistency",
    phase: "solutioning",
    agentId: "architect",
    workflowFile:
      "bmm/workflows/3-solutioning/create-architecture/workflow.md",
    stepsDir:
      "bmm/workflows/3-solutioning/create-architecture/steps",
    requires: ["create-prd"],
  },
  {
    id: "create-epics-and-stories",
    name: "Create Epics & Stories",
    description:
      "Transform PRD + Architecture into implementation-ready stories",
    phase: "solutioning",
    agentId: "pm",
    workflowFile:
      "bmm/workflows/3-solutioning/create-epics-and-stories/workflow.md",
    stepsDir:
      "bmm/workflows/3-solutioning/create-epics-and-stories/steps",
    requires: ["create-prd", "create-architecture"],
  },
  {
    id: "check-implementation-readiness",
    name: "Implementation Readiness Check",
    description:
      "Validate PRD, Architecture, and Epics are aligned before coding",
    phase: "solutioning",
    agentId: "architect",
    workflowFile:
      "bmm/workflows/3-solutioning/check-implementation-readiness/workflow.md",
    stepsDir:
      "bmm/workflows/3-solutioning/check-implementation-readiness/steps",
    requires: ["create-prd", "create-architecture", "create-epics-and-stories"],
  },

  // ── Phase 4: Implementation ────────────────────────────────────────────
  {
    id: "sprint-planning",
    name: "Sprint Planning",
    description: "Generate sprint-status.yaml to sequence all project tasks",
    phase: "implementation",
    agentId: "sm",
    workflowFile:
      "bmm/workflows/4-implementation/sprint-planning/workflow.yaml",
    stepsDir: null,
    requires: ["create-epics-and-stories"],
  },
  {
    id: "create-story",
    name: "Create Story",
    description:
      "Prepare story with all required context for dev agent",
    phase: "implementation",
    agentId: "sm",
    workflowFile:
      "bmm/workflows/4-implementation/create-story/workflow.yaml",
    stepsDir: null,
    requires: ["sprint-planning"],
  },
  {
    id: "dev-story",
    name: "Dev Story",
    description: "Implement story: write tests and code",
    phase: "implementation",
    agentId: "dev",
    workflowFile:
      "bmm/workflows/4-implementation/dev-story/workflow.yaml",
    stepsDir: null,
    requires: ["create-story"],
  },
  {
    id: "code-review",
    name: "Code Review",
    description:
      "Adversarial code review across multiple quality facets",
    phase: "implementation",
    agentId: "dev",
    workflowFile:
      "bmm/workflows/4-implementation/code-review/workflow.yaml",
    stepsDir: null,
    requires: ["dev-story"],
  },

  // ── Quick Flow ─────────────────────────────────────────────────────────
  {
    id: "quick-spec",
    name: "Quick Spec",
    description:
      "Create implementation-ready tech spec through conversational discovery",
    phase: "analysis",
    agentId: "quick-flow-solo-dev",
    workflowFile:
      "bmm/workflows/bmad-quick-flow/quick-spec/workflow.md",
    stepsDir:
      "bmm/workflows/bmad-quick-flow/quick-spec/steps",
    requires: [],
  },
  {
    id: "quick-dev",
    name: "Quick Dev",
    description: "Implement tech spec end-to-end",
    phase: "implementation",
    agentId: "quick-flow-solo-dev",
    workflowFile:
      "bmm/workflows/bmad-quick-flow/quick-dev/workflow.md",
    stepsDir:
      "bmm/workflows/bmad-quick-flow/quick-dev/steps",
    requires: ["quick-spec"],
  },

  // ── Supporting Workflows ───────────────────────────────────────────────
  {
    id: "correct-course",
    name: "Course Correction",
    description:
      "Navigate major changes discovered mid-implementation",
    phase: "implementation",
    agentId: "pm",
    workflowFile:
      "bmm/workflows/4-implementation/correct-course/workflow.yaml",
    stepsDir: null,
    requires: ["sprint-planning"],
  },
  {
    id: "sprint-status",
    name: "Sprint Status",
    description:
      "View current sprint status and next recommended action",
    phase: "implementation",
    agentId: "sm",
    workflowFile:
      "bmm/workflows/4-implementation/sprint-status/workflow.yaml",
    stepsDir: null,
    requires: ["sprint-planning"],
  },
  {
    id: "retrospective",
    name: "Retrospective",
    description:
      "Party Mode review of all work completed across an epic",
    phase: "implementation",
    agentId: "sm",
    workflowFile:
      "bmm/workflows/4-implementation/retrospective/workflow.yaml",
    stepsDir: null,
    requires: ["sprint-planning"],
  },
  {
    id: "document-project",
    name: "Document Project",
    description:
      "Analyze an existing project to produce documentation for human and LLM",
    phase: "analysis",
    agentId: "analyst",
    workflowFile:
      "bmm/workflows/document-project/workflow.yaml",
    stepsDir: null,
    requires: [],
  },
  {
    id: "generate-project-context",
    name: "Generate Project Context",
    description:
      "Create project-context.md with critical rules for AI agents",
    phase: "analysis",
    agentId: "analyst",
    workflowFile:
      "bmm/workflows/generate-project-context/workflow.md",
    stepsDir:
      "bmm/workflows/generate-project-context/steps",
    requires: [],
  },
  {
    id: "qa-generate-e2e-tests",
    name: "QA Generate E2E Tests",
    description:
      "Generate automated end-to-end tests for existing features",
    phase: "implementation",
    agentId: "qa",
    workflowFile:
      "bmm/workflows/qa-generate-e2e-tests/workflow.yaml",
    stepsDir: null,
    requires: ["dev-story"],
  },

  // ── Core Workflows ─────────────────────────────────────────────────────
  {
    id: "brainstorming",
    name: "Brainstorm Project",
    description:
      "Expert guided facilitation through brainstorming techniques with a final report",
    phase: "analysis",
    agentId: "analyst",
    workflowFile:
      "core/workflows/brainstorming/workflow.md",
    stepsDir:
      "core/workflows/brainstorming/steps",
    requires: [],
  },
];

/**
 * Get a workflow by ID.
 */
export function getWorkflow(id: string): WorkflowDefinition | undefined {
  return WORKFLOW_REGISTRY.find((w) => w.id === id);
}

/**
 * Get workflows available given completed workflow IDs.
 */
export function getAvailableWorkflows(
  completedIds: string[]
): WorkflowDefinition[] {
  return WORKFLOW_REGISTRY.filter((w) =>
    w.requires.every((req) => completedIds.includes(req))
  );
}

/**
 * Get workflows for a specific phase.
 */
export function getWorkflowsByPhase(
  phase: BmadPhase
): WorkflowDefinition[] {
  return WORKFLOW_REGISTRY.filter((w) => w.phase === phase);
}
