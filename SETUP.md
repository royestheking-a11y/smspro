# 🚀 Quick Setup Guide

Welcome to **SMS PRO**! Follow these steps to get started.

## Step 1: Check MongoDB

Make sure MongoDB is running on your system:

```bash
# Check if MongoDB is running
mongosh --eval "db.version()"
```

If not installed, install MongoDB:
- **macOS**: `brew install mongodb-community`
- **Ubuntu**: `sudo apt-get install mongodb`
- **Windows**: Download from mongodb.com

## Step 2: Setup Test Data

Run the test setup script to create sample orders:

```bash
node test-setup.js
```

This will create 3 test orders for you to try the system.

## Step 3: Start the Server

```bash
npm start
```

You should see:
```
╔══════════════════════════════════════╗
║      SMS PRO - Rizqara Tech         ║
╚══════════════════════════════════════╝

✓ Server running on port 3000
✓ Dashboard: http://localhost:3000
✓ Webhook: http://localhost:3000/webhook
```

## Step 4: Open Dashboard

Open your browser and go to:
```
http://localhost:3000
```

You should see the beautiful pink dashboard! 🎨

## Step 5: Test the Webhook

Open a new terminal and test with curl:

### Test 1: bKash Payment (500 BDT)
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"message":"You received Tk 500.00 from 01712345678. TrxID BK123ABC456","sender":"bKash","token":"RIZQARA_SECURE_TOKEN_12345"}'
```

### Test 2: Nagad Payment (1000 BDT)
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"message":"You have received Tk. 1000.00 from 01787654321. Trx ID: NGD987XYZ654","sender":"Nagad","token":"RIZQARA_SECURE_TOKEN_12345"}'
```

## Step 6: Check Results

1. **In Dashboard**: You should see:
   - Live logs showing the transaction was received
   - Stats updating (pending orders decreasing, paid orders increasing)
   - Recent transactions list updating

2. **In Terminal**: You should see server logs showing the match

## Next Steps

### For Android SMS Forwarding:

1. Download **TNRSOFT SMS Webhook** app from Play Store

2. Configure:
   - **Sender Names**: bKash, Nagad, 16247, 16216
   - **Webhook URL**: `http://YOUR_SERVER_IP:3000/webhook`
   - **Token**: `RIZQARA_SECURE_TOKEN_12345`

3. Test by sending yourself a real bKash/Nagad payment!

### For Production Deployment:

See the main **README.md** file for:
- VPS deployment instructions
- SSL certificate setup
- PM2 process management
- Nginx reverse proxy configuration

---

## Troubleshooting

### MongoDB Connection Error
```bash
# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### Port 3000 Already in Use
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Token Mismatch
Make sure the token in your webhook request matches the one in `.env`:
```
WEBHOOK_TOKEN=RIZQARA_SECURE_TOKEN_12345
```

---

**🎉 Congratulations! Your SMS PRO system is ready!**
