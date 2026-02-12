# Install - Setup Project Dependencies

Install all project dependencies based on the project type.

## Instructions

1. **Detect package manager and configuration files**
   - Look for: package.json, requirements.txt, pyproject.toml, Cargo.toml, go.mod, etc.

2. **Install dependencies**
   - **Node.js/Bun**: `npm install` or `bun install`
   - **Python (uv)**: `uv sync` or `uv pip install -r requirements.txt`
   - **Python (pip)**: `pip install -r requirements.txt`
   - **Rust**: `cargo build`
   - **Go**: `go mod download`

3. **Verify installation**
   - Check for errors in the installation output
   - Verify key dependencies are installed

4. **Setup additional requirements**
   - Copy .env.sample to .env if present
   - Run any setup scripts if documented

## Report

- Installation method used
- Number of dependencies installed
- Any warnings or errors encountered
- Next steps if manual configuration is needed
