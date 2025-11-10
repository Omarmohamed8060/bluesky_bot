// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\models\account.model.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Account = sequelize.define('Account', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        handle: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        did: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        appPassword: {
            type: DataTypes.STRING, // سيتم تخزين النص المشفر
            allowNull: false
        },
        proxy: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'banned', 'error'),
            defaultValue: 'active',
            allowNull: false
        },
        lastUsedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        dailySendCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        errorCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        tableName: 'accounts',
        timestamps: true // لإضافة createdAt و updatedAt
    });

    return Account;
};