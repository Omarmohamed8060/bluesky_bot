// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\queue\index.js

const { Queue, Worker } = require('bullmq');
const { BskyAgent, RichText } = require('@atproto/api'); 
const { Account, Template, Target, Send } = require('../models'); 
const { decrypt } = require('../utils/crypto.util'); 
require('dotenv').config();

const connectionOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
};

const BSKY_SERVICE_URL = 'https://bsky.social';

const campaignQueue = new Queue('campaign-jobs', { 
    connection: connectionOptions 
});

const getDailyLimit = (accountCreationDate) => {
    const today = new Date();
    const diffTime = Math.abs(today - accountCreationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays <= 3) {
        return 5;  
    } else if (diffDays <= 7) {
        return 15; 
    } else if (diffDays <= 14) {
        return 30; 
    }
    return 50; 
};

const setupWorker = () => {
    const worker = new Worker('campaign-jobs', async (job) => {
        const { campaignId, templateId, targetDid } = job.data;

        let logEntry = {
            campaignId,
            targetDid,
            accountId: null, 
            status: 'pending',
            errorMessage: null
        };

        let activeAccount = null;

        try {
            // --- 1. اختيار حساب متاح (Warm-Up Logic) ---
            activeAccount = await Account.findOne({
                where: { status: 'active' },
                order: [['lastUsedAt', 'ASC']] 
            });

            if (!activeAccount) {
                throw new Error('No active accounts available in the pool. Retrying later.'); 
            }

            // ⚠️ التحقق من حد الإرسال اليومي
            const accountDailyLimit = getDailyLimit(activeAccount.createdAt);
            if (activeAccount.dailySendCount >= accountDailyLimit) {
                await activeAccount.update({ lastUsedAt: new Date(), status: 'active' }); 
                throw new Error(`Account ${activeAccount.handle} reached daily Warm-Up limit of ${accountDailyLimit}. Skipping.`); 
            }


            logEntry.accountId = activeAccount.id;

            // --- 2. جلب البيانات ---
            const template = await Template.findByPk(templateId);
            const target = await Target.findOne({ where: { did: targetDid } }); 
            
            if (!template || !target) {
                throw new Error(`Template or Target not found. (T:${templateId}, U:${targetDid})`);
            }

            // --- 3. تجهيز الرسالة (Spin Text Logic) ---
            let selectedContent;
            if (Array.isArray(template.content) && template.content.length > 0) {
                // اختيار نص عشوائي من مصفوفة المحتوى (Spin Text)
                selectedContent = template.content[Math.floor(Math.random() * template.content.length)];
            } else {
                // العودة إلى المحتوى كسترينج عادي إذا كان غير صحيح
                 selectedContent = template.content;
            }

            let messageContent = selectedContent.replace(
                /\{\{name\}\}/gi, 
                target.displayName || target.handle || 'friend'
            );
            
            // --- 4. تسجيل الدخول والإرسال ---
            const agent = new BskyAgent({ service: BSKY_SERVICE_URL });
            const password = decrypt(activeAccount.appPassword);
            if (!password) {
                throw new Error('Failed to decrypt password. Check SECRET_KEY in .env.');
            }

            await agent.login({
                identifier: activeAccount.handle,
                password: password
            });

            // --- 5. إنشاء المنشور الموجه (RichText) ---
            const rt = new RichText({ text: `@${target.handle} ${messageContent}` });
            await rt.detectFacets(agent); 

            await agent.post({
                text: rt.text,
                facets: rt.facets
            });

            // --- 6. تحديث قاعدة البيانات (نجاح) ---
            logEntry.status = 'sent';
            logEntry.sentAt = new Date();
            
            activeAccount.lastUsedAt = new Date();
            activeAccount.dailySendCount += 1;
            await activeAccount.save();

        } catch (error) {
            logEntry.status = 'failed';
            logEntry.errorMessage = error.message;

            // --- منطق الفشل الذكي (تعطيل الحساب) ---
            const errorMessage = error.message.toLowerCase();
            
            if (activeAccount && (errorMessage.includes('invalid credentials') || errorMessage.includes('401') || errorMessage.includes('unauthorized'))) {
                await activeAccount.update({ status: 'error' });
            }
            
            // إعادة رفع الخطأ ليقوم BullMQ بإعادة المحاولة (Auto-Retry)
            throw error; 
            
        } finally {
            // --- 7. تسجيل النتيجة دائماً ---
            await Send.create(logEntry);
        }

    }, { 
        connection: connectionOptions,
        defaultJobOptions: {
            attempts: 3, 
            backoff: {
                type: 'exponential', 
                delay: 5000, 
            },
        },
        limiter: { 
            max: 5, 
            duration: 60000 
        }
    });

    worker.on('completed', (job) => {
        console.log(`[Worker] Job ${job.id} completed successfully.`);
    });
};

module.exports = {
    campaignQueue,
    setupWorker
};