const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

let serviceAccount;

// PRÜFUNG: Sind wir in der Cloud oder Lokal?
if (process.env.FIREBASE_CONFIG) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
        console.log("☁️ Firebase Config erfolgreich geladen.");
    } catch (err) {
        console.error("❌ FEHLER beim Parsen von FIREBASE_CONFIG:", err.message);
        // Falls das Parsen fehlschlägt, versuchen wir es trotzdem lokal (Backup)
        const serviceAccountPath = path.join(__dirname, '..', '..', 'secrets', 'firebase-service-account.json');
        serviceAccount = require(serviceAccountPath);
    }
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

// Deine CID-Datenbank
const db = getFirestore("cid-development-database");

console.log("✅ Firebase-Admin erfolgreich verbunden!");

module.exports = { admin, db };