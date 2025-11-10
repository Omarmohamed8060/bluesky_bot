// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\controllers\campaign.controller.js

const { Campaign, Template, Target, TargetList } = require('../models'); // ⬅️ [جديد]
const queueService = require('../services/queue.service');

/**
 * إنشاء حملة جديدة
 * (POST /api/v1/campaigns)
 */
const createCampaign = async (req, res) => {
    const { name, templateId, targetListId } = req.body; // ⬅️ [تم التعديل]

    if (!name || !templateId || !targetListId) {
        return res.status(400).json({ error: 'Campaign name, templateId, and targetListId are required.' });
    }

    try {
        // 1. التأكد من أن القالب موجود
        const template = await Template.findByPk(templateId);
        if (!template) {
            return res.status(404).json({ error: 'Template not found.' });
        }
        
        // 2. التأكد من أن القائمة موجودة
        const targetList = await TargetList.findByPk(targetListId);
        if (!targetList) {
            return res.status(404).json({ error: 'Target list not found.' });
        }

        // 3. التأكد من أن قائمة الأهداف تحتوي على مستخدمين
        const targetCount = await Target.count({ where: { targetListId } }); // ⬅️ [تم التعديل]
        if (targetCount === 0) {
            return res.status(404).json({ error: `Target list '${targetList.name}' is empty.` });
        }

        // 4. إنشاء الحملة
        const newCampaign = await Campaign.create({
            name,
            templateId,
            targetListId, // ⬅️ [تم التعديل]
            status: 'draft' 
        });

        res.status(201).json(newCampaign);

    } catch (error) {
        console.error('[Controller] Error creating campaign:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

/**
 * جلب جميع الحملات
 * (GET /api/v1/campaigns)
 */
const getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.findAll({
            // include: [TargetList], // (لإظهار تفاصيل القائمة)
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json(campaigns);
    } catch (error) {
        console.error('[Controller] Error fetching campaigns:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

/**
 * جلب حملة واحدة (مع تفاصيلها)
 * (GET /api/v1/campaigns/:id)
 */
const getCampaignById = async (req, res) => {
    const { id } = req.params;
    try {
        const campaign = await Campaign.findByPk(id, {
            include: [
                { model: Template, as: 'template', attributes: ['name', 'content'] },
                { model: TargetList, as: 'targetList', attributes: ['name'] } // ⬅️ [جديد]
            ]
        });
        
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found.' });
        }
        
        res.status(200).json(campaign);
    } catch (error) {
        console.error('[Controller] Error fetching campaign:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};


/**
 * بدء تشغيل حملة
 * (POST /api/v1/campaigns/:id/start)
 */
const startCampaign = async (req, res) => {
    const { id } = req.params;
    try {
        const campaign = await Campaign.findByPk(id);
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found.' });
        }

        if (campaign.status !== 'draft') {
            return res.status(400).json({ error: `Campaign is already ${campaign.status}. Cannot start.` });
        }

        // 1. إضافة المهام إلى قائمة الانتظار
        const result = await queueService.addCampaignJobs(campaign);
        if (!result.success) {
            return res.status(500).json({ error: 'Failed to add jobs to queue.', details: result.error });
        }

        // 2. تحديث حالة الحملة إلى "running"
        campaign.status = 'running';
        await campaign.save();

        res.status(200).json({
            message: `Campaign started successfully. ${result.count} jobs added to the queue.`,
            campaign
        });

    } catch (error) {
        console.error(`[Controller] Error starting campaign ${id}:`, error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};


module.exports = {
    createCampaign,
    getAllCampaigns,
    getCampaignById,
    startCampaign 
};