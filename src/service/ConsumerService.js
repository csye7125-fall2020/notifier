const kafka = require("kafka-node");
const config = require("../kafka/kafkaConfig");
const watchService = require("./WatchService");
const statusService = require("./StatusService");

const client = require('prom-client');

const consumedCounter = new client.Counter({
    name: 'notifier_count_message_consumed',
    help: 'The total number of messages consumed'
});

const metrics_util = require("../util/metrics_util");
const histogram = metrics_util.histogram;

try {
    const end = histogram.startTimer();
    const options = {
        kafkaHost: config.kafka_host,
        groupId: 'WeatherGroup',
        sessionTimeout: 15000,
        protocol: ['roundrobin'],
        fromOffset: 'earliest' // equivalent of auto.offset.reset valid values are 'none', 'latest', 'earliest'
    };
    const consumerGroup = new kafka.ConsumerGroup(options, config.kafka_topic);

    consumerGroup.on("message", function (message) {
        const sec = end();
        console.info("Kafka response time: ", sec);

        console.log("kafka-> ", message.value);
        console.log(
            '%s read msg Topic="%s" Partition=%s Offset=%d',
            this.client.clientId,
            message.topic,
            message.partition,
            message.offset
        );
        consumedCounter.inc();
        const watchJson = JSON.parse(message.value);
        console.log("watch json id: " + watchJson.watchId)
        console.log("isWatchExist: " + watchService.isWatchExist(watchJson.watchId));

        watchService.isWatchExist(watchJson.watchId)
            .then(existingWatchCount => {
                if (existingWatchCount <= 0) {
                    watchService.addWatch(watchJson)
                        .then(watch_data => {
                            watchService.addAlert(watchJson.alerts, watch_data.watchId)
                                .then(alert_data => {
                                    console.log("watch and alert saved successfully");

                                    //update the the alert status
                                    statusService.updateAlertStatus(watchJson);
                                }).catch(e => console.log("error", e));
                        }).catch(e => console.log("error", e));
                } else {


                    watchService.getWatch(watchJson.watchId)
                        .then(existingWatch => {
                            if (new Date(watchJson.updatedAt) > existingWatch.updatedAt) {
                                watchService.updateWatch(watchJson)
                                    .then(watch_data => {
                                        console.log("watch updated successfully");
                                    }).catch(e => console.log("error", e));

                                // updating alerts
                                for (let i = 0; i < watchJson.alerts.length; i++) {
                                    // iterate for each alert. compare and update.
                                    let flag = false;
                                    for (let j = 0; j < existingWatch.alerts.length; j++) {
                                        if (watchJson.alerts[i].alertId === existingWatch.alerts[j].alertId) {
                                            flag = true;
                                            break;
                                        }
                                    }
                                    if (!flag) {
                                        watchService.addSingleAlert(watchJson.alerts[i]);
                                    }
                                }

                                for (let i = 0; i < existingWatch.alerts.length; i++) {
                                    // iterate for each alert. compare and update.
                                    let flag = false;
                                    for (let j = 0; j < watchJson.alerts.length; j++) {
                                        if (existingWatch.alerts[i].alertId === watchJson.alerts[j].alertId) {
                                            flag = true;
                                            break;
                                        }
                                    }
                                    if (!flag) {
                                        watchService.deleteSingleAlert(existingWatch.alerts[i]);
                                    }
                                }
                            }

                            //update the the alert status
                            statusService.updateAlertStatus(watchJson);
                        });
                }
            });

    });
    consumerGroup.on("error", function (err) {
        const sec = end();
        console.info("Kafka response time: ", sec);

        console.error("Error while consuming kafka", err.message);
    });
} catch (e) {
    console.error(e.message);
}
