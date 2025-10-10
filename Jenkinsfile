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

                    // -----------------------------------------------------------------
                    // 1. PRE-EMPTIVE CLEANUP (Kill Before Launch) - Use Groovy try-catch
                    // -----------------------------------------------------------------
                    echo "1. Pre-emptive cleanup: Ensuring port 8080 is free before launch... 🧹"

                    // Use try-catch to wrap the bat command, ensuring the Groovy script
                    // does not fail if no process is found (which causes taskkill/netstat to error).
                    try {
                        // This command chain finds the PID listening on 8080 and kills it.
                        // It is designed to be highly reliable, but will error if nothing is found.
                        bat '''
                            FOR /F "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') DO (
                                ECHO Killing existing process with PID: %%a
                                taskkill /F /PID %%a
                            )
                        '''
                    } catch (e) {
                        // Ignore the error; it simply means no process was running.
                        echo "Pre-emptive kill completed (no running process found, or process killed)."
                    }

                    // --- 2. Launching NEW application version ---
                    echo "2. Launching NEW application version (Build ${env.BUILD_NUMBER}) on port 8080... 🚀"
                    // Use 'start /B' for background launch
                    bat "start /B java -jar \"${jarPath}\""

                    echo "3. Giving the app 15 seconds to start up..."
                    sleep 15

                    // --- 4. Health Check and Verification ---
                    echo "4. Traffic Switch: Verifying NEW application health... ✅"
                    // Use a reliable Windows curl or powershell Invoke-WebRequest here
                    powershell 'Invoke-WebRequest -Uri "http://localhost:8080/" -StatusCode 200 -UseBasicParsing'

                    echo "5. Success! New version is live on simulated server."
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
