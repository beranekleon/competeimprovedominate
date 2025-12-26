const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const app = express();

/**
 * Middleware zur Verarbeitung von JSON-formatierten Request-Bodys.
 * Middleware for parsing JSON-formatted request bodies.
 */
app.use(express.json());

/**
 * Initialisierung des Firebase Admin SDKs.
 * Initialization of the Firebase Admin SDK.
 */
if (!admin.apps.length) {
    admin.initializeApp();
}

/**
 * Initialisierung der Firestore-Instanz mit der spezifischen Datenbank-ID.
 * Initialization of the Firestore instance with the specific database ID.
 */
const db = admin.firestore("cid-development-database");

/**
 * Endpunkt zur Überprüfung des Systemstatus.
 * Endpoint for checking the system status.
 */
app.get('/status', (req, res) => {
    res.json({ nachricht: "Backend ist online und erreichbar!" });
});

/**
 * REST-Endpunkt für die Benutzerregistrierung.
 * Erstellt ein neues Benutzerdokument in der Collection 'users'.
 * REST endpoint for user registration.
 * Creates a new user document in the 'users' collection.
 */
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        /**
         * Validierung der erforderlichen Eingabeparameter.
         * Validation of required input parameters.
         */
        if (!email || !password) {
            return res.status(400).json({ fehler: "Email und Passwort erforderlich." });
        }

        /**
         * Erzeugung eines Passwort-Hashes mittels bcrypt (Salt-Rounds: 10).
         * Generation of a password hash using bcrypt (salt rounds: 10).
         */
        const hashedPassword = await bcrypt.hash(password, 10);

        /**
         * Referenzierung des Benutzerdokuments unter Verwendung der E-Mail als Dokument-ID.
         * Referencing the user document using the email as the document ID.
         */
        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (doc.exists) {
            return res.status(400).json({ fehler: "Benutzer existiert bereits." });
        }

        /**
         * Persistierung des Benutzerdatensatzes in Firestore.
         * Persisting the user record in Firestore.
         */
        await userRef.set({
            email: email,
            password: hashedPassword,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ nachricht: "Benutzer erfolgreich registriert." });
    } catch (error) {
        /**
         * Fehlerbehandlung und Ausgabe detaillierter Server-Logs.
         * Error handling and output of detailed server logs.
         */
        console.error("Firestore Schreibfehler | Firestore Write Error:", error);
        res.status(500).json({ fehler: `Interner Serverfehler: ${error.message}` });
    }
});

/**
 * Konfiguration des Server-Ports.
 * Server port configuration.
 */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT} | Server running on port ${PORT}`);
});