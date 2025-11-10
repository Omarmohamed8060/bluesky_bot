// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\services\queue.service.js

const { campaignQueue } = require('../queue/index');
const { Target } = require('../models');

/**
 * إضافة جميع مهام الحملة إلى قائمة الانتظار
 * @param {object} campaign - كائن الحملة (من Sequelize)
 */
const addCampaignJobs = async (campaign) => {
    console.log(`[QueueService] Starting to add jobs for campaign ${campaign.id}...`);

    try {
        // ⚠️ [الإصلاح] البحث الآن يتم بواسطة targetListId (المفتاح الخارجي الجديد)
        const targetListId = campaign.targetListId; 
        
        // 1. جلب جميع الأهداف (Targets) لهذه الحملة
        const targets = await Target.findAll({
            where: { targetListId: targetListId }, // ⬅️ تم التعديل
            attributes: ['did'] 
        });

        if (targets.length === 0) {
            console.warn(`[QueueService] No targets found for campaign ${campaign.id}.`);
            return { success: false, error: 'No targets found in list.' };
        }

        console.log(`[QueueService] Found ${targets.length} targets. Adding to queue...`);

        // 2. تحويلهم إلى "مهام" (Jobs)
        const jobs = targets.map(target => ({
            name: `send-to-${target.did}`, 
            data: {
                campaignId: campaign.id,
                templateId: campaign.templateId,
                targetDid: target.did
            },
            opts: {
                jobId: `${campaign.id}-${target.did}` 
            }
        }));

        // 3. إضافة جميع المهام دفعة واحدة إلى BullMQ
        await campaignQueue.addBulk(jobs);

        console.log(`[QueueService] Successfully added ${jobs.length} jobs to the queue.`);
        return { success: true, count: jobs.length };

    } catch (error) {
        console.error(`[QueueService] Error adding jobs to queue:`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    addCampaignJobs
};