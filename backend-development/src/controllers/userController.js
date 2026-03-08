const bcrypt = require('bcrypt');
const { admin, db } = require('../config/firebase');
const { normalizeEmail } = require('../utils/helpers');

const sanitizeAndDedupeLocations = (rawLocations) => {
    const points = Array.isArray(rawLocations) ? rawLocations : [];
    const dedupe = new Set();

    return points
        .filter((point) => point && typeof point.latitude === 'number' && typeof point.longitude === 'number')
        .map((point) => ({
            latitude: point.latitude,
            longitude: point.longitude,
            accuracy: typeof point.accuracy === 'number' ? point.accuracy : null,
            speed: typeof point.speed === 'number' ? point.speed : null,
            heading: typeof point.heading === 'number' ? point.heading : null,
            timestamp: point.timestamp || new Date().toISOString(),
        }))
        .filter((point) => {
            // Round to reduce floating noise while preserving enough precision for gameplay.
            const key = `${point.latitude.toFixed(6)}:${point.longitude.toFixed(6)}`;
            if (dedupe.has(key)) {
                return false;
            }

            dedupe.add(key);
            return true;
        });
};

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

        const locations = sanitizeAndDedupeLocations(session.locations);

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
                locations,
                savedAt: admin.firestore.Timestamp.now(),
            }),
            lastUpdate: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ nachricht: "Session gespeichert." });
    } catch (error) {
        res.status(500).json({ fehler: error.message });
    }
};

exports.getSessions = async (req, res) => {
    try {
        const email = normalizeEmail(req.query.email || req.body?.email);

        if (!email) {
            return res.status(400).json({ fehler: "E-Mail fehlt." });
        }

        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).json({ fehler: "Benutzer nicht gefunden." });
        }

        const sessions = Array.isArray(doc.data().sessions) ? doc.data().sessions : [];
        const sanitizedSessions = sessions.map((session) => ({
            startedAt: session.startedAt || null,
            stoppedAt: session.stoppedAt || null,
            durationMs: typeof session.durationMs === 'number' ? session.durationMs : 0,
            durationSeconds: typeof session.durationSeconds === 'number' ? session.durationSeconds : 0,
            savedAt: session.savedAt || null,
            locations: sanitizeAndDedupeLocations(session.locations),
        }));

        res.status(200).json({ sessions: sanitizedSessions });
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