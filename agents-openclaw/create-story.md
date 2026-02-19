# Create Story Workflow (6-Step)

**🔥 CRITICAL MISSION:** Create the ULTIMATE story context engine that prevents LLM developer mistakes!

**Purpose:** NOT to copy from epics — create comprehensive, optimized story file giving DEV agent EVERYTHING for flawless implementation.

**Prevent:** Reinventing wheels, wrong libraries, wrong file locations, breaking regressions, ignoring UX, vague implementations, lying about completion.

---

## OpenClaw Integration

**Invocation:** `sessions_spawn` with label `bmad-create-story`

**Inputs:** `PROJECT_ROOT`, `PLANNING_ARTIFACTS`, `IMPLEMENTATION_ARTIFACTS`, `STORY_KEY` (optional)

---

## Critical Rules

- 🚨 EXHAUSTIVE ANALYSIS — do NOT skim!
- 🔬 Use subprocesses for parallel analysis if available
- ❓ Save questions for after story is written
- 🎯 ZERO USER INTERVENTION except initial story selection

---

## Workflow

### Step 1: Determine Target Story
- If story key provided: parse epic_num, story_num, story_key
- If not: load sprint-status.yaml, find FIRST backlog story (top to bottom)
- If no backlog: HALT
- If first story in epic: mark epic in-progress
- If epic done: HALT

### Step 2: Load and Analyze Core Artifacts (EXHAUSTIVE)
- **Epics:** Full epic context, all stories for cross-story context, our story's ACs
- **Previous Story Intelligence** (if story_num > 1): dev notes, review feedback, file patterns, lessons
- **Git Intelligence:** recent commits, code patterns, conventions

### Step 3: Architecture Analysis
Extract from architecture.md for this story:
- Technical stack with versions
- Code structure and naming conventions
- API patterns and data contracts
- Database schemas
- Security requirements
- Performance requirements
- Testing standards
- Deployment patterns
- Integration patterns

### Step 4: Web Research
- Latest versions of mentioned libraries/frameworks
- Breaking changes, security updates, deprecations

### Step 5: Create Story File
Write to `{IMPLEMENTATION_ARTIFACTS}/{story_key}.md` with:
- Story (As a/I want/So that)
- Acceptance Criteria (all from epics)
- Tasks/Subtasks (linked to ACs)
- Dev Notes (architecture, tech specs, file structure, testing, previous story intel, git intel, research, references)
- Dev Agent Record (to be filled by dev)

Set status: ready-for-dev

### Step 6: Update Sprint Status and Finalize
- Validate against quality checklist
- Save story file
- Update sprint-status.yaml: story → ready-for-dev
- Report completion

---

## HALT Conditions

- No backlog stories → HALT
- Epic file missing → HALT
- Story already exists → HALT
- Missing critical context → HALT
