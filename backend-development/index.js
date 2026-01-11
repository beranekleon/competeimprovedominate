const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { getFirestore } = require('firebase-admin/firestore');

const app = express();
app.use(cors());
app.use(express.json());

if (!admin.apps.length) {
    admin.initializeApp();
}

/**
 * Zugriff auf die spezifische Firestore-Datenbankinstanz.
 * Accessing the specific Firestore database instance.
 */
const db = getFirestore("cid-development-database");

app.get('/status', (req, res) => {
    res.json({ nachricht: "Backend ist online! Hallo Welt!" });
});

/**
 * Registrierung eines neuen Benutzers.
 * Registration of a new user.
 */
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ fehler: "Daten unvollständig." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (doc.exists) return res.status(400).json({ fehler: "Benutzer existiert bereits." });

        await userRef.set({
            email,
            password: hashedPassword,
            userData: "", // Initial leerer Datensatz | Initially empty data record
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ nachricht: "Registrierung erfolgreich." });
    } catch (error) {
        res.status(500).json({ fehler: error.message });
    }
});

/**
 * Login-Endpunkt: Sendet jetzt auch vorhandene 'userData' zurück.
 * Login endpoint: Now also returns existing 'userData'.
 */
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (!doc.exists) return res.status(401).json({ fehler: "Benutzer nicht gefunden." });

        const user = doc.data();
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(401).json({ fehler: "Ungültiges Passwort." });

        /**
         * Erfolg: Sende E-Mail und die gespeicherten Daten an die App.
         * Success: Send email and stored data to the app.
         */
        res.status(200).json({ 
            nachricht: "Login erfolgreich.",
            user: { 
                email: user.email,
                userData: user.userData || "" // Rückgabe der Profildaten | Returning profile data
            }
        });
    } catch (error) {
        res.status(500).json({ fehler: "Interner Serverfehler." });
    }
});

/**
 * Speichern der Benutzerdaten.
 * Saving user data.
 */
app.post('/save-data', async (req, res) => {
    try {
        const { email, userData } = req.body;
        const userRef = db.collection('users').doc(email);
        
        await userRef.update({
            userData: userData,
            lastUpdate: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ nachricht: "Daten synchronisiert." });
    } catch (error) {
        res.status(500).json({ fehler: "Fehler beim Speichern." });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server läuft auf Port ${PORT}`);
});