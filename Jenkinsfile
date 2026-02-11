pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'sahilll22'
        IMAGE_TAG = "${BUILD_NUMBER}"
        SONAR_SCANNER_OPTS = "-Xmx4096m"
    }
    
    stages {
        stage('Code Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Test Node.js Services') {
            agent {
                docker { 
                    image 'node:18-alpine' 
                    reuseNode true
                }
            }
            steps {
                sh '''
                    echo "========== Testing Node.js Services =========="
                    # Install and test Gateway
                    cd services/gateway
                    npm ci
                    npm test
                    
                    # Install and test Atmosphere
                    cd ../atmosphere
                    npm ci
                    npm test
                    
                    # Install and test Ecosystem
                    cd ../ecosystem
                    npm ci
                    npm test
                    
                    # Install and test Web
                    cd ../../apps/web
                    npm ci
                    npm test
                '''
            }
        }

        stage('Test Python Services') {
            agent {
                docker { 
                    image 'python:3.9-alpine'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    echo "========== Testing Python Services =========="
                    cd services/thermal
                    python -m venv venv
                    . venv/bin/activate
                    pip install -r requirements.txt
                    pytest --cov=. --cov-report=xml
                '''
            }
        }
        
        stage('SonarQube Analysis') {
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli:5.0.1'
                    reuseNode true
                    args '--network devops-tool_devops-net'
                }
            }
            steps {
                script {
                    echo "========== Running SonarQube Analysis =========="
                    sh 'rm -rf .scannerwork'
                    withSonarQubeEnv('SonarQube') {
                        sh '''
                            # Determine authentication parameters
                            SC_AUTH_ARGS=""
                            if [ -n "$SONAR_AUTH_TOKEN" ]; then
                                SC_AUTH_ARGS="-Dsonar.login=$SONAR_AUTH_TOKEN"
                            elif [ -n "$SONAR_LOGIN" ]; then
                                SC_AUTH_ARGS="-Dsonar.login=$SONAR_LOGIN"
                                if [ -n "$SONAR_PASSWORD" ]; then
                                    SC_AUTH_ARGS="$SC_AUTH_ARGS -Dsonar.password=$SONAR_PASSWORD"
                                fi
                            fi
                            
                            sonar-scanner \
                            $SC_AUTH_ARGS \
                            -Dsonar.projectKey=EcoSync \
                            -Dsonar.projectName=EcoSync \
                            -Dsonar.sources=. \
                            -Dsonar.exclusions=**/node_modules/**,**/coverage/**,**/dist/**,**/.git/**,**/venv/**,**/__pycache__/** \
                            -Dsonar.javascript.lcov.reportPaths=services/gateway/coverage/lcov.info,services/atmosphere/coverage/lcov.info,services/ecosystem/coverage/lcov.info,apps/web/coverage/lcov.info \
                            -Dsonar.python.coverage.reportPaths=services/thermal/coverage.xml \
                            -Dsonar.javascript.nodebridge.timeout=600 \
                            -Dsonar.javascript.node.maxspace=4096
                        '''
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    echo "========== Building Docker Images =========="
                    sh '''
                        docker build -t ${DOCKERHUB_USERNAME}/ecosync:gateway-${IMAGE_TAG} ./services/gateway
                        docker build -t ${DOCKERHUB_USERNAME}/ecosync:atmosphere-${IMAGE_TAG} ./services/atmosphere
                        docker build -t ${DOCKERHUB_USERNAME}/ecosync:thermal-${IMAGE_TAG} ./services/thermal
                        docker build -t ${DOCKERHUB_USERNAME}/ecosync:ecosystem-${IMAGE_TAG} ./services/ecosystem
                        docker build -t ${DOCKERHUB_USERNAME}/ecosync:web-${IMAGE_TAG} ./apps/web
                    '''
                }
            }
        }
        
        stage('Scan Images') {
            steps {
                script {
                    echo "========== Scanning Images with Trivy =========="
                    sh '''
                        # Run Trivy via Docker
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --severity HIGH,CRITICAL ${DOCKERHUB_USERNAME}/ecosync:gateway-${IMAGE_TAG}
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --severity HIGH,CRITICAL ${DOCKERHUB_USERNAME}/ecosync:atmosphere-${IMAGE_TAG}
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --severity HIGH,CRITICAL ${DOCKERHUB_USERNAME}/ecosync:thermal-${IMAGE_TAG}
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --severity HIGH,CRITICAL ${DOCKERHUB_USERNAME}/ecosync:ecosystem-${IMAGE_TAG}
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --severity HIGH,CRITICAL ${DOCKERHUB_USERNAME}/ecosync:web-${IMAGE_TAG}
                    '''
                }
            }
        }
        
        stage('Deploy to DockerHub') {
            steps {
                script {
                    echo "========== Deploying to DockerHub =========="
                    sh '''
                        echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                        
                        docker push ${DOCKERHUB_USERNAME}/ecosync:gateway-${IMAGE_TAG}
                        docker push ${DOCKERHUB_USERNAME}/ecosync:atmosphere-${IMAGE_TAG}
                        docker push ${DOCKERHUB_USERNAME}/ecosync:thermal-${IMAGE_TAG}
                        docker push ${DOCKERHUB_USERNAME}/ecosync:ecosystem-${IMAGE_TAG}
                        docker push ${DOCKERHUB_USERNAME}/ecosync:web-${IMAGE_TAG}
                        
                        docker logout
                    '''
                }
            }
        }

        stage('Update K8s Manifests') {
            steps {
                script {
                    echo "========== Updating K8s Manifests =========="
                    sh """
                        sed -i 's|gateway-.*|gateway-${IMAGE_TAG}|g' k8s/deployments.yaml
                        sed -i 's|atmosphere-.*|atmosphere-${IMAGE_TAG}|g' k8s/deployments.yaml
                        sed -i 's|thermal-.*|thermal-${IMAGE_TAG}|g' k8s/deployments.yaml
                        sed -i 's|ecosystem-.*|ecosystem-${IMAGE_TAG}|g' k8s/deployments.yaml
                        sed -i 's|web-.*|web-${IMAGE_TAG}|g' k8s/deployments.yaml
                    """
                    
                    withCredentials([usernamePassword(credentialsId: 'github-token', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
                        sh """
                            git config user.email "sahilt0971@gmail.com"
                            git config user.name "sahilt0971"
                            git add k8s/deployments.yaml
                            if ! git diff-index --quiet HEAD; then
                                git commit -m "Update image tags to ${IMAGE_TAG} [skip ci]"
                                git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/${GIT_USERNAME}/EcoSync.git HEAD:main
                            else
                                echo "No changes to commit"
                            fi
                        """
                    }
                }
            }
        }
    }
}
