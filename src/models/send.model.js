// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\models\send.model.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Send = sequelize.define('Send', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        campaignId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        accountId: {
            type: DataTypes.INTEGER,
            allowNull: true, 
        },
        // ⚠️ [الحل الجذري] نوقف تعريف targetDid هنا مؤقتاً لتجنب خطأ الترتيب
        // targetDid: { 
        //     type: DataTypes.STRING,
        //     allowNull: false,
        // },
        status: {
            type: DataTypes.ENUM('pending', 'sent', 'failed'),
            defaultValue: 'pending',
            allowNull: false
        },
        errorMessage: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        sentAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'sends',
        timestamps: true
    });

    return Send;
};