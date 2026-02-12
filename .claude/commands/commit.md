# Commit - Create Git Commit

Generate and create a well-formatted git commit.

## Variables

- `$1`: Agent name (e.g., "planner", "implementor", "reviewer")
- `$2`: Issue class (e.g., "/chore", "/bug", "/feature")
- `$3`: Issue description

## Instructions

1. **Review changes**
   ```bash
   git diff HEAD
   ```

2. **Generate commit message**

   **Format:** `<agent_name>: <issue_class>: <message>`

   **Rules:**
   - Use present tense (add, fix, update, not added, fixed, updated)
   - Be specific and concise (max 50 characters for message)
   - Focus on "what" and "why", not "how"
   - Remove "/" from issue_class in message

   **Examples:**
   - `planner: feature: add user authentication system`
   - `implementor: bug: fix null pointer in data handler`
   - `reviewer: chore: update dependencies to latest`

3. **Stage and commit**
   ```bash
   git add -A
   git commit -m "<generated_message>"
   ```

4. **Verify commit**
   ```bash
   git log -1 --oneline
   ```

## Output Format

Return ONLY the commit message that was used (without the command).

Example output:
```
planner: feature: add user authentication system
```
