pipeline {
  agent any

  environment {
    GCP_PROJECT = 'your-project-id'            // Google Cloud Project ID
    GCR_IMAGE = "gcr.io/${GCP_PROJECT}/app"    // Docker image ที่จะ push ไป GCR
    K8S_DEPLOYMENT_NAME = 'app-deployment'     // ชื่อ Kubernetes deployment
    K8S_NAMESPACE = 'default'                 // Namespace ใน Kubernetes
  }

  stages {
    stage('Checkout Code') {
      steps {
        // Clone repository จาก Git
        git 'https://github.com/your-repo.git'
      }
    }

    stage('Run Unit Tests') {
      steps {
        script {
          // รัน unit tests
          sh 'npm install'
          sh 'npm run test'   // สั่งรัน unit test ของ Node.js (ปรับใช้ตาม project)
        }
      }
    }

    stage('Run Integration Tests') {
      steps {
        script {
          // รัน integration tests
          sh 'npm run test:integration'  // สั่งรัน integration test ของ Node.js (ปรับใช้ตาม project)
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

    stage('Deploy to GKE') {
      steps {
        script {
          // Set rolling update สำหรับ Kubernetes deployment
          sh """
            kubectl set image deployment/${K8S_DEPLOYMENT_NAME} ${K8S_DEPLOYMENT_NAME}=${GCR_IMAGE}:latest --namespace=${K8S_NAMESPACE}
            kubectl rollout status deployment/${K8S_DEPLOYMENT_NAME} --namespace=${K8S_NAMESPACE}
            kubectl rollout restart deployment/${K8S_DEPLOYMENT_NAME} --namespace=${K8S_NAMESPACE}  # Restart deployment เพื่อใช้ rolling update
          """
        }
      }
    }
  }

  post {
    success {
      echo "Deployment completed successfully!"
    }
    failure {
      echo "Deployment failed!"
    }
  }
}
