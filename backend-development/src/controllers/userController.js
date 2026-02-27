const bcrypt = require('bcrypt');
const { admin, db } = require('../config/firebase');
const { normalizeEmail } = require('../utils/helpers');

exports.saveData = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { userData } = req.body;
        const userRef = db.collection('users').doc(email);
        
        await userRef.update({
            userData: userData ?? "",
            lastUpdate: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(200).json({ nachricht: "Daten synchronisiert." });
    } catch (error) {
        res.status(500).json({ fehler: error.message });
    }
};

exports.saveSession = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { session } = req.body;

        if (!email) {
            return res.status(400).json({ fehler: "E-Mail fehlt." });
        }

        if (!session || !session.startedAt || !session.stoppedAt || typeof session.durationMs !== 'number') {
            return res.status(400).json({ fehler: "Ungültige Session-Daten." });
        }

        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).json({ fehler: "Benutzer nicht gefunden." });
        }

        await userRef.update({
            sessions: admin.firestore.FieldValue.arrayUnion({
                startedAt: session.startedAt,
                stoppedAt: session.stoppedAt,
                durationMs: session.durationMs,
                durationSeconds: session.durationSeconds ?? Math.floor(session.durationMs / 1000),
                savedAt: admin.firestore.FieldValue.serverTimestamp(),
            }),
            lastUpdate: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ nachricht: "Session gespeichert." });
    } catch (error) {
        res.status(500).json({ fehler: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { password } = req.body;
        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (!doc.exists) return res.status(404).json({ fehler: "Nicht gefunden." });
        const isMatch = await bcrypt.compare(password, doc.data().password);
        if (!isMatch) return res.status(401).json({ fehler: "Ungültiges Passwort." });

        await userRef.delete();
        res.status(200).json({ nachricht: "Konto gelöscht." });
    } catch (error) {
        res.status(500).json({ fehler: error.message });
    }
};