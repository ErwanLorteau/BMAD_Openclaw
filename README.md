# BMad Method × OpenClaw

Implementation of the [BMad Method](https://github.com/bmadcode/BMAD-METHOD) for AI-driven software development, adapted for [OpenClaw](https://github.com/openclaw/openclaw) agent orchestration via `sessions_spawn`.

## Branches

| Branch | Purpose |
|--------|---------|
| **`main`** | Complete implementation — upstream + OpenClaw custom agents |
| **`master`** | Original v1 release (archived) |
| **`bmad-method-core`** | Clean upstream BMad v6 reference |

## Structure

```
agents/                 # 10 upstream BMad agents (official personas)
├── analyst.md                # Mary — business analysis & research
├── architect.md              # Winston — system architecture
├── bmad-master.md            # Orchestrator — routes tasks to agents
├── developer.md              # James — implementation
├── product-manager.md        # John — product strategy
├── qa-engineer.md            # Quinn — quality assurance
├── quick-flow-solo-dev.md    # Barry — rapid solo development
├── scrum-master.md           # Bob — sprint planning & epics
├── tech-writer.md            # Paige — documentation
└── ux-designer.md            # Sally — UX design

agents-openclaw/        # 11 custom execution agents (OpenClaw additions)
├── business-analyst.md       # Requirements & specs
├── code-review.md            # Senior dev review
├── correct-course.md         # Course correction
├── create-story.md           # Story creation from epics
├── dev-story.md              # Story development execution
├── product-owner.md          # Product ownership & priorities
├── qa-tester.md              # Test execution
├── readiness-check.md        # Implementation readiness validation
├── retrospective.md          # Sprint retrospective
├── sprint-status.md          # Sprint status tracking
└── ux-review.md              # UX review validation

templates/              # 17 document templates
├── architecture-decision.md
├── brainstorming-session.md
├── doc-deep-dive.md
├── doc-index.md
├── doc-project-overview.md
├── doc-source-tree.md
├── epics.md
├── prd.md
├── product-brief.md
├── project-brainstorming-context.md
├── project-context.md
├── readiness-report.md
├── research.md
├── sprint-status.yaml
├── story.md
├── tech-spec.md
└── ux-design.md

checklists/             # 7 validation checklists
├── code-review.md
├── correct-course.md
├── create-story.md
├── dev-story.md
├── document-project.md
├── qa-automate.md
└── sprint-planning.md

workflow/               # Orchestration & process
├── orchestrator.md           # Agent routing & task delegation
├── phases.md                 # Development phases & transitions
└── state-machine.md          # Workflow state machine
```

## Workflow

```
Idea → Product Brief → PRD → Architecture → UX Design → Epics & Stories
  → Readiness Check → [Dev Story → Code Review → QA] → Retrospective
```

**Planning** (`agents/`): product-manager, analyst, architect, ux-designer, scrum-master
**Execution** (`agents-openclaw/`): create-story, dev-story, code-review, qa-tester, ux-review, retrospective
**Utility**: bmad-master, quick-flow, correct-course, sprint-status, readiness-check

## Usage with OpenClaw

```javascript
sessions_spawn({
  task: "Create the PRD for our project",
  agentId: "product-manager",
  label: "prd-creation"
});
```

## Team Customization

Teams can customize agent names, inject company context, and remap OpenClaw agent IDs
**without forking** the repo. Create a `bmad.config.yaml` in your project root:

```yaml
company:
  name: "Your Company"
  tech_stack: "Your stack"
agents:
  product-manager:
    name: "Priya"
    openclaw_agent_id: "priya"
```

No config file = current behavior unchanged. See [docs/configuration.md](docs/configuration.md)
for the full reference and all supported fields.

## Credits

Based on the [BMad Method v6](https://github.com/bmadcode/BMAD-METHOD) by BMad Code.
