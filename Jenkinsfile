pipeline {
  agent any

  environment {
    GCP_PROJECT = 'your-project-id'    // Google Cloud Project ID
    GCR_IMAGE = "gcr.io/${GCP_PROJECT}/devops-pipeline-demo"
    K8S_DEPLOYMENT_NAME = 'devops-pipeline-demo-deployment' // Kubernetes deployment name
    K8S_NAMESPACE = 'default'              // Kubernetes namespace
    TERRAFORM_DIR = 'terraform'            // Terraform directory
    VAULT_ADDR = 'http://127.0.0.1:8200'   // Vault server address
    VAULT_TOKEN = credentials('vault-token') // Jenkins Vault plugin credential
  }

  stages {
    stage('Checkout Code') {
      steps {
        git 'https://github.com/your-repo.git' // Replace with your GitHub repository
      }
    }

    stage('Terraform Init & Apply') {
      steps {
        dir("${TERRAFORM_DIR}") {
          script {
            withCredentials([file(credentialsId: 'gcp-service-account-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
              sh 'terraform init'
              sh 'terraform apply -auto-approve'
            }
          }
        }
      }
      post {
        failure {
          error 'Terraform apply failed. Stopping pipeline.'
        }
      }
    }

    stage('Deploy Prometheus & Grafana') {
      steps {
        script {
          echo 'Deploying Prometheus and Grafana using Helm'
          sh '''
            helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
            helm repo update
            helm upgrade --install prometheus prometheus-community/prometheus --namespace monitoring --create-namespace
            helm upgrade --install grafana grafana/grafana --namespace monitoring --create-namespace --set adminPassword=admin
          '''
        }
      }
      post {
        failure {
          error 'Failed to deploy Prometheus and Grafana.'
        }
      }
    }

    stage('Fetch Secrets from Vault') {
      steps {
        script {
          withVault([vaultUrl: env.VAULT_ADDR, tokenCredentialId: env.VAULT_TOKEN]) {
            def secrets = vault path: 'secret/data/devops-pipeline-demo', engineVersion: 2
            env.DB_USERNAME = secrets.data.data.username
            env.DB_PASSWORD = secrets.data.data.password
            echo "Vault secrets fetched successfully"
          }
        }
      }
      post {
        failure {
          error 'Failed to fetch secrets from Vault.'
        }
      }
    }

    stage('Lint Code') {
      steps {
        script {
          sh 'npm install'
          sh 'npm run lint'
        }
      }
      post {
        failure {
          error 'Lint failed. Please fix linting issues.'
        }
      }
    }

    stage('Run Tests') {
      parallel {
        stage('Unit Tests') {
          steps {
            script {
              sh 'npm run test'
            }
          }
        }
        stage('Integration Tests') {
          steps {
            script {
              sh 'npm run test:integration'
            }
          }
        }
      }
      post {
        always {
          junit 'test-results/*.xml' // Collect test results for visualization
        }
        failure {
          error 'Tests failed. Please check test reports.'
        }
      }
    }

    stage('Run E2E Tests') {
      steps {
        script {
          sh 'npm run test:e2e'
        }
      }
      post {
        failure {
          error 'E2E tests failed. Please investigate.'
        }
      }
    }

    stage('Security Scan') {
      steps {
        script {
          sh 'snyk test'
        }
      }
      post {
        failure {
          error 'Security scan failed. Please resolve security issues.'
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          docker.build("${GCR_IMAGE}:latest")
        }
      }
    }

    stage('Push Docker Image to GCR') {
      steps {
        script {
          withCredentials([file(credentialsId: 'gcp-service-account-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
            sh 'gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS'
            sh 'gcloud auth configure-docker'
            docker.image("${GCR_IMAGE}:latest").push()
          }
        }
      }
    }

    stage('Deploy to Staging (Dev)') {
      steps {
        script {
          sh """
            kubectl set image deployment/staging-${K8S_DEPLOYMENT_NAME} staging-${K8S_DEPLOYMENT_NAME}=${GCR_IMAGE}:latest --namespace=${K8S_NAMESPACE}
            kubectl rollout status deployment/staging-${K8S_DEPLOYMENT_NAME} --namespace=${K8S_NAMESPACE}
          """
        }
      }
      post {
        failure {
          error 'Deployment to staging (dev) failed.'
        }
      }
    }

    stage('Promote to Prod') {
      when {
        branch 'main'
      }
      steps {
        script {
          echo "Promoting to production..."
          docker.image("${GCR_IMAGE}:latest").tag('prod')
          docker.image("${GCR_IMAGE}:prod").push()
        }
      }
    }

    stage('Deploy to GKE (Prod)') {
      options {
        timeout(time: 10, unit: 'MINUTES')
      }
      steps {
        script {
          withCredentials([file(credentialsId: 'gcp-service-account-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
            sh 'gcloud container clusters get-credentials ${K8S_DEPLOYMENT_NAME} --zone asia-southeast1 --project ${GCP_PROJECT}'
            sh """
              kubectl set image deployment/prod-${K8S_DEPLOYMENT_NAME} prod-${K8S_DEPLOYMENT_NAME}=${GCR_IMAGE}:prod --namespace=${K8S_NAMESPACE}
              kubectl rollout status deployment/prod-${K8S_DEPLOYMENT_NAME} --namespace=${K8S_NAMESPACE}
            """
          }
        }
      }
      post {
        failure {
          error 'Deployment to GKE (prod) failed.'
        }
      }
    }
  }

  post {
    success {
      emailext (
        subject: "Jenkins Build Success - ${env.JOB_NAME}",
        body: "<p>The build for <b>${env.JOB_NAME}</b> was successful!</p>",
        mimeType: 'text/html',
        to: "recipient@example.com"
      )
    }
    failure {
      emailext (
        subject: "Jenkins Build Failure - ${env.JOB_NAME}",
        body: "<p>The build for <b>${env.JOB_NAME}</b> has failed. Please investigate.</p>",
        mimeType: 'text/html',
        to: "recipient@example.com"
      )
    }
    cleanup {
      script {
        echo "Cleaning up temporary resources"
        // Any cleanup logic goes here (e.g., delete temporary files, containers, etc.)
      }
    }
  }
}
