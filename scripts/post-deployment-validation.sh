#!/bin/bash
echo "Running Post-Deployment Validation..."
curl -f http://your-application-url/health || { echo "Application health check failed"; exit 1; }

kubectl logs -l app=devops-demo | grep "ERROR"
if [ $? -eq 0 ]; then
  echo "Errors found in application logs"
  exit 1
fi

echo "Post-Deployment Validation completed successfully."
