# 🚀 Complete Payment Gateway

## Features
✅ User Dashboard with all pages  
✅ Create Payment with QR Code  
✅ UPI Links for PhonePe, Google Pay, Paytm, BharatPe  
✅ Transaction History  
✅ Profile Management  
✅ Razorpay Integration  
✅ Firebase Realtime Database  
✅ PayU Integration  
✅ Webhook Support  
✅ API Documentation  

## Deployment
1. Copy all files to GitHub
2. Deploy on Render.com
3. Set Environment Variables:
   - FIREBASE_PRIVATE_KEY
   - RAZORPAY_KEY_ID
   - RAZORPAY_KEY_SECRET

## Access URLs
- Dashboard: `https://paymxraaz.onrender.com/`
- Create Payment: `https://paymxraaz.onrender.com/create-payment`
- UPI Links: `https://paymxraaz.onrender.com/upi-links`
- Transactions: `https://paymxraaz.onrender.com/transactions`
- Profile: `https://paymxraaz.onrender.com/profile`
- API Docs: `https://paymxraaz.onrender.com/api-docs`
- Health: `https://paymxraaz.onrender.com/health`

## API Endpoints
- POST `/api/create-payment` - Create payment
- GET `/api/upi-apps/:upiId` - Get UPI links
- POST `/api/save-upi` - Save UPI ID
- POST `/api/webhook/razorpay` - Webhook