const bcrypt = require('bcrypt');
const { admin, db } = require('../config/firebase');
const { normalizeEmail, hashToken } = require('../utils/helpers');

// (Optional) Email Service Logik hierhin oder in eigenen Service
const sendResetCode = async (email, code) => {
    // ... deine bestehende nodemailer Logik ...
    console.log(`[DEV] Passwort-Reset Code für ${email}: ${code}`);
};

exports.register = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { password, phone } = req.body; // neu: phone

        if (!email || !password) return res.status(400).json({ fehler: "E-Mail oder Passwort fehlt" });

        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();
        if (doc.exists) return res.status(400).json({ fehler: "Benutzer existiert bereits." });

        const hashedPassword = await bcrypt.hash(password, 10);

        await userRef.set({
            email,
            password: hashedPassword,
            phone: phone || null, // neu: Telefonnummer speichern (optional)
            userData: { workouts: [], progress: {}, lastSync: null },
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ nachricht: "Registrierung erfolgreich." });
    } catch (error) {
        res.status(500).json({ fehler: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { password } = req.body;
        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (!doc.exists) return res.status(401).json({ fehler: "Benutzer nicht gefunden." });
        const user = doc.data();
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ fehler: "Ungültiges Passwort." });

        res.status(200).json({
            nachricht: "Login erfolgreich.",
            user: { email: user.email, userData: user.userData || { workouts: [], progress: {} } }
        });
    } catch (error) {
        res.status(500).json({ fehler: error.message });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const userRef = db.collection('users').doc(uid);
        
        await userRef.set({
            uid,
            email: decodedToken.email || null,
            providers: ['google'],
            lastLogin: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        res.status(200).json({ nachricht: "Google-Login erfolgreich", uid });
    } catch (error) {
        res.status(401).json({ fehler: "Ungültiger Google-Token" });
    }
};
exports.loginPhone = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) return res.status(400).json({ fehler: "Telefonnummer fehlt" });

        const normalizedPhone = phone.trim();

        // Suche User nach Telefonnummer
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('phone', '==', normalizedPhone).limit(1).get();

        if (snapshot.empty) {
            return res.status(401).json({ fehler: "Kein Benutzer mit dieser Nummer gefunden" });
        }

        const userDoc = snapshot.docs[0];
        const user = userDoc.data();

        res.status(200).json({
            nachricht: "Login erfolgreich",
            user: {
                email: user.email,
                userData: user.userData || { workouts: [], progress: {} }
            }
        });
    } catch (error) {
        res.status(500).json({ fehler: error.message });
    }
};
exports.requestPhoneCode = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ fehler: "Telefonnummer fehlt" });

        const normalizedPhone = phone.trim();

        // Suche User nach Telefonnummer
        const snapshot = await db.collection('users').where('phone', '==', normalizedPhone).limit(1).get();

        if (snapshot.empty) {
            return res.status(404).json({ fehler: "Nummer nicht gefunden" });
        }

        const userDoc = snapshot.docs[0];
        const user = userDoc.data();

        // Generiere Dummy-Code (fest oder random)
        const code = "123456"; // Oder: Math.floor(100000 + Math.random() * 900000).toString();

        // Temporär speichern (z. B. 5 Min Ablauf)
        await db.collection('phoneCodes').doc(normalizedPhone).set({
            code,
            userEmail: user.email,
            expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // In echt: SMS senden – hier nur Log
        console.log(`Dummy-Code für ${normalizedPhone}: ${code}`);

        res.status(200).json({ nachricht: "Code gesendet (Dummy: 123456)" });
    } catch (error) {
        res.status(500).json({ fehler: error.message });
    }
};

exports.verifyPhoneCode = async (req, res) => {
    try {
        const { phone, code } = req.body;
        if (!phone || !code) return res.status(400).json({ fehler: "Daten fehlen" });

        const normalizedPhone = phone.trim();

        const codeRef = db.collection('phoneCodes').doc(normalizedPhone);
        const codeDoc = await codeRef.get();

        if (!codeDoc.exists) {
            return res.status(400).json({ fehler: "Kein Code angefordert oder abgelaufen" });
        }

        const stored = codeDoc.data();

        if (stored.expiresAt.toDate() < new Date()) {
            await codeRef.delete();
            return res.status(400).json({ fehler: "Code abgelaufen" });
        }

        if (stored.code !== code.trim()) {
            return res.status(400).json({ fehler: "Ungültiger Code" });
        }

        // Code gültig → User-Daten holen
        const userSnapshot = await db.collection('users').where('phone', '==', normalizedPhone).limit(1).get();
        if (userSnapshot.empty) {
            return res.status(404).json({ fehler: "User nicht gefunden" });
        }

        const user = userSnapshot.docs[0].data();

        // Cleanup
        await codeRef.delete();

        res.status(200).json({
            nachricht: "Login erfolgreich",
            user: {
                email: user.email,
                userData: user.userData || { workouts: [], progress: {} }
            }
        });
    } catch (error) {
        res.status(500).json({ fehler: error.message });
    }
};