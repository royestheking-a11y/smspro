const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Log = require('../models/Log');
const { parseSMS } = require('../utils/smsParser');
const { matchTransaction } = require('../utils/matcher');

const router = express.Router();

/**
 * Webhook endpoint for SMS forwarding app
 * POST /webhook
 */
router.post(
    '/webhook',
    [
        body('message').notEmpty().withMessage('SMS message is required'),
        body('sender').notEmpty().withMessage('Sender information is required'),
        body('token').notEmpty().withMessage('Authentication token is required')
    ],
    async (req, res) => {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                errors: errors.array()
            });
        }

        const { message, sender, token } = req.body;

        // Security check: Verify token
        if (token !== process.env.WEBHOOK_TOKEN) {
            await Log.create({
                type: 'error',
                message: 'Unauthorized webhook attempt',
                metadata: { sender, ip: req.ip }
            });

            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized'
            });
        }

        try {
            // Parse SMS message
            const parsedData = parseSMS(message, sender);

            if (!parsedData || !parsedData.trxId) {
                await Log.create({
                    type: 'warning',
                    message: 'Failed to parse SMS',
                    metadata: { message, sender }
                });

                return res.status(200).json({
                    status: 'warning',
                    message: 'SMS received but could not extract transaction details'
                });
            }

            // Check if transaction already exists
            const existingTrx = await Transaction.findOne({ trxId: parsedData.trxId });
            if (existingTrx) {
                await Log.create({
                    type: 'info',
                    message: `Duplicate transaction received: ${parsedData.trxId}`,
                    metadata: { trxId: parsedData.trxId }
                });

                return res.status(200).json({
                    status: 'duplicate',
                    message: 'Transaction already processed'
                });
            }

            // Create transaction record
            const transaction = await Transaction.create({
                trxId: parsedData.trxId,
                amount: parsedData.amount,
                sender: parsedData.sender || sender,
                rawMessage: message,
                provider: parsedData.provider
            });

            // Attempt to match with an order
            const matchResult = await matchTransaction({
                trxId: parsedData.trxId,
                amount: parsedData.amount,
                provider: parsedData.provider
            });

            // Update transaction status
            if (matchResult.matched) {
                transaction.status = 'matched';
                transaction.matchedOrderId = matchResult.order.orderId;
                await transaction.save();
            }

            // Emit real-time notification via Socket.IO
            const io = req.app.get('io');
            if (io) {
                io.emit('transaction', {
                    type: matchResult.matched ? 'success' : 'warning',
                    trxId: parsedData.trxId,
                    amount: parsedData.amount,
                    provider: parsedData.provider,
                    matched: matchResult.matched,
                    order: matchResult.order,
                    timestamp: new Date()
                });
            }

            return res.status(200).json({
                status: 'success',
                message: parsedData.trxId,
                matched: matchResult.matched,
                matchDetails: matchResult
            });

        } catch (error) {
            console.error('Webhook error:', error);

            await Log.create({
                type: 'error',
                message: `Webhook processing error: ${error.message}`,
                metadata: { error: error.message, stack: error.stack }
            });

            return res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
);

module.exports = router;
