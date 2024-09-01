pipeline {
    agent any
    
    stages {
        stage('Setup Docker') {
            steps {
                script {
                    // Install Docker if necessary
                    if (!sh(script: 'command -v docker', returnStatus: true) == 0) {
                        sh '''
                        echo "Installing Docker..."
                        sudo apt-get update
                        sudo apt-get install -y docker.io
                        sudo systemctl start docker
                        sudo systemctl enable docker
                        '''
                    } else {
                        echo 'Docker is already installed.'
                    }
                }
            }
        }

        stage('Start Docker Registry') {
            steps {
                sh 'docker run -d -p 5000:5000 --restart=always --name registry registry:2 || true'
            }
        }

        stage('Build') {
            steps {
                echo 'Building the application...'
                sh 'mvn clean package'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'mvn test'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                sh 'docker build -t 127.0.0.1:5000/app:latest .'
            }
        }

        stage('Push Docker Image') {
            steps {
                echo 'Pushing Docker image to local registry...'
                sh 'docker push 127.0.0.1:5000/app:latest'
            }
        }

        stage('Deploy to Minikube') {
            steps {
                echo 'Deploying to Minikube...'
                sh 'kubectl apply -f k8s/deployment.yaml'
                sh 'kubectl apply -f k8s/service.yaml'
            }
        }

        stage('Port Forwarding') {
            steps {
                echo 'Setting up port forwarding...'
                sh 'kubectl port-forward svc/app 8080:8080 &'
            }
        }
    }

    post {
        always {
            echo 'Cleaning up Docker images...'
            sh 'docker rmi 127.0.0.1:5000/app:latest || true'
        }
    }
}
