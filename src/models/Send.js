// Send.js (D:\Projects\bluesky_bot\src\models\Send.js)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Send = sequelize.define('Send', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    message_id: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM('Success', 'Failed', 'Rate Limited', 'Blocked'), allowNull: false },
    error_message: { type: DataTypes.TEXT, allowNull: true },
    sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
    tableName: 'sends',
    timestamps: false,
});

module.exports = Send;