const express = require('express');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Log = require('../models/Log');
const { getMatchingStats } = require('../utils/matcher');

const router = express.Router();

/**
 * Get recent logs
 * GET /api/logs?limit=50
 */
router.get('/logs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const logs = await Log.find()
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();

        res.json({
            status: 'success',
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

/**
 * Get system statistics
 * GET /api/stats
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await getMatchingStats();

        const totalTransactions = await Transaction.countDocuments();
        const matchedTransactions = await Transaction.countDocuments({ status: 'matched' });
        const unmatchedTransactions = await Transaction.countDocuments({ status: 'unmatched' });

        res.json({
            status: 'success',
            data: {
                orders: stats,
                transactions: {
                    total: totalTransactions,
                    matched: matchedTransactions,
                    unmatched: unmatchedTransactions
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

/**
 * Get pending orders
 * GET /api/orders?status=pending
 */
router.get('/orders', async (req, res) => {
    try {
        const status = req.query.status || 'pending';
        const limit = parseInt(req.query.limit) || 100;

        const orders = await Order.find({ status })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.json({
            status: 'success',
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

/**
 * Get recent transactions
 * GET /api/transactions
 */
router.get('/transactions', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const transactions = await Transaction.find()
            .sort({ receivedAt: -1 })
            .limit(limit)
            .lean();

        res.json({
            status: 'success',
            data: transactions
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

/**
 * Create a new order (for testing)
 * POST /api/orders
 */
router.post('/orders', async (req, res) => {
    try {
        const { orderId, customerPhone, customerName, amount, paymentMethod } = req.body;

        const order = await Order.create({
            orderId,
            customerPhone,
            customerName,
            amount,
            paymentMethod
        });

        res.status(201).json({
            status: 'success',
            data: order
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
