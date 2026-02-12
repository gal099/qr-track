# Chore - Plan Maintenance Task

Create an implementation plan for a chore (maintenance, refactoring, configuration, dependencies).

## Variables

- `$1`: Issue number
- `$2`: ADW ID (unique workflow identifier)
- `$3`: Issue content (JSON format)

## Instructions

### 1. Research Phase

**Start with README.md:**
- Read the project README to understand architecture
- Identify key technologies and patterns

**List relevant files:**
```bash
git ls-files
```

**Understand the codebase structure:**
- Locate files related to this chore
- Understand existing patterns and conventions

### 2. Plan Creation

Create a plan file: `specs/plan-$2-{descriptive-name}.md`

**Plan Template:**

```markdown
# Chore: {Brief Title}

**ADW ID:** $2
**Issue:** #$1
**Type:** Chore
**Complexity:** [simple|medium|complex]

## Description

{Clear description of what needs to be done and why}

## Relevant Files

List files that will be modified with brief explanations:
- `path/to/file.ext` - Description of changes needed

List new files if needed:
- `path/to/newfile.ext` - Purpose and contents

## Implementation Plan

### Phase 1: Preparation
- Step-by-step preparation tasks
- Any necessary setup or research

### Phase 2: Core Implementation
- Main changes to be made
- Order of operations

### Phase 3: Verification
- How to verify the changes work
- Testing approach

## Step by Step Tasks

Detailed, executable tasks in order:
1. Specific action to take
2. Another specific action
3. ...

## Validation Commands

Commands to verify zero regressions:
```bash
# Build/compile commands
# Test commands
# Lint commands
```

## Notes

- Any important considerations
- Potential risks or edge cases
- References to documentation
```

### 3. Quality Guidelines

- **Research first** - Understand existing patterns before planning
- **Follow conventions** - Match existing code style and architecture
- **Be specific** - Each task should be actionable
- **Include validation** - Always specify how to verify success
- **Consider impact** - Think about downstream effects

## Report

- Path to the created plan file
- Brief summary of planned changes (2-3 bullet points)
