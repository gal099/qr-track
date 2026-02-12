# Test - Run Tests

Run the project's test suite.

## Instructions

1. **Detect test framework**
   - Look for test configuration files
   - Check package.json scripts
   - Identify test directories

2. **Run appropriate tests**

   **Node.js/JavaScript:**
   ```bash
   npm test
   # or
   bun test
   # or
   npx jest
   npx vitest
   ```

   **Python:**
   ```bash
   uv run pytest
   # or
   pytest
   # or
   python -m pytest
   ```

   **Other frameworks:**
   - Use the test command documented in README
   - Check for Makefile targets

3. **Analyze results**
   - Count passing tests
   - Identify failing tests
   - Note any errors or warnings

4. **Report issues**
   - If tests fail, identify which tests and why
   - Check if failures are related to recent changes

## Report

Summary:
- Test framework used
- Number of tests run
- Pass/fail count
- Details of any failures
- Next steps if tests fail
