# Notifier
test
Notifier microservice implementation using Node.js and Kafka for consuming watch/alert information with weather information for users from `poller` microservice and update notification status.

## Team Members:
1. Rajashree Joshi
1. Kinnar Kansara

Technology stack:
- Node.js (v12.x)
- Apache Kafka (Streaming platform)
- MySQL Server 8
- Docker


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
    
