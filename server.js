const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const admin = require('firebase-admin');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ✅ FIXED FIREBASE INITIALIZATION
const firebaseConfig = {
  type: "service_account",
  project_id: "raaz-cf574",
  private_key_id: "2141d62f4fbcc5703593252abfb710ffe51fb660",
  private_key: process.env.FIREBASE_PRIVATE_KEY ? 
    process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : 
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCUpXV2MzLAPh2b\nUDdXdsouGXD2NF1nEN4yOxAcKCMFnCJD4knk5DPa2a56gWQ4gfz7CZXTqb9GGaAE\nvqTr6lo5Ca7TjqK7uY2t/86vJe3o3x3ELWCuhbnm0plz7ZSauizc/C0Yrj0RsuD1\n1jBY/ClJknB+z6Jq2sizVlzGyQGouOvo6taEg/Qo2xOEnNg6pNEUm23ZYskMJHBG\nJIzBziBFAqyxW75STwdV9xys0+gGfituGd2XnsMF21GNr0ydLsqEUUzLTfv5j7Dd\n6UbBsm7eDNUI5mfeNCx5Vxxn4HlxOGo8KjfF8M3zNY9nvVhtz/CL2IssLNOJv3fw\nN6SY27TPAgMBAAECggEABleqU7kgMOcK7ltAMUGGo5bppKexVeTOBkiniaawxTGB\n83GOrkSKbeEcj7+WSM71vg8M+d4OpO1npYGDmfQC64IdQoud0p1lN90Ssuh5u+uh\nN9ipJ76ETclYoNisnuQou+PKrM3qbyc5xWOL5pAZLDl3sVbSBaCA2x4T5qt29ahK\n6d/kAaON3mNBu4EAc1Tn6NEBMWTNTefjg6wl2XVFVm0/ACU2KB6Ku/FsRURWbVEN\nifcxQk9Bd1OAt/Q6BQ4Im0+rgRA31vDuvDv70hyY8JR5RyTcivQ5NSk3o0ENyDDe\n/WzzBDcM3t8PDoXENv2n3vkihVk76EeaRlG1PPqAUQKBgQDSG4hMJhcbOAfXqUaL\nLyonTGQaTPKtEiqflJBtVyzKlaaAS51ZMpGT7FXfjZ8LnNqaGXE4sNwqp0LCB2cV\nvttO2qT4YGWqr24l8JcAZEIDAhdOzSUFmW7HmPHl1KzfHLA+oEL9JLRoEGkzVnDE\ndVJZtWrmamIflsTXa8i2+m8GSQKBgQC1HTusf5sf3Zal8+1MjnueHq0eK30TZc1g\nMLWU6MXhmUYh1WIGhi4J0Ba01ar8jBvYVxBJdaaSRifE0zAUFbVB3Tha0eT4Opax\ne/L3xvTLsbemjfQCIQ7ctXNkH3tnb/eZSZODZVOc6eo91XkgCBDP0JGTr0p7LC49\neBNrlnQCVwKBgQCfJwHghL3d/VxbbTsldS2eJQxyq7TriqZEyTl5yZ4BOsiryBtB\nlL+XaF9H/rPqDP+92OXdxoKPwLEd3pOkcjUXjyGFjyeT2l06WftX7ZnfQ3c6VsTj\nb+ztPpqFuMrWGpoaZjU4IdSSO1Qk8iZrel9N2tFGBnGbcg5bC6c3i44MGQKBgQCj\n45gkODR/WV0BPwH0zNo/8zJkoqXD79Mwv+MQpLKruq8j3pudm739Uze428CmV4K6\n+c3bK4NXyfQiv5g6FIq41x4v0M+JcDr80FTEslzCFkdBiCLN6mwwfGG2sGZS65b6\nNwItXHuU+nblDU9WFPZhlzKkmXKkkw4kwYuRR8wicQKBgEVGaErwLjQ8MwElM2QF\nx2bH4zARE32r5IOu/8lMuFRw28pIUILG5zzPE/ptRv/Wk7oQ/Hm76ece/84x2B7V\nPR8huqF+3AUMCkLgS3jO2RMWzmvlJ/AZM9vEXdPWQB6o0hiOPM5MiKs6IB+QGjio\nWj5bFrH1WXSv1PaxJCSUP07d\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@raaz-cf574.iam.gserviceaccount.com",
  client_id: "108814795918058499272",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40raaz-cf574.iam.gserviceaccount.com"
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: "https://raaz-cf574-default-rtdb.firebaseio.com"
  });
  console.log("✅ Firebase connected successfully!");
} catch (error) {
  console.error("❌ Firebase error:", error.message);
}

const db = admin.database();

// ✅ RAZORPAY CONFIGURATION
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_SECRET'
});

// ✅ PAYU CONFIGURATION
const payuConfig = {
  merchantKey: 'b4QB2q',
  merchantSalt: 'HaRzuk8VS5BjGmjFZHcul9wIty2Dgo9h',
  authHeader: 'MIIEvgIBADANBgkqhkiGw0BAQEFAASCBKgwggSkAgEAAoIBAQDXPV9iupil4uzDh9MMoap+eQOYlPzBuzArXiQafqgNYSGsjM81IAiUsySgmh1xD6ZLStZzoXkRfiwq+m6ssPk4qETn3Y1k9nHa2SbG49TQmLEZf0/BTRnE90IKpqkR/UZ6y0WLFevWeFloZIJ2hOayk3WnJE6aW8gmMCFqHjkyKiFHWTs8gdNCGLeksmtc9MVxjTiU/lqxtlohyYgIkS6Ya57T4AJhkNZtgnKAE0D7ER4exwQmLl9o8CTGBCHwqAAhl3wStkkHWnGNEfSaiiVTAEmP90ARJidBfZyAJCepoU9a4vKGGaJLAvgyWsMlrF9ZnlzLhCaBThmEOGV9+HYrAgMBAAECggEAPAyXTAgbBkzlGTgPnXqNAnPomO0YB0SeD7tX/zxOzkzHBEjUllG1kybXlSbqB90B3AepBOGL0WGOGP99WRiWr0Pi1X1uMTjAUvo6Y0q02O2Am0h1i8xi4BzLhAUzLh2nSCLl6APZpCA3cXR5IW+6nR+et17dvxrUIDNVXzHHa0Lqixii+I/hlJHydM78OMr7aDF+kChWR5wRzAt0C2Vnu9Fa80mrfc+3YbnHqsZc7mGTHK2YmXrQfWh8RAH4yFW2cucxWt+B4Of5lBfnBRj5aHO/GmasI1k+Gz9RUhWFUPCQTAtf35HK7Be5ivHtryf1IXtLRZ59fFp5UXXh9KD9YQKBgQD4t6yTmap0RLTCHG4rzA5KWuzDlL8A/2e6GZX8Us3wCBQYQpYE4e/UhGZHdDtFyBLmPs28g4QIo0dCEGN0xOsZd+UdLiVKEc/suZIGaxFWaucaXFqmPB/nC1uDrUqmr72QYckE5FdefY9gDLLfR83jOD9ObPWs8aP+0KThyuiUVwKBgQDdisHoatokLY/E0zzJAYm7uuCoDfvxIq1BGf5W6cVw1uStFxOupoH2vs9PN8eFEt3wNm+Z3TL21P3SdgfFY4pKEEaAPjf+OaxsWdXpL90wyKnL0Xc1uPJK5s9QMXVuSrwiCa71mXJd0Y8R689PGf7obKLsh4cYPYFddez2h/PoTQKBgQC0a+EnzUAGSdTqPt94q/Tt4VmBY0TPf3cKXAceXB8B8YpKMvtKnW9xtX3QdbONol57YbGy/6Bm97L4bJUJHtQAzKWKbnAkdBll+xO/zilsi+4LhFVJ47Gs0+NV+P5/PlsAAr9k6hOq+uBn565WJGtpWeMqjAYHp960OTxygtQGzwKBgDGXM9ygvn/Gqx314u9jpr8dD9jOeIz7pCikduhhn86oa7vLJJ69qu3evG0RIVpKZN+2b7jTaOsTtlV8EjU/GN+HUSC3zLTdmBkQ6u8txad743Y6RyMBaUsW62UaDR1JIV/FJyLW3GDf3dS3IkqkmQjR+I5VsAnfCqwvD4IH4LMpAoGBAOw9HQ1E6ntZvdIdlvnFA9KgcnmCpbZkcAtUrscTXledKD0fpg+ryXhXauF5/HuCxLV/xKMqu33E4B7LOzkiWe2MpaulbUPr5W5V6isxr/lGZkKVy2c7v0XlhaxgDXPEm9u9qGrhfnqua8Osn48iQBrrt8z08Zc1hCYIguW7CFWz',
  testMode: true
};

// ============================================
// 🏠 HOME PAGE - USER DASHBOARD
// ============================================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Gateway - User Dashboard</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; display: flex; justify-content: center; align-items: center; }
            .container { background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 1200px; width: 100%; overflow: hidden; }
            .header { background: linear-gradient(to right, #4a6ee0, #6a11cb); color: white; padding: 40px; text-align: center; }
            .header h1 { font-size: 36px; margin-bottom: 10px; }
            .header p { opacity: 0.9; font-size: 18px; }
            .content { padding: 40px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
            .card { background: #f8f9fa; border-radius: 15px; padding: 30px; text-align: center; transition: all 0.3s; border: 2px solid transparent; }
            .card:hover { transform: translateY(-5px); border-color: #4a6ee0; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .card i { font-size: 50px; color: #4a6ee0; margin-bottom: 20px; }
            .card h3 { font-size: 22px; margin-bottom: 15px; color: #333; }
            .card p { color: #666; margin-bottom: 25px; line-height: 1.6; }
            .btn { background: linear-gradient(to right, #4a6ee0, #6a11cb); color: white; border: none; padding: 15px 30px; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.3s; }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(106, 17, 203, 0.3); }
            .footer { text-align: center; padding: 30px; color: #666; border-top: 1px solid #eee; }
            .api-section { background: #e9ecef; padding: 25px; border-radius: 12px; margin-top: 30px; }
            .endpoint { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #4a6ee0; border-radius: 8px; }
            code { background: #f1f3f4; padding: 3px 8px; border-radius: 4px; font-family: monospace; }
            @media (max-width: 768px) {
                .content { grid-template-columns: 1fr; padding: 20px; }
                .header { padding: 30px 20px; }
            }
        </style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1><i class="fas fa-wallet"></i> Payment Gateway Dashboard</h1>
                <p>Accept payments via UPI, Cards, Net Banking | 100% Secure</p>
            </div>
            
            <div class="content">
                <div class="card">
                    <i class="fas fa-plus-circle"></i>
                    <h3>Create Payment</h3>
                    <p>Generate payment links and QR codes for your customers. Accept payments via UPI, cards, and net banking.</p>
                    <a href="/create-payment" class="btn"><i class="fas fa-bolt"></i> Create Payment</a>
                </div>
                
                <div class="card">
                    <i class="fas fa-qrcode"></i>
                    <h3>UPI Payment Links</h3>
                    <p>Generate UPI links for PhonePe, Google Pay, Paytm, BharatPe. Share with customers for instant payments.</p>
                    <a href="/upi-links" class="btn"><i class="fas fa-link"></i> Generate Links</a>
                </div>
                
                <div class="card">
                    <i class="fas fa-history"></i>
                    <h3>Transaction History</h3>
                    <p>View all your transactions, payment status, and download reports. Track your earnings in real-time.</p>
                    <a href="/transactions" class="btn"><i class="fas fa-chart-bar"></i> View Transactions</a>
                </div>
                
                <div class="card">
                    <i class="fas fa-user-cog"></i>
                    <h3>Profile & Settings</h3>
                    <p>Manage your profile, UPI IDs, API keys, and payment settings. Configure your payment gateway.</p>
                    <a href="/profile" class="btn"><i class="fas fa-cog"></i> Manage Profile</a>
                </div>
            </div>
            
            <div class="api-section">
                <h3 style="margin-bottom: 20px; color: #333;"><i class="fas fa-code"></i> API Endpoints</h3>
                <div class="endpoint">
                    <strong>Create Payment Order</strong><br>
                    <code>POST /api/create-payment</code><br>
                    Body: { "amount": 100, "upiId": "yourname@okicici", "customerName": "John" }
                </div>
                <div class="endpoint">
                    <strong>Get UPI Links</strong><br>
                    <code>GET /api/upi-apps/yourname@okicici?amount=100&name=Business</code>
                </div>
                <div class="endpoint">
                    <strong>Payment Webhook</strong><br>
                    <code>POST /api/webhook/razorpay</code><br>
                    Razorpay will send payment updates here
                </div>
                <div class="endpoint">
                    <strong>Health Check</strong><br>
                    <code>GET /health</code><br>
                    Check server status
                </div>
            </div>
            
            <div class="footer">
                <p>Powered by Razorpay & Firebase | Test Mode Active | Server: Online</p>
                <p style="margin-top: 10px; font-size: 14px;">
                    <a href="/health" style="color: #4a6ee0; text-decoration: none;">Server Health</a> | 
                    <a href="/api-docs" style="color: #4a6ee0; text-decoration: none;">API Documentation</a> | 
                    <a href="https://razorpay.com" style="color: #4a6ee0; text-decoration: none;" target="_blank">Razorpay</a>
                </p>
            </div>
        </div>
        
        <script>
            // Check server health
            fetch('/health')
                .then(res => res.json())
                .then(data => {
                    console.log('Server status:', data.status);
                })
                .catch(err => {
                    console.log('Server check failed:', err);
                });
        </script>
    </body>
    </html>
  `);
});

// ============================================
// 📱 CREATE PAYMENT PAGE
// ============================================
app.get('/create-payment', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Create Payment - Payment Gateway</title>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', system-ui; }
            body { background: #f5f7fa; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(to right, #4a6ee0, #6a11cb); color: white; padding: 30px; border-radius: 15px; margin-bottom: 30px; }
            .header h1 { font-size: 28px; margin-bottom: 10px; }
            .header p { opacity: 0.9; }
            .back-btn { background: rgba(255,255,255,0.2); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 15px; }
            .card { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); margin-bottom: 30px; }
            .form-group { margin-bottom: 25px; }
            label { display: block; margin-bottom: 8px; font-weight: 600; color: #444; }
            input, select, textarea { width: 100%; padding: 14px; border: 2px solid #e1e5eb; border-radius: 10px; font-size: 16px; transition: all 0.3s; }
            input:focus, select:focus, textarea:focus { border-color: #4a6ee0; outline: none; box-shadow: 0 0 0 3px rgba(74, 110, 224, 0.1); }
            .btn { background: linear-gradient(to right, #4a6ee0, #6a11cb); color: white; border: none; padding: 16px 30px; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; width: 100%; }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(106, 17, 203, 0.3); }
            .qr-container { text-align: center; padding: 30px; background: #f8f9fa; border-radius: 12px; margin: 25px 0; }
            #qrCode { margin: 20px auto; }
            .result { background: #e8f5e9; padding: 25px; border-radius: 12px; margin-top: 25px; border-left: 5px solid #4caf50; }
            .hidden { display: none; }
            .upi-apps { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 25px 0; }
            .upi-app { border: 2px solid #e1e5eb; border-radius: 10px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s; }
            .upi-app:hover { border-color: #4a6ee0; background: #f9f7ff; transform: translateY(-3px); }
            .upi-app img { width: 60px; height: 60px; margin-bottom: 10px; }
            .status { padding: 10px 15px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; }
            .status-success { background: #d4edda; color: #155724; }
            .status-pending { background: #fff3cd; color: #856404; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1><i class="fas fa-plus-circle"></i> Create Payment</h1>
                <p>Generate payment links and QR codes for your customers</p>
                <button class="back-btn" onclick="window.location.href='/'"><i class="fas fa-arrow-left"></i> Back to Dashboard</button>
            </div>
            
            <div class="card">
                <h2 style="margin-bottom: 25px; color: #333;">Payment Details</h2>
                
                <div class="form-group">
                    <label for="customerName">Customer Name</label>
                    <input type="text" id="customerName" placeholder="Enter customer name" value="John Doe">
                </div>
                
                <div class="form-group">
                    <label for="customerEmail">Customer Email (Optional)</label>
                    <input type="email" id="customerEmail" placeholder="customer@example.com" value="customer@example.com">
                </div>
                
                <div class="form-group">
                    <label for="customerPhone">Customer Phone (Optional)</label>
                    <input type="tel" id="customerPhone" placeholder="9999999999" value="9999999999">
                </div>
                
                <div class="form-group">
                    <label for="yourUpiId">Your UPI ID (to receive payment)</label>
                    <input type="text" id="yourUpiId" placeholder="yourname@okicici" value="merchant@okicici">
                    <small style="color: #666; display: block; margin-top: 5px;">This is where you'll receive the money</small>
                </div>
                
                <div class="form-group">
                    <label for="amount">Amount (₹)</label>
                    <input type="number" id="amount" placeholder="Enter amount" value="100" min="1">
                </div>
                
                <div class="form-group">
                    <label for="description">Payment Description</label>
                    <input type="text" id="description" placeholder="e.g., Product purchase, Service fee" value="Payment for services">
                </div>
                
                <button class="btn" onclick="createPayment()">
                    <i class="fas fa-bolt"></i> Create Payment Link
                </button>
                
                <div id="paymentResult" style="margin-top: 20px;"></div>
            </div>
            
            <div class="card result hidden" id="paymentResultCard">
                <h2 style="color: #2e7d32; margin-bottom: 20px;"><i class="fas fa-check-circle"></i> Payment Created Successfully!</h2>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <p><strong>Order ID:</strong> <span id="resultOrderId" style="font-family: monospace;"></span></p>
                    <p><strong>Amount:</strong> ₹<span id="resultAmount"></span></p>
                    <p><strong>UPI ID:</strong> <code id="resultUpiId"></code></p>
                    <p><strong>Payment Link:</strong> <br>
                    <small id="resultPaymentLink" style="word-break: break-all; color: #666;"></small></p>
                </div>
                
                <div class="qr-container">
                    <h3>Scan QR Code to Pay</h3>
                    <div id="resultQrCode"></div>
                    <p style="color: #666; margin-top: 10px;">Scan with any UPI app</p>
                </div>
                
                <h3 style="margin: 30px 0 15px 0;">Open Directly in UPI App:</h3>
                <div class="upi-apps" id="upiAppsContainer"></div>
                
                <div style="display: flex; gap: 15px; margin-top: 25px;">
                    <button class="btn" onclick="copyPaymentLink()" style="background: #2196f3;">
                        <i class="fas fa-copy"></i> Copy Payment Link
                    </button>
                    <button class="btn" onclick="openRazorpayCheckout()">
                        <i class="fas fa-credit-card"></i> Pay with Razorpay
                    </button>
                </div>
            </div>
        </div>
        
        <script>
            const backendUrl = window.location.origin;
            let currentPayment = null;
            
            async function createPayment() {
                const customerName = document.getElementById('customerName').value;
                const customerEmail = document.getElementById('customerEmail').value;
                const customerPhone = document.getElementById('customerPhone').value;
                const yourUpiId = document.getElementById('yourUpiId').value;
                const amount = document.getElementById('amount').value;
                const description = document.getElementById('description').value;
                
                if (!amount || amount < 1) {
                    alert('Please enter a valid amount (minimum ₹1)');
                    return;
                }
                
                if (!yourUpiId || !yourUpiId.includes('@')) {
                    alert('Please enter a valid UPI ID (format: yourname@bank)');
                    return;
                }
                
                document.getElementById('paymentResult').innerHTML = \`
                    <div style="text-align: center; padding: 20px; color: #666;">
                        <i class="fas fa-spinner fa-spin"></i> Creating payment...
                    </div>
                \`;
                
                try {
                    const response = await fetch('\${backendUrl}/api/create-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            amount: parseFloat(amount),
                            upiId: yourUpiId,
                            customerName: customerName,
                            customerEmail: customerEmail,
                            customerPhone: customerPhone,
                            description: description
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        currentPayment = data;
                        
                        // Update result display
                        document.getElementById('resultOrderId').textContent = data.orderId;
                        document.getElementById('resultAmount').textContent = data.amount;
                        document.getElementById('resultUpiId').textContent = yourUpiId;
                        document.getElementById('resultPaymentLink').textContent = data.qrCode;
                        
                        // Generate QR code
                        document.getElementById('resultQrCode').innerHTML = '';
                        QRCode.toCanvas(document.getElementById('resultQrCode'), data.qrCode, {
                            width: 200,
                            height: 200,
                            margin: 2,
                            color: { dark: '#000000', light: '#FFFFFF' }
                        });
                        
                        // Generate UPI app links
                        const apps = [
                            { name: 'PhonePe', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/PhonePe_Logo.svg/240px-PhonePe_Logo.svg.png', 
                              link: \`phonepe://pay?pa=\${yourUpiId}&pn=\${encodeURIComponent(customerName)}&am=\${amount}&cu=INR\` },
                            { name: 'Google Pay', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/240px-Google_Pay_Logo.svg.png', 
                              link: \`tez://upi/pay?pa=\${yourUpiId}&pn=\${encodeURIComponent(customerName)}&am=\${amount}\` },
                            { name: 'Paytm', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Paytm_logo_%28standalone%29.svg/240px-Paytm_logo_%28standalone%29.svg.png', 
                              link: \`paytmmp://upi/pay?pa=\${yourUpiId}&pn=\${encodeURIComponent(customerName)}&am=\${amount}\` },
                            { name: 'BharatPe', logo: 'https://seeklogo.com/images/B/bharatpe-logo-3B7D4C8249-seeklogo.com.png', 
                              link: \`bharatpe://upi/pay?pa=\${yourUpiId}&pn=\${encodeURIComponent(customerName)}&am=\${amount}\` }
                        ];
                        
                        let appsHtml = '';
                        apps.forEach(app => {
                            appsHtml += \`
                                <div class="upi-app" onclick="window.location.href='\${app.link}'">
                                    <img src="\${app.logo}" alt="\${app.name}">
                                    <div>\${app.name}</div>
                                </div>
                            \`;
                        });
                        document.getElementById('upiAppsContainer').innerHTML = appsHtml;
                        
                        // Show result card
                        document.getElementById('paymentResultCard').classList.remove('hidden');
                        document.getElementById('paymentResult').innerHTML = '';
                        
                        // Scroll to result
                        document.getElementById('paymentResultCard').scrollIntoView({ behavior: 'smooth' });
                        
                    } else {
                        document.getElementById('paymentResult').innerHTML = \`
                            <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px;">
                                <i class="fas fa-exclamation-circle"></i> Error: \${data.error || 'Payment creation failed'}
                            </div>
                        \`;
                    }
                } catch (error) {
                    document.getElementById('paymentResult').innerHTML = \`
                        <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px;">
                            <i class="fas fa-exclamation-circle"></i> Network error: \${error.message}
                        </div>
                    \`;
                    console.error(error);
                }
            }
            
            function copyPaymentLink() {
                if (!currentPayment) return;
                
                navigator.clipboard.writeText(currentPayment.qrCode)
                    .then(() => alert('Payment link copied to clipboard!'))
                    .catch(err => {
                        console.error('Copy failed:', err);
                        alert('Failed to copy: ' + err.message);
                    });
            }
            
            function openRazorpayCheckout() {
                if (!currentPayment) return;
                
                const options = {
                    key: currentPayment.razorpayKey,
                    amount: currentPayment.amount * 100,
                    currency: 'INR',
                    name: 'Payment Gateway',
                    description: document.getElementById('description').value,
                    order_id: currentPayment.orderId,
                    handler: function(response) {
                        alert(\`✅ Payment Successful!\\nPayment ID: \${response.razorpay_payment_id}\\nOrder ID: \${response.razorpay_order_id}\`);
                    },
                    prefill: {
                        name: document.getElementById('customerName').value,
                        email: document.getElementById('customerEmail').value,
                        contact: document.getElementById('customerPhone').value
                    },
                    theme: { color: '#4a6ee0' }
                };
                
                const rzp = new Razorpay(options);
                rzp.open();
                
                rzp.on('payment.failed', function(response) {
                    alert(\`❌ Payment Failed\\nError: \${response.error.description}\`);
                });
            }
        </script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </body>
    </html>
  `);
});

// ============================================
// 🔗 UPI LINKS PAGE
// ============================================
app.get('/upi-links', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>UPI Links Generator - Payment Gateway</title>
        <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', system-ui; }
            body { background: #f5f7fa; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(to right, #4a6ee0, #6a11cb); color: white; padding: 30px; border-radius: 15px; margin-bottom: 30px; }
            .header h1 { font-size: 28px; margin-bottom: 10px; }
            .back-btn { background: rgba(255,255,255,0.2); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 15px; }
            .card { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); margin-bottom: 30px; }
            .form-group { margin-bottom: 25px; }
            label { display: block; margin-bottom: 8px; font-weight: 600; color: #444; }
            input { width: 100%; padding: 14px; border: 2px solid #e1e5eb; border-radius: 10px; font-size: 16px; }
            input:focus { border-color: #4a6ee0; outline: none; }
            .btn { background: linear-gradient(to right, #4a6ee0, #6a11cb); color: white; border: none; padding: 16px; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; width: 100%; }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(106, 17, 203, 0.3); }
            .qr-container { text-align: center; padding: 30px; background: #f8f9fa; border-radius: 12px; margin: 25px 0; }
            #qrCode { margin: 20px auto; }
            .upi-apps { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 25px 0; }
            .upi-app { border: 2px solid #e1e5eb; border-radius: 10px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s; }
            .upi-app:hover { border-color: #4a6ee0; background: #f9f7ff; transform: translateY(-3px); }
            .upi-app img { width: 60px; height: 60px; margin-bottom: 10px; }
            .hidden { display: none; }
            .upi-string { background: #f1f3f4; padding: 15px; border-radius: 8px; margin: 20px 0; font-family: monospace; word-break: break-all; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1><i class="fas fa-link"></i> UPI Payment Links Generator</h1>
                <p>Generate UPI links for PhonePe, Google Pay, Paytm, BharatPe</p>
                <button class="back-btn" onclick="window.location.href='/'"><i class="fas fa-arrow-left"></i> Back to Dashboard</button>
            </div>
            
            <div class="card">
                <h2 style="margin-bottom: 25px; color: #333;">Generate UPI Links</h2>
                
                <div class="form-group">
                    <label for="upiId">Your UPI ID</label>
                    <input type="text" id="upiId" placeholder="yourname@okicici" value="merchant@okicici">
                </div>
                
                <div class="form-group">
                    <label for="amount">Amount (₹)</label>
                    <input type="number" id="amount" value="100" min="1">
                </div>
                
                <div class="form-group">
                    <label for="name">Your Name/Business Name</label>
                    <input type="text" id="name" placeholder="Enter your name" value="My Business">
                </div>
                
                <button class="btn" onclick="generateLinks()">
                    <i class="fas fa-bolt"></i> Generate UPI Links
                </button>
            </div>
            
            <div class="card hidden" id="resultCard">
                <h2 style="color: #2e7d32; margin-bottom: 20px;"><i class="fas fa-check-circle"></i> UPI Links Generated</h2>
                
                <div class="qr-container">
                    <h3>Scan QR Code to Pay</h3>
                    <div id="qrCode"></div>
                    <p style="color: #666; margin-top: 10px;">Scan with any UPI app</p>
                </div>
                
                <h3 style="margin: 30px 0 15px 0;">Open Directly in App:</h3>
                <div class="upi-apps" id="appsContainer"></div>
                
                <div style="margin-top: 25px;">
                    <h3>UPI String:</h3>
                    <div class="upi-string" id="upiString"></div>
                    <button class="btn" onclick="copyUpiString()" style="background: #2196f3;">
                        <i class="fas fa-copy"></i> Copy UPI String
                    </button>
                </div>
            </div>
        </div>
        
        <script>
            function generateLinks() {
                const upiId = document.getElementById('upiId').value;
                const amount = document.getElementById('amount').value;
                const name = document.getElementById('name').value;
                
                if (!upiId || !upiId.includes('@')) {
                    alert('Please enter a valid UPI ID');
                    return;
                }
                
                // Generate UPI string
                const upiString = \`upi://pay?pa=\${upiId}&pn=\${encodeURIComponent(name)}&am=\${amount}&cu=INR\`;
                document.getElementById('upiString').textContent = upiString;
                
                // Generate QR code
                document.getElementById('qrCode').innerHTML = '';
                QRCode.toCanvas(document.getElementById('qrCode'), upiString, {
                    width: 200,
                    height: 200,
                    margin: 2
                });
                
                // Generate app links
                const apps = [
                    { name: 'PhonePe', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/PhonePe_Logo.svg/240px-PhonePe_Logo.svg.png', 
                      link: \`phonepe://pay?pa=\${upiId}&pn=\${encodeURIComponent(name)}&am=\${amount}&cu=INR\` },
                    { name: 'Google Pay', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/240px-Google_Pay_Logo.svg.png', 
                      link: \`tez://upi/pay?pa=\${upiId}&pn=\${encodeURIComponent(name)}&am=\${amount}\` },
                    { name: 'Paytm', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Paytm_logo_%28standalone%29.svg/240px-Paytm_logo_%28standalone%29.svg.png', 
                      link: \`paytmmp://upi/pay?pa=\${upiId}&pn=\${encodeURIComponent(name)}&am=\${amount}\` },
                    { name: 'BharatPe', logo: 'https://seeklogo.com/images/B/bharatpe-logo-3B7D4C8249-seeklogo.com.png', 
                      link: \`bharatpe://upi/pay?pa=\${upiId}&pn=\${encodeURIComponent(name)}&am=\${amount}\` }
                ];
                
                let appsHtml = '';
                apps.forEach(app => {
                    appsHtml += \`
                        <div class="upi-app" onclick="window.location.href='\${app.link}'">
                            <img src="\${app.logo}" alt="\${app.name}">
                            <div>\${app.name}</div>
                        </div>
                    \`;
                });
                document.getElementById('appsContainer').innerHTML = appsHtml;
                
                // Show result
                document.getElementById('resultCard').classList.remove('hidden');
                
                // Save to backend
                fetch('\${window.location.origin}/api/save-upi', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        upiId: upiId,
                        userId: 'web_user',
                        appName: 'links_generator'
                    })
                });
            }
            
            function copyUpiString() {
                const upiString = document.getElementById('upiString').textContent;
                navigator.clipboard.writeText(upiString)
                    .then(() => alert('UPI string copied to clipboard!'))
                    .catch(err => console.error('Copy failed:', err));
            }
        </script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </body>
    </html>
  `);
});

// ============================================
// 📊 TRANSACTIONS PAGE
// ============================================
app.get('/transactions', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transaction History - Payment Gateway</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', system-ui; }
            body { background: #f5f7fa; color: #333; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(to right, #4a6ee0, #6a11cb); color: white; padding: 30px; border-radius: 15px; margin-bottom: 30px; }
            .header h1 { font-size: 28px; margin-bottom: 10px; }
            .back-btn { background: rgba(255,255,255,0.2); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 15px; }
            .card { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 15px; text-align: left; border-bottom: 1px solid #e1e5eb; }
            th { background: #f8f9fa; font-weight: 600; color: #555; }
            .status { padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; }
            .status-success { background: #d4edda; color: #155724; }
            .status-pending { background: #fff3cd; color: #856404; }
            .status-failed { background: #f8d7da; color: #721c24; }
            .btn { background: linear-gradient(to right, #4a6ee0, #6a11cb); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin: 5px; }
            .filter { display: flex; gap: 15px; margin-bottom: 20px; }
            .filter select, .filter input { padding: 10px; border: 2px solid #e1e5eb; border-radius: 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1><i class="fas fa-history"></i> Transaction History</h1>
                <p>View all your payments and track earnings</p>
                <button class="back-btn" onclick="window.location.href='/'"><i class="fas fa-arrow-left"></i> Back to Dashboard</button>
            </div>
            
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h2 style="color: #333;">Recent Transactions</h2>
                    <div>
                        <button class="btn" onclick="refreshTransactions()"><i class="fas fa-sync-alt"></i> Refresh</button>
                        <button class="btn" style="background: #28a745;"><i class="fas fa-download"></i> Export</button>
                    </div>
                </div>
                
                <div class="filter">
                    <select id="filterStatus">
                        <option value="all">All Status</option>
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                    <input type="date" id="filterDate">
                    <input type="text" id="filterSearch" placeholder="Search by order ID or customer...">
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="transactionsTable">
                        <tr>
                            <td colspan="6" style="text-align: center; padding: 50px; color: #666;">
                                <i class="fas fa-spinner fa-spin"></i> Loading transactions...
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <div style="text-align: center; margin-top: 30px;">
                    <button class="btn" onclick="loadMore()" style="background: #6c757d;">Load More</button>
                </div>
            </div>
        </div>
        
        <script>
            async function loadTransactions() {
                const table = document.getElementById('transactionsTable');
                table.innerHTML = \`
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 50px; color: #666;">
                            <i class="fas fa-spinner fa-spin"></i> Loading...
                        </td>
                    </tr>
                \`;
                
                // Simulate API call
                setTimeout(() => {
                    const transactions = [
                        { id: 'txn_001', orderId: 'ORD_20231215_001', customer: 'John Doe', amount: 250, status: 'success', date: '2023-12-15' },
                        { id: 'txn_002', orderId: 'ORD_20231214_002', customer: 'Jane Smith', amount: 500, status: 'pending', date: '2023-12-14' },
                        { id: 'txn_003', orderId: 'ORD_20231213_003', customer: 'Robert Brown', amount: 100, status: 'success', date: '2023-12-13' },
                        { id: 'txn_004', orderId: 'ORD_20231212_004', customer: 'Alice Johnson', amount: 750, status: 'failed', date: '2023-12-12' },
                        { id: 'txn_005', orderId: 'ORD_20231211_005', customer: 'Michael Wilson', amount: 300, status: 'success', date: '2023-12-11' }
                    ];
                    
                    let html = '';
                    transactions.forEach(txn => {
                        const statusClass = \`status-\${txn.status}\`;
                        html += \`
                            <tr>
                                <td>\${txn.date}</td>
                                <td><code>\${txn.orderId}</code></td>
                                <td>\${txn.customer}</td>
                                <td>₹\${txn.amount}</td>
                                <td><span class="status \${statusClass}">\${txn.status}</span></td>
                                <td>
                                    <button class="btn" style="padding: 6px 12px; font-size: 14px;" onclick="viewTransaction('\${txn.id}')">
                                        View
                                    </button>
                                </td>
                            </tr>
                        \`;
                    });
                    
                    table.innerHTML = html;
                }, 1000);
            }
            
            function refreshTransactions() {
                loadTransactions();
            }
            
            function viewTransaction(id) {
                alert('Transaction ID: ' + id + '\\n\\nIn a real application, this would show detailed transaction information.');
            }
            
            function loadMore() {
                alert('Loading more transactions...');
            }
            
            // Initial load
            loadTransactions();
        </script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </body>
    </html>
  `);
});

// ============================================
// 👤 PROFILE PAGE
// ============================================
app.get('/profile', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Profile - Payment Gateway</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', system-ui; }
            body { background: #f5f7fa; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(to right, #4a6ee0, #6a11cb); color: white; padding: 30px; border-radius: 15px; margin-bottom: 30px; }
            .header h1 { font-size: 28px; margin-bottom: 10px; }
            .back-btn { background: rgba(255,255,255,0.2); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 15px; }
            .card { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); margin-bottom: 30px; }
            .form-group { margin-bottom: 25px; }
            label { display: block; margin-bottom: 8px; font-weight: 600; color: #444; }
            input { width: 100%; padding: 14px; border: 2px solid #e1e5eb; border-radius: 10px; font-size: 16px; }
            input:focus { border-color: #4a6ee0; outline: none; }
            .btn { background: linear-gradient(to right, #4a6ee0, #6a11cb); color: white; border: none; padding: 16px; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; width: 100%; }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(106, 17, 203, 0.3); }
            .avatar { width: 100px; height: 100px; background: #4a6ee0; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 40px; margin: 0 auto 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1><i class="fas fa-user-cog"></i> Profile Settings</h1>
                <p>Manage your account and payment preferences</p>
                <button class="back-btn" onclick="window.location.href='/'"><i class="fas fa-arrow-left"></i> Back to Dashboard</button>
            </div>
            
            <div class="card">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div class="avatar" id="userAvatar">U</div>
                    <h2 id="userName">User Account</h2>
                    <p style="color: #666;">Merchant ID: <span id="userId">user_123456</span></p>
                </div>
                
                <div class="form-group">
                    <label for="profileName">Full Name</label>
                    <input type="text" id="profileName" value="John Doe">
                </div>
                
                <div class="form-group">
                    <label for="profileEmail">Email Address</label>
                    <input type="email" id="profileEmail" value="john@example.com">
                </div>
                
                <div class="form-group">
                    <label for="profilePhone">Phone Number</label>
                    <input type="tel" id="profilePhone" value="+91 9876543210">
                </div>
                
                <div class="form-group">
                    <label for="profileBusiness">Business Name</label>
                    <input type="text" id="profileBusiness" value="My Business">
                </div>
                
                <div class="form-group">
                    <label for="profileUpiId">Primary UPI ID</label>
                    <input type="text" id="profileUpiId" value="merchant@okicici">
                </div>
                
                <button class="btn" onclick="saveProfile()">
                    <i class="fas fa-save"></i> Save Profile
                </button>
            </div>
            
            <div class="card">
                <h2 style="margin-bottom: 20px; color: #333;">Security</h2>
                <button class="btn" onclick="changePassword()" style="margin-bottom: 15px;">
                    <i class="fas fa-key"></i> Change Password
                </button>
                <button class="btn" style="background: #6c757d;" onclick="manageUpiIds()">
                    <i class="fas fa-list"></i> Manage UPI IDs
                </button>
            </div>
        </div>
        
        <script>
            function saveProfile() {
                const name = document.getElementById('profileName').value;
                document.getElementById('userName').textContent = name;
                document.getElementById('userAvatar').textContent = name.charAt(0).toUpperCase();
                alert('Profile saved successfully!');
            }
            
            function changePassword() {
                const newPass = prompt('Enter new password:');
                if (newPass && newPass.length >= 6) {
                    alert('Password changed successfully!');
                } else if (newPass) {
                    alert('Password must be at least 6 characters');
                }
            }
            
            function manageUpiIds() {
                alert('Manage UPI IDs\\n\\nThis feature allows you to add/remove UPI IDs.');
            }
        </script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </body>
    </html>
  `);
});

// ============================================
// 🏥 HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: '🟢 ONLINE',
    timestamp: new Date().toISOString(),
    service: 'Payment Gateway API',
    version: '2.0.0',
    endpoints: {
      home: 'GET /',
      createPaymentPage: 'GET /create-payment',
      upiLinksPage: 'GET /upi-links',
      transactionsPage: 'GET /transactions',
      profilePage: 'GET /profile',
      createPayment: 'POST /api/create-payment',
      upiApps: 'GET /api/upi-apps/:upiId',
      saveUpi: 'POST /api/save-upi',
      health: 'GET /health'
    },
    services: {
      firebase: admin.apps.length > 0 ? '🟢 Connected' : '🔴 Disconnected',
      razorpay: razorpay.key_id ? '🟢 Configured' : '🔴 Not Configured',
      database: 'https://raaz-cf574-default-rtdb.firebaseio.com'
    }
  });
});

// ============================================
// 📄 API DOCUMENTATION
// ============================================
app.get('/api-docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Documentation - Payment Gateway</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', system-ui; }
            body { background: #f5f7fa; color: #333; line-height: 1.6; }
            .container { max-width: 1000px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(to right, #4a6ee0, #6a11cb); color: white; padding: 40px; border-radius: 15px; margin-bottom: 30px; }
            .header h1 { font-size: 32px; margin-bottom: 10px; }
            .endpoint { background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); border-left: 4px solid #4a6ee0; }
            code { background: #f1f3f4; padding: 3px 8px; border-radius: 4px; font-family: monospace; }
            pre { background: #2d2d2d; color: #fff; padding: 20px; border-radius: 8px; overflow-x: auto; margin: 15px 0; }
            .method { display: inline-block; padding: 5px 10px; border-radius: 4px; font-weight: bold; margin-right: 10px; }
            .get { background: #61affe; color: white; }
            .post { background: #49cc90; color: white; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1><i class="fas fa-code"></i> API Documentation</h1>
                <p>Payment Gateway REST API Reference</p>
            </div>
            
            <div class="endpoint">
                <div><span class="method post">POST</span> <code>/api/create-payment</code></div>
                <p style="margin: 15px 0;">Create a new payment order.</p>
                <p><strong>Request Body:</strong></p>
                <pre>
{
  "amount": 100,
  "upiId": "merchant@okicici",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "9999999999",
  "description": "Payment for services"
}</pre>
                <p><strong>Response:</strong></p>
                <pre>
{
  "success": true,
  "orderId": "order_123456",
  "amount": 100,
  "currency": "INR",
  "upiId": "merchant@okicici",
  "qrCode": "upi://pay?pa=merchant@okicici&pn=John%20Doe&am=100&cu=INR",
  "razorpayKey": "rzp_test_xxxx",
  "paymentRefId": "-Nxyz123"
}</pre>
            </div>
            
            <div class="endpoint">
                <div><span class="method get">GET</span> <code>/api/upi-apps/:upiId</code></div>
                <p style="margin: 15px 0;">Get UPI links for all payment apps.</p>
                <p><strong>Parameters:</strong></p>
                <ul>
                    <li><code>:upiId</code> - Your UPI ID (e.g., merchant@okicici)</li>
                    <li><code>?amount=100</code> - Amount (optional, default: 100)</li>
                    <li><code>?name=Business</code> - Your name (optional, default: Merchant)</li>
                </ul>
            </div>
            
            <div class="endpoint">
                <div><span class="method post">POST</span> <code>/api/save-upi</code></div>
                <p style="margin: 15px 0;">Save a UPI ID to database.</p>
                <pre>
{
  "upiId": "merchant@okicici",
  "userId": "user_123",
  "appName": "phonepe"
}</pre>
            </div>
            
            <div class="endpoint">
                <div><span class="method get">GET</span> <code>/health</code></div>
                <p style="margin: 15px 0;">Check server health and status.</p>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding: 20px; color: #666;">
                <p>Base URL: <code>https://paymxraaz.onrender.com</code></p>
                <p>© 2023 Payment Gateway API</p>
            </div>
        </div>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </body>
    </html>
  `);
});

// ============================================
// 🔧 API ENDPOINTS
// ============================================

// 1. CREATE PAYMENT
app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, upiId, customerName, customerEmail, customerPhone, description } = req.body;
    
    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least ₹1'
      });
    }
    
    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        upiId: upiId || 'not_provided',
        customerName: customerName || 'Customer',
        description: description || 'Payment'
      }
    };
    
    const order = await razorpay.orders.create(options);
    
    // Generate UPI QR code data
    const qrData = `upi://pay?pa=${upiId || 'test@razorpay'}&pn=${encodeURIComponent(customerName || 'Merchant')}&am=${amount}&cu=INR`;
    
    // Generate UPI app links
    const upiLinks = {
      phonepe: `phonepe://pay?pa=${upiId || 'test@razorpay'}&pn=${encodeURIComponent(customerName || 'Merchant')}&am=${amount}&cu=INR`,
      google_pay: `tez://upi/pay?pa=${upiId || 'test@razorpay'}&pn=${encodeURIComponent(customerName || 'Merchant')}&am=${amount}`,
      paytm: `paytmmp://upi/pay?pa=${upiId || 'test@razorpay'}&pn=${encodeURIComponent(customerName || 'Merchant')}&am=${amount}`,
      bharatpe: `bharatpe://upi/pay?pa=${upiId || 'test@razorpay'}&pn=${encodeURIComponent(customerName || 'Merchant')}&am=${amount}`,
      default: qrData
    };
    
    // Save to Firebase
    const paymentRef = db.ref('payments').push();
    await paymentRef.set({
      orderId: order.id,
      amount: amount,
      currency: 'INR',
      upiId: upiId,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      description: description,
      status: 'created',
      razorpayOrderId: order.id,
      qrCode: qrData,
      createdAt: new Date().toISOString(),
      userId: req.body.userId || 'web_user'
    });
    
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
    console.error('Payment creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payment'
    });
  }
});

// 2. GET UPI APPS LINKS
app.get('/api/upi-apps/:upiId', (req, res) => {
  try {
    const { upiId } = req.params;
    const { amount = 100, name = 'Merchant' } = req.query;
    
    if (!upiId || !upiId.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid UPI ID format. Use: yourname@bank'
      });
    }
    
    const qrData = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;
    
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
      }
    };
    
    res.json({
      success: true,
      upiId: upiId,
      amount: amount,
      merchantName: name,
      qrCode: qrData,
      apps: apps,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 3. SAVE UPI ID
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

// 4. PAYU PAYMENT
app.post('/api/payu-payment', async (req, res) => {
  try {
    const { amount, productInfo, firstName, email, phone } = req.body;
    
    // Generate hash for PayU
    const hashString = `${payuConfig.merchantKey}|${Math.random().toString(36).substr(2, 9)}|${amount}|${productInfo}|${firstName}|${email}|||||||||||${payuConfig.merchantSalt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');
    
    // Save to Firebase
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

// 5. RAZORPAY WEBHOOK
app.post('/api/webhook/razorpay', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body.toString();
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    if (signature === expectedSignature) {
      const event = JSON.parse(body);
      console.log('Webhook received:', event.event);
      
      // Process payment event
      if (event.event === 'payment.captured') {
        const payment = event.payload.payment.entity;
        
        // Update Firebase
        db.ref('payments').orderByChild('razorpayOrderId')
          .equalTo(payment.order_id)
          .once('value')
          .then(snapshot => {
            if (snapshot.exists()) {
              const paymentKey = Object.keys(snapshot.val())[0];
              db.ref(`payments/${paymentKey}`).update({
                status: 'success',
                paymentId: payment.id,
                method: payment.method,
                upiVpa: payment.vpa || null,
                captured: true,
                webhookReceived: true,
                updatedAt: new Date().toISOString()
              });
              console.log(`✅ Payment ${payment.id} updated in Firebase`);
            }
          });
      }
      
      res.json({ status: 'ok' });
    } else {
      console.error('Invalid webhook signature');
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. GET USER STATS
app.get('/api/user/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const paymentsRef = db.ref('payments');
    const snapshot = await paymentsRef
      .orderByChild('userId')
      .equalTo(userId)
      .once('value');
    
    let totalAmount = 0;
    let successCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    
    if (snapshot.exists()) {
      const payments = snapshot.val();
      Object.values(payments).forEach(payment => {
        totalAmount += payment.amount || 0;
        if (payment.status === 'success') successCount++;
        else if (payment.status === 'pending') pendingCount++;
        else if (payment.status === 'failed') failedCount++;
      });
    }
    
    res.json({
      success: true,
      stats: {
        totalEarnings: totalAmount,
        successfulPayments: successCount,
        pendingPayments: pendingCount,
        failedPayments: failedCount,
        totalTransactions: successCount + pendingCount + failedCount
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. GET USER TRANSACTIONS
app.get('/api/user/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const transactionsRef = db.ref('payments');
    const snapshot = await transactionsRef
      .orderByChild('userId')
      .equalTo(userId)
      .once('value');
    
    let transactions = [];
    if (snapshot.exists()) {
      transactions = Object.entries(snapshot.val()).map(([key, value]) => ({
        id: key,
        ...value
      }));
      
      // Sort by date (newest first)
      transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Apply pagination
      transactions = transactions.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    }
    
    res.json({
      success: true,
      transactions: transactions,
      count: transactions.length,
      total: snapshot.exists() ? Object.keys(snapshot.val()).length : 0
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 🚀 START SERVER
// ============================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
    🚀 Payment Gateway Server Started!
    📍 Port: ${PORT}
    🌐 URL: http://localhost:${PORT}
    🔗 Render URL: https://paymxraaz.onrender.com
    
    📊 Available Pages:
    👉 Dashboard: http://localhost:${PORT}/
    👉 Create Payment: http://localhost:${PORT}/create-payment
    👉 UPI Links: http://localhost:${PORT}/upi-links
    👉 Transactions: http://localhost:${PORT}/transactions
    👉 Profile: http://localhost:${PORT}/profile
    👉 API Docs: http://localhost:${PORT}/api-docs
    👉 Health: http://localhost:${PORT}/health
    
    🔧 API Endpoints:
    👉 POST /api/create-payment
    👉 GET /api/upi-apps/:upiId
    👉 POST /api/save-upi
    👉 POST /api/webhook/razorpay
    
    ✅ Server is ready to accept payments!
  `);
});