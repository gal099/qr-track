"""
Data types for Agentic Development Workflows (ADW).

Defines core data structures used across ADW modules for type safety and validation.
"""

from typing import Literal, Optional, List
from pydantic import BaseModel, Field


# Slash Commands
SlashCommand = Literal[
    "/classify_issue",
    "/chore",
    "/bug",
    "/feature",
    "/patch",
    "/implement",
    "/commit",
    "/test",
]

# Model names
ModelName = Literal["sonnet", "opus", "haiku"]

# Model sets for dynamic selection
ModelSet = Literal["base", "heavy"]

# Issue classifications
IssueClass = Literal["/chore", "/bug", "/feature", "/patch", "0"]


class AgentTemplateRequest(BaseModel):
    """Request to execute an agent with a slash command template."""

    agent_name: str = Field(..., description="Name of the agent executing the command")
    slash_command: SlashCommand = Field(..., description="Slash command to execute")
    args: List[str] = Field(default_factory=list, description="Arguments for the command")
    adw_id: str = Field(..., description="Unique ADW workflow identifier")
    model: Optional[ModelName] = Field(None, description="Model to use (if not using dynamic selection)")
    working_dir: Optional[str] = Field(None, description="Working directory for execution")


class AgentPromptResponse(BaseModel):
    """Response from agent execution."""

    success: bool = Field(..., description="Whether execution was successful")
    result: Optional[str] = Field(None, description="Result message from agent")
    error: Optional[str] = Field(None, description="Error message if execution failed")
    raw_output: Optional[str] = Field(None, description="Complete raw JSONL output")
    should_retry: bool = Field(False, description="Whether this error is retryable")


class GitHubIssue(BaseModel):
    """GitHub issue representation."""

    number: int = Field(..., description="Issue number")
    title: str = Field(..., description="Issue title")
    body: Optional[str] = Field(None, description="Issue body/description")
    labels: List[str] = Field(default_factory=list, description="Issue labels")
    state: Literal["open", "closed"] = Field(..., description="Issue state")
    html_url: str = Field(..., description="URL to the issue")


class ADWMetadata(BaseModel):
    """Metadata for tracking ADW workflow execution."""

    adw_id: str = Field(..., description="Unique workflow identifier")
    issue_number: Optional[int] = Field(None, description="Related GitHub issue number")
    issue_class: Optional[IssueClass] = Field(None, description="Classified issue type")
    branch_name: Optional[str] = Field(None, description="Git branch for this workflow")
    plan_file: Optional[str] = Field(None, description="Path to implementation plan")
    model_set: ModelSet = Field("base", description="Model set to use (base/heavy)")
    all_adws: List[str] = Field(default_factory=list, description="List of ADW workflows executed")
