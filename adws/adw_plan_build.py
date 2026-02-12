#!/usr/bin/env python3
"""
ADW Plan + Build - Basic workflow for planning and implementing changes.

Usage:
    uv run adw_plan_build.py <issue_number> [adw_id]

Example:
    uv run adw_plan_build.py 123
    uv run adw_plan_build.py 123 abc12345
"""

import sys
import json
import subprocess
from pathlib import Path

# Add adw_modules to path
sys.path.insert(0, str(Path(__file__).parent / "adw_modules"))

from adw_modules import (
    ADWState,
    ensure_adw_id,
    AgentTemplateRequest,
    prompt_claude_code_with_retry,
    create_branch,
    commit_changes,
    generate_branch_name,
)


def fetch_github_issue(issue_number: int) -> dict:
    """
    Fetch issue from GitHub using gh CLI.

    Returns: dict with 'title' and 'body' keys
    """
    try:
        result = subprocess.run(
            ["gh", "issue", "view", str(issue_number), "--json", "title,body"],
            capture_output=True,
            text=True,
            check=True
        )
        issue_data = json.loads(result.stdout)
        return issue_data
    except subprocess.CalledProcessError as e:
        print(f"Error fetching issue from GitHub: {e.stderr}")
        print("Make sure you have gh CLI installed and authenticated")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error parsing GitHub issue data: {e}")
        sys.exit(1)


def extract_classification(text: str) -> str:
    """
    Extract slash command from Claude's response.

    Handles cases where Claude includes explanation + classification.
    """
    import re

    # Look for /chore, /bug, /feature, /patch, or 0 in the text
    patterns = [
        r'(/chore|/bug|/feature|/patch)',  # Slash commands
        r'\b(0)\b',  # Just 0
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1)

    # If nothing found, return the last line (likely contains the classification)
    lines = text.strip().split('\n')
    last_line = lines[-1].strip().strip('`').strip()

    return last_line


def classify_issue(issue_content: str, adw_id: str) -> str:
    """
    Classify issue into command type.

    Returns: /chore, /bug, /feature, or /patch
    """
    request = AgentTemplateRequest(
        agent_name="classifier",
        slash_command="/classify_issue",
        args=[issue_content],
        adw_id=adw_id,
    )

    response = prompt_claude_code_with_retry(request)
    if not response.success:
        print(f"Error classifying issue: {response.error}")
        sys.exit(1)

    # Extract classification from response
    classification = extract_classification(response.result)

    if classification == "0":
        print("Error: Could not classify issue")
        sys.exit(1)

    return classification


def create_plan(issue_number: int, adw_id: str, issue_class: str, issue_content: str) -> str:
    """
    Create implementation plan.

    Returns: Path to plan file
    """
    # Prepare issue JSON
    issue_json = json.dumps({
        "number": issue_number,
        "title": f"Issue #{issue_number}",
        "body": issue_content,
    })

    request = AgentTemplateRequest(
        agent_name="planner",
        slash_command=issue_class,
        args=[str(issue_number), adw_id, issue_json],
        adw_id=adw_id,
    )

    response = prompt_claude_code_with_retry(request, max_retries=3)
    if not response.success:
        print(f"Error creating plan: {response.error}")
        sys.exit(1)

    # Extract plan file path from response
    plan_file = response.result.strip()
    return plan_file


def implement_plan(plan_file: str, adw_id: str) -> None:
    """Execute implementation plan."""
    # Read plan content
    plan_path = Path(plan_file)
    if not plan_path.exists():
        print(f"Error: Plan file not found: {plan_file}")
        sys.exit(1)

    plan_content = plan_path.read_text()

    request = AgentTemplateRequest(
        agent_name="implementor",
        slash_command="/implement",
        args=[plan_content],
        adw_id=adw_id,
    )

    response = prompt_claude_code_with_retry(request, max_retries=3)
    if not response.success:
        print(f"Error implementing plan: {response.error}")
        sys.exit(1)

    print(f"Implementation complete: {response.result}")


def create_commit(agent_name: str, issue_class: str, issue_content: str, adw_id: str) -> str:
    """Create git commit."""
    request = AgentTemplateRequest(
        agent_name=agent_name,
        slash_command="/commit",
        args=[agent_name, issue_class, issue_content],
        adw_id=adw_id,
    )

    response = prompt_claude_code_with_retry(request)
    if not response.success:
        print(f"Error creating commit: {response.error}")
        sys.exit(1)

    return response.result.strip()


def main():
    """Main workflow execution."""
    if len(sys.argv) < 2:
        print("Usage: uv run adw_plan_build.py <issue_number> [adw_id]")
        sys.exit(1)

    issue_number = int(sys.argv[1])
    provided_adw_id = sys.argv[2] if len(sys.argv) > 2 else None

    # Fetch issue from GitHub
    print(f"\n📥 Fetching issue #{issue_number} from GitHub...")
    issue_data = fetch_github_issue(issue_number)
    issue_title = issue_data.get("title", "")
    issue_body = issue_data.get("body", "")
    issue_content = f"{issue_title}\n\n{issue_body}"

    print(f"✅ Issue fetched: {issue_title}")
    print(f"\n📋 Issue content:\n{'-' * 60}\n{issue_content}\n{'-' * 60}\n")

    print(f"\n🚀 Starting ADW Plan + Build for issue #{issue_number}")

    # Ensure we have an ADW ID
    adw_id = ensure_adw_id(provided_adw_id)
    print(f"📋 ADW ID: {adw_id}")

    # Initialize state
    state = ADWState(adw_id)
    state.update(issue_number=issue_number)
    state.save("adw_plan_build")

    # Step 1: Classify issue
    print("\n🔍 Classifying issue...")
    issue_class = classify_issue(issue_content, adw_id)
    print(f"✅ Classification: {issue_class}")

    state.update(issue_class=issue_class)
    state.save("adw_plan_build")

    # Step 2: Generate branch name and create branch
    print("\n🌿 Creating branch...")
    branch_name = generate_branch_name(adw_id, issue_number, issue_content[:50], issue_class)
    create_branch(branch_name, checkout=True)
    print(f"✅ Branch created: {branch_name}")

    state.update(branch_name=branch_name)
    state.save("adw_plan_build")

    # Step 3: Create plan
    print("\n📝 Creating implementation plan...")
    plan_file = create_plan(issue_number, adw_id, issue_class, issue_content)
    print(f"✅ Plan created: {plan_file}")

    state.update(plan_file=plan_file)
    state.save("adw_plan_build")

    # Commit plan
    commit_msg = create_commit("planner", issue_class, issue_content, adw_id)
    commit_changes(commit_msg)
    print(f"✅ Plan committed: {commit_msg}")

    # Step 4: Implement plan
    print("\n⚙️  Implementing plan...")
    implement_plan(plan_file, adw_id)
    print("✅ Implementation complete")

    # Commit implementation
    commit_msg = create_commit("implementor", issue_class, issue_content, adw_id)
    commit_changes(commit_msg)
    print(f"✅ Implementation committed: {commit_msg}")

    print(f"\n✨ Workflow complete! ADW ID: {adw_id}")
    print(f"📂 State saved in: agents/{adw_id}/")


if __name__ == "__main__":
    main()
