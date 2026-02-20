# Team Configuration — bmad.config.yaml

BMAD_Openclaw supports a lightweight config file that lets teams customize agent
personas, inject company context, and remap OpenClaw agent IDs — **without forking
or modifying any framework files**.

No config file = current behavior unchanged. Every field is optional.

---

## Quick Start

```bash
# 1. Copy the example config to your project root
cp bmad.config.example.yaml bmad.config.yaml

# 2. Open bmad.config.yaml and uncomment the fields you want
# 3. Restart your OpenClaw session — config loads automatically
```

That's it. The orchestrator reads `bmad.config.yaml` at session start and applies
your customizations before activating any agent.

---

## Config File Reference

The config file lives at `bmad.config.yaml` in your **project root** (same directory
where you run OpenClaw). It is YAML and never committed to the BMAD_Openclaw repo —
only `bmad.config.example.yaml` is shipped.

### `version`

```yaml
version: "1"
```

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `version` | string | No | — |

Schema version. Must be `"1"` for v1. Omitting it is fine. An unrecognized value
produces a warning but does not abort.

---

### `company`

Company context injected into all agent prompts as background knowledge.

```yaml
company:
  name: "Acme Corp"
  context: |
    B2B SaaS for logistics. Prioritize reliability and compliance.
  tech_stack: "TypeScript, Next.js, PostgreSQL"
  conventions: |
    All PRs require two reviewers.
    Post decisions to the team wiki, not chat.
```

| Field | Type | Required | Resolves | Description |
|-------|------|----------|----------|-------------|
| `company.name` | string | No | `{{company_name}}` | Company display name |
| `company.context` | string | No | `{{company_context}}` | Business context (multi-line ok) |
| `company.tech_stack` | string | No | `{{tech_stack}}` | Primary tech stack |
| `company.conventions` | string | No | `{{conventions}}` | Team norms (multi-line ok) |

All `company.*` fields are available as background knowledge to **all** agents.

---

### `agents`

Override individual agent personas. Keys must match canonical role slugs (see table below).

```yaml
agents:
  product-manager:
    name: "Riley"
    emoji: "📊"
    openclaw_agent_id: "riley"
    persona_append: "Owns sprint planning and stakeholder updates."
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `agents.ROLE.name` | string | No | Replaces the agent's default display name |
| `agents.ROLE.emoji` | string | No | Replaces the agent's default emoji |
| `agents.ROLE.openclaw_agent_id` | string | No | `agentId` used for `sessions_spawn` |
| `agents.ROLE.persona_append` | string | No | Text **appended** to the Persona section — never replaces base persona |

`persona_append` is additive. The base persona (expertise, principles, communication style)
always stays intact. Use it to add team-specific notes: tools used, channels to post to, etc.

---

## Canonical Role Keys

| Config key | Default name | Default emoji | File |
|------------|-------------|---------------|------|
| `analyst` | Mary | 📊 | `agents/analyst.md` |
| `architect` | James | 🏗️ | `agents/architect.md` |
| `developer` | John | 💻 | `agents/developer.md` |
| `product-manager` | John | 📋 | `agents/product-manager.md` |
| `qa-engineer` | Mary | 🔍 | `agents/qa-engineer.md` |
| `scrum-master` | Bob | 🏃 | `agents/scrum-master.md` |
| `tech-writer` | Paige | ✍️ | `agents/tech-writer.md` |
| `ux-designer` | Jane | 🎨 | `agents/ux-designer.md` |
| `bmad-master` | BMad Master | 🧙 | `agents/bmad-master.md` |

An unknown key (e.g., a typo) produces a warning but does not abort the session.

---

## Resolution Rules

### Priority (highest wins)

```
1. bmad.config.yaml — agents.<role>.*     (role-specific overrides)
2. bmad.config.yaml — company.*           (shared company context)
3. Agent .md file hardcoded values        (upstream defaults)
```

### Template Variables — `{{var|default}}` Syntax

Agent files use `{{var|DEFAULT}}` placeholders in their H1 headers. Resolution:

- If `var` is present in config → use the config value.
- If `var` is absent from config → use `DEFAULT` (the text after `|`).

This makes agent files fully readable and functional without any config. The inline
default is the upstream value (e.g., `{{agent_name|John}}`).

### `persona_append` Behavior

When `persona_append` is set for a role:

- The orchestrator **appends** the text as an additional paragraph after the existing
  Persona/Identity section in the agent file.
- The base persona (role expertise, principles, communication style) is **never modified**.
- Think of it as a sticky note added on top of the agent's profile.

---

## Backward Compatibility

- **No config file** → identical behavior to pre-config BMAD_Openclaw (zero breaking changes).
- **Partial config** → only configured fields override; everything else uses file defaults.
- **Existing forks** → you can gradually migrate manual edits to `bmad.config.yaml` and restore
  the original agent files.
- **Overlay directories** → `bmad.config.yaml` can coexist with overlay patterns. Config takes
  precedence for the fields it defines.

`bmad.config.yaml` is git-ignored by convention (add it to your project's `.gitignore`).
`bmad.config.example.yaml` is the template committed to the framework repo.

---

## Known Limitations (V1)

The following are **not** supported in v1 — planned for a future release:

| Limitation | Notes |
|------------|-------|
| Environment variable interpolation in config values | Use OpenClaw session context for secrets |
| Routing overrides (`routing:` key) | Planned for V2 |
| Deeper persona placeholders (beyond H1 headers) | `persona_append` covers most use cases |
| Per-agent config files | Single unified file is intentional for small teams |
| Config hot-reload without session restart | Re-read happens at session start |

---

## Manual Test Checklist

Before submitting a PR that touches config behavior, verify these four scenarios:

1. **No config** — Run any workflow without `bmad.config.yaml`. Confirm output is identical
   to pre-config behavior (agent uses upstream default name and emoji).

2. **Minimal config** — Add `company.name: "TestCo"` only. Confirm agent acknowledges the
   company name when relevant; no other behavior changes.

3. **Full config** — Add full agent overrides (name, emoji, persona_append). Confirm the
   agent introduces itself with the configured name/emoji and includes the appended persona text.

4. **Config removed** — Start session with config, then remove `bmad.config.yaml` and restart.
   Confirm fallback to upstream defaults with no errors.
