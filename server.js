const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Firebase इनिशियलाइज़ेशन (आपके Firebase क्रेडेंशियल्स के साथ)
const serviceAccount = {
  "type": "service_account",
  "project_id": "raaz-cf574",
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://raaz-cf574-default-rtdb.firebaseio.com"
});

const db = admin.database();

// Razorpay इनिशियलाइज़ेशन (टेस्ट मोड कीज़)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET'
});

// 1. ऑर्डर बनाने का API
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency, userUpiId } = req.body;
    const options = {
      amount: amount * 100, // रुपये से पैसे में
      currency: currency || 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userUpiId: userUpiId || 'Not Provided'
      }
    };
    const order = await razorpay.orders.create(options);
    
    // Firebase में ऑर्डर सेव करें
    const orderRef = db.ref('orders').push();
    await orderRef.set({
      orderId: order.id,
      amount: amount,
      currency: currency,
      userUpiId: userUpiId,
      status: 'created',
      createdAt: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      orderId: order.id, 
      amount: order.amount,
      key: razorpay.key_id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 2. यूजर की UPI ID सेव करने का API (PhonePe, Google Pay, etc.)
app.post('/api/save-upi', async (req, res) => {
  try {
    const { userId, upiId, appName } = req.body;
    const upiRef = db.ref('user_upi').child(userId).push();
    await upiRef.set({
      upiId: upiId,
      appName: appName, // 'phonepe', 'google_pay', 'bharatpe', etc.
      createdAt: new Date().toISOString()
    });
    res.json({ success: true, message: 'UPI ID saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. भुगतान सत्यापन Webhook (Razorpay से कॉल होगा)
app.post('/api/payment-verify', async (req, res) => {
  const crypto = require('crypto');
  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret');
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');
  
  if (digest === req.headers['x-razorpay-signature']) {
    const event = req.body.event;
    const payment = req.body.payload.payment.entity;
    
    // Firebase में भुगतान की स्थिति अपडेट करें
    const paymentRef = db.ref('payments').child(payment.order_id);
    await paymentRef.set({
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: payment.amount / 100,
      method: payment.method,
      upiId: payment.vpa || 'N/A',
      status: payment.status,
      verified: true,
      verifiedAt: new Date().toISOString()
    });
    
    console.log('Payment verified:', payment.id);
  }
  res.json({ status: 'ok' });
});

// 4. सभी UPI ऐप्स के लिए सपोर्टेड लिंक जनरेटर
app.get('/api/generate-upi-links', (req, res) => {
  const { upiId, amount, name } = req.query;
  const apps = {
    phonepe: `phonepe://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`,
    google_pay: `gpay://upi/pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`,
    paytm: `paytmmp://upi/pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`,
    bharatpe: `bharatpe://upi/pay?pa=${upiId}&pn=${name}&am=${amount}`,
    default_upi: `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`
  };
  res.json({ success: true, links: apps });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));