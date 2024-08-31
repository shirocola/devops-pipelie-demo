#!/bin/bash
echo "Running Pre-Build Checks..."
if [ -z "$REQUIRED_ENV_VAR" ]; then
  echo "ERROR: REQUIRED_ENV_VAR is not set"
  exit 1
fi

command -v some_dependency >/dev/null 2>&1 || { echo >&2 "Dependency some_dependency is not installed. Aborting."; exit 1; }

echo "All checks passed."
