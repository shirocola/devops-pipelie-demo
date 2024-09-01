pipeline {
    agent {
        kubernetes {
            label 'docker-agent'
            defaultContainer 'jnlp'
            yaml '''
            apiVersion: v1
            kind: Pod
            spec:
              containers:
              - name: docker
                image: docker:20.10.7
                command:
                - cat
                tty: true
                volumeMounts:
                - name: docker-sock
                  mountPath: /var/run/docker.sock
              volumes:
              - name: docker-sock
                hostPath:
                  path: /var/run/docker.sock
            '''
        }
    }

    stages {
        stage('Setup Docker') {
            steps {
                container('docker') {
                    sh 'docker --version'
                }
            }
        }

        stage('Start Docker Registry') {
            steps {
                container('docker') {
                    sh 'docker run -d -p 5000:5000 --restart=always --name registry registry:2 || true'
                }
            }
        }

        stage('Build') {
            steps {
                container('docker') {
                    echo 'Building the application...'
                    sh 'mvn clean package'
                }
            }
        }

        stage('Test') {
            steps {
                container('docker') {
                    echo 'Running tests...'
                    sh 'mvn test'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                container('docker') {
                    echo 'Building Docker image...'
                    sh 'docker build -t 127.0.0.1:5000/app:latest .'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                container('docker') {
                    echo 'Pushing Docker image to local registry...'
                    sh 'docker push 127.0.0.1:5000/app:latest'
                }
            }
        }

        stage('Deploy to Minikube') {
            steps {
                container('docker') {
                    echo 'Deploying to Minikube...'
                    sh 'kubectl apply -f k8s/deployment.yaml'
                    sh 'kubectl apply -f k8s/service.yaml'
                }
            }
        }

        stage('Port Forwarding') {
            steps {
                container('docker') {
                    echo 'Setting up port forwarding...'
                    sh 'kubectl port-forward svc/app 8080:8080 &'
                }
            }
        }
    }

    post {
        always {
            container('docker') {
                echo 'Cleaning up Docker images...'
                sh 'docker rmi 127.0.0.1:5000/app:latest || true'
            }
        }
    }
}
