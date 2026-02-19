# Correct Course Workflow — Sprint Change Management

## Objective

Navigate significant changes during sprint execution by analyzing impact, proposing solutions, and routing for implementation.

---

## OpenClaw Integration

**Invocation:** `sessions_spawn` with label `bmad-correct-course`

**Inputs:**

- `PROJECT_ROOT`: Project root directory
- `PLANNING_ARTIFACTS`: Path to planning artifacts
- `IMPLEMENTATION_ARTIFACTS`: Path to implementation artifacts
- `CHANGE_DESCRIPTION`: What changed and why
- `CHANGE_TRIGGER`: What prompted this (bug, requirement change, technical discovery, user feedback)

---

## Critical Rules

- Document output: Updated epics, stories, or PRD sections. Clear, actionable changes.
- This is for SIGNIFICANT changes affecting project direction.
- Work interactively with user — they make final decisions.
- Be factual, not blame-oriented when analyzing issues.

---

## Workflow

### Step 1: Initialize Change Navigation

1. Load project-context.md for project-wide patterns (if exists)
2. Confirm change trigger and gather user description of the issue
3. Ask: "What specific issue or change has been identified that requires navigation?"
4. Verify access to required documents: PRD, Epics, Architecture, UI/UX
5. Ask user for mode preference:
   - **Incremental** (recommended): Refine each edit collaboratively
   - **Batch**: Present all changes at once for review

If change trigger unclear: `HALT: Cannot navigate without clear triggering issue.`
If core documents unavailable: `HALT: Need access to project documents.`

### Step 2: Execute Change Analysis Checklist

Work through each section systematically with the user:

#### Section 1: Understand the Trigger and Context
- [ ] 1.1 Identify triggering story
- [ ] 1.2 Define core problem precisely (categorize: technical limitation, new requirement, misunderstanding, strategic pivot, failed approach)
- [ ] 1.3 Assess initial impact and gather supporting evidence

#### Section 2: Epic Impact Assessment
- [ ] 2.1 Evaluate current epic containing trigger story
- [ ] 2.2 Determine required epic-level changes (modify scope, add epic, remove epic, redefine)
- [ ] 2.3 Review all remaining planned epics for required changes
- [ ] 2.4 Check if issue invalidates future epics or necessitates new ones
- [ ] 2.5 Consider if epic order or priority should change

#### Section 3: Artifact Conflict and Impact Analysis
- [ ] 3.1 Check PRD for conflicts (goals, requirements, MVP scope)
- [ ] 3.2 Review Architecture for conflicts (components, patterns, stack, schemas, APIs, integrations)
- [ ] 3.3 Examine UI/UX specifications for conflicts (components, flows, wireframes, patterns, accessibility)
- [ ] 3.4 Consider impact on other artifacts (deployment, IaC, monitoring, testing, CI/CD)

#### Section 4: Path Forward Evaluation
- [ ] 4.1 Evaluate Option 1: Direct Adjustment — modify/add stories within existing plan
- [ ] 4.2 Evaluate Option 2: Potential Rollback — revert completed work to simplify
- [ ] 4.3 Evaluate Option 3: PRD MVP Review — reduce scope or modify goals
- [ ] 4.4 Select recommended path with rationale (effort, risk, timeline, team morale, sustainability, stakeholder expectations)

#### Section 5: Sprint Change Proposal Components
- [ ] 5.1 Create issue summary
- [ ] 5.2 Document epic impact and artifact adjustment needs
- [ ] 5.3 Present recommended path with rationale
- [ ] 5.4 Define PRD MVP impact and high-level action plan
- [ ] 5.5 Establish agent handoff plan (dev team, PO/SM, PM/Architect)

#### Section 6: Final Review and Handoff
- [ ] 6.1 Review checklist completion
- [ ] 6.2 Verify proposal accuracy
- [ ] 6.3 Obtain explicit user approval
- [ ] 6.4 Update sprint-status.yaml to reflect approved changes
- [ ] 6.5 Confirm next steps and handoff plan

### Step 3: Draft Specific Change Proposals

For each affected artifact, produce explicit edit proposals:

**Story changes:** Show old → new text, include story ID, section, rationale
**PRD modifications:** Specify sections, show current/proposed, explain MVP impact
**Architecture changes:** Identify affected components, diagram updates, ripple effects
**UI/UX updates:** Reference screens/components, show flow changes

If Incremental mode: Present each individually, ask Approve/Edit/Skip
If Batch mode: Collect all and present together

### Step 4: Generate Sprint Change Proposal

Compile document with sections:
1. **Issue Summary** — Problem statement, context, evidence
2. **Impact Analysis** — Epic, story, artifact, technical impacts
3. **Recommended Approach** — Chosen path, rationale, effort/risk estimates
4. **Detailed Change Proposals** — All refined edits grouped by artifact type
5. **Implementation Handoff** — Scope classification (Minor/Moderate/Major), recipients, responsibilities, success criteria

Write to `{PLANNING_ARTIFACTS}/sprint-change-proposal-{date}.md`

### Step 5: Finalize and Route for Implementation

Get explicit user approval.

**If Minor scope:** Route to development team
**If Moderate scope:** Route to Product Owner / Scrum Master
**If Major scope:** Route to Product Manager / Architect

### Step 6: Workflow Completion

Summarize: issue addressed, change scope, artifacts modified, routed to whom.

Confirm deliverables: Sprint Change Proposal, edit proposals with before/after, implementation handoff plan.

```
✅ Correct Course workflow complete!
```

---

## HALT Conditions

- Change scope too large (fundamental pivot — needs full re-planning) → `HALT: {reason}`
- Conflicting requirements needing human resolution → `HALT: {reason}`
- Cannot determine impact without missing context → `HALT: {reason}`
- Trigger unclear or no evidence → `HALT: {reason}`
- User approval not obtained → `HALT: Must have explicit approval`

## Rules

- Always assess ALL artifacts — don't just fix the obvious one
- Keep changes minimal and surgical
- Preserve consistency across documents
- Document rationale for every change
- Handle changes professionally as opportunities to improve
