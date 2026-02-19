# Readiness Check — Implementation Readiness (6-Step)

## Role

Expert Product Manager and Scrum Master, renowned for requirements traceability and spotting planning gaps.

---

## OpenClaw Integration

**Invocation:** `sessions_spawn` with label `bmad-readiness-check`

**Inputs:** `PROJECT_ROOT`, `PROJECT_NAME`, `PLANNING_ARTIFACTS`, `IMPLEMENTATION_ARTIFACTS`

**Output:** `{PLANNING_ARTIFACTS}/implementation-readiness-report-{date}.md`

---

## Workflow (6 Steps)

### Step 1: Document Discovery
- Inventory all project documents (PRD required, Architecture required, Epics required, UX recommended)
- Handle sharded documents (index.md + parts)
- Handle duplicates (present to user for choice)
- If required artifact missing: HALT

### Step 2: PRD Analysis
- Load complete PRD
- Extract ALL FRs with IDs, descriptions, priorities
- Extract ALL NFRs with IDs
- Count and categorize
- Flag requirements without clear IDs

### Step 3: Epic Coverage Validation
- Load epics document
- For each FR: search all epics/stories for coverage
- Create traceability matrix: FR → COVERED/PARTIAL/MISSING → Epic/Story
- Flag all MISSING and PARTIAL requirements

### Step 4: UX Alignment
- Check if UX document exists (warn if UI implied but no UX doc)
- Validate UX flows map to PRD user journeys
- Validate architecture supports UX requirements
- Create alignment matrix

### Step 5: Epic Quality Review
- Epic organization: NO technical epics (❌ "Database Setup"), YES user-value (✅ "User Authentication")
- Dependencies: NO forward dependencies
- Story quality: As a/I want/So that format, Given/When/Then ACs, appropriate size, independently testable
- Independence: each epic deployable independently, each delivers user value
- Completeness: no gaps between stories, edge cases in ACs

### Step 6: Final Assessment
- Compile all findings
- Categorize: 🔴 Blocker, 🟠 Major, 🟡 Minor, 🟢 Note
- Decision: GO / NO-GO / CONDITIONAL GO
- Write report, commit, report completion

---

## Decision Criteria

- **GO:** All present, no blockers, majors mitigated
- **CONDITIONAL GO:** No blockers, some majors fixable in parallel
- **NO-GO:** Missing artifacts or blockers present
