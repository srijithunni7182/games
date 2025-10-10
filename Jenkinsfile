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
                    // findFiles is a Groovy step and works cross-platform after installing the utility plugin
                    def jarFile = findFiles(glob: "${appDir}/target/*.jar")[0]
                    def jarPath = jarFile.path

                    // --- 1. PRE-EMPTIVE CLEANUP (KILL OLD PROCESS) ---
                    echo "1. Pre-emptive cleanup: Ensuring port 8080 is free before launch... 🧹"

                    // PowerShell command to find the process ID (PID) listening on port 8080 and forcefully stop it.
                    // -ErrorAction SilentlyContinue prevents the pipeline from failing if the port is already free.
                    pwsh '''
                        $PID = (Get-NetTCPConnection -LocalPort 8080 -State Listen).OwningProcess
                        if ($PID) {
                            Write-Host "Killing existing process with PID: $PID"
                            Stop-Process -Id $PID -Force -ErrorAction SilentlyContinue
                        } else {
                            Write-Host "Port 8080 is already free."
                        }
                    '''

                    // --- 2. Launching NEW application version ---
                    echo "2. Launching NEW application version (Build ${env.BUILD_NUMBER}) on port 8080... 🚀"

                    // `Start-Process` runs the command in the background. `-NoNewWindow` is critical.
                    // We redirect output to a file to keep the console clean.
                    pwsh "Start-Process -FilePath 'java' -ArgumentList '-jar', \"${jarPath}\" -NoNewWindow -RedirectStandardOutput 'app.log' -RedirectStandardError 'app.log'"

                    echo "3. Giving the app 15 seconds to start up..."
                    sleep 15 // Groovy 'sleep' works fine

                    // --- 4. Health Check and Verification ---
                    echo "4. Traffic Switch: Verifying NEW application health... ✅"
                    // Invoke-WebRequest is the native PowerShell way to check an HTTP endpoint.
                    // -StatusCode 200 checks for a successful response.
                    pwsh 'Invoke-WebRequest -Uri "http://localhost:8080/" -StatusCode 200 -UseBasicParsing'

                    echo "5. Success! New version is live on simulated server."
                }
            }
            // ---------------------------------------------------------------- //
            // POST SECTION: Final safety net cleanup.
            // ---------------------------------------------------------------- //
            post {
                always {
                    echo "Safety net: Cleaning up port 8080 for the next deployment... 🛡️"
                    // Repeat the cleanup logic to ensure the process is killed even if the health check failed.
                    pwsh '''
                        $PID = (Get-NetTCPConnection -LocalPort 8080 -State Listen).OwningProcess
                        if ($PID) {
                            Write-Host "Safety kill process with PID: $PID"
                            Stop-Process -Id $PID -Force -ErrorAction SilentlyContinue
                        }
                    '''
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
