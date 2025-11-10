// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\utils\crypto.util.js

const crypto = require('crypto');
require('dotenv').config();

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.SECRET_KEY;

// ⚠️ المفتاح السري يجب أن يكون 32 بايت
const key = crypto.createHash('sha256').update(String(SECRET_KEY)).digest('base64').substr(0, 32);

/**
 * دالة التشفير
 * @param {string} text - النص المراد تشفيره (كلمة المرور)
 * @returns {string} - النص المشفر (iv:encryptedData)
 */
const encrypt = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
};

/**
 * دالة فك التشفير
 * @param {string} hash - النص المشفر (iv:encryptedData)
 * @returns {string | null} - النص الأصلي (كلمة المرور) أو null عند فشل العملية
 */
const decrypt = (hash) => {
    try {
        const parts = hash.split(':');
        if (parts.length !== 2) {
            console.error('Decryption Error: Invalid hash format. Expected iv:encryptedData');
            return null;
        }
        
        const iv = Buffer.from(parts.shift(), 'hex');
        const encryptedText = Buffer.from(parts.join(':'), 'hex');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error.message);
        return null; 
    }
};

module.exports = {
    encrypt,
    decrypt
};