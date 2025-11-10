// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\models\campaign.model.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Campaign = sequelize.define('Campaign', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        // ⚠️ إزالة جميع حقول المفاتيح الخارجية من التعريف المباشر
        status: {
            type: DataTypes.ENUM('draft', 'running', 'paused', 'completed', 'error'),
            defaultValue: 'draft',
            allowNull: false
        },
    }, {
        tableName: 'campaigns',
        timestamps: true
    });

    return Campaign;
};