#!/bin/bash

# Trivy scan script
echo "Starting Trivy scan..."
docker pull gcr.io/$PROJECT_ID/devops-demo:${BUILD_ID}
trivy image --exit-code 1 --severity HIGH,CRITICAL gcr.io/$PROJECT_ID/devops-demo:${BUILD_ID}
