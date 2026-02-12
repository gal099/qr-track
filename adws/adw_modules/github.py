"""GitHub operations for ADW workflows."""

import subprocess
import sys

# Bot identifier to mark ADW comments
ADW_BOT_IDENTIFIER = "[ADW-BOT]"


def make_issue_comment(issue_number: str, comment: str) -> None:
    """Post a comment to a GitHub issue using gh CLI."""
    cmd = [
        "gh",
        "issue",
        "comment",
        issue_number,
        "--body",
        comment,
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            print(f"Warning: Failed to post comment: {result.stderr}", file=sys.stderr)
            # Don't exit, just warn - comments are nice-to-have

    except FileNotFoundError:
        print("Warning: gh CLI not found, skipping comment", file=sys.stderr)
    except Exception as e:
        print(f"Warning: Failed to post comment: {e}", file=sys.stderr)


def format_issue_message(adw_id: str, agent_name: str, message: str) -> str:
    """Format a message for issue comments with ADW tracking."""
    return f"{ADW_BOT_IDENTIFIER} {adw_id}_{agent_name}: {message}"
