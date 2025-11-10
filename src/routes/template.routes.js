// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\routes\template.routes.js

const express = require('express');
const router = express.Router();
const templateController = require('../controllers/template.controller');

// --- مسارات إدارة القوالب ---

// (POST) /api/v1/templates - لإنشاء قالب جديد
router.post('/', templateController.createTemplate);

// (GET) /api/v1/templates - لجلب جميع القوالب
router.get('/', templateController.getAllTemplates);

// (GET) /api/v1/templates/:id - لجلب قالب واحد
router.get('/:id', templateController.getTemplateById);

// (PUT) /api/v1/templates/:id - لتحديث قالب
router.put('/:id', templateController.updateTemplate);

// (DELETE) /api/v1/templates/:id - لحذف قالب
router.delete('/:id', templateController.deleteTemplate);

module.exports = router;