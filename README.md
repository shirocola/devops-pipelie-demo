# DevOps Pipeline Demo

This project demonstrates a complete CI/CD pipeline using Jenkins, Terraform, Docker, Kubernetes, Helm, Vault, Prometheus, Grafana, and Loki for logging. It automates the deployment of a Node.js application to Google Kubernetes Engine (GKE) with integration for monitoring, logging, and secret management.

## Table of Contents
- [Technologies Used](#technologies-used)
- [Pipeline Overview](#pipeline-overview)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [CI/CD Pipeline Stages](#cicd-pipeline-stages)
- [Deploying to Production](#deploying-to-production)
- [Monitoring and Logging](#monitoring-and-logging)


## Technologies Used

- **Jenkins**: CI/CD tool used to automate the build and deployment process.
- **Terraform**: Infrastructure as Code (IaC) tool used to provision resources in Google Cloud Platform (GCP).
- **Docker**: Containerization platform used for building and running the application.
- **Kubernetes**: Container orchestration platform used for deploying and managing containers.
- **Helm**: Kubernetes package manager used for managing Prometheus, Grafana, and Loki.
- **Vault**: Used for managing and accessing secrets securely.
- **Prometheus**: Monitoring system.
- **Grafana**: Visualization tool for metrics.
- **Loki**: Log aggregation tool.

## Pipeline Overview

The pipeline is defined in the `Jenkinsfile` and automates the following steps:

1. **Code Checkout**: Fetches the latest code from the repository.

2. **Terraform Init & Apply**: Provisions the necessary GCP infrastructure.

3. **Build Docker Image**: Builds the Docker image for the application.

4. **Deploy Prometheus, Grafana & Loki**: Deploys monitoring and logging tools using Helm.

5. **Push Docker Image**: Pushes the built Docker image to Google Container Registry (GCR).

6. **Deploy to Staging (Dev)**: Deploys the application to the staging environment on GKE.

7. **Run Tests**: Runs unit, integration, and end-to-end tests.

8. **Promote to Production**: Tags the image as `prod` and deploys it to the production environment.

## Prerequisites

- **Google Cloud Account**: A GCP account with a project setup.
- **Google Kubernetes Engine (GKE)**: GKE must be enabled in your GCP project.
- **Jenkins**: Jenkins should be configured with the necessary plugins.
- **Docker**: Ensure Docker is installed on your local machine or CI/CD environment.

## Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-repo.git
cd devops-pipeline-demo
```

### Step 2: Configure Google Cloud Authentication
Ensure that your GCP credentials file is available and set up properly. Update the Jenkinsfile with the correct GCP_PROJECT and credentials file location.

### Step 3: Install Dependencies
```bash
npm install
```
### Step 4: Configure Jenkins
1.Create a new Jenkins pipeline job.

2.Point Jenkins to this repository.

3.Configure necessary credentials in Jenkins (GCP Service Account, Vault Token, etc.).


### Step 5: Run the Pipeline
Trigger the pipeline from Jenkins to start the CI/CD process. The pipeline will:

1. Provision infrastructure using Terraform.

2. Build and deploy the application to GKE.

3. Set up monitoring and logging using Prometheus, Grafana, and Loki.


## CI/CD Pipeline Stages
1. **Checkout Code:** Fetches the latest code from the repository.

2. **Terraform Init & Apply:** Provisions the necessary GCP infrastructure.

3. **Lint Code:** Runs code linting checks.

4. **Run Tests:** Executes unit, integration, and end-to-end (E2E) tests.

5. **Build & Push Docker Image:** Builds the app image and pushes it to Google Container Registry     (GCR).

6. **Deploy to Staging (Dev):** Deploys the application to the staging environment on GKE.

7. **Security Scan:** Performs a security scan on the codebase.

8. **Promote to Production:** Tags the image as prod and pushes it to GCR.

9. **Deploy to GKE (Prod):** Deploys the prod-tagged image to the production environment.

10. **Cleanup:** Cleans up temporary resources and uninstalls services like Prometheus and Grafana.

11. This reflects the actual sequence as implemented in the Jenkins pipeline.

## Deploying to Production
To promote a successful staging build to production, simply merge the code to the main branch. Jenkins will tag the latest image as prod and deploy it to the production Kubernetes cluster.

## Monitoring and Logging
Prometheus: Collects metrics from the application and Kubernetes clusters.
Grafana: Provides a dashboard for visualizing metrics collected by Prometheus.
Loki: Aggregates logs from all running pods. Logs can be viewed through Grafana.

## License
This project is licensed under the MIT License.
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)