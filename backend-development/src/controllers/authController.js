const bcrypt = require('bcrypt');
const { admin, db } = require('../config/firebase');
const { normalizeEmail, hashToken } = require('../utils/helpers');
const twilio = require('twilio');

// Twilio-Client initialisieren (nur einmal)
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// (Optional) Email Service Logik hierhin oder in eigenen Service
const sendResetCode = async (email, code) => {
    // ... deine bestehende nodemailer Logik ...
    console.log(`[DEV] Passwort-Reset Code für ${email}: ${code}`);
};

exports.register = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { password, phone } = req.body;
        if (!email || !password) return res.status(400).json({ fehler: "E-Mail oder Passwort fehlt" });

        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();
        if (doc.exists) return res.status(400).json({ fehler: "Benutzer existiert bereits." });

        const hashedPassword = await bcrypt.hash(password, 10);

        await userRef.set({
            email,
            password: hashedPassword,
            phone: phone || null,
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

// Twilio Verify – Code per SMS anfordern
exports.requestPhoneCode = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ fehler: "Telefonnummer fehlt" });

        const normalizedPhone = phone.trim();

        // Optional: Prüfe ob Nummer existiert
        const snapshot = await db.collection('users').where('phone', '==', normalizedPhone).limit(1).get();
        if (snapshot.empty) return res.status(404).json({ fehler: "Nummer nicht registriert" });

        // OTP per Twilio Verify senden – SMS
        const verification = await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verifications
            .create({
                to: normalizedPhone,
                channel: 'sms'
            });

        console.log(`SMS-OTP gesendet an ${normalizedPhone} - Status: ${verification.status}`);

        res.status(200).json({ nachricht: "Code per SMS gesendet" });
    } catch (error) {
        console.error("Twilio Verify Fehler:", error);
        res.status(500).json({ fehler: "Code konnte nicht gesendet werden" });
    }
};

// Twilio Verify – Code prüfen & Login
exports.verifyPhoneCode = async (req, res) => {
    try {
        const { phone, code } = req.body;
        if (!phone || !code) return res.status(400).json({ fehler: "Daten fehlen" });

        const normalizedPhone = phone.trim();

        const check = await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verificationChecks
            .create({
                to: normalizedPhone,
                code: code.trim()
            });

        if (check.status !== 'approved') {
            return res.status(400).json({ fehler: "Ungültiger oder abgelaufener Code" });
        }

        // Login erfolgreich – User-Daten holen
        const userSnapshot = await db.collection('users').where('phone', '==', normalizedPhone).limit(1).get();
        if (userSnapshot.empty) return res.status(404).json({ fehler: "User nicht gefunden" });

        const user = userSnapshot.docs[0].data();

        res.status(200).json({
            nachricht: "Login erfolgreich",
            user: {
                email: user.email,
                userData: user.userData || { workouts: [], progress: {} }
            }
        });
    } catch (error) {
        console.error("Verify Check Fehler:", error);
        res.status(500).json({ fehler: error.message });
    }
};

// Passwort ändern (für eingeloggte User – prüft aktuelles Passwort)
exports.changePassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({ fehler: "Alle Felder erforderlich" });
        }

        const normalizedEmail = normalizeEmail(email);
        const userRef = db.collection('users').doc(normalizedEmail);
        const doc = await userRef.get();

        if (!doc.exists) return res.status(404).json({ fehler: "Benutzer nicht gefunden" });

        const user = doc.data();

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(401).json({ fehler: "Aktuelles Passwort falsch" });

        if (newPassword.length < 6) return res.status(400).json({ fehler: "Neues Passwort muss mindestens 6 Zeichen lang sein" });

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await userRef.update({
            password: hashedNewPassword,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ nachricht: "Passwort erfolgreich geändert" });
    } catch (error) {
        console.error("Change Password Fehler:", error);
        res.status(500).json({ fehler: "Interner Fehler" });
    }
};