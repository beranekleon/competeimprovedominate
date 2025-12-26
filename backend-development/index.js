const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const app = express();

/**
 * Middleware zur Verarbeitung von JSON-Daten im Request-Body.
 * Middleware for parsing JSON data in the request body.
 */
app.use(express.json());

/**
 * Initialisierung des Firebase Admin SDKs.
 * Initialization of the Firebase Admin SDK.
 */
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

/**
 * Bestehender Status-Endpunkt für den Verbindungstest.
 * Existing status endpoint for the connection test.
 */
app.get('/status', (req, res) => {
    res.json({ nachricht: "Backend ist online und erreichbar!" });
});

/**
 * Endpunkt für die Benutzerregistrierung (POST /register).
 * Endpoint for user registration (POST /register).
 */
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ fehler: "Email und Passwort erforderlich." });
        }

        // Passwort-Hashing vor dem Speichern | Password hashing before storage
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
        console.error("Registrierungsfehler | Registration error:", error);
        res.status(500).json({ fehler: "Interner Serverfehler." });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT} | Server running on port ${PORT}`);
});