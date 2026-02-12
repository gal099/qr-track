"""
Git operations module for ADW workflows.

Handles branch creation, commits, and basic git operations.
"""

import subprocess
from pathlib import Path
from typing import Optional, Tuple


def run_git_command(
    args: list[str],
    working_dir: Optional[Path] = None,
    check: bool = True,
) -> Tuple[int, str, str]:
    """
    Run a git command and return results.

    Args:
        args: Git command arguments (without 'git' prefix)
        working_dir: Directory to run command in
        check: Whether to raise on non-zero exit code

    Returns:
        Tuple of (return_code, stdout, stderr)
    """
    cmd = ["git"] + args
    cwd = working_dir or Path.cwd()

    result = subprocess.run(
        cmd,
        cwd=cwd,
        capture_output=True,
        text=True,
        check=False,
    )

    if check and result.returncode != 0:
        raise RuntimeError(f"Git command failed: {' '.join(cmd)}\n{result.stderr}")

    return result.returncode, result.stdout.strip(), result.stderr.strip()


def get_current_branch(working_dir: Optional[Path] = None) -> str:
    """Get the name of the current git branch."""
    _, stdout, _ = run_git_command(["branch", "--show-current"], working_dir)
    return stdout


def branch_exists(branch_name: str, working_dir: Optional[Path] = None) -> bool:
    """Check if a branch exists locally."""
    returncode, _, _ = run_git_command(
        ["rev-parse", "--verify", branch_name],
        working_dir,
        check=False,
    )
    return returncode == 0


def create_branch(
    branch_name: str,
    working_dir: Optional[Path] = None,
    checkout: bool = True,
) -> None:
    """
    Create a new git branch.

    Args:
        branch_name: Name of branch to create
        working_dir: Directory to run command in
        checkout: Whether to checkout the new branch
    """
    if branch_exists(branch_name, working_dir):
        if checkout:
            run_git_command(["checkout", branch_name], working_dir)
        return

    if checkout:
        run_git_command(["checkout", "-b", branch_name], working_dir)
    else:
        run_git_command(["branch", branch_name], working_dir)


def commit_changes(
    message: str,
    working_dir: Optional[Path] = None,
    add_all: bool = True,
) -> Optional[str]:
    """
    Stage and commit changes.

    Args:
        message: Commit message
        working_dir: Directory to run command in
        add_all: Whether to stage all changes first

    Returns:
        Commit hash if successful, None otherwise
    """
    if add_all:
        run_git_command(["add", "-A"], working_dir)

    # Check if there are changes to commit
    returncode, _, _ = run_git_command(
        ["diff", "--cached", "--quiet"],
        working_dir,
        check=False,
    )

    if returncode == 0:
        # No changes to commit
        return None

    # Create commit
    run_git_command(["commit", "-m", message], working_dir)

    # Get commit hash
    _, commit_hash, _ = run_git_command(["rev-parse", "HEAD"], working_dir)
    return commit_hash


def get_main_branch(working_dir: Optional[Path] = None) -> str:
    """
    Detect the main branch name (main or master).

    Returns:
        Name of the main branch
    """
    # Check for main
    if branch_exists("main", working_dir):
        return "main"

    # Check for master
    if branch_exists("master", working_dir):
        return "master"

    # Default to main
    return "main"


def generate_branch_name(
    adw_id: str,
    issue_number: Optional[int],
    description: str,
    issue_class: str,
) -> str:
    """
    Generate a consistent branch name.

    Format: {type}-{issue}-{adw_id}-{description}

    Args:
        adw_id: Workflow identifier
        issue_number: Optional issue number
        description: Brief description
        issue_class: Issue classification (/chore, /bug, /feature)

    Returns:
        Generated branch name
    """
    # Map issue class to prefix
    prefix_map = {
        "/chore": "chore",
        "/bug": "fix",
        "/feature": "feat",
        "/patch": "patch",
    }
    prefix = prefix_map.get(issue_class, "chore")

    # Clean description (lowercase, replace spaces with hyphens)
    clean_desc = description.lower().replace(" ", "-")
    # Remove special characters
    clean_desc = "".join(c for c in clean_desc if c.isalnum() or c == "-")
    # Limit length
    clean_desc = clean_desc[:30]

    # Build branch name
    if issue_number:
        return f"{prefix}-{issue_number}-{adw_id}-{clean_desc}"
    else:
        return f"{prefix}-{adw_id}-{clean_desc}"


def has_uncommitted_changes(working_dir: Optional[Path] = None) -> bool:
    """Check if there are uncommitted changes."""
    returncode, _, _ = run_git_command(
        ["diff", "--quiet"],
        working_dir,
        check=False,
    )
    has_unstaged = returncode != 0

    returncode, _, _ = run_git_command(
        ["diff", "--cached", "--quiet"],
        working_dir,
        check=False,
    )
    has_staged = returncode != 0

    return has_unstaged or has_staged
