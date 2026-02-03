const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['success', 'error', 'info', 'warning'],
        required: true,
        index: true
    },
    message: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Auto-delete logs older than 30 days
logSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Log', logSchema);
