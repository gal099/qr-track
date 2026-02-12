"""
ADW Modules - Core functionality for Agentic Development Workflows.
"""

from .agent import (
    execute_template,
    prompt_claude_code_with_retry,
    get_model_for_slash_command,
)
from .data_types import (
    AgentTemplateRequest,
    AgentPromptResponse,
    GitHubIssue,
    ADWMetadata,
    SlashCommand,
    ModelName,
    ModelSet,
    IssueClass,
)
from .git_ops import (
    create_branch,
    commit_changes,
    get_current_branch,
    get_main_branch,
    generate_branch_name,
    has_uncommitted_changes,
)
from .state import ADWState, ensure_adw_id

__all__ = [
    # Agent
    "execute_template",
    "prompt_claude_code_with_retry",
    "get_model_for_slash_command",
    # Data types
    "AgentTemplateRequest",
    "AgentPromptResponse",
    "GitHubIssue",
    "ADWMetadata",
    "SlashCommand",
    "ModelName",
    "ModelSet",
    "IssueClass",
    # Git operations
    "create_branch",
    "commit_changes",
    "get_current_branch",
    "get_main_branch",
    "generate_branch_name",
    "has_uncommitted_changes",
    # State
    "ADWState",
    "ensure_adw_id",
]
