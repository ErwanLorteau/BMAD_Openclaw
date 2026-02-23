import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { execute as initProject } from "../tools/bmad-init-project.ts";
import { execute as listWorkflows } from "../tools/bmad-list-workflows.ts";
import { execute as getState } from "../tools/bmad-get-state.ts";
import { execute as saveArtifact } from "../tools/bmad-save-artifact.ts";
import { execute as completeWorkflow } from "../tools/bmad-complete-workflow.ts";

const BMAD_METHOD = join(import.meta.dirname, "../../bmad-method");
const ctx = { bmadMethodPath: BMAD_METHOD };

describe("tool: bmad_init_project", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "bmad-tool-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("initializes a new project", async () => {
    const result = await initProject(
      "test",
      { projectPath: tempDir, projectName: "My Project" },
      ctx
    );
    const text = result.content[0].text;
    expect(text).toContain("✅");
    expect(text).toContain("My Project");
    expect(text).toContain("state.json");
  });

  it("rejects double initialization", async () => {
    await initProject("t", { projectPath: tempDir, projectName: "P1" }, ctx);
    const result = await initProject(
      "t",
      { projectPath: tempDir, projectName: "P2" },
      ctx
    );
    expect(result.content[0].text).toContain("already initialized");
  });

  it("rejects nonexistent directory", async () => {
    const result = await initProject(
      "t",
      { projectPath: "/nonexistent/path", projectName: "P" },
      ctx
    );
    expect(result.content[0].text).toContain("Error");
  });
});

describe("tool: bmad_list_workflows", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "bmad-tool-test-"));
    await initProject("t", { projectPath: tempDir, projectName: "Test" }, ctx);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("lists available workflows for fresh project", async () => {
    const result = await listWorkflows("t", { projectPath: tempDir });
    const text = result.content[0].text;
    expect(text).toContain("create-product-brief");
    expect(text).toContain("market-research");
    // Should not show workflows with prerequisites
    expect(text).not.toContain("create-prd —");
  });

  it("errors for uninitialized project", async () => {
    const result = await listWorkflows("t", { projectPath: "/tmp/nowhere" });
    expect(result.content[0].text).toContain("Error");
  });
});

describe("tool: bmad_get_state", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "bmad-tool-test-"));
    await initProject("t", { projectPath: tempDir, projectName: "Test" }, ctx);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("returns project state", async () => {
    const result = await getState("t", { projectPath: tempDir });
    const text = result.content[0].text;
    expect(text).toContain("Test");
    expect(text).toContain("analysis");
    expect(text).toContain("None");
  });
});

describe("tool: bmad_save_artifact", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "bmad-tool-test-"));
    await initProject("t", { projectPath: tempDir, projectName: "Test" }, ctx);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("saves artifact to specified path", async () => {
    const result = await saveArtifact("t", {
      projectPath: tempDir,
      content: "# Product Brief\n\nThis is a test.",
      outputFile: "_bmad-output/planning-artifacts/product-brief.md",
    });
    const text = result.content[0].text;
    expect(text).toContain("✅");
    expect(text).toContain("product-brief.md");
  });

  it("rejects empty content", async () => {
    const result = await saveArtifact("t", {
      projectPath: tempDir,
      content: "",
      outputFile: "_bmad-output/test.md",
    });
    expect(result.content[0].text).toContain("Error");
  });
});
