const client = require("prom-client");
const register = new client.Registry();

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register });

register.setDefaultLabels({
    app: 'notifier'
});

module.exports = {
    histogram: new client.Histogram({
        name: 'timed_kafka_calls',
        help: 'The time taken to process database queries'
    })
}
