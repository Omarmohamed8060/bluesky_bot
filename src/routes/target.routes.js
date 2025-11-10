// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\routes\target.routes.js

const express = require('express');
const router = express.Router();
const targetController = require('../controllers/target.controller');

// (POST) /api/v1/targets - لإضافة هدف جديد (أو تحديثه)
router.post('/', targetController.addTarget);

// (GET) /api/v1/targets - لجلب جميع الأهداف (مع فلتر اختياري)
router.get('/', targetController.getAllTargets);

// (DELETE) /api/v1/targets/:id - لحذف هدف
router.delete('/:id', targetController.deleteTarget);

module.exports = router;