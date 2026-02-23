import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { loadAgentPersona, formatPersonaPrompt } from "../lib/agent-loader.ts";

const BMAD_METHOD = join(import.meta.dirname, "../../bmad-method");

describe("agent-loader", () => {
  it("loads analyst persona", async () => {
    const persona = await loadAgentPersona(BMAD_METHOD, "analyst");
    expect(persona.id).toBe("analyst");
    expect(persona.name).toBe("Mary");
    expect(persona.title).toBe("Business Analyst");
    expect(persona.role).toContain("Business Analyst");
    expect(persona.identity).toBeTruthy();
    expect(persona.communicationStyle).toBeTruthy();
  });

  it("loads architect persona", async () => {
    const persona = await loadAgentPersona(BMAD_METHOD, "architect");
    expect(persona.name).toBe("Winston");
  });

  it("loads pm persona", async () => {
    const persona = await loadAgentPersona(BMAD_METHOD, "pm");
    expect(persona.name).toBe("John");
  });

  it("throws for unknown agent", async () => {
    await expect(
      loadAgentPersona(BMAD_METHOD, "nonexistent")
    ).rejects.toThrow("Unknown agent ID");
  });

  it("formatPersonaPrompt produces readable output", async () => {
    const persona = await loadAgentPersona(BMAD_METHOD, "analyst");
    const prompt = formatPersonaPrompt(persona);
    expect(prompt).toContain("Mary");
    expect(prompt).toContain("Business Analyst");
    expect(prompt).toContain("Identity:");
  });
});
