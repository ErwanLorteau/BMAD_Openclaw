# BMad Method Core

Trimmed, standalone extraction of the [BMad Method](https://github.com/bmad-method/bmad-method) — agent system prompts, workflow definitions, templates, and checklists.

**No IDE integrations. No CLI tooling. No website. Just the methodology.**

## What This Is

The BMad Method is a multi-agent software development methodology that orchestrates specialized AI agents through a structured workflow: Analysis → Planning → Solutioning → Implementation.

This repo isolates the **core methodology** so each agent prompt can be used directly as a system prompt in any AI tool, agent framework, or orchestration system.

## Directory Structure

```
bmad-method-core/
├── agents/                    # Standalone agent system prompts
│   ├── analyst.md             # Mary 📊 — Business Analyst
│   ├── architect.md           # Winston 🏗️ — System Architect
│   ├── bmad-master.md         # BMad Master 🧙 — Orchestrator
│   ├── developer.md           # Amelia 💻 — Senior Developer
│   ├── product-manager.md     # John 📋 — Product Manager
│   ├── qa-engineer.md         # Quinn 🧪 — QA Engineer
│   ├── quick-flow-solo-dev.md # Barry 🚀 — Quick Flow Dev
│   ├── scrum-master.md        # Bob 🏃 — Scrum Master
│   ├── tech-writer.md         # Paige 📚 — Technical Writer
│   └── ux-designer.md         # Sally 🎨 — UX Designer
├── workflow/                  # Methodology structure
│   ├── phases.md              # The 4 phases: Analysis → Planning → Solutioning → Implementation
│   ├── orchestrator.md        # Master orchestration rules, step-file architecture, routing
│   └── state-machine.md       # Status transitions, handoff rules, sprint tracking
├── templates/                 # Output templates (verbatim from official repo)
│   ├── product-brief.md
│   ├── prd.md
│   ├── ux-design.md
│   ├── architecture-decision.md
│   ├── epics.md
│   ├── readiness-report.md
│   ├── story.md
│   ├── sprint-status.yaml
│   ├── tech-spec.md
│   ├── research.md
│   ├── project-context.md
│   ├── brainstorming-session.md
│   └── doc-*.md               # Documentation templates
├── checklists/                # Validation checklists (verbatim from official repo)
│   ├── code-review.md
│   ├── correct-course.md
│   ├── create-story.md
│   ├── dev-story.md
│   ├── sprint-planning.md
│   ├── qa-automate.md
│   └── document-project.md
└── README.md
```

## How to Use

### As System Prompts

Each file in `agents/` is a complete, standalone system prompt. Copy the contents and use as a system prompt for any AI model:

```
# Example: spawn a Product Manager agent
system_prompt = open("agents/product-manager.md").read()
```

### Workflow Phases

Read `workflow/phases.md` to understand the full development lifecycle:

1. **Analysis** (Analyst) — Research, brainstorming, product brief
2. **Planning** (PM, UX Designer) — PRD creation, UX design specification
3. **Solutioning** (Architect, PM) — Architecture decisions, epic/story breakdown, readiness check
4. **Implementation** (Scrum Master, Developer, QA) — Sprint planning, story development, code review
5. **Quick Flow** (Solo Dev) — Alternative rapid path for smaller tasks

### State Machine

See `workflow/state-machine.md` for:
- Epic status: `backlog → in-progress → done`
- Story status: `backlog → ready-for-dev → in-progress → review → done`
- Agent handoff rules between phases
- Sprint tracking structure

### Templates

Use files in `templates/` as starting points for your project artifacts. They contain placeholder variables (e.g., `{{project_name}}`) that get filled during workflow execution.

### Checklists

Use files in `checklists/` for validation at key workflow checkpoints.

## Source

Extracted from the official [BMad Method repository](https://github.com/bmad-method/bmad-method). All content is sourced verbatim or consolidated from the original agent definitions, workflow files, templates, and checklists.

## License

See the [original repository](https://github.com/bmad-method/bmad-method) for license terms.
