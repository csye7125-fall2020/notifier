const Sequelize = require('sequelize');
const params = require("./db-params");

const sequelize = new Sequelize(params.DB, params.USER, params.PASSWORD, {
    host: params.HOST,
    dialect: params.DIALECT,
    operatorsAliases: false,
    pool: {
        max: params.POOL.max,
        min: params.POOL.min,
        acquire: params.POOL.acquire,
        idle: params.POOL.idle
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.watch = require("../model/Watch")(sequelize, Sequelize);
db.alert = require("../model/Alert")(sequelize, Sequelize);
db.status = require("../model/Status")(sequelize, Sequelize);

db.watch.hasMany(db.alert, {
    onUpdate: "cascade",
    onDelete: "cascade",
    foreignKey: {name: "watchId", allowNull: false}
});

db.alert.hasMany(db.status, {
    onUpdate: "cascade",
    onDelete: "cascade",
    foreignKey: {name: "alertId", allowNull: false}
});

module.exports = db;
