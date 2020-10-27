# Notifier

Notifier microservice implementation using Node.js and Kafka for consuming watch/alert information with weather information for users from `poller` microservice and update notification status.

## Team Members:
1. Rajashree Joshi
1. Kinnar Kansara

Technology stack:
- Node.js (v12.x)
- Apache Kafka (Streaming platform)
- MySQL Server 8
- Docker
- Helm (For installing helm charts. Needs `kubectl` installed and `kubeconfig` set)

## Reuirements

- Node.js and npm

    https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions

    - Debian and Ubuntu based distributions (Node.js v12.x)
        ```$xslt
        # Using Ubuntu
        curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
        sudo apt-get install -y nodejs

        # Using Debian, as root
        curl -sL https://deb.nodesource.com/setup_12.x | bash -
        apt-get install -y nodejs
        ```

    - Installing dependencies from `package.json`
        ```
        Execute `npm install` from root of the repo
        ```

- Apache Kafka: https://kafka.apache.org/downloads

- MySQL: Install and configure MySQL from `apt` repo.

- Docker: 


### Kafka Configuration

Download Kafka binary from above URL and setup services with following commands.

- Zookeeper
    
    Start zookeeper service with:
        
        bin/zookeeper-server-start.sh config/zookeeper.properties

- Kafka Brokers

    Configure and start Kafka brokers
    ```
    bin/kafka-server-start.sh config/server.properties
    ```

- Create a Kafka Topic

    We can start with 1 replication factor and partition. Change these configurations based on the requirements
    ```
    bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic test
    ```

- Run Kafka Producer
    ```
    bin/kafka-console-producer --broker-list localhost:9092 --topic test
    ```

- Run Kafka Consumer
    ```
    bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test --from-beginning
    ```

*TIP: In case Zookeeper or Kafka Broker become unresponsive or unable to terminate, executing `jps` command on the shell would give all JVM instances. To kill the processes, `kill -9 <pid>` would do the trick.*


### Testing locally with Docker

- Testing app with dockerized environment

    Create a private repository on docker hub. Name it `notifier`.

- Build Docker image
    ```
    sudo docker build -t <your docker username>/notifier .
    ```

- Push image to Docker hub
    ```
    sudo docker push <your docker username>/notifier:latest
    ```
    *In case you are not logged in, use below command to login to Docker hub*
    ```
    sudo docker login -u <your docker username> --password-stdin
    ```

- Run the image
    ```
    sudo docker run -e DBUser='<db username>' -e DBPassword='<db password>' -e DBName='csye7125_notifier' -e DBHost='localhost' -e alertThreshold=60 -it --name notifier --network="host" <your docker username>/notifier:latest
    ```
    *`alertThreshold` environment variable is used to send alert again after defined threshold*

### Installing helm chart

Make sure the context for kubernetes is defined for `kubectl` and `helm` is installed

To create new deployment, use below command to deploy `notifier` application
```
helm install notifier ./helm/notifier-helm/ -f ./helm/my-values.yaml
```
Things to consider:
- First you need to create `kubernetes` secret by executing below command
    ```    
    kubectl create secret docker-registry regcred --docker-server=https://index.docker.io/v1/ --docker-username=<docker_hub_uname> --docker-password=<docker_hub_password> --docker-email=<email_used_for_docker_hub>
    ```
    Get the secret by executing
    ```
    kubectl get secret regcred --output=yaml
    ```
    Copy base64 value in `imageCredentials.dockerconfig` of `my-values.yaml`.

- Replace the RDS instance endpoint in `rdsdata.db_host`.


Example `my-values.yaml` will look like:
    
    imageCredentials:
      dockerconfig: <your secret>

    spec:
      imageName: <docker username/notifier:latest

    rdsdata:
      db_host: notifier-rds-instance.abcd0123456.us-east-1.rds.amazonaws.com
      db_name: csye7125_notifier
      db_user: csye7125_user
      db_password: Asdf#12345$
