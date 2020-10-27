module.exports = {
    kafka_topic: 'weather',
    kafka_server: 'localhost:2181',
    alert_threshold: process.env.alertThreshold || 60,
    kafka_host: process.env.KAFKA_HOST || 'kafka:9092'
};
