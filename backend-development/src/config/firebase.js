const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

// Der Pfad zu deinem Ordner 'secrets' und deiner neuen Datei
// Wir gehen von 'src/config' zwei Ebenen hoch (../..) in den Hauptordner
const serviceAccountPath = path.join(__dirname, '..', '..', 'secrets', 'firebase-service-account.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

// Verbindung zu deiner spezifischen CID-Datenbank
const db = getFirestore("cid-development-database");

console.log("✅ Firebase-Admin erfolgreich mit lokalem Key verbunden!");

module.exports = { admin, db };