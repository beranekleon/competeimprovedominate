const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

let serviceAccount;

// PRÜFUNG: Sind wir in der Cloud oder Lokal?
if (process.env.FIREBASE_CONFIG) {
    // CLOUD: Wir nutzen die Variable, die du gerade in der Console gespeichert hast
    console.log("☁️ Nutze Firebase-Konfiguration aus Umgebungsvariablen...");
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
} else {
    // LOKAL: Wir nutzen wie gewohnt deine Datei im secrets Ordner
    console.log("💻 Nutze lokalen Firebase-Key aus dem secrets-Ordner...");
    const serviceAccountPath = path.join(__dirname, '..', '..', 'secrets', 'firebase-service-account.json');
    serviceAccount = require(serviceAccountPath);
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