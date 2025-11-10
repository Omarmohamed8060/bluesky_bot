// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\models\targetList.model.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const TargetList = sequelize.define('TargetList', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    }, {
        tableName: 'targetLists', // تحديد اسم الجدول
        timestamps: true
    });

    return TargetList;
};