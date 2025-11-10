// Campaign.js (D:\Projects\bluesky_bot\src\models\Campaign.js)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Campaign = sequelize.define('Campaign', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('Pending', 'Running', 'Paused', 'Completed'), defaultValue: 'Pending' },
    total_targets: { type: DataTypes.INTEGER, defaultValue: 0 },
    sent_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    fail_count: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
    tableName: 'campaigns',
    timestamps: true,
});

module.exports = Campaign;