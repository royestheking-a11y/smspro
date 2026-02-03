#!/usr/bin/env node

/**
 * Test Script for SMS PRO
 * Tests the webhook and order matching functionality
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./backend/models/Order');

async function runTests() {
    console.log('╔══════════════════════════════════════╗');
    console.log('║     SMS PRO - Test Suite            ║');
    console.log('╚══════════════════════════════════════╝\n');

    try {
        // Connect to MongoDB
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ MongoDB connected\n');

        // Clear existing test data
        console.log('🗑️  Clearing test data...');
        await Order.deleteMany({ orderId: /^TEST/ });
        console.log('✓ Test data cleared\n');

        // Create test orders
        console.log('📝 Creating test orders...');

        const testOrders = [
            {
                orderId: 'TEST001',
                customerPhone: '01712345678',
                customerName: 'Test Customer 1',
                amount: 500,
                paymentMethod: 'bkash'
            },
            {
                orderId: 'TEST002',
                customerPhone: '01787654321',
                customerName: 'Test Customer 2',
                amount: 1000,
                paymentMethod: 'nagad'
            },
            {
                orderId: 'TEST003',
                customerPhone: '01698765432',
                customerName: 'Test Customer 3',
                amount: 250,
                paymentMethod: 'bkash'
            }
        ];

        for (const orderData of testOrders) {
            const order = await Order.create(orderData);
            console.log(`✓ Created: ${order.orderId} - ${order.customerName} - ${order.amount} BDT`);
        }

        console.log('\n✅ Test orders created successfully!\n');
        console.log('📊 Test Data Summary:');
        console.log('   • 3 pending orders created');
        console.log('   • Order IDs: TEST001, TEST002, TEST003');
        console.log('   • Amounts: 500, 1000, 250 BDT');
        console.log('   • Payment methods: bKash, Nagad\n');

        console.log('🧪 Next Steps:');
        console.log('   1. Start the server: npm start');
        console.log('   2. Open dashboard: http://localhost:3000');
        console.log('   3. Test webhook with sample SMS (see below)\n');

        console.log('📤 Sample Webhook Test (bKash):');
        console.log('   curl -X POST http://localhost:3000/webhook \\');
        console.log('     -H "Content-Type: application/json" \\');
        console.log('     -d \'{"message":"You received Tk 500.00 from 01712345678. TrxID BK123ABC456","sender":"bKash","token":"' + process.env.WEBHOOK_TOKEN + '"}\'\n');

        console.log('📤 Sample Webhook Test (Nagad):');
        console.log('   curl -X POST http://localhost:3000/webhook \\');
        console.log('     -H "Content-Type: application/json" \\');
        console.log('     -d \'{"message":"You have received Tk. 1000.00 from 01787654321. Trx ID: NGD987XYZ654","sender":"Nagad","token":"' + process.env.WEBHOOK_TOKEN + '"}\'\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB');
    }
}

runTests();
