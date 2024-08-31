pipeline {
    agent any
    environment {
        GCR_CREDENTIALS = credentials('gcr-json-key')
        PROJECT_ID = 'your-gcp-project-id'
        SONAR_HOST_URL = 'http://your-sonarqube-server-url'
        SONAR_LOGIN = credentials('sonar-token')
    }
    stages {
        stage('Pre-Build Check') {
            steps {
                echo 'Checking dependencies and environment...'
                // Add any pre-build checks here
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
                    sh 'mvn sonar:sonar -Dsonar.host.url=$SONAR_HOST_URL -Dsonar.login=$SONAR_LOGIN'
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
                echo 'Running Checkmarx scan...'
                // Add Checkmarx scan command here
            }
        }
        stage('Build Docker Image') {
            steps {
                dir('devops-demo') {
                    echo 'Building the Docker image...'
                    sh 'docker build -t gcr.io/$PROJECT_ID/devops-demo:dev-${env.BUILD_ID} .'
                    sh 'docker push gcr.io/$PROJECT_ID/devops-demo:dev-${env.BUILD_ID}'
                }
            }
        }
        stage('Retag and Push Docker Image') {
            steps {
                script {
                    // Retag and push for Staging
                    sh 'docker tag gcr.io/$PROJECT_ID/devops-demo:dev-${env.BUILD_ID} gcr.io/$PROJECT_ID/devops-demo:staging-${env.BUILD_ID}'
                    sh 'docker push gcr.io/$PROJECT_ID/devops-demo:staging-${env.BUILD_ID}'

                    // Retag and push for Prod
                    sh 'docker tag gcr.io/$PROJECT_ID/devops-demo:dev-${env.BUILD_ID} gcr.io/$PROJECT_ID/devops-demo:prod-${env.BUILD_ID}'
                    sh 'docker push gcr.io/$PROJECT_ID/devops-demo:prod-${env.BUILD_ID}'
                }
            }
        }
        stage('Deploy to Kubernetes') {
            parallel {
                stage('Deploy to Dev') {
                    steps {
                        dir('helm/dev') {
                            echo 'Deploying to Dev environment using Helm...'
                            sh 'helm upgrade --install devops-demo-dev ./devops-demo -f values-dev.yaml'
                        }
                    }
                }
                stage('Deploy to Staging') {
                    when {
                        branch 'dev'
                    }
                    steps {
                        dir('helm/staging') {
                            echo 'Deploying to Staging environment using Helm...'
                            sh 'helm upgrade --install devops-demo-staging ./devops-demo -f values-staging.yaml'
                        }
                    }
                }
                stage('Deploy to Prod') {
                    when {
                        expression {
                            return input(message: 'Deploy to Production?', ok: 'Deploy')
                        }
                    }
                    steps {
                        dir('helm/prod') {
                            echo 'Deploying to Prod environment using Helm...'
                            sh 'helm upgrade --install devops-demo-prod ./devops-demo -f values-prod.yaml'
                        }
                    }
                }

            }
        }
        stage('Post-Deployment Validation') {
            steps {
                echo 'Validating deployment...'
                // Add validation commands here
            }
        }
    }
    post {
        always {
            echo 'Cleaning up...'
            sh 'docker rmi gcr.io/$PROJECT_ID/devops-demo:dev-${env.BUILD_ID}'
            sh 'docker rmi gcr.io/$PROJECT_ID/devops-demo:staging-${env.BUILD_ID}'
            sh 'docker rmi gcr.io/$PROJECT_ID/devops-demo:prod-${env.BUILD_ID}'
        }
    }
}
