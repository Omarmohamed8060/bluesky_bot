// Target.js (D:\Projects\bluesky_bot\src\models\Target.js)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Target = sequelize.define('Target', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    handle: { type: DataTypes.STRING, allowNull: false, unique: true },
    did: { type: DataTypes.STRING, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: true, comment: 'Used for {{name}} variable' },
    last_contacted: { type: DataTypes.DATE, allowNull: true },
}, {
    tableName: 'targets',
    timestamps: true,
});

module.exports = Target;