// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\routes\campaign.routes.js

const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaign.controller');

// --- مسارات إدارة الحملات ---

// (POST) /api/v1/campaigns - لإنشاء حملة جديدة
router.post('/', campaignController.createCampaign);

// (GET) /api/v1/campaigns - لجلب جميع الحملات
router.get('/', campaignController.getAllCampaigns);

// (GET) /api/v1/campaigns/:id - لجلب حملة واحدة
router.get('/:id', campaignController.getCampaignById);

// (POST) /api/v1/campaigns/:id/start - لبدء تشغيل الحملة
// (هذه هي الإضافة الجديدة)
router.post('/:id/start', campaignController.startCampaign);

// (لاحقاً، سنضيف مسار "إيقاف" الحملة)
// router.post('/:id/pause', campaignController.pauseCampaign);

module.exports = router;