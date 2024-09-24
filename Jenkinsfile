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
    ADMIN_PASSWORD = credentials('grafana-admin-password')
    HECKMARX_CREDENTIALS = credentials('checkmarx-credentials')
    SONARQUBE_TOKEN = credentials('sonarqube-token')
    SONARQUBE_URL = 'http://your-sonarqube-instance'
  }

  stages {
    // Terraform stage for infrastructure provisioning
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

    // Run Ansible Playbook for additional configuration
    stage('Run Ansible Setup') {
      steps {
        runAnsiblePlaybook()
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
        stage('SonarQube Analysis') {
          steps {
            runSonarQubeScan()
          }
        }
        stage('Checkmarx Scan') {
          steps {
            runCheckmarxScan()
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

    // Update Kubernetes manifests and push changes to Git
    stage('Update Kubernetes Manifests for ArgoCD') {
      steps {
        updateKubernetesManifests()
      }
    }

    // Run Load Test (optional for staging)
    stage('Run Load Test') {
      when {
        branch 'staging'
      }
      steps {
        runLoadTest()
      }
    }

    // Promotion to Production via ArgoCD
    stage('Promote to Production') {
      when {
        branch 'main'
      }
      steps {
        promoteToProduction()
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

// Run Ansible Playbook
def runAnsiblePlaybook() {
  sh '''
    ansible-playbook -i ansible/inventory ansible/setup-playbook.yml --extra-vars "env=staging"
  '''
}

def lintCode() {
  sh 'npm install'
  sh 'npm run lint'
}

def runSonarQubeScan() {
  withSonarQubeEnv('SonarQube') {
    sh 'sonar-scanner \
        -Dsonar.projectKey=devops-pipeline-demo \
        -Dsonar.sources=. \
        -Dsonar.host.url=${SONARQUBE_URL} \
        -Dsonar.login=${SONARQUBE_TOKEN}'
  }
}

// Checkmarx Scan
def runCheckmarxScan() {
  withCredentials([usernamePassword(credentialsId: 'checkmarx-credentials', usernameVariable: 'CHECKMARX_USER', passwordVariable: 'CHECKMARX_PASS')]) {
    sh '''
    checkmarx-scan --project-name "devops-pipeline-demo" --username ${CHECKMARX_USER} --password ${CHECKMARX_PASS} --server http://your-checkmarx-server \
      --scan-mode full --preset "Default"
    '''
  }
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

// Update Kubernetes manifests for ArgoCD and push to Git
def updateKubernetesManifests() {
  sh '''
    sed -i 's|image: gcr.io/your-project-id/devops-pipeline-demo:.*|image: ${GCR_IMAGE}:latest|' k8s/deployment.yaml
    git config user.email "jenkins@example.com"
    git config user.name "Jenkins CI"
    git add k8s/deployment.yaml
    git commit -m "Update Kubernetes manifests for ArgoCD with new Docker image"
    git push origin main
  '''
  // ArgoCD will monitor the Git repository and apply changes automatically.
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
  // Update Kubernetes manifests with production image and push to Git
  sh '''
    sed -i 's|image: gcr.io/your-project-id/devops-pipeline-demo:.*|image: ${GCR_IMAGE}:prod|' k8s/deployment.yaml
    git config user.email "jenkins@example.com"
    git config user.name "Jenkins CI"
    git add k8s/deployment.yaml
    git commit -m "Promote Docker image to production via ArgoCD"
    git push origin main
  '''
  // ArgoCD will sync this change and apply it to the production cluster.
}

def cleanup() {
  sh 'docker system prune -f'
}

def notify(status) {
  emailext (
    subject: "Jenkins Build ${status} - ${env.JOB_NAME}",
    body: "<p>The build for <b>${env.JOB_NAME}</b> has ${status}.</p>",
    mimeType: 'text/html',
    to: "recipient@example.com"
  )
}
