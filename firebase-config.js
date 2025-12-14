// आपके Firebase प्रोजेक्ट की कॉन्फ़िगरेशन (आपके दिए गए विवरण से)
const firebaseConfig = {
  apiKey: "AIzaSyDn6V7p5zfY1P4Y7KXGaTvfZkivuYbhhjg",
  authDomain: "raaz-cf574.firebaseapp.com",
  databaseURL: "https://raaz-cf574-default-rtdb.firebaseio.com",
  projectId: "raaz-cf574",
  storageBucket: "raaz-cf574.firebasestorage.app",
  messagingSenderId: "752137866532",
  appId: "1:752137866532:android:bca4edd1ba14605a3a37b1"
};

// यूजर की UPI ID सेव करने के लिए फ़ंक्शन
async function saveUserUpi(userId, upiId, appName) {
  try {
    const response = await fetch('https://paymxraaz.onrender.com/api/save-upi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, upiId, appName })
    });
    return await response.json();
  } catch (error) {
    console.error("Error saving UPI:", error);
  }
}

// UPI लिंक जनरेट करने के लिए
async function generateUpiLinks(upiId, amount, name) {
  try {
    const response = await fetch(`https://paymxraaz.onrender.com/api/generate-upi-links?upiId=${upiId}&amount=${amount}&name=${encodeURIComponent(name)}`);
    return await response.json();
  } catch (error) {
    console.error("Error generating links:", error);
  }
}