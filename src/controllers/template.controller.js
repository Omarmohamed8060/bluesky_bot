// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\controllers\template.controller.js

const { Template } = require('../models');

/**
 * إنشاء قالب جديد
 * (POST /api/v1/templates)
 */
const createTemplate = async (req, res) => {
    const { name, content } = req.body; // content الآن يجب أن تكون مصفوفة

    if (!name || !content) {
        return res.status(400).json({ error: 'Template name and content are required.' });
    }
    
    // ⚠️ الإصلاح: التأكد من أن content هي مصفوفة، حتى لو أدخلها المستخدم كنص واحد
    let safeContent = content;
    if (typeof content === 'string') {
        safeContent = [content];
    } else if (!Array.isArray(content)) {
        return res.status(400).json({ error: 'Content must be a string or an array of strings for spin text.' });
    }


    try {
        const existingTemplate = await Template.findOne({ where: { name } });
        if (existingTemplate) {
            return res.status(409).json({ error: 'A template with this name already exists.' });
        }

        const newTemplate = await Template.create({ name, content: safeContent });
        res.status(201).json(newTemplate);

    } catch (error) {
        console.error('[Controller] Error creating template:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

/**
 * جلب جميع القوالب (GET /api/v1/templates)
 */
const getAllTemplates = async (req, res) => {
    try {
        const templates = await Template.findAll({
            order: [['name', 'ASC']]
        });
        res.status(200).json(templates);
    } catch (error) {
        console.error('[Controller] Error fetching templates:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

/**
 * جلب قالب واحد بواسطة ID (GET /api/v1/templates/:id)
 */
const getTemplateById = async (req, res) => {
    const { id } = req.params;
    try {
        const template = await Template.findByPk(id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found.' });
        }
        res.status(200).json(template);
    } catch (error) {
        console.error('[Controller] Error fetching template:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

/**
 * تحديث قالب (PUT /api/v1/templates/:id)
 */
const updateTemplate = async (req, res) => {
    const { id } = req.params;
    const { name, content } = req.body;

    if (!name || !content) {
        return res.status(400).json({ error: 'Template name and content are required.' });
    }
    
    // ⚠️ الإصلاح: التأكد من أن content هي مصفوفة
    let safeContent = content;
    if (typeof content === 'string') {
        safeContent = [content];
    } else if (!Array.isArray(content)) {
        return res.status(400).json({ error: 'Content must be a string or an array of strings for spin text.' });
    }


    try {
        const template = await Template.findByPk(id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found.' });
        }

        if (name !== template.name) {
            const existingTemplate = await Template.findOne({ where: { name } });
            if (existingTemplate) {
                return res.status(409).json({ error: 'A template with this name already exists.' });
            }
        }

        template.name = name;
        template.content = safeContent;
        await template.save();
        
        res.status(200).json(template);

    } catch (error) {
        console.error('[Controller] Error updating template:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

/**
 * حذف قالب (DELETE /api/v1/templates/:id)
 */
const deleteTemplate = async (req, res) => {
    const { id } = req.params;
    try {
        const template = await Template.findByPk(id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found.' });
        }

        await template.destroy();
        res.status(204).send();

    } catch (error) {
        console.error('[Controller] Error deleting template:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};


module.exports = {
    createTemplate,
    getAllTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate
};