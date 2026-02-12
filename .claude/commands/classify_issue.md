# Classify Issue

Classify a GitHub issue or task description into a command type.

## Variables

- `$ARGUMENTS`: The issue content (JSON or plain text)

## Instructions

1. **Read the issue carefully**
   - Analyze the title and description
   - Look for keywords and context

2. **Classify into one of these types**
   - `/chore` - Maintenance, refactoring, configuration, dependencies
   - `/bug` - Bug fixes, error corrections, broken functionality
   - `/feature` - New features, enhancements, new functionality
   - `/patch` - Small focused fixes from review feedback
   - `0` - Cannot classify or invalid issue

3. **Classification rules**
   - **Chore**: Update deps, refactor code, improve performance, add tests, documentation updates, configuration changes
   - **Bug**: Fix error, broken feature, incorrect behavior, crash, security vulnerability
   - **Feature**: Add new capability, implement new UI, create new API endpoint, new user story
   - **Patch**: Review change request, fix failing test, address PR comment

4. **Do NOT examine the codebase** - only use the issue content

## Output Format

CRITICAL: Return ONLY the slash command classification. Nothing else.

Valid outputs:
- /chore
- /bug
- /feature
- /patch
- 0

Example outputs (these are the ONLY acceptable formats):
/feature
/bug
0

DO NOT include:
- Explanations or reasoning
- Markdown code blocks or backticks
- Additional text before or after
- Line breaks or extra whitespace

Just output the command. That's it.
