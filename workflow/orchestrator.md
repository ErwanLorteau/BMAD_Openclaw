# BMad Method — Orchestrator Rules

## Config Layer

The config layer allows teams to customize agent personas and inject company context
without forking or modifying any BMAD_Openclaw framework files.

> **Note:** `bmad.config.yaml` is user-created and never overwritten by a framework update.
> Agent names in this file reflect upstream defaults. If `bmad.config.yaml` is present,
> names and emojis may be remapped per your team's configuration.

### Config Discovery

At session start, apply the following rules **once** and hold results as "active config":

1. **CHECK** — Does `bmad.config.yaml` exist in the project root?
   - **YES** → Read and parse it. Proceed to step 2.
   - **NO** → All agent file defaults apply unchanged. Skip all remaining config steps.

2. **VALIDATE** — If a `version:` field is present and its value is not `"1"`, emit a
   warning and continue (do not abort).

3. **WARN** — If any key under `agents:` does not match a canonical role slug
   (`analyst`, `architect`, `developer`, `product-manager`, `qa-engineer`,
   `scrum-master`, `tech-writer`, `ux-designer`, `bmad-master`), emit a warning
   (likely a typo). Do not abort.

### Agent Name Resolution

When activating any agent role:

1. **FIND** — Look up `agents.<role-key>` in the active config.
   - Role not in config → use all file defaults for that agent. Stop here.
   - Role in config → proceed.

2. **APPLY** field-level overrides (only for fields explicitly present in config):
   - `agents.<role>.name` → use as the agent's display name
   - `agents.<role>.emoji` → use in the agent header
   - `agents.<role>.persona_append` → append as an additional paragraph in the Persona section
   - `agents.<role>.openclaw_agent_id` → use for `sessions_spawn` agentId

### Company Context Injection

If `company.*` fields are present in the active config:

- Make `company.name`, `company.context`, `company.tech_stack`, and `company.conventions`
  available as background knowledge when acting as **any** agent.
- Do **not** expose raw config YAML verbatim to users unless explicitly asked.

### Template Variable Resolution

Agent files may contain `{{var|default}}` placeholders. Resolution rules:

- `{{company_name}}` → `company.name` (or empty string if not set)
- `{{company_context}}` → `company.context` (or empty string)
- `{{tech_stack}}` → `company.tech_stack` (or empty string)
- `{{conventions}}` → `company.conventions` (or empty string)
- `{{agent_name|DEFAULT}}` → `agents.<role>.name` from config, or `DEFAULT` if not set
- `{{agent_emoji|DEFAULT}}` → `agents.<role>.emoji` from config, or `DEFAULT` if not set

The text after `|` is the **inline default** — the value used when the variable is absent
from config. Agent files remain fully functional and readable without any config present.

---

## Workflow Execution Engine

The workflow execution engine governs all BMad workflow processing. Every workflow follows these rules.

### Core Mandates

- **Always read COMPLETE files** — NEVER use offset/limit when reading any workflow-related files
- **Instructions are MANDATORY** — either as file path, steps, or embedded list in YAML, XML, or markdown
- **Execute ALL steps in instructions IN EXACT ORDER**
- **Save to output file after EVERY template-output tag**
- **NEVER skip a step** — you are responsible for every step's execution without fail or excuse

### Step Execution Rules

1. Steps execute in exact numerical order (1, 2, 3...)
2. Optional steps: Ask user unless YOLO mode active
3. Template-output tags: Save content, discuss with user, NEVER proceed until user indicates to proceed (unless YOLO mode)

### Execution Modes

| Mode | Behavior |
|------|----------|
| **Normal** | Full user interaction and confirmation of EVERY step at EVERY template output |
| **YOLO** | Skip all confirmations and elicitation, minimize prompts, produce workflow automatically by simulating expert user responses |

### User Options at Checkpoints

At each template-output checkpoint, the user can choose:
- **[a] Advanced Elicitation** — Start deep-dive elicitation techniques on current section
- **[c] Continue** — Proceed to next step
- **[p] Party-Mode** — Start multi-agent group discussion on current topic
- **[y] YOLO** — Auto-complete the rest of the document without further prompts

---

## Step-File Architecture

All multi-step BMad workflows use the step-file architecture pattern:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file that must be followed exactly
- **Just-In-Time Loading**: Only the current step file is in memory — never load future step files until told to do so
- **Sequential Enforcement**: Steps must be completed in order, no skipping or optimization allowed
- **State Tracking**: Document progress in output file frontmatter using `stepsCompleted` array
- **Append-Only Building**: Build documents by appending content as directed to the output file

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order, never deviate
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: Only proceed to next step when user selects Continue
5. **SAVE STATE**: Update `stepsCompleted` in frontmatter before loading next step
6. **LOAD NEXT**: When directed, read fully and follow the next step file

### Critical Rules (NO EXCEPTIONS)

- 🛑 **NEVER** load multiple step files simultaneously
- 📖 **ALWAYS** read entire step file before execution
- 🚫 **NEVER** skip steps or optimize the sequence
- 💾 **ALWAYS** update frontmatter of output files when writing final output for a step
- 🎯 **ALWAYS** follow the exact instructions in the step file
- ⏸️ **ALWAYS** halt at menus and wait for user input
- 📋 **NEVER** create mental todo lists from future steps

---

## Workflow Configuration (workflow.yaml)

Every workflow has a configuration file that defines:

### Required Fields
- `name` — Workflow identifier
- `description` — What the workflow does
- `config_source` — Path to module config (REQUIRED for all modules)

### Common Fields
- `instructions` — Path to instruction file (markdown, XML, or embedded)
- `validation` — Path to validation checklist
- `template` — Path to output template (or `false` for action-only workflows)
- `default_output_file` — Where to write the output document
- `installed_path` — Base path for the workflow's files

### Input File Patterns
Workflows can define `input_file_patterns` for smart document discovery:

```yaml
input_file_patterns:
  prd:
    whole: "{planning_artifacts}/*prd*.md"
    sharded: "{planning_artifacts}/*prd*/*.md"
    load_strategy: "FULL_LOAD"
  epics:
    whole: "{planning_artifacts}/*epic*.md"
    sharded_single: "{planning_artifacts}/*epic*/epic-{{epic_num}}.md"
    load_strategy: "SELECTIVE_LOAD"
```

### Load Strategies
- **FULL_LOAD** — Load ALL files in the directory
- **SELECTIVE_LOAD** — Load specific files using template variables
- **INDEX_GUIDED** — Load index.md, analyze structure, intelligently load relevant docs

---

## Smart Document Discovery Protocol

When a workflow invokes the `discover_inputs` protocol:

1. **Parse** input_file_patterns from workflow.yaml
2. **Try sharded documents first** — check for directory-based document splits
3. **Fall back to whole documents** — single file versions
4. **Handle not found gracefully** — set content variable to empty, note as unavailable
5. **Report discovery results** — list all loaded content variables with file counts

---

## Agent Routing

### By Phase
| Phase | Primary Agent(s) |
|-------|-----------------|
| Analysis | Mary (Analyst) |
| Planning | John (PM), Sally (UX) |
| Solutioning | Winston (Architect), John (PM) |
| Implementation | Bob (SM), Amelia (Dev), Quinn (QA) |
| Quick Flow | Barry (Solo Dev) |

### By Task Type
| Need | Route To |
|------|----------|
| Research / Analysis | Mary (Analyst) |
| Requirements / PRD | John (PM) |
| UX Design | Sally (UX Designer) |
| Architecture | Winston (Architect) |
| Sprint Management | Bob (Scrum Master) |
| Code Implementation | Amelia (Developer) |
| Testing | Quinn (QA) |
| Documentation | Paige (Tech Writer) |
| Quick Feature | Barry (Quick Flow) |
| General Guidance | BMad Master |

---

## Party Mode

Party Mode enables multi-agent group discussions. Any workflow checkpoint can launch Party Mode where all agents participate with their unique perspectives.

### Protocol
- ALL agent dialogue MUST use format: `Name (Role): dialogue`
- Create natural back-and-forth with user actively participating
- Show disagreements, diverse perspectives, authentic team dynamics
- 2-3 most relevant agents selected for balanced perspective
- User can exit Party Mode at any time to return to normal workflow

---

## Advanced Elicitation

At any workflow checkpoint, the user can invoke Advanced Elicitation to deep-dive into the current section using specialized techniques:

- Methods loaded from a CSV registry covering core, structural, risk, and creative categories
- 5 context-appropriate methods presented for selection
- Methods applied iteratively to enhance current content
- Enhanced content replaces original section in the output document
- User can reshuffle methods, list all, or proceed at any time
