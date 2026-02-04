/**
 * SMS PRO - Frontend Application
 * Real-time dashboard with Socket.IO integration
 */

// Global state
let socket = null;
let isConnected = false;

// DOM Elements
const elements = {
    serviceSwitch: document.getElementById('serviceSwitch'),
    domainInput: document.getElementById('domain'),
    tokenInput: document.getElementById('token'),
    toggleTokenBtn: document.getElementById('toggleToken'),
    saveConfigBtn: document.getElementById('saveConfig'),
    clearLogsBtn: document.getElementById('clearLogs'),
    refreshBtn: document.getElementById('refreshTransactions'),
    logsContainer: document.getElementById('logs'),
    statusBadge: document.getElementById('statusBadge'),
    statusText: document.getElementById('statusText'),
    totalOrders: document.getElementById('totalOrders'),
    pendingOrders: document.getElementById('pendingOrders'),
    paidOrders: document.getElementById('paidOrders'),
    matchRate: document.getElementById('matchRate'),
    transactionsList: document.getElementById('transactionsList')
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Load saved configuration
    loadConfig();

    // Setup event listeners
    setupEventListeners();

    // Initialize Socket.IO
    initializeSocket();

    // Load initial data
    fetchStats();
    fetchTransactions();

    // Auto-refresh stats every 30 seconds
    setInterval(fetchStats, 30000);
}

// Socket.IO Connection
function initializeSocket() {
    socket = io();

    socket.on('connect', () => {
        isConnected = true;
        updateConnectionStatus(true);
        addLog('success', 'Connected to SMS PRO server');

        // Request Notification Permission
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    });

    socket.on('disconnect', () => {
        isConnected = false;
        updateConnectionStatus(false);
        addLog('error', 'Disconnected from server');
    });

    // Listen for transaction events
    socket.on('transaction', (data) => {
        handleIncomingTransaction(data);
    });

    // Listen for log events
    socket.on('log', (data) => {
        addLog(data.type, data.message);
    });
}

// Handle incoming transaction from Socket.IO
function handleIncomingTransaction(data) {
    const { type, trxId, amount, provider, matched, order } = data;

    if (matched) {
        addLog('success', `✓ TrxID ${trxId} matched to Order #${order.orderId} (${order.customerName}) - ${amount} BDT`);
        playNotificationSound('success');
        showSystemNotification(`Payment Received: ${amount} BDT`, `Order #${order.orderId} confirmed via ${provider}`);
    } else {
        addLog('warning', `⚠ TrxID ${trxId} received but no matching order found - ${amount} BDT via ${provider}`);
        playNotificationSound('warning');
    }

    // Refresh data
    fetchStats();
    fetchTransactions();
}

// Update connection status
function updateConnectionStatus(connected) {
    const dot = elements.statusBadge.querySelector('.status-dot');

    if (connected) {
        elements.statusText.textContent = 'Online';
        dot.classList.remove('offline');
    } else {
        elements.statusText.textContent = 'Offline';
        dot.classList.add('offline');
    }
}

// Add log entry
function addLog(type, message) {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const logLine = document.createElement('div');
    logLine.className = `log-line ${type}`;
    logLine.innerHTML = `
        <span class="timestamp">[${timestamp}]</span>
        <span class="message">${escapeHtml(message)}</span>
    `;

    elements.logsContainer.appendChild(logLine);
    elements.logsContainer.scrollTop = elements.logsContainer.scrollHeight;

    // Keep only last 100 logs
    const logs = elements.logsContainer.querySelectorAll('.log-line');
    if (logs.length > 100) {
        logs[0].remove();
    }
}

// Fetch statistics
async function fetchStats() {
    try {
        const baseUrl = window.API_BASE || '';
        const response = await fetch(`${baseUrl}/api/stats`);
        const data = await response.json();

        if (data.status === 'success') {
            const { orders } = data.data;
            // Update stats with animation
            updateStatWithAnimation(elements.totalOrders, orders.totalOrders);
            updateStatWithAnimation(elements.pendingOrders, orders.pendingOrders);
            updateStatWithAnimation(elements.paidOrders, orders.paidOrders);
            updateStatWithAnimation(elements.matchRate, orders.matchRate + '%');
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

// Fetch recent transactions
async function fetchTransactions() {
    try {
        const baseUrl = window.API_BASE || '';
        const response = await fetch(`${baseUrl}/api/transactions?limit=10`);
        const data = await response.json();

        if (data.status === 'success') {
            renderTransactions(data.data);
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}

// Render transactions list
function renderTransactions(transactions) {
    if (transactions.length === 0) {
        elements.transactionsList.innerHTML = `
            <div class="empty-state">
                <p>No transactions yet</p>
            </div>
        `;
        return;
    }

    elements.transactionsList.innerHTML = transactions.map(trx => {
        const date = new Date(trx.receivedAt).toLocaleDateString();
        const time = new Date(trx.receivedAt).toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-trx">${escapeHtml(trx.trxId)}</div>
                    <div class="transaction-details">
                        ${trx.amount} BDT • ${trx.provider.toUpperCase()} • ${date} ${time}
                    </div>
                </div>
                <span class="transaction-badge ${trx.status}">
                    ${trx.status}
                </span>
            </div>
        `;
    }).join('');
}

// Event Listeners
function setupEventListeners() {
    // Toggle token visibility
    elements.toggleTokenBtn.addEventListener('click', () => {
        const type = elements.tokenInput.type === 'password' ? 'text' : 'password';
        elements.tokenInput.type = type;

        // Toggle icon
        const btn = elements.toggleTokenBtn;
        if (type === 'password') {
            // Show Eye (Open)
            btn.innerHTML = `
                <svg viewBox="0 0 256 256" fill="currentColor" width="20" height="20">
                    <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231,128C226.94,136.6,208,172.91,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
                </svg>`;
        } else {
            // Show EyeSlash (Closed)
            btn.innerHTML = `
                <svg viewBox="0 0 256 256" fill="currentColor" width="20" height="20">
                    <path d="M53.92,34.62a8,8,0,1,0-11.84,10.76l18.4,20.26c-17,14.77-29.28,31-29.74,31.62a8,8,0,0,0,0,13.48c.45.62,31.76,43.26,97.26,43.26a131,131,0,0,0,43.83-7.5l29.63,32.61a8,8,0,1,0,11.84-10.76Zm5.21,43.89,35.34,38.9A15.92,15.92,0,0,1,93,122.09l-13-14.28A133.3,133.3,0,0,1,59.13,78.51ZM128,214c-47.53,0-85.34-22.18-100.26-40.45A137,137,0,0,1,49.2,154.2l20.44-18.57a31.94,31.94,0,0,0,32.12,35.35c.18,0,.35,0,.53,0l17.75-16.14a48,48,0,0,0,51.87-47.16l19.5-17.72A117.76,117.76,0,0,1,209.73,125l13.62-12.38A134.46,134.46,0,0,1,241.06,177.3C223.49,198.86,180.89,214,128,214Zm93.26-45.71a8,8,0,1,1-13.48-8,55.45,55.45,0,0,0,4.22-5.71l-14.76-13.42a129.83,129.83,0,0,0-58.85-50.62L161.5,69.5a48,48,0,0,1,56,58.82ZM128,70a55.15,55.15,0,0,0-15.06,2.1L94.57,54A137.58,137.58,0,0,1,128,46c53.37,0,96,15.35,113.62,37.11a8,8,0,1,1-12.44,10.1C215.11,75.83,178.61,62,128,62Z"></path>
                </svg>`;
        }
    });

    // Save configuration
    elements.saveConfigBtn.addEventListener('click', saveConfig);

    // Clear logs
    elements.clearLogsBtn.addEventListener('click', () => {
        elements.logsContainer.innerHTML = '';
        addLog('info', 'Logs cleared');
    });

    // Refresh transactions
    elements.refreshBtn.addEventListener('click', () => {
        fetchTransactions();
        fetchStats();
        addLog('info', 'Data refreshed');
    });

    // Service switch
    elements.serviceSwitch.addEventListener('change', (e) => {
        const status = e.target.checked ? 'ENABLED' : 'DISABLED';
        addLog('info', `Forwarding service ${status}`);
        saveConfig();
    });
}

// Save configuration to localStorage
function saveConfig() {
    const config = {
        domain: elements.domainInput.value,
        token: elements.tokenInput.value,
        serviceEnabled: elements.serviceSwitch.checked,
        gateways: {
            bkash: document.getElementById('gw_bkash').checked,
            nagad: document.getElementById('gw_nagad').checked,
            rocket: document.getElementById('gw_rocket').checked,
            bank: document.getElementById('gw_bank').checked
        }
    };

    localStorage.setItem('sms-pro-config', JSON.stringify(config));

    // Show success message
    addLog('success', 'Configuration saved successfully');

    // Add visual feedback
    elements.saveConfigBtn.textContent = '✓ Saved!';
    setTimeout(() => {
        elements.saveConfigBtn.textContent = 'Save Configuration';
    }, 2000);
}

// Load configuration from localStorage
function loadConfig() {
    const saved = localStorage.getItem('sms-pro-config');

    if (saved) {
        try {
            const config = JSON.parse(saved);
            elements.domainInput.value = config.domain || '';
            elements.tokenInput.value = config.token || '';
            elements.serviceSwitch.checked = config.serviceEnabled !== false;

            // Load gateway settings
            if (config.gateways) {
                document.getElementById('gw_bkash').checked = config.gateways.bkash;
                document.getElementById('gw_nagad').checked = config.gateways.nagad;
                document.getElementById('gw_rocket').checked = config.gateways.rocket;
                document.getElementById('gw_bank').checked = config.gateways.bank;
            }
        } catch (error) {
            console.error('Error loading config:', error);
        }
    }

    // Set default domain if empty
    if (!elements.domainInput.value) {
        elements.domainInput.value = window.location.hostname;
    }
}

// Play notification sound (optional)
function playNotificationSound(type) {
    // Create a simple beep using Web Audio API
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.frequency.value = type === 'success' ? 800 : 400;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.2);
    } catch (error) {
        // Silently fail if audio API not supported
    }
}

// Show System Notification
function showSystemNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            new Notification(title, {
                body: body,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                vibrate: [200, 100, 200]
            });
        } catch (e) {
            console.log('Notification failed:', e);
        }
    }
}

// Update stat value with animation
function updateStatWithAnimation(element, newValue) {
    const oldValue = element.textContent;
    if (oldValue !== String(newValue)) {
        element.classList.add('stat-update');
        element.textContent = newValue;
        setTimeout(() => {
            element.classList.remove('stat-update');
        }, 600);
    }
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
