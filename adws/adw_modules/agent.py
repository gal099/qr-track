"""
Agent execution module for running Claude Code CLI commands.

Handles subprocess execution, JSONL output parsing, and retry logic.
"""

import json
import subprocess
import sys
import time
from pathlib import Path
from typing import Optional, List, Dict, Final

from .data_types import (
    AgentTemplateRequest,
    AgentPromptResponse,
    SlashCommand,
    ModelName,
    ModelSet,
)


# Model mapping for slash commands
SLASH_COMMAND_MODEL_MAP: Final[Dict[SlashCommand, Dict[ModelSet, ModelName]]] = {
    "/classify_issue": {"base": "sonnet", "heavy": "sonnet"},
    "/chore": {"base": "sonnet", "heavy": "opus"},
    "/bug": {"base": "sonnet", "heavy": "opus"},
    "/feature": {"base": "sonnet", "heavy": "opus"},
    "/patch": {"base": "sonnet", "heavy": "sonnet"},
    "/implement": {"base": "sonnet", "heavy": "opus"},
    "/commit": {"base": "sonnet", "heavy": "sonnet"},
    "/test": {"base": "sonnet", "heavy": "sonnet"},
}


def get_model_for_slash_command(
    slash_command: SlashCommand,
    model_set: ModelSet = "base",
) -> ModelName:
    """
    Get the appropriate model for a slash command based on model set.

    Args:
        slash_command: The slash command to execute
        model_set: "base" for standard models, "heavy" for more powerful models

    Returns:
        Model name to use (sonnet, opus, or haiku)
    """
    command_models = SLASH_COMMAND_MODEL_MAP.get(slash_command)
    if not command_models:
        return "sonnet"  # Default fallback

    return command_models.get(model_set, "sonnet")


def parse_jsonl_output(output: str) -> AgentPromptResponse:
    """
    Parse JSONL output from Claude Code CLI.

    Args:
        output: Raw JSONL output string

    Returns:
        Parsed response with result or error
    """
    lines = output.strip().split("\n")
    result_message: Optional[str] = None
    error_message: Optional[str] = None

    for line in lines:
        if not line.strip():
            continue

        try:
            data = json.loads(line)

            # Look for result in various message formats
            if isinstance(data, dict):
                if "result" in data:
                    result_message = data["result"]
                elif "text" in data:
                    result_message = data["text"]
                elif "error" in data:
                    error_message = data["error"]

        except json.JSONDecodeError:
            continue

    success = result_message is not None and error_message is None

    return AgentPromptResponse(
        success=success,
        result=result_message,
        error=error_message,
        raw_output=output,
        should_retry=False,
    )


def execute_template(request: AgentTemplateRequest) -> AgentPromptResponse:
    """
    Execute a slash command template via Claude Code CLI.

    Args:
        request: Agent template request with command and args

    Returns:
        Response with result or error
    """
    # Get Claude Code CLI path
    claude_path = Path.home() / ".local" / "bin" / "claude"
    if not claude_path.exists():
        return AgentPromptResponse(
            success=False,
            error=f"Claude Code CLI not found at {claude_path}",
            should_retry=False,
        )

    # Determine model to use
    if request.model:
        model = request.model
    else:
        from .state import ADWState
        state = ADWState(request.adw_id)
        model_set = state.get("model_set", "base")
        model = get_model_for_slash_command(request.slash_command, model_set)

    # Build command
    command_parts = [
        str(claude_path),
        "-m", model,
        "-p", request.slash_command,
    ]

    # Add arguments
    command_parts.extend(request.args)

    # Set working directory
    working_dir = request.working_dir or Path.cwd()

    try:
        # Execute command
        result = subprocess.run(
            command_parts,
            cwd=working_dir,
            capture_output=True,
            text=True,
            timeout=600,  # 10 minute timeout
        )

        if result.returncode != 0:
            return AgentPromptResponse(
                success=False,
                error=f"Command failed with code {result.returncode}: {result.stderr}",
                raw_output=result.stdout,
                should_retry=True,
            )

        # Parse output
        return parse_jsonl_output(result.stdout)

    except subprocess.TimeoutExpired:
        return AgentPromptResponse(
            success=False,
            error="Command timed out after 10 minutes",
            should_retry=True,
        )
    except Exception as e:
        return AgentPromptResponse(
            success=False,
            error=f"Execution error: {str(e)}",
            should_retry=False,
        )


def prompt_claude_code_with_retry(
    request: AgentTemplateRequest,
    max_retries: int = 3,
) -> AgentPromptResponse:
    """
    Execute template with exponential backoff retry logic.

    Args:
        request: Agent template request
        max_retries: Maximum number of retry attempts

    Returns:
        Final response after retries
    """
    delays = [1, 3, 5]  # Exponential backoff delays

    for attempt in range(max_retries):
        response = execute_template(request)

        if response.success or not response.should_retry:
            return response

        if attempt < max_retries - 1:
            delay = delays[min(attempt, len(delays) - 1)]
            print(f"Retry {attempt + 1}/{max_retries} after {delay}s...", file=sys.stderr)
            time.sleep(delay)

    return response
