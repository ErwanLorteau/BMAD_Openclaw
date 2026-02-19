# BMad Method — Workflow Phases

The BMad Method organizes software development into 4 main phases, each with specific workflows and responsible agents.

---

## Phase 1: Analysis

**Purpose:** Research, ideation, and product vision definition.

**Primary Agent:** Mary (Business Analyst) 📊

### Workflows

| Workflow | Trigger | Description |
|----------|---------|-------------|
| Brainstorm Project | BP | Expert guided facilitation through brainstorming techniques with a final report |
| Market Research | MR | Market analysis, competitive landscape, customer needs and trends |
| Domain Research | DR | Industry domain deep dive, subject matter expertise and terminology |
| Technical Research | TR | Technical feasibility, architecture options and implementation approaches |
| Create Product Brief | CB | Guided experience to nail down product idea into an executive brief |

### Outputs
- Research reports (market, domain, technical)
- Product brief
- Brainstorming session results

---

## Phase 2: Planning

**Purpose:** Define requirements, user experience, and product specifications.

**Primary Agents:** John (Product Manager) 📋, Sally (UX Designer) 🎨

### Workflows

| Workflow | Trigger | Agent | Description |
|----------|---------|-------|-------------|
| Create PRD | CP | PM | Produce Product Requirements Document through structured facilitation |
| Validate PRD | VP | PM | Validate PRD is comprehensive, lean, well organized and cohesive |
| Edit PRD | EP | PM | Update an existing PRD |
| Create UX Design | CU | UX | Plan UX patterns, look and feel to inform architecture and implementation |

### Outputs
- Product Requirements Document (PRD)
- UX Design Specification

---

## Phase 3: Solutioning

**Purpose:** Architecture decisions, epic/story breakdown, and implementation readiness.

**Primary Agents:** Winston (Architect) 🏗️, John (Product Manager) 📋

### Workflows

| Workflow | Trigger | Agent | Description |
|----------|---------|-------|-------------|
| Create Architecture | CA | Architect | Document technical decisions for implementation consistency |
| Create Epics & Stories | CE | PM | Transform PRD + Architecture into implementation-ready stories |
| Implementation Readiness | IR | Architect/PM | Validate PRD, Architecture, and Epics are aligned |

### Outputs
- Architecture Decision Document
- Epics and Stories listing
- Implementation Readiness Report

---

## Phase 4: Implementation

**Purpose:** Sprint execution, story development, code review, and delivery.

**Primary Agents:** Bob (Scrum Master) 🏃, Amelia (Developer) 💻

### Workflows

| Workflow | Trigger | Agent | Description |
|----------|---------|-------|-------------|
| Sprint Planning | SP | SM | Generate sprint-status.yaml to sequence all project tasks |
| Create Story | CS | SM | Prepare story with all required context for dev agent |
| Dev Story | DS | Dev | Implement story: write tests and code |
| Code Review | CR | Dev | Adversarial code review across multiple quality facets |
| Sprint Status | — | SM | View current sprint status and next recommended action |
| Course Correction | CC | PM/SM | Navigate major changes discovered mid-implementation |
| Retrospective | ER | SM | Party Mode review of all work completed across an epic |
| QA Automate | QA | QA | Generate automated tests for existing features |

### Outputs
- Sprint status tracking (sprint-status.yaml)
- Story files with comprehensive dev context
- Implemented code with tests
- Code review reports
- Retrospective documents

---

## Quick Flow (Alternative Path)

**Purpose:** Rapid spec-to-implementation for smaller tasks. Minimum ceremony.

**Primary Agent:** Barry (Quick Flow Solo Dev) 🚀

| Workflow | Trigger | Description |
|----------|---------|-------------|
| Quick Spec | QS | Create implementation-ready tech spec through conversational discovery |
| Quick Dev | QD | Implement tech spec end-to-end |
| Code Review | CR | Comprehensive code review |

---

## Supporting Workflows

| Workflow | Trigger | Agent | Description |
|----------|---------|-------|-------------|
| Document Project | DP | Analyst/Writer | Analyze existing project to produce documentation |
| Generate Project Context | — | — | Create project-context.md with critical rules for AI agents |
| Party Mode | — | All | Multi-agent group discussion |
| Advanced Elicitation | — | Any | Deep-dive elicitation techniques during any workflow step |
| Brainstorming | BP | Analyst | Diverse creative techniques for ideation |

---

## Typical Flow

```
Phase 1: Analysis
  └─ Research → Product Brief

Phase 2: Planning
  └─ Create PRD → Create UX Design

Phase 3: Solutioning
  └─ Create Architecture → Create Epics & Stories → Implementation Readiness Check

Phase 4: Implementation
  └─ Sprint Planning → Create Story → Dev Story → Code Review → (repeat) → Retrospective
```

Each phase builds on the artifacts from the previous phase. The Implementation Readiness check at the end of Phase 3 ensures everything is aligned before coding begins.
