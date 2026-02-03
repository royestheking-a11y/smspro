require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');

// Import routes
const webhookRouter = require('./routes/webhook');
const apiRouter = require('./routes/api');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make Socket.IO available to routes
app.set('io', io);

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/', webhookRouter);
app.use('/api', apiRouter);

// Root endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    // Send initial connection success message
    socket.emit('log', {
        type: 'success',
        message: 'Connected to SMS PRO server',
        timestamp: new Date()
    });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sms-pro';

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('✓ MongoDB connected successfully');
        console.log('Database:', mongoose.connection.name);
    })
    .catch((err) => {
        console.error('✗ MongoDB connection error:', err);
        process.exit(1);
    });

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nGracefully shutting down...');
    await mongoose.connection.close();
    process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('╔══════════════════════════════════════╗');
    console.log('║      SMS PRO - Rizqara Tech         ║');
    console.log('╚══════════════════════════════════════╝');
    console.log(`\n✓ Server running on port ${PORT}`);
    console.log(`✓ Dashboard: http://localhost:${PORT}`);
    console.log(`✓ Webhook: http://localhost:${PORT}/webhook`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = { app, server, io };
