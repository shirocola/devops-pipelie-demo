pipeline {
    agent {
        kubernetes {
            label 'docker-kubectl-agent'
            yaml """
            apiVersion: v1
            kind: Pod
            spec:
              containers:
              - name: maven
                image: maven:3.8.1-jdk-11
                command:
                - cat
                tty: true
                volumeMounts:
                - name: workspace-volume
                  mountPath: /home/jenkins/agent
              - name: docker
                image: docker:20.10.7
                command:
                - cat
                tty: true
                volumeMounts:
                - name: docker-sock
                  mountPath: /var/run/docker.sock
                - name: workspace-volume
                  mountPath: /home/jenkins/agent
              - name: kubectl
                image: lachlanevenson/k8s-kubectl:v1.18.0
                command:
                - cat
                tty: true
                volumeMounts:
                - name: workspace-volume
                  mountPath: /home/jenkins/agent
              volumes:
              - name: docker-sock
                hostPath:
                  path: /var/run/docker.sock
              - name: workspace-volume
                emptyDir: {}
            """
        }
    }
    stages {
        stage('Setup Namespace and RBAC') {
            steps {
                container('kubectl') {
                    echo 'Setting up Namespace and RBAC...'
                    sh 'kubectl apply -f infra/local/namespace.yaml || true'  // Create namespace if not already created
                    sh 'kubectl apply -f infra/local/rbac.yaml'
                }
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
        stage('Build Docker Image') {
            steps {
                container('docker') {
                    echo 'Building the Docker image...'
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
                container('kubectl') {
                    echo 'Deploying to Minikube...'
                    sh 'kubectl apply -f infra/local/deployment.yaml'
                    sh 'kubectl apply -f infra/local/service.yaml'
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
