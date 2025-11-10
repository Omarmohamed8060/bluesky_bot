// Template.js (D:\Projects\bluesky_bot\src\models\Template.js)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Template = sequelize.define('Template', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    content: { type: DataTypes.TEXT, allowNull: false, comment: 'Message content with variables' },
    description: { type: DataTypes.STRING, allowNull: true },
}, {
    tableName: 'templates',
    timestamps: true,
});

module.exports = Template;