pipeline {
  agent any

  environment {
    GCP_PROJECT = 'your-project-id'    // Google Cloud Project ID
    GCR_IMAGE = "gcr.io/${GCP_PROJECT}/app"
    K8S_DEPLOYMENT_NAME = 'app-deployment' // Kubernetes deployment name
    K8S_NAMESPACE = 'default'              // Kubernetes namespace
    TERRAFORM_DIR = 'terraform'            // Terraform directory
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

    stage('Deploy to Staging') {
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
          error 'Deployment to staging failed.'
        }
      }
    }

    stage('Deploy to GKE') {
      options {
        timeout(time: 10, unit: 'MINUTES')
      }
      steps {
        script {
          withCredentials([file(credentialsId: 'gcp-service-account-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
            sh 'gcloud container clusters get-credentials ${K8S_DEPLOYMENT_NAME} --zone asia-southeast1 --project ${GCP_PROJECT}'
            sh """
              kubectl set image deployment/${K8S_DEPLOYMENT_NAME} ${K8S_DEPLOYMENT_NAME}=${GCR_IMAGE}:latest --namespace=${K8S_NAMESPACE}
              kubectl rollout status deployment/${K8S_DEPLOYMENT_NAME} --namespace=${K8S_NAMESPACE}
            """
          }
        }
      }
      post {
        failure {
          error 'Deployment to GKE failed.'
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
