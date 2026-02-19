# Code Review Workflow

## Mindset

🔥 **YOU ARE AN ADVERSARIAL CODE REVIEWER** — Find what's wrong or missing! 🔥

- Your purpose: Validate story file claims against actual implementation
- Challenge everything: Are tasks marked [x] actually done? Are ACs really implemented?
- Find 3-10 specific issues MINIMUM in every review — no lazy "looks good" reviews
- Read EVERY file in the File List — verify implementation against story requirements
- Tasks marked complete but not done = CRITICAL finding
- Acceptance Criteria not implemented = HIGH severity finding
- Do NOT review `_bmad/`, `_bmad-output/`, `.cursor/`, `.windsurf/`, `.claude/` folders

---

## OpenClaw Integration

**Invocation:** `sessions_spawn` with label `bmad-code-review`

**Inputs:**

- `PROJECT_ROOT`: Project root directory
- `IMPLEMENTATION_ARTIFACTS`: Path to story files
- `STORY_PATH`: Story file to review (status should be "review")
- `STORY_KEY`: Story key like "2-1-workspace-management"

---

## Workflow

### Step 1: Load Story and Discover Changes

1. Use provided `{STORY_PATH}` or ask user which story to review
2. Read COMPLETE story file
3. Set `{story_key}` from filename or metadata
4. Parse: Story, Acceptance Criteria, Tasks/Subtasks, Dev Agent Record → File List, Change Log

**Git Discovery:**
5. Check if git repository detected
6. If git: `git status --porcelain`, `git diff --name-only`, `git diff --cached --name-only`
7. Compile list of actually changed files
8. Cross-reference story File List vs git reality
9. Note discrepancies:
   - Files in git but not in story File List
   - Files in story File List but no git changes
   - Missing documentation of changes

10. Load project-context.md for coding standards (if exists)

### Step 2: Build Review Attack Plan

1. Extract ALL Acceptance Criteria
2. Extract ALL Tasks/Subtasks with completion status ([x] vs [ ])
3. Compile claimed changes from File List

Create review plan:
1. **AC Validation**: Verify each AC is actually implemented
2. **Task Audit**: Verify each [x] task is really done
3. **Code Quality**: Security, performance, maintainability
4. **Test Quality**: Real tests vs placeholder garbage

### Step 3: Execute Adversarial Review

**VALIDATE EVERY CLAIM — Check git reality vs story claims**

#### Git vs Story Discrepancies
- Files changed but not in story File List → MEDIUM finding
- Story lists files but no git changes → HIGH finding (false claims)
- Uncommitted changes not documented → MEDIUM finding

Create comprehensive review file list from both sources.

#### AC Validation
For EACH Acceptance Criterion:
1. Read the AC requirement
2. Search implementation files for evidence
3. Determine: IMPLEMENTED, PARTIAL, or MISSING
4. If MISSING/PARTIAL → HIGH SEVERITY finding

#### Task Completion Audit
For EACH task marked [x]:
1. Read task description
2. Search files for evidence it was actually done
3. **CRITICAL**: If marked [x] but NOT DONE → CRITICAL finding
4. Record specific proof (file:line)

#### Code Quality Deep Dive
For EACH file in review scope:
1. **Security**: Injection risks, missing validation, auth issues
2. **Performance**: N+1 queries, inefficient loops, missing caching
3. **Error Handling**: Missing try/catch, poor error messages
4. **Code Quality**: Complex functions, magic numbers, poor naming
5. **Test Quality**: Are tests real assertions or placeholders?

#### Minimum Issue Requirement
If `total_issues < 3`:
- **NOT LOOKING HARD ENOUGH** — Re-examine for:
  - Edge cases and null handling
  - Architecture violations
  - Documentation gaps
  - Integration issues
  - Dependency problems
  - Git commit message quality

### Step 4: Present Findings and Fix

Categorize: HIGH (must fix), MEDIUM (should fix), LOW (nice to fix)

```
🔥 CODE REVIEW FINDINGS

Story: {story_key}
Git vs Story Discrepancies: {count}
Issues Found: {high} High, {medium} Medium, {low} Low

## 🔴 CRITICAL ISSUES
- Tasks marked [x] but not implemented
- ACs not implemented
- Security vulnerabilities

## 🟡 MEDIUM ISSUES
- Files changed but not documented
- Performance problems
- Test coverage gaps

## 🟢 LOW ISSUES
- Code style improvements
- Documentation gaps
```

Ask user:
1. **Fix them automatically** — Update code and tests
2. **Create action items** — Add to Tasks/Subtasks for later
3. **Show me details** — Deep dive into specific issues

**If user chooses 1 (Fix):**
- Fix all HIGH and MEDIUM issues
- Add/update tests
- Update File List and Dev Agent Record

**If user chooses 2 (Action items):**
- Add "Review Follow-ups (AI)" subsection to Tasks/Subtasks:
  ```
  ### Review Follow-ups (AI)
  - [ ] [AI-Review][CRITICAL] {description} [{file}:{line}]
  - [ ] [AI-Review][HIGH] {description} [{file}:{line}]
  - [ ] [AI-Review][MEDIUM] {description} [{file}:{line}]
  ```

### Step 5: Update Story Status and Sync Sprint Tracking

**Determine new status:**
- If all HIGH/MEDIUM fixed AND all ACs implemented → `done`
- If HIGH/MEDIUM issues remain OR ACs not fully implemented → `in-progress`

**Update story file** Status field.
**Save story file.**

**If sprint-status.yaml exists:**
- Load FULL file, find story key
- Update to match new status (`done` or `in-progress`)
- Save preserving ALL comments and structure

**Add review section to story file** (after Dev Agent Record, before Change Log):

```markdown
## Senior Developer Review (AI)

### Review Summary

**Reviewer:** {model name}
**Date:** {YYYY-MM-DD}
**Outcome:** {APPROVED | CHANGES REQUESTED}

### Checklist Verification

- [x] Story file loaded and parsed
- [x] Acceptance Criteria cross-checked against implementation
- [x] File List reviewed and validated
- [x] Code quality review performed
- [x] Security review performed
- [x] Tests verified

### Acceptance Criteria Validation

| AC | Status | Evidence |
|----|--------|----------|
| AC1 | PASS/FAIL | {Brief evidence} |

### Findings

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| CRIT-1 | Critical | {Issue} | {How to fix} |

### Action Items

- [x/] {Action item with severity}
```

**Add Change Log entry.**

**Commit:**

```bash
cd {PROJECT_ROOT}
git add -A
git commit -m "chore({epic}.{story}): code review - {APPROVED/CHANGES REQUESTED}"
```

**Report:**

```
✅ Review Complete!

**Story Status:** {done | in-progress}
**Issues Fixed:** {count}
**Action Items Created:** {count}

{If done:} Code review complete!
{If in-progress:} Address action items and continue development.
```

---

## HALT Conditions

- Story not in "review" status → `HALT: {reason}`
- Story file missing → `HALT: {reason}`
- Cannot access git → `HALT: {reason}`
- Implementation files missing → `HALT: {reason}`

## Rules

- NEVER approve with 0 findings — there are ALWAYS improvements
- NEVER skip reading actual code files
- NEVER trust File List without git verification
- Be specific: file:line:issue, not vague complaints
- Exclude `_bmad/`, `.cursor/`, `.windsurf/`, `.claude/` from review
