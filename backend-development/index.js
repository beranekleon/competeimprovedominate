const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { getFirestore } = require('firebase-admin/firestore');

const app = express();
app.use(cors());           // Ermöglicht Cross-Origin-Requests von deiner App
app.use(express.json());   // Parst JSON-Bodies in Requests

// Firebase Admin nur einmal initialisieren
if (!admin.apps.length) {
    admin.initializeApp();
    // Falls du später Credentials brauchst → hier einfügen:
    // admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = getFirestore("cid-development-database");

// ────────────────────────────────────────────────
// Endpunkte
// ────────────────────────────────────────────────

app.get('/status', (req, res) => {
    res.json({ nachricht: "Backend ist online! Hallo Welt!" });
});

app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ fehler: "Daten unvollständig (E-Mail oder Passwort fehlt)." });
        }

        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (doc.exists) {
            return res.status(400).json({ fehler: "Benutzer existiert bereits." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await userRef.set({
            email,
            password: hashedPassword,
            userData: {
                workouts: [],
                progress: {},
                lastSync: null
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ nachricht: "Registrierung erfolgreich. Willkommen in der Fitness-App!" });
    } catch (error) {
        res.status(500).json({ fehler: `Fehler bei der Registrierung: ${error.message}` });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ fehler: "E-Mail oder Passwort fehlt." });
        }

        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(401).json({ fehler: "Benutzer nicht gefunden." });
        }

        const user = doc.data();
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ fehler: "Ungültiges Passwort." });
        }

        res.status(200).json({
            nachricht: "Login erfolgreich.",
            user: {
                email: user.email,
                userData: user.userData || { workouts: [], progress: {} }
            }
        });
    } catch (error) {
        res.status(500).json({ fehler: `Interner Serverfehler: ${error.message}` });
    }
});

app.post('/save-data', async (req, res) => {
    try {
        const { email, userData } = req.body;
        if (!email) {
            return res.status(400).json({ fehler: "E-Mail fehlt." });
        }

        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).json({ fehler: "Benutzer nicht gefunden." });
        }

        await userRef.update({
            userData: userData ?? { workouts: [], progress: {} },
            lastUpdate: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ nachricht: "Tracking-Daten erfolgreich synchronisiert." });
    } catch (error) {
        res.status(500).json({ fehler: `Fehler beim Speichern der Daten: ${error.message}` });
    }
});

app.post('/delete-user', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ fehler: "Daten unvollständig." });
        }

        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).json({ fehler: "Benutzer nicht gefunden." });
        }

        const user = doc.data();
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ fehler: "Ungültiges Passwort." });
        }

        await userRef.delete();
        res.status(200).json({ nachricht: "Benutzerkonto erfolgreich gelöscht." });
    } catch (error) {
        res.status(500).json({ fehler: `Fehler beim Löschen: ${error.message}` });
    }
});

// ────────────────────────────────────────────────
// Google-Login-Skizze (noch nicht vollständig implementiert)
// ────────────────────────────────────────────────

app.post('/google-login', async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ fehler: "idToken fehlt." });
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const email = decodedToken.email;

        // Hier könntest du nun den Firestore-Eintrag suchen/erstelle/synchronisieren
        // z. B. wie bei /register oder /save-data ...

        res.status(200).json({
            nachricht: "Google-Login erfolgreich",
            email,
            // userData: ... ggf. aus Firestore laden
        });
    } catch (error) {
        res.status(401).json({ fehler: `Ungültiger Token: ${error.message}` });
    }
});

// ────────────────────────────────────────────────
// Server starten
// ────────────────────────────────────────────────

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server läuft auf Port ${PORT}`);
});