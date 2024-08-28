# Devops-Pipelie-Demo

This project demonstrates a basic DevOps pipeline using Jenkins, Docker, and Kubernetes with a simple Spring Boot application.

## Prerequisites

- Java 11+
- Docker
- Kubernetes
- Jenkins

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/devops-demo.git
   cd devops-demo
   ```

2. Build the application using Maven:
     ```bash
   mvn clean package
   ```


3. Build the Docker image:
     ```bash
   docker build -t yourusername/devops-demo:latest .
   ```

4. Deploy to Kubernetes:
    ```bash
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   ```

## Running Tests
Unit Tests:
    ```bash
    mvn test
    ```

Integration Tests:
    ```bash
    mvn integration-test
    ```

## Jenkis Pipeline
    1. Set up a Jenkins job and configure it to pull this repository.
    2. Ensure that the job is configured to run the Jenkinsfile.
    3. Run the job to build, test, and deploy the application.


