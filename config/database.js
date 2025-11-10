// database.js (D:\Projects\bluesky_bot\config\database.js)

const { Sequelize } = require('sequelize');
require('dotenv').config();

// ⚠️ تذكير: تأكد أنك قمت بتشغيل PostgreSQL وأن كلمة المرور في .env صحيحة!

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// دالة لاختبار الاتصال
async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('🔗 Database connection has been established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
        // نخرج من التطبيق إذا فشل الاتصال
        process.exit(1); 
    }
}

module.exports = { sequelize, connectDB };