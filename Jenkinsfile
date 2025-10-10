pipeline {
    // Configure your agent and tools as before
    agent any 
    tools {
        maven 'M3' 
    }

    triggers {
        // Run every minute if there's an SCM change
        pollSCM('H/1 * * * *') 
        
        // Run every day at midnight (00:00)
        cron('0 0 * * *') 
    }
    stages {
    // ---------------------------------------------------------------- //
    // 1. THE BUILD STAGE: Compiles the code and packages the artifact //
    // ---------------------------------------------------------------- //
        stage('Build') {
            steps {
                dir('numberGuessGame') {
                    // This command skips the tests and only compiles and packages
                    powershell 'mvn -B clean package -DskipTests'
                }
            }
        }

    // --------------------------------------------------------- //
    // 2. THE TEST STAGE: Runs tests on the packaged artifact //
    // --------------------------------------------------------- //
        stage('Test') {
            steps {
                dir('numberGuessGame') {
                    // This command runs the tests on the compiled code
                    powershell 'mvn test'
                }
            }
            post {
                // This ensures the test results are published even if some tests fail
                always {
                    junit '**/target/surefire-reports/*.xml' 
                }
            }
        }
        
    // --------------------------------------------------------- //
    // 3. (Optional) ARCHIVE STAGE: Save the build artifact      //
    // --------------------------------------------------------- //
        stage('Archive Artifacts') {
            when {
                // Only archive if all previous stages (including Test) succeeded
                expression { 
                    return currentBuild.result == 'SUCCESS' || currentBuild.result == null
                }
            }
            steps {
                dir('numberGuessGame') {
                    // Save the final JAR or WAR file for deployment later
                    archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
                }
            }
        }
        stage('Simulate Blue/Green Redeployment') {
            steps {
                script {
                    def appDir = "numberGuessGame"
                    def jarFile = findFiles(glob: "${appDir}/target/*.jar")[0]
                    def jarPath = jarFile.path
                    echo "1. Checking for old service on port 8080 (Simulated Old Version)..."
                    // Kill any old instance
                    sh 'fuser -k 8080/tcp || true'
                    echo "2. Launching NEW application version (Build ${env.BUILD_NUMBER})..."
                    sh "nohup java -jar ${jarPath} > app.log 2>&1 &"
                    sleep 15 // Give it time to start up
                    echo "3. Traffic Switch: Verifying NEW application health..."
                    sh 'curl --fail http://localhost:8080/ || exit 1'
                    echo "4. Success! New version is live on simulated server."
                }
            }
            post {
                always {
                    echo "Safety net: Cleaning up port 8080 for the next deployment..."
                    sh 'fuser -k 8080/tcp || true'
                }
            }
        }
        stage('Visualization') {
            parallel {
                stage('Show Metrics') {
                    steps {
                        echo 'Visualizing build metrics...'
                        // Add real visualization logic here
                    }
                }
                stage('Show Logs') {
                    steps {
                        echo 'Visualizing build logs...'
                        // Add real visualization logic here
                    }
                }
            }
        }
    }
}
