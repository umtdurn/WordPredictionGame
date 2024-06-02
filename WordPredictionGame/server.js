const WebSocket = require('ws');
const admin = require('firebase-admin');
const serviceAccount = require('./config/keywordapp-ad572-firebase-adminsdk-qehg6-0888b38994.json');

// Firebase admin SDK'nızı başlatın
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://keywordapp-ad572-default-rtdb.firebaseio.com"
  });
  
// Firebase Realtime Database'i referans al
const db = admin.database();
const usersRef = db.ref('users');

// Web Socket sunucusunu başlat
const wss = new WebSocket.Server({ port: 8585 }, () => {
    console.log(`Server started on port ${wss.address().port}`);
});

    console.log('ws dewam');
  wss.on('error', (error) => {
    console.error('WebSocket Error:', error);
  });
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Firebase'deki kullanıcı değişikliklerini dinle
  usersRef.on('value', (snapshot) => {
    const users = snapshot.val();
    const activeUsers = Object.values(users).filter(user => user.isActive);
    ws.send(JSON.stringify(activeUsers)); // Aktif kullanıcıları istemciye gönder
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
console.log('ws bitti');


