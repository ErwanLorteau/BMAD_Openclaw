# Retrospective Workflow — Epic Completion Review

## Objective

Run after epic completion to review overall success, extract lessons learned, and explore if new information emerged that might impact the next epic.

---

## OpenClaw Integration

**Invocation:** `sessions_spawn` with label `bmad-retrospective`

**Inputs:**

- `PROJECT_ROOT`: Project root directory
- `IMPLEMENTATION_ARTIFACTS`: Path to story files
- `PLANNING_ARTIFACTS`: Path to planning docs
- `EPIC_NUMBER`: The epic to review

---

## Critical Rules

- ⚠️ **ABSOLUTELY NO TIME ESTIMATES** — NEVER mention hours, days, weeks, months, or ANY time-based predictions. AI has fundamentally changed development speed.
- **PARTY MODE PROTOCOL**: ALL agent dialogue MUST use format: "Name (Role): dialogue"
- Scrum Master (Bob) facilitates — psychological safety is paramount — NO BLAME
- Focus on systems, processes, and learning — not individual performance
- Everyone contributes with specific examples preferred
- Two-part format: (1) Epic Review + (2) Next Epic Preparation

---

## Workflow

### Step 1: Epic Discovery — Find Completed Epic with Priority Logic

1. **PRIORITY 1:** Check `{IMPLEMENTATION_ARTIFACTS}/sprint-status.yaml`
   - Load FULL file, read ALL entries
   - Find highest epic number with at least one story marked "done"
   - Present finding to user: "Based on sprint-status, it looks like Epic {N} was recently completed. Is that the epic to review?"
   - WAIT for user to confirm or correct

2. **PRIORITY 2:** If not found in sprint-status, ask user directly

3. **PRIORITY 3:** Fallback to scanning story files for highest numbered epic

4. **Verify epic completion:**
   - Count total stories and done stories for this epic
   - If incomplete: present options (complete remaining stories, or continue with partial retro)
   - If complete: proceed

### Step 2: Deep Story Analysis — Extract Lessons from Implementation

For each story in the epic, read the complete story file and extract:

**Dev Notes and Struggles:**
- Where developers struggled or made mistakes
- Unexpected complexity or gotchas
- Technical decisions that didn't work out
- Where estimates were way off

**Review Feedback Patterns:**
- Recurring feedback themes across stories
- Which issues came up repeatedly
- Quality concerns or architectural misalignments

**Lessons Learned:**
- Explicit lessons documented during development
- "Aha moments" or breakthroughs
- What would be done differently

**Technical Debt Incurred:**
- Shortcuts taken and why
- Debt items affecting next epic
- Severity and priority

**Testing and Quality Insights:**
- Testing challenges or surprises
- Bug patterns or regression issues
- Coverage gaps

**Synthesize patterns across ALL stories:**
- Common struggles (appeared in 2+ stories)
- Recurring review feedback
- Breakthrough moments
- Velocity patterns
- Team collaboration highlights

### Step 3: Load and Integrate Previous Epic Retrospective

If previous epic exists (epic_num - 1):
- Search for previous retrospectives: `{IMPLEMENTATION_ARTIFACTS}/epic-{prev}-retro-*.md`
- If found:
  - Extract action items, lessons, process improvements, tech debt, team agreements
  - Cross-reference with current epic:
    - **Action Item Follow-Through:** For each, mark ✅ Completed, ⏳ In Progress, ❌ Not Addressed
    - **Lessons Applied:** Check if team applied them, with evidence
    - **Process Improvements Effectiveness:** Did changes help?
    - **Technical Debt Status:** Addressed or grew?
  - Prepare "continuity insights" for discussion

### Step 4: Preview Next Epic with Change Detection

Calculate next epic number. Load next epic if it exists.

If found:
- Analyze: objectives, stories, complexity, dependencies, risks
- Identify dependencies on completed epic
- Note preparation gaps (technical setup, knowledge, refactoring, documentation)
- Check technical prerequisites

### Step 5: Initialize Retrospective with Rich Context

Load agent configurations. Present epic summary:

```
═══════════════════════════════════════════════════════
🔄 TEAM RETROSPECTIVE - Epic {N}: {Title}
═══════════════════════════════════════════════════════

Delivery Metrics:
- Completed: {X}/{Y} stories ({Z}%)
- Blockers encountered: {N}
- Technical debt items: {N}

Quality and Technical:
- Test coverage: {info}
- Production incidents: {N}

Business Outcomes:
- Goals achieved: {X}/{Y}
```

Ground rules: psychological safety, no blame, systems focus, every voice matters.

WAIT for user to respond.

### Step 6: Epic Review Discussion — What Went Well, What Didn't

Facilitate natural team discussion using Party Mode:
- Start with successes — each agent contributes
- **Bring user ({user_name}) in as Project Lead** — ask their perspective
- Transition to challenges with care
- Show authentic disagreements and resolve them constructively
- Weave in patterns from Step 2 story analysis
- Reference specific stories and evidence
- If previous retro exists, review action item follow-through

WAIT for user at key moments.

### Step 7: Next Epic Preparation Discussion

If next epic exists:
- Discuss dependencies, technical concerns, knowledge gaps
- Create tension between business pressure and technical reality
- Explore middle ground and compromise
- Identify: critical preparation (must do before epic), parallel preparation (during early stories), nice-to-have

WAIT for user to validate preparation plan.

### Step 8: Synthesize Action Items

Create SMART action items with:
- Clear description, assigned owner, timeline, success criteria
- Categories: Process Improvements, Technical Debt, Documentation, Team Agreements
- Preparation tasks for next epic with owners and estimates
- Critical path items

**CRITICAL ANALYSIS — Detect Significant Changes:**
Check if any of these are true:
- Architectural assumptions proven wrong
- Major scope changes
- Technical approach needs fundamental change
- Dependencies not accounted for
- User needs significantly different
- Performance/scalability concerns
- Security/compliance issues
- Integration assumptions incorrect

If significant discoveries detected:
```
🚨 SIGNIFICANT DISCOVERY ALERT
Epic {next} needs updating based on discoveries from Epic {current}.
```

WAIT for user to decide how to handle.

### Step 9: Critical Readiness Exploration

Final readiness check — explore through conversation:
- Testing and quality state
- Deployment status
- Stakeholder acceptance
- Technical health/stability
- Unresolved blockers

WAIT for user at each checkpoint.

### Step 10: Retrospective Closure

Summarize key takeaways, commitments, next steps. Celebrate accomplishments.

### Step 11: Save Retrospective and Update Sprint Status

1. Save comprehensive retrospective to: `{IMPLEMENTATION_ARTIFACTS}/epic-{N}-retro-{date}.md`
2. Update sprint-status.yaml: `epic-{N}-retrospective` → `done`

### Step 12: Final Summary and Handoff

```
✅ Retrospective Complete!

**Epic Review:** Epic {N}: {Title} reviewed
**Commitments:** {action_count} action items, {prep_count} prep tasks, {critical_count} critical path items

**Next Steps:**
1. Review retrospective summary
2. Execute preparation sprint
3. Review action items in next standup
{If epic update needed:} 4. Schedule Epic {next} planning review session
```

---

## Quality Gates

- [ ] All stories in epic reviewed
- [ ] Code patterns documented with examples
- [ ] Tech debt catalogued with impact assessment
- [ ] Previous retro follow-through analyzed
- [ ] Next epic preparation plan created
- [ ] Significant changes detected and flagged
- [ ] SMART action items created with owners
- [ ] Sprint status updated
- [ ] Retrospective file created and saved

## HALT Conditions

- Epic not fully complete (and user declines partial retro) → `HALT`
- Story files missing or unreadable → `HALT: {reason}`
- Cannot access codebase → `HALT: {reason}`
