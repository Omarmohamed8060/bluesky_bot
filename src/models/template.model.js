// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\models\template.model.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Template = sequelize.define('Template', {
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
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: 'Template content with variables like {{name}} or {{link}}'
        }
    }, {
        tableName: 'templates',
        timestamps: true 
    });

    return Template;
};