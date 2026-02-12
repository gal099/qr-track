# Tools - List Available Commands

List all available slash commands and their purposes.

## Instructions

1. **List all command files**
   ```bash
   ls -1 .claude/commands/*.md
   ```

2. **Read and summarize each command**
   - Command name
   - Brief description (from first line/title)
   - When to use it

3. **Organize by category**

   **Project Setup:**
   - Commands for initial setup

   **Planning:**
   - Commands for creating implementation plans

   **Execution:**
   - Commands for implementing changes

   **Quality:**
   - Commands for testing and validation

   **Git Operations:**
   - Commands for version control

## Report

Formatted list of available commands:

```
📋 Available Commands:

🚀 Project Setup
  /install - Install project dependencies
  /prime - Understand codebase structure

📝 Planning
  /chore - Plan maintenance tasks
  /bug - Plan bug fixes
  /feature - Plan new features

⚙️ Execution
  /implement - Execute implementation plan

✅ Quality
  /test - Run test suite

🔧 Utilities
  /tools - Show this list
  /classify_issue - Classify issue type
  /commit - Create git commit
```

Include brief usage examples if helpful.
