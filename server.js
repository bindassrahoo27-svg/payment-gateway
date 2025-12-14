const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ FIXED FIREBASE CONFIG (आपके credentials के साथ)
const firebaseConfig = {
  type: "service_account",
  project_id: "raaz-cf574",
  private_key_id: "2141d62f4fbcc5703593252abfb710ffe51fb660",
  private_key: process.env.FIREBASE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCUpXV2MzLAPh2b\nUDdXdsouGXD2NF1nEN4yOxAcKCMFnCJD4knk5DPa2a56gWQ4gfz7CZXTqb9GGaAE\nvqTr6lo5Ca7TjqK7uY2t/86vJe3o3x3ELWCuhbnm0plz7ZSauizc/C0Yrj0RsuD1\n1jBY/ClJknB+z6Jq2sizVlzGyQGouOvo6taEg/Qo2xOEnNg6pNEUm23ZYskMJHBG\nJIzBziBFAqyxW75STwdV9xys0+gGfituGd2XnsMF21GNr0ydLsqEUUzLTfv5j7Dd\n6UbBsm7eDNUI5mfeNCx5Vxxn4HlxOGo8KjfF8M3zNY9nvVhtz/CL2IssLNOJv3fw\nN6SY27TPAgMBAAECggEABleqU7kgMOcK7ltAMUGGo5bppKexVeTOBkiniaawxTGB\n83GOrkSKbeEcj7+WSM71vg8M+d4OpO1npYGDmfQC64IdQoud0p1lN90Ssuh5u+uh\nN9ipJ76ETclYoNisnuQou+PKrM3qbyc5xWOL5pAZLDl3sVbSBaCA2x4T5qt29ahK\n6d/kAaON3mNBu4EAc1Tn6NEBMWTNTefjg6wl2XVFVm0/ACU2KB6Ku/FsRURWbVEN\nifcxQk9Bd1OAt/Q6BQ4Im0+rgRA31vDuvDv70hyY8JR5RyTcivQ5NSk3o0ENyDDe\n/WzzBDcM3t8PDoXENv2n3vkihVk76EeaRlG1PPqAUQKBgQDSG4hMJhcbOAfXqUaL\nLyonTGQaTPKtEiqflJBtVyzKlaaAS51ZMpGT7FXfjZ8LnNqaGXE4sNwqp0LCB2cV\nvttO2qT4YGWqr24l8JcAZEIDAhdOzSUFmW7HmPHl1KzfHLA+oEL9JLRoEGkzVnDE\ndVJZtWrmamIflsTXa8i2+m8GSQKBgQC1HTusf5sf3Zal8+1MjnueHq0eK30TZc1g\nMLWU6MXhmUYh1WIGhi4J0Ba01ar8jBvYVxBJdaaSRifE0zAUFbVB3Tha0eT4Opax\ne/L3xvTLsbemjfQCIQ7ctXNkH3tnb/eZSZODZVOc6eo91XkgCBDP0JGTr0p7LC49\neBNrlnQCVwKBgQCfJwHghL3d/VxbbTsldS2eJQxyq7TriqZEyTl5yZ4BOsiryBtB\nlL+XaF9H/rPqDP+92OXdxoKPwLEd3pOkcjUXjyGFjyeT2l06WftX7ZnfQ3c6VsTj\nb+ztPpqFuMrWGpoaZjU4IdSSO1Qk8iZrel9N2tFGBnGbcg5bC6c3i44MGQKBgQCj\n45gkODR/WV0BPwH0zNo/8zJkoqXD79Mwv+MQpLKruq8j3pudm739Uze428CmV4K6\n+c3bK4NXyfQiv5g6FIq41x4v0M+JcDr80FTEslzCFkdBiCLN6mwwfGG2sGZS65b6\nNwItXHuU+nblDU9WFPZhlzKkmXKkkw4kwYuRR8wicQKBgEVGaErwLjQ8MwElM2QF\nx2bH4zARE32r5IOu/8lMuFRw28pIUILG5zzPE/ptRv/Wk7oQ/Hm76ece/84x2B7V\nPR8huqF+3AUMCkLgS3jO2RMWzmvlJ/AZM9vEXdPWQB6o0hiOPM5MiKs6IB+QGjio\nWj5bFrH1WXSv1PaxJCSUP07d\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@raaz-cf574.iam.gserviceaccount.com",
  client_id: "108814795918058499272",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40raaz-cf574.iam.gserviceaccount.com"
};

// ✅ FIXED: Firebase initialization
try {
  // Private key को correct format में लाएं
  const privateKey = firebaseConfig.private_key.replace(/\\n/g, '\n');
  
  admin.initializeApp({
    credential: admin.credential.cert({
      ...firebaseConfig,
      private_key: privateKey
    }),
    databaseURL: "https://raaz-cf574-default-rtdb.firebaseio.com"
  });
  console.log("✅ Firebase connected successfully!");
} catch (error) {
  console.error("❌ Firebase error:", error.message);
}

const db = admin.database();

// ✅ Razorpay Configuration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET'
});

// ✅ PayU Configuration
const payuConfig = {
  merchantKey: 'b4QB2q',
  merchantSalt: 'HaRzuk8VS5BjGmjFZHcul9wIty2Dgo9h',
  authHeader: 'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDXPV9iupil4uzDh9MMoap+eQOYlPzBuzArXiQafqgNYSGsjM81IAiUsySgmh1xD6ZLStZzoXkRfiwq+m6ssPk4qETn3Y1k9nHa2SbG49TQmLEZf0/BTRnE90IKpqkR/UZ6y0WLFevWeFloZIJ2hOayk3WnJE6aW8gmMCFqHjkyKiFHWTs8gdNCGLeksmtc9MVxjTiU/lqxtlohyYgIkS6Ya57T4AJhkNZtgnKAE0D7ER4exwQmLl9o8CTGBCHwqAAhl3wStkkHWnGNEfSaiiVTAEmP90ARJidBfZyAJCepoU9a4vKGGaJLAvgyWsMlrF9ZnlzLhCaBThmEOGV9+HYrAgMBAAECggEAPAyXTAgbBkzlGTgPnXqNAnPomO0YB0SeD7tX/zxOzkzHBEjUllG1kybXlSbqB90B3AepBOGL0WGOGP99WRiWr0Pi1X1uMTjAUvo6Y0q02O2Am0h1i8xi4BzLhAUzLh2nSCLl6APZpCA3cXR5IW+6nR+et17dvxrUIDNVXzHHa0Lqixii+I/hlJHydM78OMr7aDF+kChWR5wRzAt0C2Vnu9Fa80mrfc+3YbnHqsZc7mGTHK2YmXrQfWh8RAH4yFW2cucxWt+B4Of5lBfnBRj5aHO/GmasI1k+Gz9RUhWFUPCQTAtf35HK7Be5ivHtryf1IXtLRZ59fFp5UXXh9KD9YQKBgQD4t6yTmap0RLTCHG4rzA5KWuzDlL8A/2e6GZX8Us3wCBQYQpYE4e/UhGZHdDtFyBLmPs28g4QIo0dCEGN0xOsZd+UdLiVKEc/suZIGaxFWaucaXFqmPB/nC1uDrUqmr72QYckE5FdefY9gDLLfR83jOD9ObPWs8aP+0KThyuiUVwKBgQDdisHoatokLY/E0zzJAYm7uuCoDfvxIq1BGf5W6cVw1uStFxOupoH2vs9PN8eFEt3wNm+Z3TL21P3SdgfFY4pKEEaAPjf+OaxsWdXpL90wyKnL0Xc1uPJK5s9QMXVuSrwiCa71mXJd0Y8R689PGf7obKLsh4cYPYFddez2h/PoTQKBgQC0a+EnzUAGSdTqPt94q/Tt4VmBY0TPf3cKXAceXB8B8YpKMvtKnW9xtX3QdbONol57YbGy/6Bm97L4bJUJHtQAzKWKbnAkdBll+xO/zilsi+4LhFVJ47Gs0+NV+P5/PlsAAr9k6hOq+uBn565WJGtpWeMqjAYHp960OTxygtQGzwKBgDGXM9ygvn/Gqx314u9jpr8dD9jOeIz7pCikduhhn86oa7vLJJ69qu3evG0RIVpKZN+2b7jTaOsTtlV8EjU/GN+HUSC3zLTdmBkQ6u8txad743Y6RyMBaUsW62UaDR1JIV/FJyLW3GDf3dS3IkqkmQjR+I5VsAnfCqwvD4IH4LMpAoGBAOw9HQ1E6ntZvdIdlvnFA9KgcnmCpbZkcAtUrscTXledKD0fpg+ryXhXauF5/HuCxLV/xKMqu33E4B7LOzkiWe2MpaulbUPr5W5V6isxr/lGZkKVy2c7v0XlhaxgDXPEm9u9qGrhfnqua8Osn48iQBrrt8z08Zc1hCYIguW7CFWz',
  testMode: true
};

// 1️⃣ CREATE PAYMENT ORDER (Razorpay)
app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, upiId, customerName, email, phone } = req.body;
    
    // Razorpay order create
    const options = {
      amount: Math.round(amount * 100), // पैसे में
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        upiId: upiId || 'not_provided',
        customerName: customerName || 'Customer'
      }
    };
    
    const order = await razorpay.orders.create(options);
    
    // Firebase में save करें
    const paymentRef = db.ref('payments').push();
    await paymentRef.set({
      paymentId: order.id,
      amount: amount,
      upiId: upiId,
      customerName: customerName,
      status: 'created',
      gateway: 'razorpay',
      createdAt: new Date().toISOString(),
      razorpayOrderId: order.id
    });
    
    // UPI links generate करें
    const upiLinks = {
      phonepe: `phonepe://pay?pa=${upiId || 'test@razorpay'}&pn=${encodeURIComponent(customerName || 'Merchant')}&am=${amount}&cu=INR`,
      google_pay: `tez://upi/pay?pa=${upiId || 'test@razorpay'}&pn=${encodeURIComponent(customerName || 'Merchant')}&am=${amount}`,
      paytm: `paytmmp://upi/pay?pa=${upiId || 'test@razorpay'}&pn=${encodeURIComponent(customerName || 'Merchant')}&am=${amount}`,
      bharatpe: `bharatpe://upi/pay?pa=${upiId || 'test@razorpay'}&pn=${encodeURIComponent(customerName || 'Merchant')}&am=${amount}`,
      default: `upi://pay?pa=${upiId || 'test@razorpay'}&pn=${encodeURIComponent(customerName || 'Merchant')}&am=${amount}&cu=INR`
    };
    
    // QR code data
    const qrData = `upi://pay?pa=${upiId || 'test@razorpay'}&pn=${encodeURIComponent(customerName || 'Merchant')}&am=${amount}&cu=INR`;
    
    res.json({
      success: true,
      orderId: order.id,
      amount: amount,
      currency: 'INR',
      upiId: upiId,
      customerName: customerName,
      razorpayKey: razorpay.key_id,
      upiLinks: upiLinks,
      qrCode: qrData,
      paymentRefId: paymentRef.key,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment creation failed'
    });
  }
});

// 2️⃣ PAYU PAYMENT (Alternative)
app.post('/api/payu-payment', async (req, res) => {
  try {
    const { amount, productInfo, firstName, email, phone } = req.body;
    
    // PayU hash generation
    const crypto = require('crypto');
    const hashString = `${payuConfig.merchantKey}|${Math.random().toString(36).substr(2, 9)}|${amount}|${productInfo}|${firstName}|${email}|||||||||||${payuConfig.merchantSalt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');
    
    const paymentRef = db.ref('payu_payments').push();
    await paymentRef.set({
      amount: amount,
      productInfo: productInfo,
      customerName: firstName,
      email: email,
      phone: phone,
      status: 'initiated',
      hash: hash,
      createdAt: new Date().toISOString()
    });
    
    res.json({
      success: true,
      merchantKey: payuConfig.merchantKey,
      merchantSalt: payuConfig.merchantSalt,
      hash: hash,
      txnId: Math.random().toString(36).substr(2, 9),
      amount: amount,
      productInfo: productInfo,
      firstName: firstName,
      email: email,
      phone: phone,
      payuUrl: payuConfig.testMode ? 
        'https://test.payu.in/_payment' : 
        'https://secure.payu.in/_payment'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 3️⃣ GET UPI LINKS FOR SPECIFIC APPS
app.get('/api/upi-apps/:upiId', (req, res) => {
  const { upiId } = req.params;
  const { amount = 100, name = 'Merchant' } = req.query;
  
  const apps = {
    phonepe: {
      name: 'PhonePe',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/PhonePe_Logo.svg/240px-PhonePe_Logo.svg.png',
      link: `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`,
      package: 'com.phonepe.app'
    },
    google_pay: {
      name: 'Google Pay',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/240px-Google_Pay_Logo.svg.png',
      link: `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}`,
      package: 'com.google.android.apps.nbu.paisa.user'
    },
    paytm: {
      name: 'Paytm',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Paytm_logo_%28standalone%29.svg/240px-Paytm_logo_%28standalone%29.svg.png',
      link: `paytmmp://upi/pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}`,
      package: 'net.one97.paytm'
    },
    bharatpe: {
      name: 'BharatPe',
      logo: 'https://seeklogo.com/images/B/bharatpe-logo-3B7D4C8249-seeklogo.com.png',
      link: `bharatpe://upi/pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}`,
      package: 'com.bharatpe.app'
    },
    default: {
      name: 'Any UPI App',
      logo: 'https://cdn-icons-png.flaticon.com/512/3573/3573188.png',
      link: `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`,
      package: ''
    }
  };
  
  res.json({
    success: true,
    upiId: upiId,
    amount: amount,
    merchantName: name,
    apps: apps,
    qrCode: `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`
  });
});

// 4️⃣ SAVE USER UPI ID
app.post('/api/save-upi', async (req, res) => {
  try {
    const { upiId, userId, appName } = req.body;
    
    if (!upiId || !upiId.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid UPI ID format. Use: yourname@bank'
      });
    }
    
    const upiRef = db.ref('user_upi').push();
    await upiRef.set({
      upiId: upiId,
      userId: userId || 'anonymous',
      appName: appName || 'unknown',
      createdAt: new Date().toISOString(),
      status: 'active'
    });
    
    res.json({
      success: true,
      message: 'UPI ID saved successfully',
      upiId: upiId,
      recordId: upiRef.key,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 5️⃣ WEBHOOK FOR PAYMENT VERIFICATION
app.post('/api/webhook/razorpay', express.raw({ type: 'application/json' }), (req, res) => {
  const crypto = require('crypto');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';
  
  const signature = req.headers['x-razorpay-signature'];
  const body = req.body.toString();
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  if (signature === expectedSignature) {
    const event = JSON.parse(body);
    
    // Firebase में update करें
    if (event.payload && event.payload.payment && event.payload.payment.entity) {
      const payment = event.payload.payment.entity;
      
      db.ref('payments').orderByChild('razorpayOrderId')
        .equalTo(payment.order_id)
        .once('value')
        .then(snapshot => {
          if (snapshot.exists()) {
            const paymentKey = Object.keys(snapshot.val())[0];
            db.ref(`payments/${paymentKey}`).update({
              status: payment.status,
              paymentId: payment.id,
              method: payment.method,
              upiVpa: payment.vpa || null,
              captured: payment.captured || false,
              webhookReceived: true,
              updatedAt: new Date().toISOString()
            });
          }
        });
    }
    
    res.json({ status: 'ok' });
  } else {
    res.status(400).json({ error: 'Invalid signature' });
  }
});

// 6️⃣ HEALTH CHECK ENDPOINT
app.get('/health', (req, res) => {
  res.json({
    status: '🟢 ONLINE',
    timestamp: new Date().toISOString(),
    services: {
      firebase: admin.apps.length > 0 ? '🟢 Connected' : '🔴 Disconnected',
      razorpay: razorpay.key_id ? '🟢 Configured' : '🔴 Not Configured',
      payu: payuConfig.merchantKey ? '🟢 Configured' : '🔴 Not Configured',
      database: 'https://raaz-cf574-default-rtdb.firebaseio.com'
    },
    endpoints: {
      createPayment: 'POST /api/create-payment',
      upiApps: 'GET /api/upi-apps/:upiId',
      saveUpi: 'POST /api/save-upi',
      payuPayment: 'POST /api/payu-payment',
      health: 'GET /health'
    }
  });
});

// 7️⃣ ROOT ENDPOINT
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Gateway API</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #4a6ee0; }
        .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #4a6ee0; }
        code { background: #e9ecef; padding: 2px 6px; border-radius: 3px; }
        .status { display: inline-block; padding: 5px 10px; background: #28a745; color: white; border-radius: 3px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>💰 Payment Gateway API</h1>
        <p><span class="status">ONLINE</span> Server is running successfully!</p>
        <p>Base URL: <code>https://paymxraaz.onrender.com</code></p>
        
        <h2>Available Endpoints:</h2>
        
        <div class="endpoint">
          <strong>Create Payment</strong><br>
          <code>POST /api/create-payment</code><br>
          Body: { "amount": 100, "upiId": "yourname@okicici", "customerName": "John Doe" }
        </div>
        
        <div class="endpoint">
          <strong>Get UPI App Links</strong><br>
          <code>GET /api/upi-apps/yourname@okicici?amount=100&name=John</code>
        </div>
        
        <div class="endpoint">
          <strong>Save UPI ID</strong><br>
          <code>POST /api/save-upi</code><br>
          Body: { "upiId": "yourname@okicici", "userId": "user123" }
        </div>
        
        <div class="endpoint">
          <strong>Health Check</strong><br>
          <code>GET /health</code>
        </div>
        
        <h2>Test UPI IDs:</h2>
        <ul>
          <li><code>success@razorpay</code> - Test success payment</li>
          <li><code>failure@razorpay</code> - Test failure payment</li>
          <li>Use any real UPI ID for actual payments</li>
        </ul>
        
        <p><a href="/health">Click here for detailed health status</a></p>
      </div>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🌐 Base URL: https://paymxraaz.onrender.com`);
});