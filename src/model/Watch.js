module.exports = (sequelize, Sequelize) => {
    return sequelize.define("watch", {
        watchId: {
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        userId: {
            type: Sequelize.UUID,
            allowNull: false
        },
        zipcode: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
}
