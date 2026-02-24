import { describe, it, expect } from "vitest";
import { join } from "node:path";
import {
  loadStepFile,
  listStepFiles,
  findFirstStep,
  countSteps,
  resolveStepPath,
} from "../lib/step-loader.ts";

const BMAD_METHOD = join(import.meta.dirname, "../../bmad-method");
const BRIEF_STEPS = join(
  BMAD_METHOD,
  "bmm/workflows/1-analysis/create-product-brief/steps"
);

describe("step-loader", () => {
  it("loads step-01-init.md correctly", async () => {
    const step = await loadStepFile(join(BRIEF_STEPS, "step-01-init.md"));
    expect(step.stepNumber).toBe(1);
    expect(step.name).toBe("step-01-init");
    expect(step.nextStepFile).toBeTruthy();
    expect(step.content).toContain("Product Brief Initialization");
  });

  it("loads step-06-complete.md as final step", async () => {
    const step = await loadStepFile(join(BRIEF_STEPS, "step-06-complete.md"));
    expect(step.stepNumber).toBe(6);
    // Final step may or may not have nextStepFile — depends on implementation
  });

  it("listStepFiles returns sorted files", async () => {
    const files = await listStepFiles(BRIEF_STEPS);
    expect(files.length).toBeGreaterThanOrEqual(6);
    expect(files[0]).toMatch(/^step-01/);
  });

  it("findFirstStep returns step-01", async () => {
    const first = await findFirstStep(BRIEF_STEPS);
    expect(first).toContain("step-01");
  });

  it("countSteps returns correct count", async () => {
    const count = await countSteps(BRIEF_STEPS);
    expect(count).toBeGreaterThanOrEqual(6);
  });

  it("resolveStepPath replaces variables", () => {
    const resolved = resolveStepPath(
      "{project-root}/_bmad/bmm/workflows/1-analysis/steps/step-02.md",
      { "project-root": "/home/user/project" }
    );
    expect(resolved).toBe(
      "/home/user/project/_bmad/bmm/workflows/1-analysis/steps/step-02.md"
    );
  });
});
