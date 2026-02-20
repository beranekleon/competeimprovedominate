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
            userData: "",
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