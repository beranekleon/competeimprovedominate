const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = getFirestore("cid-development-database");

module.exports = { admin, db };