const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const { getFirestore } = require('firebase-admin/firestore'); // Import für benannte Datenbanken | Import for named databases

const app = express();

/**
 * Middleware zur Verarbeitung von JSON-Bodys.
 * Middleware for parsing JSON bodies.
 */
app.use(express.json());

/**
 * Initialisierung des Firebase Admin SDKs.
 * Initialization of the Firebase Admin SDK.
 */
try {
    if (!admin.apps.length) {
        admin.initializeApp();
    }
} catch (initError) {
    console.error("Initialisierungsfehler | Initialization Error:", initError);
}

/**
 * Zugriff auf eine benannte Firestore-Datenbankinstanz.
 * Accessing a named Firestore database instance.
 */
const db = getFirestore("cid-development-database");

/**
 * Standard-Endpunkt für den Integritätstest.
 * Standard endpoint for health checks.
 */
app.get('/status', (req, res) => {
    res.json({ nachricht: "Backend ist online und erreichbar!" });
});

/**
 * POST-Endpunkt zur Benutzerregistrierung.
 * POST endpoint for user registration.
 */
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ fehler: "Email und Passwort erforderlich." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (doc.exists) {
            return res.status(400).json({ fehler: "Benutzer existiert bereits." });
        }

        await userRef.set({
            email,
            password: hashedPassword,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ nachricht: "Benutzer erfolgreich registriert." });
    } catch (error) {
        console.error("Registrierungsfehler | Registration Error:", error);
        res.status(500).json({ fehler: "Interner Serverfehler." });
    }
});

/**
 * Starten des Servers auf dem von Cloud Run zugewiesenen Port.
 * Starting the server on the port assigned by Cloud Run.
 */
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server gestartet auf Port ${PORT} | Server started on port ${PORT}`);
});