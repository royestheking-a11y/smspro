const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    trxId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    rawMessage: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        enum: ['bkash', 'nagad', 'rocket', 'bank'],
        required: true
    },
    matchedOrderId: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['matched', 'unmatched'],
        default: 'unmatched',
        index: true
    },
    receivedAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);
