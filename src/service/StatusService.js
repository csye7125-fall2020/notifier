"use strict";
const db = require("../db/db-config");
const Status = db.status;
const watchService = require("./WatchService");
const {QueryTypes} = require('sequelize');
const uuid = require('uuid');
const config = require("../kafka/kafkaConfig");

exports.updateAlertStatus = (watchJson) => {
    watchService.getWatch(watchJson.watchId)
        .then(watchData => {
            console.log("watchData: " + watchData);
            const watch = watchData.toJSON();
            // Check if any alert condition is matching
            let matchingAlertId = "0";

            for (let i = 0; i < watch.alerts.length; i++) {
                let alert = watch.alerts[i];
                if ((alert.operator === 'lt' && watchJson.main[alert.fieldType] < alert.value) ||
                    (alert.operator === 'gt' && watchJson.main[alert.fieldType] > alert.value) ||
                    (alert.operator === 'lte' && watchJson.main[alert.fieldType] <= alert.value) ||
                    (alert.operator === 'gte' && watchJson.main[alert.fieldType] >= alert.value) ||
                    (alert.operator === 'eq' && watchJson.main[alert.fieldType] === alert.value)
                ) {
                    matchingAlertId = alert.alertId;
                    break;
                }
            }

            if (matchingAlertId !== "0") {
                let sql = "SELECT s.statusId, s.`status`, s.alertId, s.createdAt " +
                    "FROM statuses s " +
                    "JOIN alerts a ON s.alertId = a.alertId " +
                    "JOIN watches w ON a.watchId = a.watchId " +
                    "WHERE s.`status` = 'ALERT_SEND' AND w.userId = '" + watch.userId + "' " +
                    "ORDER BY s.createdAt DESC LIMIT 1";

                db.sequelize.query(sql, {type: QueryTypes.SELECT})
                    .then(function (prevStatuses) {
                        let ignoreFlag = false;
                        let thresholdFlag = false;
                        for (let i = 0; i < watch.alerts.length; i++) {
                            let alert = watch.alerts[i];
                            if (typeof prevStatuses == 'undefined' || prevStatuses.length <= 0) {
                                if (i === 0) {
                                    Status.create({
                                        statusId: uuid.v4(),
                                        alertId: alert.alertId,
                                        status: "ALERT_SEND"
                                    });
                                } else {
                                    Status.create({
                                        statusId: uuid.v4(),
                                        alertId: alert.alertId,
                                        status: "ALERT_IGNORED_TRESHOLD_REACHED"
                                    });
                                }
                            } else {

                                let prevStatus = prevStatuses[0];

                                let minutes = Math.abs(new Date() - prevStatus.createdAt) / (config.alert_threshold * 1000);
                                if (minutes >= 60) {
                                    // ALERT_SEND status
                                    if (alert.alertId === matchingAlertId) {
                                        Status.create({
                                            statusId: uuid.v4(),
                                            alertId: alert.alertId,
                                            status: "ALERT_SEND"
                                        });
                                    } else {
                                        Status.create({
                                            statusId: uuid.v4(),
                                            alertId: alert.alertId,
                                            status: "ALERT_IGNORED_TRESHOLD_REACHED"
                                        });
                                    }
                                } else {
                                    Status.create({
                                        statusId: uuid.v4(),
                                        alertId: alert.alertId,
                                        status: "ALERT_IGNORED_DUPLICATE"
                                    });
                                }

                            }
                        }
                    });
            }
        });
}
