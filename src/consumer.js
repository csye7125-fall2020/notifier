const kafka = require("kafka-node");
const bp = require("body-parser");
const config = require("./kafka/kafka-config");
const watchService = require("./service/WatchService");

try {
    const Consumer = kafka.Consumer;
    const client = new kafka.KafkaClient();
    let consumer = new Consumer(
        client,
        [{topic: config.kafka_topic, partition: 0}],
        {
            autoCommit: true,
            fetchMaxWaitMs: 1000,
            fetchMaxBytes: 1024 * 1024,
            encoding: "utf8",
            fromOffset: false,
        }
    );
    consumer.on("message", async function (message) {
       console.log("kafka-> ", message.value);
       if(message.value.includes("deleted")){
           const watchId = message.value.slice(0, message.value.indexOf(" "));
           return watchService.deleteWatch(watchId)
               .then(data => {
                   console.log("Watch deleted successfully");
               }).catch(e => {
                   console.log("error while deleting watch " + e.messages);
           });
       }
        const watchJson = JSON.parse(message.value);
        console.log("watch json id: " + watchJson.watchId)
        if (!watchService.isWatchExist(watchJson.watchId)) {
            watchService.addWatch(watchJson)
                .then(watch_data => {
                    watchService.addAlert(watchJson.alerts, watch_data.watchId)
                        .then(alert_data => {
                            console.log("watch and alert saved successfully");
                        }).catch(e => console.log("error", e));
                }).catch(e => console.log("error", e));
        } else{
            const watch_update_resolve = (succ) => {
                watchService.getAlert(watchJson.alerts[0].alertId)
                    .then(alert_data => {
                        watchService.updateAlert(alert_data, watchJson.alerts)
                            .then(update_succ => console.log("Update success"))
                            .catch(e => console.log("error while updating alert "+ e.messages))
                    })
            }
            const resolve_getWatch = (watch_data) => {
                watchService.updateWatch(watch_data, watchJson)
                    .then(watch_update_resolve)
                    .catch(e => console.log("error while updating watch "+ e.messages));
            }

            watchService.getWatch(watchJson.watchId)
                .then(resolve_getWatch)
                .catch(e => console.log("error while updating watch", e));
        }
    });
    consumer.on("error", function (err) {
        console.log("error", err);
    });
} catch (e) {
    console.log(e);
}
