// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\controllers\targetList.controller.js

const { TargetList, Target } = require('../models');

/**
 * إنشاء قائمة أهداف جديدة
 * (POST /api/v1/targetlists)
 */
const createTargetList = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'List name is required.' });
    }

    try {
        const [list, created] = await TargetList.findOrCreate({
            where: { name },
            defaults: { name }
        });

        if (!created) {
            return res.status(409).json({ error: 'A list with this name already exists.' });
        }

        res.status(201).json(list);

    } catch (error) {
        console.error('[Controller] Error creating list:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

/**
 * جلب جميع قوائم الأهداف (وعدد الأهداف في كل قائمة)
 * (GET /api/v1/targetlists)
 */
const getAllTargetLists = async (req, res) => {
    try {
        const lists = await TargetList.findAll({
            include: [{ model: Target, as: 'targets', attributes: [] }], 
            attributes: [
                'id', 
                'name',
                [Target.sequelize.fn('COUNT', Target.sequelize.col('targets.id')), 'targetCount'],
                'createdAt'
            ],
            group: ['TargetList.id'],
            order: [['name', 'ASC']]
        });
        res.status(200).json(lists);
    } catch (error) {
        console.error('[Controller] Error fetching lists:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

/**
 * حذف قائمة
 * (DELETE /api/v1/targetlists/:id)
 */
const deleteTargetList = async (req, res) => {
    const { id } = req.params;
    try {
        const list = await TargetList.findByPk(id);
        if (!list) {
            return res.status(404).json({ error: 'Target list not found.' });
        }

        // بما أن العلاقة مضبوطة على ON DELETE SET NULL في نموذج Target،
        // سيتم تعيين targetListId للأهداف التابعة لهذه القائمة إلى null تلقائياً.

        await list.destroy();
        res.status(204).send(); 

    } catch (error) {
        console.error('[Controller] Error deleting list:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

module.exports = {
    createTargetList,
    getAllTargetLists,
    deleteTargetList
};