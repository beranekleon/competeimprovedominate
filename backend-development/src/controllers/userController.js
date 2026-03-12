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

exports.addFriend = async (req, res) => {
    try {
        const myEmail = normalizeEmail(req.body.email);
        const friendEmail = normalizeEmail(req.body.friendEmail);

        if (myEmail === friendEmail) {
            return res.status(400).json({ fehler: "Du kannst dich nicht selbst hinzufügen." });
        }

        // 1. Prüfen, ob der aktuelle Benutzer existiert
        const mySnap = await db.collection('users').doc(myEmail).get();
        if (!mySnap.exists) {
            return res.status(404).json({ fehler: "Benutzer nicht gefunden." });
        }

        // 2. Prüfen, ob der Freund überhaupt existiert
        const friendSnap = await db.collection('users').doc(friendEmail).get();
        if (!friendSnap.exists) {
            return res.status(404).json({ fehler: "Benutzer existiert nicht." });
        }

        // 2. In der Sub-Collection 'friends' speichern
        // Wir nutzen die Email des Freundes als Dokument-ID, um Duplikate zu vermeiden
        const friendRef = db.collection('users').doc(myEmail).collection('friends').doc(friendEmail);
        
        await friendRef.set({
            email: friendEmail,
            displayName: friendSnap.data().userData?.displayName || "Unbekannter Sportler",
            addedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "accepted" // Oder "pending", falls du ein Anfragesystem willst
        });

        res.status(200).json({ nachricht: "Freund erfolgreich hinzugefügt." });
    } catch (error) {
        res.status(500).json({ fehler: error.message });
    }
};

exports.getFriends = async (req, res) => {
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

        const friendsSnap = await userRef.collection('friends').get();
        const friends = friendsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        res.status(200).json({ friends });
    } catch (error) {
        res.status(500).json({ fehler: error.message });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();

        const leaderboard = snapshot.docs.map((doc, index) => {
            const data = doc.data();
            const sessions = Array.isArray(data.sessions) ? data.sessions : [];

            const allLocations = sessions.flatMap((session) =>
                Array.isArray(session.locations) ? session.locations : []
            );

            const uniquePoints = new Set(
                allLocations
                    .filter(
                        (loc) =>
                            loc &&
                            typeof loc.latitude === 'number' &&
                            typeof loc.longitude === 'number'
                    )
                    .map(
                        (loc) =>
                            `${loc.latitude.toFixed(5)}-${loc.longitude.toFixed(5)}`
                    )
            );

            const score = uniquePoints.size;

            return {
                id: doc.id || index + 1,
                name:
                    data.userData?.displayName ||
                    data.username ||
                    data.name ||
                    data.displayName ||
                    doc.id,
                score,
                avatar:
                    data.userData?.avatar ||
                    data.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            };
        });

        leaderboard.sort((a, b) => b.score - a.score);

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error("Leaderboard Fehler:", error);
        res.status(500).json({ fehler: error.message });
    }
};