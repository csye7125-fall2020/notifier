module.exports = (sequelize, Sequelize) => {
    return sequelize.define("status", {
        statusId: {
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
}
