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
        stage('Checkout') {
            steps {
                // Ensure correct directory for the build, if necessary
                dir('numberGuessGame') { 
                    checkout scm // Explicitly check out the code
                }
            }
        }
// ---------------------------------------------------------------- //
// 1. THE BUILD STAGE: Compiles the code and packages the artifact //
// ---------------------------------------------------------------- //
        stage('Build') {
            steps {
                dir('numberGuessGame') {
                    // This command skips the tests and only compiles and packages
                    sh 'mvn -B clean package -DskipTests'
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
                    sh 'mvn test'
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
                result 'SUCCESS' 
            }
            steps {
                dir('numberGuessGame') {
                    // Save the final JAR or WAR file for deployment later
                    archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
                }
            }
        }
    }
}
