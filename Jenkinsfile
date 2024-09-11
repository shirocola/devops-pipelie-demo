pipeline {
  agent any

  environment {
    GCP_PROJECT = 'your-project-id'
    GCR_IMAGE = "gcr.io/${GCP_PROJECT}/devops-pipeline-demo"
    K8S_DEPLOYMENT_NAME = 'devops-pipeline-demo-deployment'
    K8S_NAMESPACE = 'default'
    TERRAFORM_DIR = 'terraform'
    VAULT_ADDR = 'http://127.0.0.1:8200'
    VAULT_TOKEN = credentials('vault-token')
    ADMIN_PASSWORD = credentials('grafana-admin-password') // Avoid hardcoded passwords
  }

  stages {

    // Modularized Terraform Stage
    stage('Terraform Init & Apply') {
      steps {
        dir("${TERRAFORM_DIR}") {
          script {
            terraformApply()
          }
        }
      }
    }

    // Deploy Prometheus & Grafana using Helm
    stage('Deploy Monitoring Stack') {
      steps {
        deployMonitoringStack()
      }
    }

    // Fetch Secrets from Vault
    stage('Fetch Secrets from Vault') {
      steps {
        fetchSecretsFromVault()
      }
    }

    // Code Quality & Security Scan
    stage('Code Quality & Security') {
      parallel {
        stage('Lint Code') {
          steps {
            lintCode()
          }
        }
        stage('Security Scan') {
          steps {
            runSecurityScan()
          }
        }
      }
    }

    // Run Unit & Integration Tests
    stage('Run Tests') {
      parallel {
        stage('Unit Tests') {
          steps {
            runTests('unit')
          }
        }
        stage('Integration Tests') {
          steps {
            runTests('integration')
          }
        }
      }
    }

    // Build & Push Docker Image
    stage('Build & Push Docker Image') {
      steps {
        buildAndPushDockerImage()
      }
    }

    // Update Kubernetes Manifests and Deploy to Staging
    stage('Update Kubernetes & Deploy to Staging') {
      steps {
        deployToKubernetes('staging')
      }
    }

    // Run Load Test
    stage('Run Load Test') {
      when {
        branch 'staging'
      }
      steps {
        runLoadTest()
      }
    }

    // Promote to Production
    stage('Promote to Production') {
      when {
        branch 'main'
      }
      steps {
        promoteToProduction()
      }
    }

    // Deploy to Production
    stage('Deploy to GKE (Prod)') {
      steps {
        deployToKubernetes('prod')
      }
    }

  }

  post {
    always {
      cleanup()
    }
    success {
      notify('Success')
    }
    failure {
      notify('Failure')
    }
  }
}

// Functions and Modular Steps

def terraformApply() {
  withCredentials([file(credentialsId: 'gcp-service-account-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
    sh 'terraform init'
    sh 'terraform apply -auto-approve'
  }
}

def deployMonitoringStack() {
  sh '''
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    helm upgrade --install prometheus prometheus-community/prometheus --namespace monitoring --create-namespace
    helm upgrade --install grafana grafana/grafana --namespace monitoring --create-namespace --set adminPassword=${ADMIN_PASSWORD}
    helm upgrade --install loki grafana/loki-stack --namespace monitoring --set promtail.enabled=true
  '''
  sh 'kubectl rollout status deployment/prometheus-server --namespace monitoring'
  sh 'kubectl rollout status deployment/grafana --namespace monitoring'
}

def fetchSecretsFromVault() {
  withVault([vaultUrl: env.VAULT_ADDR, tokenCredentialId: env.VAULT_TOKEN]) {
    def secrets = vault path: 'secret/data/devops-pipeline-demo', engineVersion: 2
    env.DB_USERNAME = secrets.data.data.username
    env.DB_PASSWORD = secrets.data.data.password
    echo "Vault secrets fetched successfully"
  }
}

def lintCode() {
  sh 'npm install'
  sh 'npm run lint'
}

def runSecurityScan() {
  sh 'snyk test'
}

def runTests(type) {
  if (type == 'unit') {
    sh 'npm run test'
  } else if (type == 'integration') {
    sh 'npm run test:integration'
  }
}

def buildAndPushDockerImage() {
  docker.build("${GCR_IMAGE}:latest")
  withCredentials([file(credentialsId: 'gcp-service-account-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
    sh 'gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS'
    sh 'gcloud auth configure-docker'
    docker.image("${GCR_IMAGE}:latest").push()
  }
}

def deployToKubernetes(environment) {
  if (environment == 'staging') {
    sh "kubectl set image deployment/staging-${K8S_DEPLOYMENT_NAME} staging-${K8S_DEPLOYMENT_NAME}=${GCR_IMAGE}:latest --namespace=${K8S_NAMESPACE}"
  } else if (environment == 'prod') {
    sh "kubectl set image deployment/prod-${K8S_DEPLOYMENT_NAME} prod-${K8S_DEPLOYMENT_NAME}=${GCR_IMAGE}:prod --namespace=${K8S_NAMESPACE}"
  }
  sh "kubectl rollout status deployment/${environment}-${K8S_DEPLOYMENT_NAME} --namespace=${K8S_NAMESPACE}"
}

def runLoadTest() {
  sh '''
    docker run --rm -v ${WORKSPACE}/loadtest:/scripts loadimpact/k6 run /scripts/loadtest.js --out json=/scripts/loadtest-result.json
  '''
  archiveArtifacts artifacts: 'loadtest/loadtest-result.html', allowEmptyArchive: false
  publishHTML(target: [
    allowMissing: false,
    keepAll: true,
    reportDir: 'loadtest',
    reportFiles: 'loadtest-result.html',
    reportName: 'K6 Load Test Report'
  ])
}

def promoteToProduction() {
  docker.image("${GCR_IMAGE}:latest").tag('prod')
  docker.image("${GCR_IMAGE}:prod").push()
}

def cleanup() {
  sh 'docker system prune -f'
  sh 'kubectl delete deployment -n ${K8S_NAMESPACE} staging-${K8S_DEPLOYMENT_NAME}'
}

def notify(status) {
  emailext (
    subject: "Jenkins Build ${status} - ${env.JOB_NAME}",
    body: "<p>The build for <b>${env.JOB_NAME}</b> has ${status}.</p>",
    mimeType: 'text/html',
    to: "recipient@example.com"
  )
}
