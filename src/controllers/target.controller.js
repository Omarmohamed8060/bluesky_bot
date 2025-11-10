// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\controllers\target.controller.js

const { Target, TargetList } = require('../models');
const { Op } = require('sequelize'); 

/**
 * إضافة هدف (مستخدم) جديد
 * (POST /api/v1/targets)
 */
const addTarget = async (req, res) => {
    const { handle, displayName, targetListId } = req.body; 
    const did = req.body.did || null; 

    if (!handle || !targetListId) {
        return res.status(400).json({ error: 'Target Handle and targetListId are required.' });
    }

    try {
        // 1. التحقق من وجود القائمة
        const listExists = await TargetList.findByPk(targetListId);
        if (!listExists) {
            return res.status(404).json({ error: 'Target list not found.' });
        }

        // 2. البحث عن الهدف وتحديثه إذا كان موجوداً
        const existingTarget = await Target.findOne({ 
            where: { handle } 
        });

        if (existingTarget) {
            // تحديث الهدف الموجود
            existingTarget.handle = handle;
            existingTarget.displayName = displayName || existingTarget.displayName;
            existingTarget.targetListId = targetListId;
            await existingTarget.save();
            return res.status(200).json(existingTarget);
        }

        // 3. إنشاء الهدف الجديد
        const newTarget = await Target.create({
            did: did || `pending_did_${Date.now()}_${Math.random() * 1000}`, // DID مؤقت
            handle,
            displayName,
            targetListId
        });

        res.status(201).json(newTarget);

    } catch (error) {
        console.error('[Controller] Error adding target:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

/**
 * جلب جميع الأهداف (يمكن فلترتها حسب القائمة)
 * (GET /api/v1/targets)
 */
const getAllTargets = async (req, res) => {
    const { listId } = req.query; 
    
    let whereClause = {};

    if (listId) {
        whereClause.targetListId = listId;
    }

    try {
        const targets = await Target.findAll({
            where: whereClause,
            include: [{ model: TargetList, as: 'list', attributes: ['name'] }], 
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(targets);
    } catch (error) {
        console.error('[Controller] Error fetching targets:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

/**
 * حذف هدف
 * (DELETE /api/v1/targets/:id)
 */
const deleteTarget = async (req, res) => {
    const { id } = req.params;
    try {
        const target = await Target.findByPk(id);
        if (!target) {
            return res.status(404).json({ error: 'Target not found.' });
        }

        await target.destroy();
        res.status(204).send(); 

    } catch (error) {
        console.error('[Controller] Error deleting target:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

module.exports = {
    addTarget,
    getAllTargets,
    deleteTarget
};