# BMad Method Plugin for OpenClaw

AI-driven agile development framework — the [BMad Method](https://github.com/bmadcode/BMAD-METHOD) as an OpenClaw plugin.

Your OpenClaw agent becomes a BMad Master, orchestrating the full software development lifecycle through structured workflows: analysis → planning → solutioning → implementation.

## How It Works

The plugin registers 7 agent tools that handle workflow orchestration, step-by-step execution, and artifact management. The master agent role-plays as different BMad personas (Analyst, PM, Architect, etc.) while the plugin manages state and step progression deterministically.

**Two execution modes:**
- **Normal** — Interactive. Agent halts at checkpoints, user picks Continue/Elicitation/Party Mode/YOLO
- **YOLO** — Autonomous. Agent runs through all steps without stopping

## Tools

| Tool | Description |
|------|-------------|
| `bmad_init_project` | Initialize a BMad project (creates `_bmad/` and state tracking) |
| `bmad_list_workflows` | List available workflows based on current project state |
| `bmad_start_workflow` | Start a workflow — loads agent persona + first step + orchestrator rules |
| `bmad_load_step` | Load the next step in the active workflow |
| `bmad_save_artifact` | Save workflow output to disk |
| `bmad_complete_workflow` | Mark workflow complete, suggest next steps |
| `bmad_get_state` | Get current project state (phase, progress, artifacts) |

## Install

```bash
# Copy or symlink into OpenClaw extensions
cp -r bmad-method-plugin ~/.openclaw/extensions/bmad-method

# Or link for development
openclaw plugins install -l ./bmad-method-plugin
```

## Configure

```json5
{
  plugins: {
    entries: {
      "bmad-method": {
        enabled: true,
        config: {
          // Optional: custom path to BMad method files
          // bmadMethodPath: "/path/to/bmad-method"
        }
      }
    }
  },
  agents: {
    list: [{
      id: "bmad-master",
      name: "BMad Master",
      tools: {
        allow: ["bmad-method"],  // Enable all BMad tools
        deny: ["sessions_spawn"] // Force spawning through plugin
      }
    }]
  }
}
```

## Workflow

```
bmad_init_project → bmad_list_workflows → bmad_start_workflow
     ↓                                          ↓
bmad_get_state ←── bmad_complete_workflow ←── bmad_load_step (repeat)
                                                 ↓
                                          bmad_save_artifact
```

## Project Structure

After initialization, your project gets:

```
project/
├── _bmad/
│   └── state.json          # Workflow state tracking
├── _bmad-output/
│   ├── planning-artifacts/  # Briefs, PRDs, architecture docs
│   └── implementation-artifacts/  # Sprint status, stories, reviews
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

## License

MIT
