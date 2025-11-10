// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\routes\account.routes.js

const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');

// --- مسارات إدارة الحسابات ---

// POST /api/v1/accounts
// لإضافة حساب جديد
router.post('/', accountController.addAccount);

// GET /api/v1/accounts
// لجلب جميع الحسابات
router.get('/', accountController.getAllAccounts);

// DELETE /api/v1/accounts/:id
// لحذف حساب معين (هذه هي الإضافة الجديدة)
// :id هي متغير سيحتوي على رقم الحساب
router.delete('/:id', accountController.deleteAccount);

module.exports = router;