# Bug - Plan Bug Fix

Create an implementation plan for fixing a bug.

## Variables

- `$1`: Issue number
- `$2`: ADW ID (unique workflow identifier)
- `$3`: Issue content (JSON format)

## Instructions

### 1. Investigation Phase

**Understand the bug:**
- Read the issue carefully
- Note expected vs actual behavior
- Identify reproduction steps

**Locate the problem:**
```bash
git ls-files
```
- Search for relevant files using grep/find
- Read related code sections
- Trace the execution flow

**Identify root cause:**
- Understand why the bug occurs
- Identify all affected areas

### 2. Plan Creation

Create a plan file: `specs/plan-$2-{descriptive-name}.md`

**Plan Template:**

```markdown
# Bug Fix: {Brief Title}

**ADW ID:** $2
**Issue:** #$1
**Type:** Bug
**Severity:** [low|medium|high|critical]

## Problem Description

**Expected Behavior:**
{What should happen}

**Actual Behavior:**
{What actually happens}

**Reproduction Steps:**
1. Step 1
2. Step 2
3. ...

## Root Cause Analysis

{Technical explanation of why the bug occurs}

## Relevant Files

Files to be modified:
- `path/to/file.ext` - Specific changes needed

## Solution Approach

### Phase 1: Fix Core Issue
- Specific changes to resolve the bug
- Why this approach solves the problem

### Phase 2: Prevent Recurrence
- Add tests to catch this bug
- Add defensive code if needed

### Phase 3: Verification
- Test the fix manually
- Run automated tests
- Check for regressions

## Step by Step Tasks

1. Modify {file} to fix {specific issue}
2. Add test case for {scenario}
3. Verify fix with {validation method}
4. ...

## Testing Strategy

**Unit Tests:**
- Test case for the bug scenario
- Edge cases to verify

**Integration Tests:**
- End-to-end verification if applicable

**Manual Testing:**
- Steps to manually verify the fix

## Validation Commands

```bash
# Commands to verify the fix
# Test commands
# Build commands
```

## Risk Assessment

- **Scope:** [minimal|moderate|extensive]
- **Breaking Changes:** [yes|no]
- **Rollback Plan:** {If needed}

## Notes

- Related issues or bugs
- Documentation updates needed
- Performance implications
```

### 3. Quality Guidelines

- **Understand before fixing** - Don't guess, investigate thoroughly
- **Fix root cause** - Not just symptoms
- **Add tests** - Prevent regression
- **Minimal changes** - Only fix what's broken
- **Verify thoroughly** - Test edge cases

## Report

- Path to the created plan file
- One-line summary of the root cause
- One-line summary of the solution
