// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\services\bluesky.service.js

const { BskyAgent } = require('@atproto/api');

// عنوان خادم Bluesky
const BSKY_SERVICE_URL = 'https://bsky.social';

/**
 * التحقق من صحة بيانات اعتماد حساب Bluesky.
 * @param {string} handle - اسم المستخدم (example.bsky.social)
 * @param {string} appPassword - كلمة مرور التطبيق
 * @returns {Promise<{success: boolean, did?: string, error?: string}>}
 */
const validateCredentials = async (handle, appPassword) => {
    // 1. إنشاء عميل BskyAgent جديد
    // (service: BSKY_SERVICE_URL) هو ضروري لتوجيه الطلب للخادم الصحيح
    const agent = new BskyAgent({ service: BSKY_SERVICE_URL });

    try {
        // 2. محاولة تسجيل الدخول
        console.log(`[Service] Attempting login for ${handle}...`);
        
        const response = await agent.login({
            identifier: handle,
            password: appPassword,
        });

        // 3. التحقق من نجاح تسجيل الدخول
        if (response.success) {
            console.log(`[Service] Login successful for ${handle}.`);
            // نرجع 'did' لأنه المعرف الفريد للحساب
            return { 
                success: true, 
                did: response.data.did 
            };
        } else {
            // هذا يحدث إذا كانت البيانات غير صحيحة ولكن الخادم رد
            console.warn(`[Service] Login failed for ${handle}: Server responded with failure.`);
            return { 
                success: false, 
                error: 'Login failed. Server responded with success: false.' 
            };
        }

    } catch (error) {
        // 4. التعامل مع الأخطاء (مثل كلمة مرور خاطئة، اسم مستخدم خاطئ)
        console.error(`[Service] Error during login for ${handle}:`, error.message);
        
        // إرجاع رسالة الخطأ كما هي من ATProto
        return { 
            success: false, 
            error: error.message || 'Unknown authentication error' 
        };
    }
};

module.exports = {
    validateCredentials
};