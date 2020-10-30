const {QueryTypes} = require('sequelize');
const kafka = require('kafka-node');
const config = require("../kafka/kafka-config");
const db = require("../db/db-config");

exports.health = (req, res) => {
    try {
        db.sequelize.query("SELECT 'MySQL up and running' as resp", {type: QueryTypes.SELECT})
            .then(succ => {
                if (succ) {
                    console.log("Db connection success.. DB Health OK");

                    const client = new kafka.KafkaClient({kafkaHost: config.kafka_host});

                    client.loadMetadataForTopics(["watch", "weather"], (err, resp) => {
                        if (err && err.message.includes("Request timed out")) {
                            return res.status(503).json({
                                health: "DOWN",
                                dbConnection: "success",
                                kafkaConnection: "fail",
                                status: "NOT READY",
                                cause: err.message
                            });
                        } else if (err) {
                            return res.status(400).json({
                                health: "DOWN",
                                dbConnection: "success",
                                kafkaConnection: "fail",
                                status: "ERROR",
                                cause: err
                            });
                        }
                        console.log(JSON.stringify(resp));
                        res.status(200).json({health: "UP"});
                    });
                }
            })
            .catch(err => {
                return res.status(400).json({
                    health: "DOWN",
                    dbConnection: "success",
                    kafkaConnection: "fail",
                    status: "ERROR",
                    cause: err
                });
            });
    } catch (e) {
        return res.status(400).json({health: "DOWN", status: "ERROR", cause: err});
    }
}
