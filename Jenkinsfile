pipeline {
    agent any
    // environment { // Commented out since no variables are used
    //     GCR_CREDENTIALS = credentials('gcr-json-key') // Not used for local builds
    //     PROJECT_ID = 'your-gcp-project-id' // Not used for local builds
    //     SONAR_HOST_URL = 'http://your-sonarqube-server-url'
    //     SONAR_LOGIN = credentials('sonar-token')
    // }
    stages {
        stage('Install Docker') {
            steps {
                sh '''
                # Install Docker if not already installed
                if ! [ -x "$(command -v docker)" ]; then
                  echo "Docker not found, installing..."
                  apt-get update
                  apt-get install -y docker.io
                  systemctl start docker
                  systemctl enable docker
                else
                  echo "Docker is already installed."
                fi
                '''
            }
        }
        stage('Start Docker Registry') {
            steps {
                sh 'docker run -d -p 5000:5000 --restart=always --name registry registry:2 || true'
            }
        }
        stage('Pre-Build Check') {
            steps {
                sh 'sh scripts/pre-build-check.sh'
            }
        }
        stage('Build') {
            steps {
                container('maven') {
                    echo 'Building the application...'
                    sh 'mvn clean package'
                }
            }
        }
        stage('Test') {
            steps {
                container('maven') {
                    echo 'Running tests...'
                    sh 'mvn test'
                }
            }
        }
        stage('SonarQube Analysis') {
            steps {
                container('maven') {
                    echo 'Running SonarQube analysis...'
                    // sh 'mvn sonar:sonar -Dsonar.host.url=$SONAR_HOST_URL -Dsonar.login=$SONAR_LOGIN'
                }
            }
        }
        stage('Trivy Scan') {
            steps {
                sh 'sh scripts/trivy-scan.sh'
            }
        }
        stage('Checkmarx Scan') {
            steps {
                sh 'sh scripts/checkmarx-scan.sh'
            }
        }
        // stage('Build Docker Image') { // Not used for local builds
        //     steps {
        //         dir('devops-demo') {
        //             echo 'Building the Docker image...'
        //             sh 'docker build -t gcr.io/$PROJECT_ID/devops-demo:dev-${env.BUILD_ID} .' 
        //             sh 'docker push gcr.io/$PROJECT_ID/devops-demo:dev-${env.BUILD_ID}' 
        //         }
        //     }
        // }

        stage('Build Local Docker Image') {
            steps {
                dir('devops-demo') {
                    echo 'Building the Docker image for local...'
                    sh 'docker build -t 127.0.0.1:5000/devops-demo:dev-latest .' 
                    sh 'docker push 127.0.0.1:5000/devops-demo:dev-latest'
                }
            }
        }
        stage('Deploy to Minikube') {
            steps {
                dir('infra/local') {
                    echo 'Deploying to Minikube environment...'
                    sh 'kubectl apply -f deployment.yaml'
                    sh 'kubectl apply -f service.yaml'
                }
            }
        }
        
        stage('Port Forwarding Jenkins') { // Port forwarding for Jenkins
            steps {
                script {
                    sh 'kubectl port-forward svc/jenkins 8080:8080 &'
                }
            }
        }
        stage('Port Forwarding Grafana') { // Port forwarding for Grafana
            steps {
                script {
                    sh 'kubectl port-forward svc/grafana 3000:3000 &'
                }
            }
        }
        stage('Port Forwarding Prometheus') { // Port forwarding for Prometheus
            steps {
                script {
                    sh 'kubectl port-forward svc/prometheus 9090:9090 &'
                }
            }
        }

        // stage('Retag and Push Docker Image') { // Not used for local builds
        //     steps {
        //         script {
        //             sh 'docker tag gcr.io/$PROJECT_ID/devops-demo:dev-${env.BUILD_ID} gcr.io/$PROJECT_ID/devops-demo:staging-${env.BUILD_ID}' 
        //             sh 'docker push gcr.io/$PROJECT_ID/devops-demo:staging-${env.BUILD_ID}'
        //             sh 'docker tag gcr.io/$PROJECT_ID/devops-demo:dev-${env.BUILD_ID} gcr.io/$PROJECT_ID/devops-demo:prod-${env.BUILD_ID}'
        //             sh 'docker push gcr.io/$PROJECT_ID/devops-demo:prod-${env.BUILD_ID}'
        //         }
        //     }
        // }
        // stage('Deploy to Kubernetes') { // Not used for local builds
        //     parallel {
        //         stage('Deploy to Dev') {
        //             steps {
        //                 dir('helm/dev') {
        //                     echo 'Deploying to Dev environment using Helm...'
        //                     sh 'helm upgrade --install devops-demo-dev ./devops-demo -f values-dev.yaml'
        //                 }
        //             }
        //         }
        //         stage('Deploy to Staging') {
        //             when {
        //                 branch 'dev'
        //             }
        //             steps {
        //                 dir('helm/staging') {
        //                     echo 'Deploying to Staging environment using Helm...'
        //                     sh 'helm upgrade --install devops-demo-staging ./devops-demo -f values-staging.yaml'
        //                 }
        //             }
        //         }
        //         stage('Deploy to Prod') {
        //             when {
        //                 expression {
        //                     return input(message: 'Deploy to Production?', ok: 'Deploy')
        //                 }
        //             }
        //             steps {
        //                 dir('helm/prod') {
        //                     echo 'Deploying to Prod environment using Helm...'
        //                     sh 'helm upgrade --install devops-demo-prod ./devops-demo -f values-prod.yaml'
        //                 }
        //             }
        //         }
        //     }
        // }

        stage('Post-Deployment Validation') {
            steps {
               sh 'sh scripts/post-deployment-validation.sh'
            }
        }
    }
    post {
        always {
            echo 'Cleaning up...'
            // Uncomment below if using GCR in actual deployments
            // sh 'docker rmi gcr.io/$PROJECT_ID/devops-demo:dev-${env.BUILD_ID}' 
            // sh 'docker rmi gcr.io/$PROJECT_ID/devops-demo:staging-${env.BUILD_ID}'
            // sh 'docker rmi gcr.io/$PROJECT_ID/devops-demo:prod-${env.BUILD_ID}'
        }
    }
}
