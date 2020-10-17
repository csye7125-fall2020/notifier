"use strict";
const db = require("../db/db-config");
const Watch = db.watch;
const Alert = db.alert;
const Status = db.status;
const watchService = require("./WatchService");
const Op = db.Sequelize.Op;
const { QueryTypes } = require('sequelize');
const uuid = require('uuid');
const config = require("../kafka/kafka-config");

exports.updateAlertStatus = (watchId, watchJson) => {
    watchService.getWatch(watchId)
        .then(watchData => {
            console.log("watchData: " + watchData);
            const watch = watchData.toJSON();
            // Check if any alert condition is matching
            var matchingAlertId = "0";

            for (var i = 0; i < watch.alerts.length; i++) {
                var alert = watch.alerts[i];
                if ((alert.operator == 'lt' && watchJson.main[alert.fieldType] < alert.value) ||
                    (alert.operator == 'gt' && watchJson.main[alert.fieldType] > alert.value) ||
                    (alert.operator == 'lte' && watchJson.main[alert.fieldType] <= alert.value) ||
                    (alert.operator == 'gte' && watchJson.main[alert.fieldType] >= alert.value) ||
                    (alert.operator == 'eq' && watchJson.main[alert.fieldType] == alert.value)
                ) {
                    matchingAlertId = alert.alertId;
                    break;
                }
            }

            if (matchingAlertId != "0") {
                // var alertIds = watch.alerts.map(function (val) {
                //     return val.alertId;
                // }).join(',');
                // var alertIdArray = string.split(',');
                // console.log(alertIds);
                // var sql = "SELECT statusId, `status`, alertId, createdAt FROM statuses "+
                //             " WHERE statusId IN( "+
                //             " SELECT MAX(createdAt) "+
                //             " FROM statuses where `status` = 'ALERT_SEND' "+
                //             " GROUP BY alertId "+
                //             " );"
                var sql = "SELECT s.statusId, s.`status`, s.alertId, s.createdAt " +
                    "FROM statuses s " +
                    "JOIN alerts a ON s.alertId = a.alertId " +
                    "JOIN watches w ON a.watchId = a.watchId " +
                    "WHERE s.`status` = 'ALERT_SEND' AND w.userId = '" + watch.userId + "' " +
                    "ORDER BY s.createdAt DESC LIMIT 1";

                // var sql = "SELECT a.statusId, a.`status`, a.alertId, a.createdAt " +
                //             "FROM statuses a "+
                //             "INNER JOIN( "+
                //                 "SELECT ANY_VALUE(s.statusId) statusId, MAX(s.createdAt) createdAt " +
                //                 "FROM statuses s  " +
                //                 "JOIN alerts a ON s.alertId = a.alertId " +
                //                 "JOIN watches w ON a.watchId = a.watchId " +
                //                 "WHERE s.`status` = 'ALERT_SEND' AND w.userId = '" + watch.userId + "' "+
                //                 "GROUP BY s.alertId "+
                //             ") b ON a.statusId = b.statusId AND a.createdAt = b.createdAt";

                db.sequelize.query(sql, { type: QueryTypes.SELECT })
                    .then(function (prevStatuses) {
                        var ignoreFlag = false;
                        var thresholdFlag = false;
                        for (var i = 0; i < watch.alerts.length; i++) {
                            var alert = watch.alerts[i];
                            if (typeof prevStatuses == 'undefined' || prevStatuses.length <= 0) {
                                if (i == 0) {
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

                                var prevStatus = prevStatuses[0];

                                var minutes = Math.abs(new Date() - prevStatus.createdAt) / (config.alert_threshold * 1000);
                                if (minutes >= 60) {
                                    // ALERT_SEND status
                                    if (alert.alertId == matchingAlertId) {
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
                        // watch.alerts.forEach(alert => {


                        // });
                    });

                // var recentAlertStatuses = Status.findAll({
                //                                 attributes: [sequelize.fn("max", sequelize.col('createdAt'))],
                //                                 group: ["alertId"],
                //                                 where: { [Op.in]: alertIdArray}
                //                             }).then(function (maxIds) {
                //                                 return Status.findAll({
                //                                     where: {
                //                                         id: {
                //                                             [Op.in]: maxIds
                //                                         }
                //                                     }
                //                                 })
                //                             }).then(function (result) {
                //                                 return Promise.resolve(result);
                //                             });

                // watch.alerts.forEach(alert => {

                // });
            }
        });

    
}