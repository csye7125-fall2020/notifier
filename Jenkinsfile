pipeline {
  environment {
    dockerRegistry = "${env.dockerRegistry}"
    dockerRegistryCredential = "${env.dockerRegistryCredential}"
    dockerImage = ''
  }
  agent any
  tools {nodejs "node" }
  stages {
    stage('Show GIT_URL') {
      steps {
        sh "echo ${env.GIT_URL}"
      }
    }
    stage('Export kubecfg via kops') {
      steps {
        //Exporting kubecfg for kubectl so helm can upgrade
        sh 'kops export kubecfg'
      }
    }
    stage('Show kubectl nodes') {
      steps {
        sh "echo showing_nodes"
        sh "kubectl get node"
        sh "kubectl get pod"
      }
    }
    stage('Cloning Git') {
      steps {
        git credentialsId: 'git_fork_private_key', url: "${env.GIT_URL}"
      }
    }
    stage('Build') {
       steps {
         sh 'npm install'
       }
    }
    stage('Get last git commit') {
       steps {
           script {
                git_hash = sh(returnStdout: true, script: "git rev-parse HEAD").trim()
           }
       }
    }
    stage('Building image') {
       steps{
         script {
           dockerImage = docker.build dockerRegistry + ":${git_hash}"
         }
       }
     }
     stage('Upload Image') {
       steps{
         script {
           docker.withRegistry( '', dockerRegistryCredential ) {
             dockerImage.push("${git_hash}")
             dockerImage.push("latest")
           }
         }
       }
     }
     stage('Remove Unused docker image') {
       steps{
         sh "docker rmi $dockerRegistry:${git_hash}"
       }
     }
    stage('Write file my-values.yaml') {
      steps{
        writeFile file: 'helm/my-values.yaml', text: "${env.my_values_yaml.replace(dockerRegistry + ':latest', dockerRegistry + ':' + git_hash)}"
      }
    }
    stage('Helm upgrade') {
      steps{
        sh "helm upgrade --install notifier ./helm/notifier-helm/ -f helm/my-values.yaml"
      }
    }
  }
}
