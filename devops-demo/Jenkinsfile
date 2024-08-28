pipeline {
    agent none

    stages {
        stage('Build') {
            agent {
                kubernetes {
                    label 'maven-agent'
                    yaml """
                    apiVersion: v1
                    kind: Pod
                    spec:
                      containers:
                      - name: maven
                        image: maven:3.8.1-openjdk-11
                        command:
                        - cat
                        tty: true
                    """
                }
            }
            steps {
                container('maven') {
                    dir('devops-demo') {
                        sh 'mvn clean package'
                    }
                }
            }
        }
        stage('Test') {
            agent {
                kubernetes {
                    label 'maven-agent'
                    yaml """
                    apiVersion: v1
                    kind: Pod
                    spec:
                      containers:
                      - name: maven
                        image: maven:3.8.1-openjdk-11
                        command:
                        - cat
                        tty: true
                    """
                }
            }
            steps {
                container('maven') {
                    dir('devops-demo') {
                        sh 'mvn test'
                    }
                }
            }
        }
        stage('Build Docker Image') {
            agent {
                kubernetes {
                    label 'kaniko-agent'
                    yaml """
                    apiVersion: v1
                    kind: Pod
                    spec:
                      containers:
                      - name: kaniko
                        image: gcr.io/kaniko-project/executor:latest
                        command:
                        - /busybox/cat
                        tty: true
                        volumeMounts:
                        - name: gcr-secret
                          mountPath: /secret
                        args:
                        - --dockerfile=Dockerfile
                        - --context=dir://devops-demo
                        - --destination=gcr.io/YOUR_PROJECT_ID/devops-demo:latest
                        - --cleanup
                    volumes:
                    - name: gcr-secret
                      secret:
                        secretName: gcr-json-key
                    """
                }
            }
            steps {
                container('kaniko') {
                    dir('devops-demo') {
                        sh '/kaniko/executor --context=dir://devops-demo --dockerfile=Dockerfile --destination=gcr.io/YOUR_PROJECT_ID/devops-demo:latest --cleanup'
                    }
                }
            }
        }
        stage('Deploy to Kubernetes') {
            agent {
                kubernetes {
                    label 'kubectl-agent'
                    yaml """
                    apiVersion: v1
                    kind: Pod
                    spec:
                      containers:
                      - name: kubectl
                        image: bitnami/kubectl:1.20
                        command:
                        - cat
                        tty: true
                        volumeMounts:
                        - name: gcr-secret
                          mountPath: /secret
                    volumes:
                    - name: gcr-secret
                      secret:
                        secretName: gcr-json-key
                    """
                }
            }
            steps {
                container('kubectl') {
                    dir('devops-demo') {
                        sh 'kubectl set image deployment/your-deployment-name your-container-name=gcr.io/YOUR_PROJECT_ID/devops-demo:latest'
                        sh 'kubectl apply -f k8s/deployment.yaml'
                        sh 'kubectl apply -f k8s/service.yaml'
                    }
                }
            }
        }
    }
}
