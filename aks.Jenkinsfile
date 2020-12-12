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
    stage('AZ Login') {
      steps {
        sh "az login --service-principal --username ${env.APP_ID}  --password ${env.PASSWORD} --tenant ${env.TENANT}"
      }
    }
    stage('Export KubeConfig Credentials ') {
      steps {
        //Exporting kubeConfig for kubectl so helm can upgrade
        sh "az aks get-credentials --name ${env.AKS_CLUSTER_NAME} --resource-group ${env.AKS_RESOURCE_GROUP} --overwrite-existing"
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
