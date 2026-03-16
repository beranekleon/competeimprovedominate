const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

let serviceAccount;

if (process.env.FIREBASE_CONFIG) {
    // CLOUD: Er nimmt die Daten aus der Google Cloud Variable
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
} else {
    // LOKAL: Er nimmt die Datei von deinem Laptop
    const path = require('path');
    // Hier nutzen wir deinen Dateinamen: firebase-service-account.json
    const serviceAccountPath = path.join(__dirname, '..', '..', 'secrets', 'firebase-service-account.json');
    serviceAccount = require(serviceAccountPath);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

// Nutze hier den Namen deiner Datenbank oder lass es leer für (default)
const db = getFirestore("cid-development-database");

module.exports = { admin, db };