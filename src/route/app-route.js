"use strict";

module.exports = function (app) {
    const healthCtrl = require("../controller/HealthCtrl");
    app.get("/health", healthCtrl.health);
};
