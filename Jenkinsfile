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
    }

