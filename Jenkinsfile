pipeline {
    agent any
    environment {
        GCR_CREDENTIALS = credentials('gcr-json-key')
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
        stage('Trivy Scan') {
            steps {
                sh 'sh scripts/trivy-scan.sh'
            }
        }
        stage('Build Docker Image') {
            steps {
                dir('devops-demo') {
                    echo 'Building the Docker image...'
                    sh 'docker build -t gcr.io/$PROJECT_ID/devops-demo:${env.BUILD_ID} .'
                }
            }
        }
        stage('Push to GCR') {
            steps {
                withCredentials([file(credentialsId: 'gcr-json-key', variable: 'GCR_KEY')]) {
                    sh 'docker login -u _json_key --password-stdin https://gcr.io < $GCR_KEY'
                    sh 'docker push gcr.io/$PROJECT_ID/devops-demo:${env.BUILD_ID}'
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                dir('k8s/prod') {
                    sh 'kubectl apply -f deployment.yaml'
                    sh 'kubectl apply -f service.yaml'
                }
            }
        }
    }
    post {
        always {
            echo 'Cleaning up...'
            sh 'docker rmi gcr.io/$PROJECT_ID/devops-demo:${env.BUILD_ID}'
        }
    }
}
