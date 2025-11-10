// Account.js (D:\Projects\bluesky_bot\src\models\Account.js)

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const bcrypt = require('bcryptjs');

const Account = sequelize.define('Account', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    did: { type: DataTypes.STRING, allowNull: false, unique: true, comment: 'Bluesky DID' },
    handle: { type: DataTypes.STRING, allowNull: false, unique: true, comment: 'Bluesky Handle' },
    app_password_hash: { type: DataTypes.STRING, allowNull: false, comment: 'Encrypted App Password' }, // مشفر
    rate_limit_per_hour: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60, comment: 'Max sends per hour' },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    last_used: { type: DataTypes.DATE, allowNull: true },
}, {
    tableName: 'accounts',
    timestamps: true,
});

// دالة لمقارنة App Password المدخلة مع الهاش المخزن
Account.prototype.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.app_password_hash);
};

module.exports = Account;