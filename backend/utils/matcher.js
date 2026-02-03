const Order = require('../models/Order');
const Log = require('../models/Log');

/**
 * Order Matcher Utility
 * Matches incoming transactions with pending orders
 */

/**
 * Find matching order by amount and payment method
 * Returns the best matching order or null
 */
async function findMatchingOrder(amount, provider) {
    try {
        // Find all pending orders with matching amount and payment method
        const matchingOrders = await Order.find({
            status: 'pending',
            amount: amount,
            paymentMethod: provider
        }).sort({ createdAt: 1 }); // Oldest first

        if (matchingOrders.length === 0) {
            return null;
        }

        // Return the oldest matching order (FIFO approach)
        return matchingOrders[0];
    } catch (error) {
        console.error('Error finding matching order:', error);
        return null;
    }
}

/**
 * Match transaction to order and update order status
 */
async function matchTransaction(transactionData) {
    const { trxId, amount, provider } = transactionData;

    try {
        // Find matching order
        const order = await findMatchingOrder(amount, provider);

        if (!order) {
            await Log.create({
                type: 'warning',
                message: `No matching order found for TrxID: ${trxId}`,
                metadata: { trxId, amount, provider }
            });

            return {
                matched: false,
                message: `No order found for amount: ${amount} BDT via ${provider}`,
                order: null
            };
        }

        // Update order status
        order.status = 'paid';
        order.transactionId = trxId;
        order.paidAt = new Date();
        await order.save();

        // Log success
        await Log.create({
            type: 'success',
            message: `Order ${order.orderId} matched with TrxID: ${trxId}`,
            metadata: {
                orderId: order.orderId,
                trxId,
                amount,
                customerName: order.customerName
            }
        });

        return {
            matched: true,
            message: `Order ${order.orderId} successfully matched!`,
            order: {
                orderId: order.orderId,
                customerName: order.customerName,
                amount: order.amount
            }
        };
    } catch (error) {
        console.error('Error matching transaction:', error);

        await Log.create({
            type: 'error',
            message: `Error matching transaction: ${error.message}`,
            metadata: { trxId, error: error.message }
        });

        return {
            matched: false,
            message: 'Error processing transaction',
            error: error.message
        };
    }
}

/**
 * Get statistics for dashboard
 */
async function getMatchingStats() {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const paidOrders = await Order.countDocuments({ status: 'paid' });

        return {
            totalOrders,
            pendingOrders,
            paidOrders,
            matchRate: totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(2) : 0
        };
    } catch (error) {
        console.error('Error getting stats:', error);
        return null;
    }
}

module.exports = {
    findMatchingOrder,
    matchTransaction,
    getMatchingStats
};
