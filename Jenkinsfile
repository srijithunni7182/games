pipeline {
    agent any // Runs on any available Jenkins agent (your local machine in this case)

    tools {
        // This tool name must match the name you configured in 
        // Manage Jenkins > Global Tool Configuration
        maven 'M3' 
    }

    stages {
        stage('Build') {
            steps {
                // Since we used 'tools', Jenkins automatically adds Maven to the PATH.
                dir('numberGuessGame') { 
                    powershell 'mvn clean install -DskipTests'
                }
            }
        stage('Test') {
            steps {
                // Since we used 'tools', Jenkins automatically adds Maven to the PATH.
                dir('numberGuessGame') { 
                    powershell 'mvn test'
                }
            }
        }
    }
}
}
