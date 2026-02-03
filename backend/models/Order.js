const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['bkash', 'nagad', 'rocket', 'bank'],
    required: true
  },
  transactionId: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  paidAt: {
    type: Date,
    default: null
  }
});

// Index for faster queries on pending orders
orderSchema.index({ status: 1, amount: 1 });

module.exports = mongoose.model('Order', orderSchema);
