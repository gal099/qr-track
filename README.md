# 🚀 Agentic Development Bootstrap

A modular, production-ready template for **Agentic Development Workflows (ADW)** - enabling AI-powered software development from **zero to production**.

**NEW:** Includes `/architect` and `/scaffold` commands to bootstrap projects from scratch with interactive architecture design.

Built from battle-tested patterns extracted from the TAC (Tactical Agentic Coding) course.

## 🎯 What is This?

This template provides everything you need to build applications using AI agents:

- **Structured Commands** - Slash commands for planning, implementing, and testing
- **Workflow Automation** - Composable workflows with state management
- **Security Built-in** - Hooks that prevent dangerous operations
- **Multi-Agent Ready** - Scale to parallel agent execution with git worktrees
- **Production Proven** - Patterns from real-world agentic applications

## ✨ Key Features

### Core Features (Always Included)
- 📋 **Essential Commands** - `/prime`, `/install`, `/feature`, `/bug`, `/chore`, `/implement`, `/test`
- 🔄 **Basic Workflows** - Plan + Build orchestration
- 💾 **State Management** - Persistent workflow tracking
- 🌿 **Git Integration** - Automatic branch creation and commits
- 🎯 **Type Safety** - Pydantic models for all data structures

### Advanced Features (Optional)
- 🔒 **Security Hooks** - Block dangerous commands and protect sensitive files
- 🌳 **Git Worktrees** - Parallel agent execution without interference
- 📊 **Notion Integration** - External task orchestration
- 📈 **KPI Tracking** - Monitor agent effectiveness

## 🚀 Quick Start

### Prerequisites

- [Claude Code CLI](https://claude.com/claude-code) - AI coding assistant
- Git

### Installation (Clone & Go!)

Simply clone this repository into your new project directory:

```bash
# Create your new project
mkdir my-new-project
cd my-new-project

# Clone the bootstrap template (dot at the end clones into current dir)
git clone https://github.com/gal099/agentic-dev-bootstrap.git .

# Remove the git history to start fresh
rm -rf .git
git init

# You're ready! Start with architecture design
claude -p "/architect" -- "Your project idea here"
```

That's it! The template is ready to use immediately.

### What You Get

After cloning, your project has:

```
my-new-project/
├── .claude/
│   ├── commands/      # All slash commands including /architect and /scaffold
│   └── settings.json
├── adws/              # Workflow automation scripts
├── agents/            # Agent execution tracking (empty initially)
├── specs/             # Implementation plans (empty initially)
├── docs/              # Documentation (empty initially)
└── README.md
```

## 📖 Usage

### Basic Workflow

1. **Understand your codebase:**
   ```bash
   claude -p /prime
   ```

2. **Plan a feature:**
   ```bash
   claude -p "/feature" -- "Add user authentication"
   ```

3. **Implement the plan:**
   ```bash
   claude -p /implement specs/plan-abc12345-user-auth.md
   ```

4. **Run tests:**
   ```bash
   claude -p /test
   ```

### Using ADW Scripts

Run the complete Plan + Build workflow:

```bash
uv run adws/adw_plan_build.py 123
```

This will:
1. Classify the issue type
2. Generate an implementation plan
3. Create a git branch
4. Implement the plan
5. Create commits
6. Track state in `agents/{adw_id}/`

## 🏗️ Architecture

### Directory Structure

After cloning, your project structure:

```
your-project/
├── .claude/
│   ├── commands/          # Slash command templates
│   │   ├── architect.md   # 🆕 Bootstrap: Architecture design
│   │   ├── scaffold.md    # 🆕 Bootstrap: Project scaffolding
│   │   ├── prime.md
│   │   ├── feature.md
│   │   ├── bug.md
│   │   ├── implement.md
│   │   └── ...
│   └── settings.json      # Claude Code configuration
│
├── adws/                  # Workflow orchestration
│   ├── adw_modules/       # Core modules
│   │   ├── agent.py       # Claude execution
│   │   ├── state.py       # State management
│   │   ├── git_ops.py     # Git operations
│   │   └── data_types.py  # Type definitions
│   └── adw_plan_build.py  # Example workflow
│
├── agents/                # Workflow execution data (created during use)
│   └── {adw_id}/
│       ├── adw_state.json
│       └── planner/
│
├── specs/                 # Implementation plans (created during use)
│   └── plan-{adw_id}-{name}.md
│
└── docs/                  # Architecture docs (created by /architect)
    ├── PRD.md
    ├── ARCHITECTURE.md
    ├── TECH_STACK.md
    └── DATA_MODEL.md
```

### Core Concepts

#### ADW ID
Every workflow execution gets a unique 8-character identifier:
- Tracks all phases (plan, build, test, review)
- Enables resume and debugging
- Links branches, commits, and PRs

#### State Management
Workflows maintain persistent state:
```json
{
  "adw_id": "abc12345",
  "issue_number": 123,
  "branch_name": "feat-123-abc12345-description",
  "plan_file": "specs/plan-abc12345-feature.md",
  "issue_class": "/feature",
  "model_set": "base"
}
```

#### Composable Workflows
Scripts can be chained via pipes:
```bash
uv run adw_plan.py 123 | uv run adw_build.py | uv run adw_test.py
```

## 🔧 Available Commands

### 🆕 Bootstrap Commands (NEW!)
- `/architect` - **Interactive project architecture design** - Ask critical questions, generate PRD and tech stack decisions
- `/scaffold` - **Generate project structure** - Create directories, dependencies, and boilerplate based on approved architecture

### Project Setup
- `/install` - Install dependencies
- `/prime` - Understand codebase
- `/tools` - List available commands

### Planning
- `/chore` - Plan maintenance tasks
- `/bug` - Plan bug fixes
- `/feature` - Plan new features

### Execution
- `/implement` - Execute implementation plan
- `/commit` - Create formatted git commits
- `/test` - Run test suite

### Utilities
- `/classify_issue` - Classify issue type

## 🔒 Security Features

When you enable security hooks, the system automatically:

### Blocks Dangerous Operations
- ❌ `rm -rf` on system paths
- ❌ Direct `.env` file access
- ❌ Force pushes to protected branches

### Maintains Audit Logs
- ✅ All tool calls logged
- ✅ Session-specific tracking
- ✅ Performance monitoring data

Logs stored in `.claude/logs/` (add to `.gitignore`)

## 🌳 Advanced: Multi-Agent Workflows

For complex projects, enable git worktrees:

```bash
# Each agent gets isolated workspace
trees/
├── abc12345/  # Agent 1 workspace
└── def67890/  # Agent 2 workspace
```

Benefits:
- Parallel execution without conflicts
- Isolated port allocation (9100-9114, 9200-9214)
- Independent testing per agent
- Easy cleanup

## 🆕 Bootstrap Workflow (Start from Zero)

### New Project from Scratch

**Step 1: Architecture Design (Interactive)**
```bash
claude -p "/architect" -- "E-commerce platform with product catalog, shopping cart, and checkout"
```

The agent will:
- Ask critical questions about scale, stack, authentication, etc.
- Generate comprehensive docs:
  - `docs/PRD.md` - Product requirements
  - `docs/ARCHITECTURE.md` - Technical decisions
  - `docs/TECH_STACK.md` - Stack with justifications
  - `docs/DATA_MODEL.md` - Database schemas

**Step 2: Review and Approve**
- Review generated documentation
- Provide feedback or approve

**Step 3: Generate Project Structure**
```bash
claude -p "/scaffold"
```

Creates complete project skeleton:
- Directory structure
- Dependencies configured
- Boilerplate code
- Configuration files
- Development setup

**Step 4: Iterative Development**
```bash
# Start building features
claude -p "/feature" -- "User authentication"
claude -p "/implement" specs/plan-xxx-auth.md
claude -p "/test"
```

---

## 📚 Examples

### Example 1: Simple Feature
```bash
# Plan and implement in one go
uv run adws/adw_plan_build.py 123 <<EOF
Add a dark mode toggle to the settings page.
It should save the preference to localStorage.
EOF
```

### Example 2: Bug Fix Workflow
```bash
# Plan the fix
claude -p "/bug" -- "Fix null pointer error in user profile"

# Review and implement
claude -p /implement specs/plan-abc12345-fix-null-pointer.md

# Test
claude -p /test
```

### Example 3: Chain Multiple Phases
```bash
# Complex workflow with testing
uv run adws/adw_plan.py 123 | \
uv run adws/adw_build.py | \
uv run adws/adw_test.py
```

## 🎓 Learn More

### Core Concepts
- **ADW (Agentic Development Workflow)**: AI-driven SDLC automation
- **Slash Commands**: Template-based AI instructions
- **State Threading**: Persistent workflow data across phases
- **Model Selection**: Dynamic Sonnet/Opus routing based on complexity

### Best Practices
1. **Always start with `/prime`** - Understand before changing
2. **Use structured planning** - Feature/bug/chore templates
3. **Enable security hooks** - Prevent accidents
4. **Track with ADW IDs** - Resume and debug workflows
5. **Compose incrementally** - Chain simple scripts

## 🤝 Contributing

This template is based on the TAC (Tactical Agentic Coding) course patterns. Contributions welcome!

### Areas for Enhancement
- Additional slash commands
- More workflow orchestrators
- Integration templates (GitHub, Notion, Jira)
- Testing frameworks
- Documentation generators

## 📄 License

MIT License - Use freely in your projects

## 🙏 Credits

Built from patterns in the [TAC Agentic Coding Course](https://github.com/your-course-link).

Inspired by real-world production agentic applications including:
- NLQ-to-SQL interfaces
- Multi-agent task boards
- Rapid prototyping systems
- Full SDLC automation

---

**Ready to build with AI agents?** Run `./init.sh` to get started! 🚀
