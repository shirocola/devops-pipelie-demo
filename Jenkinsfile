pipeline {
    agent any
    environment {
        GCR_CREDENTIALS = credentials('gcr-json-key')
        PROJECT_ID = 'your-gcp-project-id'
        SONAR_HOST_URL = 'http://your-sonarqube-server-url'
        SONAR_LOGIN = credentials('sonar-token')
    }
    stages {
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
        stage('Build Docker Image') {
            parallel {
                stage('Build for Dev') {
                    steps {
                        dir('devops-demo') {
                            echo 'Building the Docker image for Dev...'
                            sh 'docker build -t gcr.io/$PROJECT_ID/devops-demo:dev-${env.BUILD_ID} .'
                            sh 'docker push gcr.io/$PROJECT_ID/devops-demo:dev-${env.BUILD_ID}'
                        }
                    }
                }
                stage('Build for Staging') {
                    steps {
                        dir('devops-demo') {
                            echo 'Building the Docker image for Staging...'
                            sh 'docker build -t gcr.io/$PROJECT_ID/devops-demo:staging-${env.BUILD_ID} .'
                            sh 'docker push gcr.io/$PROJECT_ID/devops-demo:staging-${env.BUILD_ID}'
                        }
                    }
                }
                stage('Build for Prod') {
                    steps {
                        dir('devops-demo') {
                            echo 'Building the Docker image for Prod...'
                            sh 'docker build -t gcr.io/$PROJECT_ID/devops-demo:prod-${env.BUILD_ID} .'
                            sh 'docker push gcr.io/$PROJECT_ID/devops-demo:prod-${env.BUILD_ID}'
                        }
                    }
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
                    steps {
                        dir('helm/staging') {
                            echo 'Deploying to Staging environment using Helm...'
                            sh 'helm upgrade --install devops-demo-staging ./devops-demo -f values-staging.yaml'
                        }
                    }
                }
                stage('Deploy to Prod') {
                    steps {
                        dir('helm/prod') {
                            echo 'Deploying to Prod environment using Helm...'
                            sh 'helm upgrade --install devops-demo-prod ./devops-demo -f values-prod.yaml'
                        }
                    }
                }
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
