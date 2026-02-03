# SMS PRO - Payment Automation System

**Automated SMS payment processing for bKash & Nagad transactions**

<img src="docs/screenshot.png" alt="SMS PRO Dashboard" width="400"/>

> 🎯 Built for Rizqara Tech to automate payment verification and order management

---

## 📋 Features

✅ **Real-time SMS Processing** - Automatic TrxID extraction from bKash/Nagad  
✅ **Smart Order Matching** - FIFO algorithm matches transactions to orders  
✅ **Live Dashboard** - Real-time updates via Socket.IO  
✅ **Premium UI** - Beautiful pink & white theme  
✅ **PWA Support** - Install as Android app  
✅ **Security First** - Token-based authentication  
✅ **Transaction History** - Complete audit trail  
✅ **Multi-provider** - Supports bKash, Nagad, Rocket  

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- MongoDB installed and running
- Android phone (for SMS forwarding)

### Installation

1. **Clone or extract the project**
   ```bash
   cd "SMS PRO"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/sms-pro
   WEBHOOK_TOKEN=YOUR_SECURE_TOKEN_HERE
   NODE_ENV=production
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open dashboard**
   ```
   http://localhost:3000
   ```

---

## 📱 Android SMS Forwarding Setup

### Step 1: Install SMS Forwarding App

Download **TNRSOFT SMS Webhook** or similar app from Play Store

### Step 2: Configure the App

1. **Sender Names**: Add these senders to forward
   - `bKash`
   - `Nagad`
   - `16247` (bKash shortcode)
   - `16216` (Nagad shortcode)

2. **Webhook Domain**: Enter your server URL
   ```
   https://yourserver.com/webhook
   ```
   OR for local testing:
   ```
   http://your-local-ip:3000/webhook
   ```

3. **Webhook Token**: Enter the same token from your `.env` file
   ```
   YOUR_SECURE_TOKEN_HERE
   ```

4. **Toggle Service**: Turn ON

### Step 3: Grant Permissions

Allow the app to:
- Read SMS messages
- Run in background
- Access internet

---

## 💾 Database Setup

The system uses MongoDB with 3 collections:

### Orders Collection
```javascript
{
  orderId: "ORD123",
  customerPhone: "01712345678",
  customerName: "John Doe",
  amount: 500,
  status: "pending", // or "paid", "cancelled"
  paymentMethod: "bkash",
  transactionId: null,
  createdAt: Date,
  paidAt: null
}
```

### Creating Test Orders

You can create orders via API:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD001",
    "customerPhone": "01712345678",
    "customerName": "Test Customer",
    "amount": 500,
    "paymentMethod": "bkash"
  }'
```

Or integrate with your existing order system.

---

## 🔄 How It Works

```
┌─────────────────┐
│  Customer Pays  │
│  via bKash      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SMS Received   │
│  on Phone       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SMS Forwarded  │
│  to Webhook     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SMS Parsed     │
│  Extract TrxID  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Find Matching  │
│  Order (FIFO)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Update Order   │
│  Status: PAID   │
└─────────────────┘
```

---

## 📚 API Documentation

### Webhook Endpoint

**POST** `/webhook`

Receives SMS from forwarding app.

**Request Body:**
```json
{
  "message": "You received Tk 500.00 from 01712345678. TrxID BK123ABC456",
  "sender": "bKash",
  "token": "YOUR_SECURE_TOKEN_HERE"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "BK123ABC456",
  "matched": true,
  "matchDetails": {
    "matched": true,
    "message": "Order ORD001 successfully matched!",
    "order": {
      "orderId": "ORD001",
      "customerName": "Test Customer",
      "amount": 500
    }
  }
}
```

### Get Statistics

**GET** `/api/stats`

Returns order and transaction statistics.

### Get Recent Logs

**GET** `/api/logs?limit=50`

Returns recent system logs.

### Get Pending Orders

**GET** `/api/orders?status=pending`

Returns all pending orders.

### Get Transactions

**GET** `/api/transactions?limit=50`

Returns recent transactions.

---

## 🔐 Security Best Practices

1. **Use Strong Token**
   ```bash
   openssl rand -base64 32
   ```

2. **Enable HTTPS** in production (use Let's Encrypt)

3. **Restrict CORS** - Update `FRONTEND_URL` in `.env`

4. **Firewall Rules** - Only allow your phone's IP

5. **Regular Updates** - Keep dependencies updated
   ```bash
   npm audit fix
   ```

---

## 🌐 Deployment

### Option 1: VPS (Recommended)

1. **Rent a VPS** (DigitalOcean, AWS, etc.)

2. **Install Node.js and MongoDB**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs mongodb
   ```

3. **Upload your code**
   ```bash
   scp -r "SMS PRO" user@your-server:/var/www/
   ```

4. **Setup PM2** (process manager)
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name sms-pro
   pm2 startup
   pm2 save
   ```

5. **Configure Nginx** (reverse proxy)
   ```nginx
   server {
       listen 80;
       server_name yourserver.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
       }
   }
   ```

6. **Setup SSL**
   ```bash
   sudo certbot --nginx -d yourserver.com
   ```

### Option 2: cPanel Hosting

1. Upload files via File Manager
2. Create Node.js app in cPanel
3. Set environment variables
4. Start the application

---

## 📱 PWA Installation (Android App)

1. Open dashboard in **Chrome browser** on your phone
   ```
   https://yourserver.com
   ```

2. Tap **menu (⋮)** → **Add to Home Screen**

3. Choose a name and **Add**

4. App icon will appear on your home screen! 🎉

---

## 🧪 Testing

### Test with Mock SMS

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "message": "You received Tk 500.00 from 01712345678. TrxID BK123ABC456",
    "sender": "bKash",
    "token": "YOUR_SECURE_TOKEN_HERE"
  }'
```

### Expected Flow

1. Create a test order for 500 BDT
2. Send the mock SMS above
3. Check dashboard - order should show as "PAID"
4. Check logs - should show successful match

---

## 🛠️ Troubleshooting

### Connection Issues

**Problem**: Dashboard shows "Offline"  
**Solution**: Check if server is running and MongoDB is connected

### SMS Not Forwarding

**Problem**: No logs appearing  
**Solution**: 
- Verify token matches
- Check phone has internet
- Test with curl first
- Check app permissions

### No Order Match

**Problem**: Transaction received but not matched  
**Solution**:
- Verify order exists with exact amount
- Check payment method matches (bkash/nagad)
- Check order status is "pending"

### Port Already in Use

**Problem**: `Error: Port 3000 already in use`  
**Solution**: 
```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9
```

---

## 📊 File Structure

```
SMS PRO/
├── frontend/
│   ├── index.html      # Dashboard UI
│   ├── styles.css      # Premium pink theme
│   ├── app.js          # Frontend logic
│   ├── manifest.json   # PWA config
│   └── sw.js           # Service worker
├── backend/
│   ├── server.js       # Express server
│   ├── models/
│   │   ├── Order.js
│   │   ├── Transaction.js
│   │   └── Log.js
│   ├── routes/
│   │   ├── webhook.js
│   │   └── api.js
│   └── utils/
│       ├── smsParser.js
│       └── matcher.js
├── package.json
├── .env
└── README.md
```

---

## 🤝 Integration with Existing Systems

To integrate with your existing order management system:

1. **Export orders to MongoDB** when customer places order
2. **Set status to "pending"** and payment method
3. **Listen for updates** via MongoDB change streams
4. **Trigger actions** when status changes to "paid"

Example integration:
```javascript
// When customer places order in your system
await Order.create({
  orderId: yourOrderId,
  customerPhone: phone,
  customerName: name,
  amount: totalAmount,
  paymentMethod: 'bkash',
  status: 'pending'
});

// Monitor for payment
const changeStream = Order.watch();
changeStream.on('change', (change) => {
  if (change.updateDescription?.updatedFields?.status === 'paid') {
    // Order paid! Trigger your fulfillment process
    fulfillOrder(change.documentKey._id);
  }
});
```

---

## 📞 Support

For issues or questions:
- Email: support@rizqara.com
- Check logs: `/api/logs`
- Check health: `/health`

---

## 📝 License

Created for Rizqara Tech - All Rights Reserved

---

## 🎯 Roadmap

- [ ] Multi-currency support
- [ ] Email notifications
- [ ] WhatsApp integration
- [ ] Admin dashboard improvements
- [ ] Bulk order upload
- [ ] Export transactions to CSV
- [ ] Analytics & reports

---

**Built with ❤️ for Rizqara Tech**
