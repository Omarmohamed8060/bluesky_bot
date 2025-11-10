// C:\Users\CRIZMA MEGA STORE\bluesky_bot\src\controllers\account.controller.js

const { Account } = require('../models'); 
const blueskyService = require('../services/bluesky.service'); 
const { encrypt, decrypt } = require('../utils/crypto.util'); 

/**
 * إضافة حساب Bluesky جديد
 * (POST /api/v1/accounts)
 */
const addAccount = async (req, res) => {
    // ⚠️ تم إصلاح طريقة قراءة المتغيرات
    const { handle, appPassword, proxy } = req.body; 

    if (!handle || !appPassword) {
        return res.status(400).json({ error: 'Handle and App Password are required.' });
    }

    try {
        console.log(`[Controller] Validating credentials for ${handle}...`);
        const validationResult = await blueskyService.validateCredentials(handle, appPassword);

        if (!validationResult.success) {
            console.error(`[Controller] Validation failed for ${handle}:`, validationResult.error);
            return res.status(400).json({ error: 'Invalid Bluesky credentials.', details: validationResult.error });
        }
        
        console.log(`[Controller] Credentials validated for ${handle}. DID: ${validationResult.did}`);

        const existingAccount = await Account.findOne({ 
            where: { did: validationResult.did } 
        });

        if (existingAccount) {
            return res.status(409).json({ error: 'This account (DID) already exists in the database.' });
        }

        const encryptedPassword = encrypt(appPassword);
        if (!encryptedPassword) {
            return res.status(500).json({ error: 'Failed to encrypt password. Check server configuration.' });
        }

        const newAccount = await Account.create({
            handle: handle,
            did: validationResult.did,
            appPassword: encryptedPassword, 
            proxy: proxy || null,
            status: 'active',
            lastUsedAt: null,
            dailySendCount: 0,
            errorCount: 0
        });

        res.status(201).json({
            message: 'Account added successfully!',
            account: {
                id: newAccount.id,
                handle: newAccount.handle,
                did: newAccount.did,
                status: newAccount.status
            }
        });

    } catch (error) {
        console.error('[Controller] Error adding account:', error.message);
        res.status(500).json({ error: 'An internal server error occurred while adding the account.' });
    }
};

/**
 * جلب جميع الحسابات (GET /api/v1/accounts)
 */
const getAllAccounts = async (req, res) => {
    try {
        const accounts = await Account.findAll({
            attributes: [
                'id', 
                'handle', 
                'did', 
                'status', 
                'dailySendCount', 
                'errorCount', 
                'createdAt'
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        });

        res.status(200).json(accounts);

    } catch (error) {
        console.error('[Controller] Error fetching accounts:', error.message);
        res.status(500).json({ error: 'An internal server error occurred while fetching accounts.' });
    }
};


/**
 * حذف حساب معين (DELETE /api/v1/accounts/:id)
 */
const deleteAccount = async (req, res) => {
    const { id } = req.params;

    try {
        const account = await Account.findByPk(id);

        if (!account) {
            return res.status(404).json({ error: 'Account not found.' });
        }

        await account.destroy();

        res.status(204).send();

    } catch (error) {
        console.error(`[Controller] Error deleting account ${id}:`, error.message);
        res.status(500).json({ error: 'An internal server error occurred while deleting the account.' });
    }
};


module.exports = {
    addAccount,
    getAllAccounts,
    deleteAccount
};