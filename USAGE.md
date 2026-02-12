# Usage Guide

Detailed guide for using the Agentic Development Template.

## Getting Started

### 1. Initialize Your Project

Run the interactive setup:

```bash
./init.sh
```

Answer the questions about:
- Project location
- Project type (web app, API, script, etc.)
- Features to enable (security hooks, worktrees, etc.)

The script will:
- Copy template files
- Set up Python environment
- Configure git
- Create initial documentation

### 2. Understand Your Codebase

Before making any changes, let the AI understand your project:

```bash
claude -p /prime
```

This will:
- List all project files
- Read README and documentation
- Summarize project structure and patterns

## Working with Slash Commands

### Planning Commands

#### `/feature` - Plan New Feature

```bash
claude -p "/feature" -- "Add user authentication with JWT tokens"
```

Creates a detailed plan including:
- User story
- Problem/solution statements
- Implementation phases
- Step-by-step tasks
- Testing strategy
- Acceptance criteria

#### `/bug` - Plan Bug Fix

```bash
claude -p "/bug" -- "Fix null pointer exception in user profile page"
```

Creates a bug fix plan with:
- Expected vs actual behavior
- Root cause analysis
- Solution approach
- Testing strategy

#### `/chore` - Plan Maintenance

```bash
claude -p "/chore" -- "Update dependencies and refactor error handling"
```

Creates a maintenance plan for:
- Dependency updates
- Refactoring
- Performance improvements
- Code cleanup

### Execution Commands

#### `/implement` - Execute Plan

```bash
claude -p /implement specs/plan-abc12345-feature-name.md
```

Implements the plan:
- Follows step-by-step tasks
- Writes code matching project patterns
- Handles edge cases
- Reports what was done

#### `/test` - Run Tests

```bash
claude -p /test
```

Automatically:
- Detects test framework
- Runs all tests
- Reports results
- Identifies failures

#### `/commit` - Create Commit

```bash
claude -p /commit planner "/feature" "Add user authentication"
```

Creates formatted commit:
```
planner: feature: add user authentication
```

### Utility Commands

#### `/tools` - List Commands

```bash
claude -p /tools
```

Shows all available slash commands with descriptions.

#### `/classify_issue` - Classify Issue

```bash
claude -p /classify_issue "Update the database schema"
```

Returns: `/chore`, `/bug`, `/feature`, `/patch`, or `0`

## Using ADW Workflows

### Basic Plan + Build Workflow

```bash
uv run adws/adw_plan_build.py 123
```

Where `123` is an issue number. This executes:

1. **Classify** - Determines issue type
2. **Plan** - Creates implementation plan
3. **Branch** - Creates git branch
4. **Implement** - Executes the plan
5. **Commit** - Creates commits
6. **Track** - Saves state to `agents/{adw_id}/`

### Interactive Input

If you don't have a GitHub issue:

```bash
uv run adws/adw_plan_build.py 1 <<EOF
Add a dark mode toggle to settings.
Should persist user preference.
Include smooth transitions.
EOF
```

### Resume Workflow

Every workflow has a unique ADW ID. To resume:

```bash
# Check state
cat agents/abc12345/adw_state.json

# Continue with existing ID
uv run adws/adw_plan_build.py 123 abc12345
```

## Understanding State

Each workflow maintains state in `agents/{adw_id}/`:

```
agents/abc12345/
├── adw_state.json           # Persistent state
├── planner/
│   └── raw_output.jsonl    # Planner execution log
└── implementor/
    └── raw_output.jsonl    # Implementor execution log
```

### State Fields

```json
{
  "adw_id": "abc12345",
  "issue_number": 123,
  "branch_name": "feat-123-abc12345-description",
  "plan_file": "specs/plan-abc12345-feature.md",
  "issue_class": "/feature",
  "model_set": "base",
  "all_adws": ["adw_plan_build"]
}
```

## Working with Plans

### Plan Structure

Plans are stored in `specs/`:

```
specs/
├── plan-abc12345-user-auth.md
├── plan-def67890-fix-null-pointer.md
└── plan-ghi11111-update-deps.md
```

### Plan Naming

Format: `plan-{adw_id}-{descriptive-name}.md`

### Editing Plans

You can manually edit plans before implementation:

1. Generate plan: `claude -p "/feature" -- "..."`
2. Edit: `vim specs/plan-abc12345-feature.md`
3. Implement: `claude -p /implement specs/plan-abc12345-feature.md`

## Security Features

When security hooks are enabled:

### Protected Operations

❌ **Blocked:**
- `rm -rf /` or system paths
- Direct `.env` file access
- Force pushes: `git push --force`

✅ **Allowed:**
- `.env.sample` access
- Normal git operations
- Safe file operations

### Audit Logs

All operations are logged to `.claude/logs/`:

```
.claude/logs/
├── pre_tool_use_{sessionId}.json   # Pre-execution validation
└── post_tool_use_{sessionId}.json  # Post-execution audit
```

Add to `.gitignore`:
```
.claude/logs/
```

## Model Selection

The template uses dynamic model selection:

- **base** (default): Uses Sonnet for most operations
- **heavy**: Uses Opus for complex tasks

### Setting Model Set

In ADW state:
```json
{
  "model_set": "heavy"
}
```

Or when calling workflows:
```python
state.update(model_set="heavy")
```

### Model Mapping

- `/classify_issue`: Always Sonnet
- `/chore`, `/bug`, `/feature`: Sonnet (base) or Opus (heavy)
- `/implement`: Sonnet (base) or Opus (heavy)
- `/commit`, `/test`: Always Sonnet

## Best Practices

### 1. Always Start with `/prime`

```bash
claude -p /prime
```

Ensures the AI understands your codebase before making changes.

### 2. Review Plans Before Implementing

1. Generate plan
2. Review the plan file
3. Edit if needed
4. Then implement

### 3. Use Descriptive Issue Descriptions

Good:
```
Add user authentication using JWT tokens.
Store tokens in httpOnly cookies.
Include refresh token mechanism.
Add logout endpoint.
```

Bad:
```
Add auth
```

### 4. Commit Often

Use `/commit` after each logical change:
- After planning
- After implementing
- After fixing tests

### 5. Track with ADW IDs

Save ADW IDs for important workflows:
```bash
echo "abc12345" >> .adw_tracking
```

## Troubleshooting

### "Claude Code CLI not found"

Install Claude Code:
```bash
# Follow instructions at https://claude.com/claude-code
```

### "uv command not found"

Install uv:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### "No module named 'pydantic'"

Install dependencies:
```bash
uv add pydantic
```

### "Permission denied: ./init.sh"

Make executable:
```bash
chmod +x init.sh
```

### Scripts don't execute

Make ADW scripts executable:
```bash
chmod +x adws/*.py
```

## Advanced Usage

### Creating Custom Commands

1. Create file in `.claude/commands/your-command.md`
2. Follow the template structure:
   ```markdown
   # Your Command

   Description

   ## Variables
   - `$1`: First argument

   ## Instructions
   - Step by step instructions

   ## Report
   - What to output
   ```

3. Use it:
   ```bash
   claude -p /your-command arg1 arg2
   ```

### Creating Custom Workflows

1. Copy `adws/adw_plan_build.py` as template
2. Import modules:
   ```python
   from adw_modules import ADWState, execute_template
   ```
3. Implement your workflow logic
4. Make executable:
   ```bash
   chmod +x adws/adw_your_workflow.py
   ```

### Extending State

Add custom fields to ADW state:

```python
state = ADWState(adw_id)
state.update(
    your_custom_field="value",
    another_field=123
)
state.save("your_workflow")
```

## Next Steps

- Explore `.claude/commands/` to see all available commands
- Try the example workflow with a simple task
- Create a custom command for your specific needs
- Enable additional features (worktrees, Notion integration)

Need help? Check the [main README](README.md) or open an issue!
