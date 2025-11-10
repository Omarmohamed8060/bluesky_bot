// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\models\index.js

const { sequelize } = require('../../config/database');
require('dotenv').config(); 

const db = {};

db.sequelize = sequelize;

// 1. استيراد جميع النماذج
db.Account = require('./account.model')(sequelize);
db.Template = require('./template.model')(sequelize);
db.Target = require('./target.model')(sequelize);
db.Campaign = require('./campaign.model')(sequelize);
db.Send = require('./send.model')(sequelize);
db.TargetList = require('./targetList.model')(sequelize); 

// 2. إنشاء العلاقات (Final Stable Version)
console.log("[Models] Setting up associations (Minimal Stable Version - Final Fix)...");

// ⚠️ الإصلاح النهائي: نعتمد فقط على علاقات BelongsTo البسيطة والآمنة التي لا تنهار
db.Campaign.belongsTo(db.Template, { foreignKey: 'templateId', allowNull: false });
db.Campaign.belongsTo(db.TargetList, { foreignKey: 'targetListId', allowNull: false });
db.Target.belongsTo(db.TargetList, { foreignKey: 'targetListId', as: 'list' });
db.Send.belongsTo(db.Campaign, { foreignKey: 'campaignId', allowNull: false });
db.Send.belongsTo(db.Account, { foreignKey: 'accountId', allowNull: false });

// ❌ تم حذف العلاقة db.Send.belongsTo(db.Target) بالكامل لضمان الاستقرار.

console.log("[Models] Associations set up successfully.");


// 3. دالة المزامنة باستخدام DB_SYNC_MODE
db.syncDatabase = async () => {
    try {
        const syncMode = process.env.DB_SYNC_MODE || 'none'; 
        
        if (syncMode === 'force') {
            await sequelize.sync({ force: true }); 
            console.log('✅ All models were synchronized successfully (Forced: All data wiped).');
        } else if (syncMode === 'alter') {
            await sequelize.sync({ alter: true });
            console.log('✅ All models were synchronized successfully (Altered: Safe update).');
        } else {
            await sequelize.authenticate();
            console.log('✅ Database authenticated successfully (No sync run).');
        }
    } catch (error) {
        console.error('❌ Unable to synchronize database models:', error);
        throw error;
    }
};

module.exports = db;