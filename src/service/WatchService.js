"use strict";
const db = require("../db/db-config");
const Watch = db.watch;
const Alert = db.alert;

exports.isWatchExist = function (watchId) {
    return Watch.count({
        where: { watchId: watchId }
    });
}

exports.addWatch = (watch) => {
    return Watch.create({
        watchId: watch.watchId,
        userId: watch.userId,
        zipcode: watch.zipcode
    });
}

exports.addAlert = (alerts, watchId) => {
    for (let i in alerts) {
        alerts[i]["watchId"] = watchId;
    }
    return Alert.bulkCreate(alerts);
}

exports.addSingleAlert = (alert) => {
    return Alert.create( alert );
}

exports.deleteSingleAlert = (alert) => {
    return Alert.destroy({
        where: {
            alertId: alert.alertId
        }
    });
}

exports.updateWatch = (newWatch) => {
    return Watch.update(newWatch, {
        where: {
            watchId: newWatch.watchId
        }
    });
}

exports.updateAlert = (oldAlert, newAlert) => {
    const updatedAlert = {
        fieldType: newAlert[0].fieldType ? newAlert[0].fieldType : oldAlert.fieldType,
        operator: newAlert[0].fieldType ? newAlert[0].operator : oldAlert.operator,
        value: newAlert[0].value ? newAlert[0].value : oldAlert.value
    }
    return Alert.update(updatedAlert, {
        where: {
            alertId: newAlert.alertId
        }
    });
}

exports.deleteWatch = (watchId) => {
    return Watch.destroy({
        where: {
            watchId: watchId
        }
    });
}

exports.getWatch = (watchId) => {
    return Watch.findOne({
        where: {
            watchId: watchId
        },
        include: ["alerts"]
    })
}

exports.getAlert = (alertId) => {
    return Alert.findOne({
        where: {
            alertId: alertId
        }
    })
}

