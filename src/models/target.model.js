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
        // ⚠️ تم تغيير نوع البيانات لاستيعاب عدة خيارات نصية (Array of Strings)
        content: {
            type: DataTypes.ARRAY(DataTypes.TEXT), 
            allowNull: false,
            comment: 'Array of template content variations for spin text, e.g., ["Hello {{name}}...", "Hi {{name}}..."]'
        }
    }, {
        tableName: 'templates',
        timestamps: true
    });

    return Template;
};