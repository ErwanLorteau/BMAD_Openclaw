# BMad Method Plugin for OpenClaw

AI-driven agile development framework — the [BMad Method](https://github.com/bmadcode/BMAD-METHOD) as an OpenClaw plugin.

Each workflow spawns a dedicated specialist agent (Analyst, PM, Architect, etc.) with fresh context — no bleeding between workflows. The BMad Master orchestrates the full software development lifecycle: analysis → planning → solutioning → implementation.

<img width="1886" height="898" alt="image" src="https://github.com/user-attachments/assets/0867aa78-3c37-45c0-a832-f23f812c2458" />

## Architecture

```
main (your personal assistant)
  ↕ agent-to-agent messaging
bmad-master (top-level agent, orchestrator)
  ├→ analyst sub-agent    → Product Brief, Research
  ├→ pm sub-agent         → PRD
  ├→ ux sub-agent         → UX Design
  ├→ architect sub-agent  → Architecture, Epics & Stories
  └→ dev sub-agent        → Sprint Planning, Implementation
```

**Why top-level?** OpenClaw sub-agents cannot spawn other sub-agents. bmad-master needs to spawn specialist agents, so it must be a [top-level agent](https://docs.openclaw.ai/concepts/multi-agent) — not a sub-agent of main.

**Two execution modes:**
- **YOLO** — Autonomous. Sub-agent runs all steps without stopping. Master waits for announce, then proposes next workflow.
- **Interactive** — Sub-agent pauses after each step. User reviews output, gives feedback via the master. Master relays to sub-agent via `sessions_send`.

## Tools

| Tool | Called by | Description |
|------|-----------|-------------|
| `bmad_init_project` | Master | Initialize a BMad project (creates `_bmad/`, symlinks, state tracking) |
| `bmad_list_workflows` | Master | List available workflows based on current project state |
| `bmad_start_workflow` | Master | Prepare a workflow — returns task prompt for `sessions_spawn` |
| `bmad_load_step` | Sub-agent | Load the next step in the active workflow |
| `bmad_save_artifact` | Sub-agent | Save workflow output (always appends, dedup detection) |
| `bmad_complete_workflow` | Sub-agent | Mark workflow complete, update state |
| `bmad_get_state` | Master | Get current project state (phase, progress, artifacts) |

## Install

```bash
# Clone into OpenClaw extensions
git clone https://github.com/ErwanLorteau/BMAD_Openclaw.git ~/.openclaw/extensions/bmad-method

# Install dependencies
cd ~/.openclaw/extensions/bmad-method && npm install
```

## Configure

Add to `~/.openclaw/openclaw.json`:

```json5
{
  plugins: {
    load: {
      paths: ["~/.openclaw/extensions/bmad-method"]
    },
    entries: {
      "bmad-method": {
        enabled: true,
        config: {}
      }
    }
  },

  agents: {
    list: [
      {
        id: "bmad-master",
        name: "BMad Master",
        workspace: "~/.openclaw/workspace-bmad",
        tools: { allow: ["bmad-method"] }
      },
      {
        id: "main",
        // your existing main agent config
      }
    ]
  },

  tools: {
    agentToAgent: {
      enabled: true,
      allow: ["main", "bmad-master"]
    }
  }
}
```

Create the master's workspace:

```bash
mkdir -p ~/.openclaw/workspace-bmad
```

Then restart:

```bash
openclaw gateway restart
```

## Verify

After restart, confirm the plugin loaded:

```
[plugins] BMad Method plugin loaded. Method path: ...
[plugins] BMad Method: registered 7 tools
```

## Usage

**YOLO mode** (autonomous):
> "Tell bmad-master to initialize a project at ~/projects/my-app called my-app, then run create-product-brief in yolo mode"

**Interactive mode**:
> "Tell bmad-master to start create-prd for my-app in interactive mode"

The master handles the rest — spawning the right agent, tracking state, proposing next workflows.

## Workflow

```
User → main → sessions_send → bmad-master
                                    ↓
                          bmad_init_project
                                    ↓
                         bmad_start_workflow → task prompt
                                    ↓
                         sessions_spawn(task) → sub-agent
                                    ↓
              bmad_load_step → execute → bmad_save_artifact (repeat)
                                    ↓
                        bmad_complete_workflow
                                    ↓
                          announce → bmad-master
                                    ↓
                          propose next workflow
```

## Project Structure

```
project/
├── _bmad/
│   ├── state.json           # Workflow state (active, completed, phase)
│   ├── config.yaml          # Project config
│   ├── core/ → symlink      # BMad core files
│   └── bmm/ → symlink       # BMad method module
├── _bmad-output/
│   ├── planning-artifacts/  # Briefs, PRDs, architecture docs
│   └── implementation-artifacts/
└── docs/                    # Project knowledge
```

## BMad Phases

| Phase | Agent | Workflows |
|-------|-------|-----------|
| Analysis | Mary (Analyst) | Product Brief, Market/Domain/Technical Research |
| Planning | John (PM), Sally (UX) | PRD, UX Design |
| Solutioning | Winston (Architect) | Architecture, Epics & Stories, Readiness Check |
| Implementation | Bob (SM), Amelia (Dev) | Sprint Planning, Stories, Dev, Code Review |

## Development

```bash
npm install
npm test           # Run tests
npm run typecheck  # TypeScript check
```

## Architecture History

- **V1** (deprecated branch): Multi-agent via `sessions_spawn` with 12 agent prompts — abandoned due to complexity
- **V2** (PR #7): Single-session persona role-playing — abandoned due to context bleeding across workflows
- **V3** (current): Top-level master agent spawning sub-agents per workflow — see [Issue #8](https://github.com/ErwanLorteau/BMAD_Openclaw/issues/8) for the full journey

## License

MIT
