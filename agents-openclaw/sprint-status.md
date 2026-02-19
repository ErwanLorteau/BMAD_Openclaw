# Sprint Status Workflow — Multi-Mode Service

## Objective

Summarize sprint-status.yaml, surface risks, and route to the right implementation workflow.

---

## OpenClaw Integration

**Invocation:** `sessions_spawn` with label `bmad-sprint-status`

**Inputs:**

- `PROJECT_ROOT`: Project root directory
- `IMPLEMENTATION_ARTIFACTS`: Path to implementation artifacts
- `SPRINT_STATUS_PATH`: Path to sprint-status.yaml
- `MODE`: `interactive` (default) | `validate` | `data`

---

## Critical Rules

- ⚠️ **ABSOLUTELY NO TIME ESTIMATES** — Do NOT mention hours, days, weeks, or timelines.

---

## Workflow

### Step 0: Determine Execution Mode

- If `mode == data` → Jump to Step 20
- If `mode == validate` → Jump to Step 30
- If `mode == interactive` → Continue to Step 1

### Step 1: Locate Sprint Status File

- Try `{SPRINT_STATUS_PATH}` or `{IMPLEMENTATION_ARTIFACTS}/sprint-status.yaml`
- If not found:
  ```
  ❌ sprint-status.yaml not found.
  Run sprint-planning to generate it, then rerun sprint-status.
  ```
  Exit workflow.

### Step 2: Read and Parse sprint-status.yaml

- Read FULL file
- Parse: generated, project, project_key, tracking_system, story_location
- Parse `development_status` map. Classify keys:
  - **Epics:** keys starting with "epic-" (not ending with "-retrospective")
  - **Retrospectives:** keys ending with "-retrospective"
  - **Stories:** everything else (e.g., 1-2-login-form)
- Map legacy statuses: `drafted` → `ready-for-dev`, `contexted` → `in-progress`
- Count story statuses: backlog, ready-for-dev, in-progress, review, done
- Count epic statuses: backlog, in-progress, done
- Count retrospective statuses: optional, done

**Validate statuses against known values:**
- Valid story: backlog, ready-for-dev, in-progress, review, done, drafted (legacy)
- Valid epic: backlog, in-progress, done, contexted (legacy)
- Valid retrospective: optional, done

If unknown status detected: warn user with correction options.

**Detect risks:**
- Story in "review" → suggest code-review
- Story "in-progress" with no "ready-for-dev" → recommend staying focused
- All epics "backlog" with no ready stories → prompt create-story
- Generated timestamp > 7 days old → warn "may be stale"
- Orphaned stories (no matching epic) → warn
- In-progress epic with no stories → warn

### Step 3: Select Next Action Recommendation

Priority order (sort by epic number, then story number):
1. Any story `in-progress` → recommend `dev-story`
2. Any story `review` → recommend `code-review`
3. Any story `ready-for-dev` → recommend `dev-story`
4. Any story `backlog` → recommend `create-story`
5. Any retrospective `optional` → recommend `retrospective`
6. All done → Congratulate! 🎉

### Step 4: Display Summary

```
📊 Sprint Status

- Project: {project} ({project_key})
- Tracking: {tracking_system}

**Stories:** backlog {N}, ready-for-dev {N}, in-progress {N}, review {N}, done {N}
**Epics:** backlog {N}, in-progress {N}, done {N}

**Next Recommendation:** {workflow} ({story_id})

**Risks:** {list if any}
```

### Step 5: Offer Actions

```
Pick an option:
1) Run recommended workflow now
2) Show all stories grouped by status
3) Show raw sprint-status.yaml
4) Exit
```

---

### Step 20: Data Mode (for other workflows)

- Load and parse (same as Step 2)
- Compute recommendation (same as Step 3)
- Return structured data: next_workflow_id, next_story_id, counts, risks

### Step 30: Validate Mode

- Check file exists
- Validate required metadata fields: generated, project, project_key, tracking_system, story_location
- Verify development_status section exists with entries
- Validate all status values
- Return: is_valid, error/message, suggestion

---

## HALT Conditions

- Sprint status file not found → `HALT: Run sprint-planning first.`
- File corrupted or unparseable → `HALT: {reason}`
