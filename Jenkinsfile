pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'sahilll22'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Code Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Tests') {
            steps {
                sh '''
                    npm ci
                    cd services/gateway && npm ci && npm test || true
                    cd ../atmosphere && npm ci && npm test || true
                    cd ../ecosystem && npm ci && npm test || true
                    cd ../../apps/web && npm ci && npm test || true
                    
                    cd ../../services/thermal
                    python3 -m venv venv
                    . venv/bin/activate
                    pip install -r requirements.txt
                    pytest || true
                '''
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner'
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                sh '''
                    docker build -t ${DOCKERHUB_USERNAME}/ecosync-gateway:${IMAGE_TAG} ./services/gateway
                    docker build -t ${DOCKERHUB_USERNAME}/ecosync-atmosphere:${IMAGE_TAG} ./services/atmosphere
                    docker build -t ${DOCKERHUB_USERNAME}/ecosync-thermal:${IMAGE_TAG} ./services/thermal
                    docker build -t ${DOCKERHUB_USERNAME}/ecosync-ecosystem:${IMAGE_TAG} ./services/ecosystem
                    docker build -t ${DOCKERHUB_USERNAME}/ecosync-web:${IMAGE_TAG} ./apps/web
                '''
            }
        }
        
        stage('Scan Images') {
            steps {
                sh '''
                    trivy image ${DOCKERHUB_USERNAME}/ecosync-gateway:${IMAGE_TAG}
                    trivy image ${DOCKERHUB_USERNAME}/ecosync-atmosphere:${IMAGE_TAG}
                    trivy image ${DOCKERHUB_USERNAME}/ecosync-thermal:${IMAGE_TAG}
                    trivy image ${DOCKERHUB_USERNAME}/ecosync-ecosystem:${IMAGE_TAG}
                    trivy image ${DOCKERHUB_USERNAME}/ecosync-web:${IMAGE_TAG}
                '''
            }
        }
        
        stage('Deploy to DockerHub') {
            steps {
                sh '''
                    echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                    
                    docker push ${DOCKERHUB_USERNAME}/ecosync-gateway:${IMAGE_TAG}
                    docker push ${DOCKERHUB_USERNAME}/ecosync-atmosphere:${IMAGE_TAG}
                    docker push ${DOCKERHUB_USERNAME}/ecosync-thermal:${IMAGE_TAG}
                    docker push ${DOCKERHUB_USERNAME}/ecosync-ecosystem:${IMAGE_TAG}
                    docker push ${DOCKERHUB_USERNAME}/ecosync-web:${IMAGE_TAG}
                    
                    docker logout
                '''
            }
        }
    }
}
