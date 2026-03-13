const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

// Der Pfad zu deinem Ordner 'secrets' und deiner neuen Datei
// Wir gehen von 'src/config' zwei Ebenen hoch (../..) in den Hauptordner
const serviceAccountPath = path.join(__dirname, '..', '..', 'secrets', 'firebase-service-account.json');
const serviceAccount = require(serviceAccountPath);

// 1. Check: Sind wir in der Cloud?
if (process.env.FIREBASE_CONFIG) {
    // Wenn ja, nutzen wir den Text aus der Umgebungsvariable
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
} else {
    // Wenn nein (lokal), laden wir die Datei
    const path = require('path');
    const serviceAccountPath = path.join(__dirname, '..', '..', 'secrets', 'firebase-service-account.json');
    serviceAccount = require(serviceAccountPath);
}

if (!admin.apps.length) {
    admin.initializeApp();
}

// Verbindung zu deiner spezifischen CID-Datenbank
const db = getFirestore("cid-development-database");

console.log("✅ Firebase-Admin erfolgreich mit lokalem Key verbunden!");

module.exports = { admin, db };