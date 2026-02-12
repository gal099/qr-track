# Feature - Plan New Feature

Create a comprehensive implementation plan for a new feature.

## Variables

- `$1`: Issue number
- `$2`: ADW ID (unique workflow identifier)
- `$3`: Issue content (JSON format)

## Instructions

### 1. Research Phase

**Understand the project:**
- Read README.md for architecture overview
- List all files with `git ls-files`
- Identify existing patterns and conventions

**Analyze requirements:**
- Extract user story from issue
- Identify acceptance criteria
- Clarify scope and boundaries

**Survey relevant code:**
- Find similar existing features
- Understand current architecture
- Identify integration points

### 2. Plan Creation

Create a plan file: `specs/plan-$2-{descriptive-name}.md`

**Plan Template:**

```markdown
# Feature: {Brief Title}

**ADW ID:** $2
**Issue:** #$1
**Type:** Feature
**Complexity:** [simple|medium|complex]

## Feature Description

{Clear, concise description of what the feature does}

## User Story

**As a** {type of user}
**I want** {goal/desire}
**So that** {benefit/value}

## Problem Statement

{What problem does this solve? Why is it needed?}

## Solution Statement

{How does this feature solve the problem? High-level approach}

## Relevant Files

### Existing Files to Modify
- `path/to/file.ext` - {Changes needed and why}

### New Files to Create
- `path/to/newfile.ext` - {Purpose and key components}

## Architecture Overview

{Diagram or description of how components interact}

## Implementation Plan

### Phase 1: Foundation
**Goal:** {Setup infrastructure/data models/utilities}

Tasks:
- Create/modify foundational components
- Setup configuration
- Add dependencies if needed

### Phase 2: Core Implementation
**Goal:** {Implement main feature logic}

Tasks:
- Implement business logic
- Add API endpoints/UI components
- Wire up integrations

### Phase 3: Integration & Polish
**Goal:** {Connect to existing system, add UX polish}

Tasks:
- Integrate with existing features
- Add error handling
- Improve UX/feedback

## Step by Step Tasks

Detailed, executable tasks (execute top to bottom):

1. **{Task category}**
   - Specific subtask
   - Another subtask

2. **{Next category}**
   - Specific subtask
   - ...

## Testing Strategy

### Unit Tests
- Test {specific component} with {scenarios}
- Verify {behavior} when {condition}

### Integration Tests
- Test {workflow} end-to-end
- Verify {integration point}

### E2E Tests (if UI feature)
Create E2E test file for critical user flows:
- Test file path: `{path}`
- Key scenarios to test

## Acceptance Criteria

- [ ] {Specific, measurable criteria}
- [ ] {Another criteria}
- [ ] {Edge case handling}
- [ ] {Performance requirement}
- [ ] Tests pass
- [ ] Documentation updated

## Validation Commands

```bash
# Install dependencies (if new ones added)
# Run tests
# Start dev server
# Build production
```

## Technical Considerations

### Dependencies
- {New dependencies and why they're needed}

### Performance
- {Expected impact on performance}

### Security
- {Security implications and mitigations}

### Backwards Compatibility
- {Impact on existing features}

## Future Enhancements

{Optional improvements that could be added later}

## Notes

- Links to relevant documentation
- Design decisions and rationale
- Known limitations
```

### 3. Quality Guidelines

- **Research thoroughly** - Understand before designing
- **Follow patterns** - Use existing conventions
- **Design for extension** - Make it maintainable
- **Test comprehensively** - Include E2E for UI features
- **Document decisions** - Explain the "why"
- **Think in phases** - Break down complexity
- **Validate everything** - Ensure zero regressions

## Report

- Path to the created plan file
- 3-5 bullet points summarizing:
  - What the feature does
  - Key technical decisions
  - Main implementation phases
