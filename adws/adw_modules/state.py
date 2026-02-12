"""
State management module for ADW workflows.

Provides persistent file-based state storage and transient piping capabilities.
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict, Optional

from .data_types import ADWMetadata, ModelSet


class ADWState:
    """
    Manages persistent and transient state for ADW workflows.

    State is stored in: agents/{adw_id}/adw_state.json

    Supports two modes:
    1. Persistent: save() and load() from filesystem
    2. Transient: to_stdout() and from_stdin() for piping between scripts
    """

    # Core fields that are persisted
    CORE_FIELDS = {
        "adw_id",
        "issue_number",
        "branch_name",
        "plan_file",
        "issue_class",
        "model_set",
        "all_adws",
        # Advanced features (optional)
        "worktree_path",
        "backend_port",
        "frontend_port",
    }

    def __init__(self, adw_id: str, project_root: Optional[Path] = None):
        """
        Initialize ADW state manager.

        Args:
            adw_id: Unique workflow identifier
            project_root: Root directory of project (defaults to current directory)
        """
        self.adw_id = adw_id
        self.project_root = project_root or Path.cwd()
        self.state_dir = self.project_root / "agents" / adw_id
        self.state_file = self.state_dir / "adw_state.json"
        self._data: Dict[str, Any] = {"adw_id": adw_id}

        # Load existing state if available
        if self.state_file.exists():
            self.load()

    def get(self, key: str, default: Any = None) -> Any:
        """Get a value from state."""
        return self._data.get(key, default)

    def set(self, key: str, value: Any) -> None:
        """Set a value in state."""
        self._data[key] = value

    def update(self, **kwargs) -> None:
        """Update multiple values in state."""
        self._data.update(kwargs)

    def load(self) -> None:
        """Load state from filesystem."""
        if not self.state_file.exists():
            return

        try:
            with open(self.state_file, "r") as f:
                self._data = json.load(f)
        except Exception as e:
            print(f"Warning: Failed to load state: {e}", file=sys.stderr)

    def save(self, updated_by: Optional[str] = None) -> None:
        """
        Save state to filesystem.

        Args:
            updated_by: Optional identifier of who/what updated the state
        """
        # Ensure directory exists
        self.state_dir.mkdir(parents=True, exist_ok=True)

        # Add metadata
        if updated_by:
            self._data["last_updated_by"] = updated_by

        # Write state
        try:
            with open(self.state_file, "w") as f:
                json.dump(self._data, f, indent=2)
        except Exception as e:
            print(f"Error: Failed to save state: {e}", file=sys.stderr)
            sys.exit(1)

    def to_stdout(self) -> None:
        """Output state as JSON to stdout for piping to next script."""
        print(json.dumps(self._data))

    @classmethod
    def from_stdin(cls, adw_id: str, project_root: Optional[Path] = None) -> "ADWState":
        """
        Create state from JSON piped via stdin.

        Args:
            adw_id: Workflow identifier
            project_root: Project root directory

        Returns:
            ADWState instance with data from stdin
        """
        state = cls(adw_id, project_root)

        try:
            piped_data = json.load(sys.stdin)
            state._data.update(piped_data)
        except json.JSONDecodeError:
            pass  # No piped data, use default

        return state

    def get_working_directory(self) -> Path:
        """
        Get the working directory for this workflow.

        Returns worktree_path if set (for isolated workflows),
        otherwise returns project root.
        """
        worktree_path = self.get("worktree_path")
        if worktree_path:
            return Path(worktree_path)
        return self.project_root

    def to_metadata(self) -> ADWMetadata:
        """Convert state to ADWMetadata object."""
        return ADWMetadata(
            adw_id=self.adw_id,
            issue_number=self.get("issue_number"),
            issue_class=self.get("issue_class"),
            branch_name=self.get("branch_name"),
            plan_file=self.get("plan_file"),
            model_set=self.get("model_set", "base"),
            all_adws=self.get("all_adws", []),
        )


def ensure_adw_id(provided_id: Optional[str] = None) -> str:
    """
    Ensure we have a valid ADW ID.

    If provided_id is given and state exists, load it.
    Otherwise, generate a new ID and initialize state.

    Args:
        provided_id: Optional existing ADW ID

    Returns:
        ADW ID to use
    """
    if provided_id:
        state = ADWState(provided_id)
        if state.state_file.exists():
            return provided_id

    # Generate new ID (8 random hex characters)
    import secrets
    new_id = secrets.token_hex(4)

    # Initialize state
    state = ADWState(new_id)
    state.save("ensure_adw_id")

    return new_id
