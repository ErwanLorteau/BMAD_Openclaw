# BMad Method — State Machine & Handoff Rules

## Epic Status Flow

```
backlog → in-progress → done
```

| Status | Meaning |
|--------|---------|
| **backlog** | Epic not yet started |
| **in-progress** | Epic actively being worked on (stories being created/implemented) |
| **done** | All stories in epic completed |

**Transitions:**
- `backlog → in-progress`: Automatically when first story is created (via create-story)
- `in-progress → done`: Manually when all stories reach "done" status

---

## Story Status Flow

```
backlog → ready-for-dev → in-progress → review → done
```

| Status | Meaning |
|--------|---------|
| **backlog** | Story only exists in epic file |
| **ready-for-dev** | Story file created in stories folder (via create-story workflow) |
| **in-progress** | Developer actively working on implementation (via dev-story workflow) |
| **review** | Implementation complete, ready for code review (via dev-story completion) |
| **done** | Story completed (via code-review approval) |

**Transitions:**
- `backlog → ready-for-dev`: SM creates story file via create-story workflow
- `ready-for-dev → in-progress`: Dev agent starts implementation via dev-story workflow
- `in-progress → review`: Dev agent completes all tasks and tests pass
- `review → done`: Code review passes with all HIGH/MEDIUM issues resolved
- `review → in-progress`: Code review finds issues that need fixing

---

## Retrospective Status

```
optional ↔ done
```

| Status | Meaning |
|--------|---------|
| **optional** | Ready to be conducted but not required |
| **done** | Retrospective has been completed |

---

## Sprint Status File (sprint-status.yaml)

The sprint-status.yaml file tracks the status of all epics, stories, and retrospectives.

### Structure

```yaml
generated: 2025-01-15
project: My Project
project_key: PROJ
tracking_system: file-system
story_location: "stories/"

development_status:
  epic-1: in-progress
  1-1-user-authentication: done
  1-2-account-management: in-progress
  1-3-data-model: backlog
  epic-1-retrospective: optional

  epic-2: backlog
  2-1-feature-x: backlog
  2-2-feature-y: backlog
  epic-2-retrospective: optional
```

### Rules
- Epic transitions to "in-progress" automatically when first story is created
- Stories are typically worked in order, but parallel work is supported
- SM typically creates next story after previous one is "done" to incorporate learnings
- Dev moves story to "review", then runs code-review (fresh context, different LLM recommended)
- Never downgrade status (e.g., don't change "done" to "ready-for-dev")

---

## Agent Handoff Rules

### Phase Transitions

| From | To | Handoff Artifact |
|------|----|-----------------|
| Analyst → PM | Product Brief | Brief document triggers PRD creation |
| PM → UX Designer | PRD | PRD informs UX design exploration |
| PM → Architect | PRD + UX Design | Both inform architecture decisions |
| Architect → PM | Architecture Doc | PM creates epics with architecture context |
| PM → SM | Epics & Stories | SM begins sprint planning |
| SM → Dev | Story File | Story file contains all implementation context |
| Dev → Dev (Review) | Completed Story | Code review in fresh context, different LLM recommended |
| Dev → SM | Reviewed Story | SM creates next story incorporating learnings |
| SM → All Agents | Epic Complete | Retrospective triggers Party Mode review |

### Within Implementation Phase

```
SM: Sprint Planning → sprint-status.yaml
     ↓
SM: Create Story → story-file.md (ready-for-dev)
     ↓
Dev: Dev Story → implementation + tests (review)
     ↓
Dev: Code Review → findings + fixes (done or in-progress)
     ↓
SM: Create Next Story (incorporating learnings)
     ↓
... repeat until epic complete ...
     ↓
SM: Retrospective → lessons learned + action items
```

### Course Correction

When a major change is discovered mid-implementation:
1. PM or SM initiates Course Correction workflow
2. Impact analysis across all artifacts (PRD, Architecture, Epics, UI/UX)
3. Sprint Change Proposal generated with edit proposals
4. User approves changes
5. Handoff based on scope:
   - **Minor**: Direct to dev team
   - **Moderate**: PO/SM for backlog reorganization
   - **Major**: PM/Architect for fundamental replan

---

## Sprint Status Workflow Recommendations

The Sprint Status workflow analyzes current state and recommends next action:

1. If any story `in-progress` → recommend `dev-story`
2. If any story `review` → recommend `code-review`
3. If any story `ready-for-dev` → recommend `dev-story`
4. If any story `backlog` → recommend `create-story`
5. If any retrospective `optional` → recommend `retrospective`
6. Otherwise → All done! 🎉
