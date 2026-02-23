import { describe, it, expect } from "vitest";
import {
  WORKFLOW_REGISTRY,
  getWorkflow,
  getAvailableWorkflows,
  getWorkflowsByPhase,
} from "../lib/workflow-registry.ts";

describe("workflow-registry", () => {
  it("has all expected workflows", () => {
    expect(WORKFLOW_REGISTRY.length).toBeGreaterThanOrEqual(17);
  });

  it("getWorkflow returns correct workflow", () => {
    const w = getWorkflow("create-product-brief");
    expect(w).toBeDefined();
    expect(w!.agentId).toBe("analyst");
    expect(w!.phase).toBe("analysis");
  });

  it("getWorkflow returns undefined for unknown", () => {
    expect(getWorkflow("nonexistent")).toBeUndefined();
  });

  it("getAvailableWorkflows with no completed returns only root workflows", () => {
    const available = getAvailableWorkflows([]);
    // Should include workflows with no prerequisites
    const ids = available.map((w) => w.id);
    expect(ids).toContain("create-product-brief");
    expect(ids).toContain("market-research");
    expect(ids).toContain("quick-spec");
    // Should NOT include workflows with prerequisites
    expect(ids).not.toContain("create-prd");
    expect(ids).not.toContain("create-architecture");
  });

  it("getAvailableWorkflows unlocks PRD after product brief", () => {
    const available = getAvailableWorkflows(["create-product-brief"]);
    const ids = available.map((w) => w.id);
    expect(ids).toContain("create-prd");
  });

  it("getAvailableWorkflows unlocks architecture after PRD", () => {
    const available = getAvailableWorkflows([
      "create-product-brief",
      "create-prd",
    ]);
    const ids = available.map((w) => w.id);
    expect(ids).toContain("create-architecture");
    expect(ids).toContain("create-ux-design");
  });

  it("getWorkflowsByPhase returns correct count", () => {
    const analysis = getWorkflowsByPhase("analysis");
    expect(analysis.length).toBeGreaterThanOrEqual(4);
    expect(analysis.every((w) => w.phase === "analysis")).toBe(true);
  });
});
