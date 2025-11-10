// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\routes\targetList.routes.js

const express = require('express');
const router = express.Router();
const targetListController = require('../controllers/targetList.controller');

// (POST) /api/v1/targetlists - لإنشاء قائمة جديدة
router.post('/', targetListController.createTargetList);

// (GET) /api/v1/targetlists - لجلب جميع القوائم
router.get('/', targetListController.getAllTargetLists);

// (DELETE) /api/v1/targetlists/:id - لحذف قائمة
router.delete('/:id', targetListController.deleteTargetList);

module.exports = router;