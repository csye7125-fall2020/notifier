module.exports = {
    kafka_topic: 'weather',
    kafka_server: 'localhost:2181',
    alert_threshold: process.env.alertThreshold || 60
};
