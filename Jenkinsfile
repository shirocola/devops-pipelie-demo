pipeline {
    agent {
        docker {
            image 'maven:3.8.1-openjdk-11' // Maven with JDK 11, you can adjust as needed
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    stages {
        stage('Setup Docker Registry') {
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
