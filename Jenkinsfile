pipeline {
  agent any

  environment {
    GCP_PROJECT = 'your-project-id'            // Google Cloud Project ID
    GCR_IMAGE = "gcr.io/${GCP_PROJECT}/app"    // Docker image ที่จะ push ไป GCR
    K8S_DEPLOYMENT_NAME = 'app-deployment'     // ชื่อ Kubernetes deployment
    K8S_NAMESPACE = 'default'                  // Namespace ใน Kubernetes
  }

  stages {
    stage('Checkout Code') {
      steps {
        // Clone repository จาก Git
        git 'https://github.com/your-repo.git'
      }
    }

    stage('Lint Code') {
      steps {
        script {
          // Run ESLint หรือ linters ตามโปรเจกต์ของคุณ
          sh 'npm install'
          sh 'npm run lint'
        }
      }
    }

    stage('Run Tests') {
      parallel {
        stage('Unit Tests') {
          steps {
            script {
              // รัน unit tests
              sh 'npm run test'
            }
          }
        }
        stage('Integration Tests') {
          steps {
            script {
              // รัน integration tests
              sh 'npm run test:integration'
            }
          }
        }
      }
    }

    stage('Run E2E Tests') {
      steps {
        script {
          // รัน E2E tests
          sh 'npm run test:e2e'
        }
      }
    }

    stage('Security Scan') {
      steps {
        script {
          // สแกน security ด้วย Snyk หรือเครื่องมืออื่นๆ
          sh 'snyk test'
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          // Build Docker image จาก source code
          docker.build("${GCR_IMAGE}:latest")
        }
      }
    }

    stage('Push Docker Image to GCR') {
      steps {
        script {
          // Push Docker image ไปยัง Google Container Registry (GCR)
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
          // Set rolling update สำหรับ Kubernetes deployment
          sh """
            kubectl set image deployment/staging-${K8S_DEPLOYMENT_NAME} staging-${K8S_DEPLOYMENT_NAME}=${GCR_IMAGE}:latest --namespace=${K8S_NAMESPACE}
            kubectl rollout status deployment/staging-${K8S_DEPLOYMENT_NAME} --namespace=${K8S_NAMESPACE}
          """
        }
      }
    }

    stage('Deploy to GKE') {
      options {
        timeout(time: 10, unit: 'MINUTES')  // กำหนด timeout 10 นาทีสำหรับการ deploy
      }
      steps {
        script {
          // Set rolling update สำหรับ Kubernetes deployment
          sh """
            kubectl set image deployment/${K8S_DEPLOYMENT_NAME} ${K8S_DEPLOYMENT_NAME}=${GCR_IMAGE}:latest --namespace=${K8S_NAMESPACE}
            kubectl rollout status deployment/${K8S_DEPLOYMENT_NAME} --namespace=${K8S_NAMESPACE}
          """
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
}


}
