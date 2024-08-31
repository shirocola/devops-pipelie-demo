#!/bin/bash
echo "Running Checkmarx Scan..."
checkmarx scan --project "DevOps Demo" --token "$CHECKMARX_TOKEN" --output scan-results.json
if [ $? -ne 0 ]; then
  echo "Checkmarx Scan failed"
  exit 1
fi
echo "Checkmarx Scan completed successfully."
