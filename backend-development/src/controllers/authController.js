// src/controllers/authController.js

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { admin, db } = require('../config/firebase');
const { normalizeEmail, hashToken } = require('../utils/helpers');

// DEV mail fallback (später: nodemailer / echten mail service)
const sendMailDev = async (email, content) => {
  console.log(`[DEV] Mail an ${email}:`);
  console.log(content);
};

exports.register = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ fehler: "E-Mail oder Passwort fehlt" });
    }

    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();
    if (doc.exists) {
      return res.status(400).json({ fehler: "Benutzer existiert bereits." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = hashToken(verificationToken);

    await userRef.set({
      email,
      password: hashedPassword,
      phone: phone || null,

      emailVerified: false,
      emailVerificationToken: verificationTokenHash,
      emailVerificationExpiresAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
      ),

      userData: { workouts: [], progress: {}, lastSync: null, notes: "" },

      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // ✅ verify link (DEV)
    const baseUrl = process.env.BACKEND_PUBLIC_URL || "http://localhost:8080";
    const verifyLink = `${baseUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    await sendMailDev(email, `Bitte bestätige deine E-Mail:\n${verifyLink}`);

    return res.status(201).json({
      nachricht: "Registrierung erfolgreich. Bitte bestätige deine E-Mail.",
    });
  } catch (error) {
    return res.status(500).json({ fehler: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const email = normalizeEmail(req.query.email);
    const token = String(req.query.token || '').trim();

    if (!email || !token) {
      return res.status(400).send("Ungültiger Link.");
    }

    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(400).send("Benutzer nicht gefunden.");
    }

    const user = doc.data();

    if (user.emailVerified) {
      return res.send("E-Mail ist bereits bestätigt.");
    }

    const expiresAt = user.emailVerificationExpiresAt;
    if (!user.emailVerificationToken || !expiresAt || expiresAt.toDate() < new Date()) {
      return res.status(400).send("Token ungültig oder abgelaufen.");
    }

    const incomingHash = hashToken(token);
    if (incomingHash !== user.emailVerificationToken) {
      return res.status(400).send("Token ungültig oder abgelaufen.");
    }

    await userRef.update({
      emailVerified: true,
      emailVerificationToken: admin.firestore.FieldValue.delete(),
      emailVerificationExpiresAt: admin.firestore.FieldValue.delete(),
      emailVerifiedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.send("E-Mail erfolgreich bestätigt! Du kannst dich jetzt einloggen.");
  } catch (err) {
    return res.status(500).send("Fehler bei der Verifizierung.");
  }
};

exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ fehler: "E-Mail oder Passwort fehlt." });
    }

    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(401).json({ fehler: "Benutzer nicht gefunden." });
    }

    const user = doc.data();

    // ✅ block if email not verified
    if (user.emailVerified === false) {
      return res.status(403).json({ fehler: "Bitte bestätige zuerst deine E-Mail." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ fehler: "Ungültiges Passwort." });
    }

    return res.status(200).json({
      nachricht: "Login erfolgreich.",
      user: {
        email: user.email,
        userData: user.userData || { workouts: [], progress: {}, lastSync: null, notes: "" }
      }
    });
  } catch (error) {
    return res.status(500).json({ fehler: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ fehler: "idToken fehlt" });

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const email = normalizeEmail(decodedToken.email);

    if (!email) return res.status(400).json({ fehler: "Google-Token enthält keine E-Mail" });

    // ✅ use email as doc id (kompatibel mit save-data/delete/reset)
    const userRef = db.collection('users').doc(email);

    await userRef.set({
      uid: decodedToken.uid,
      email,
      providers: ['google'],
      emailVerified: true, // Google hat i.d.R. verifizierte Mail
      userData: { workouts: [], progress: {}, lastSync: null, notes: "" },
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return res.status(200).json({
      nachricht: "Google-Login erfolgreich",
      user: { email, userData: { workouts: [], progress: {}, lastSync: null, notes: "" } }
    });
  } catch (error) {
    return res.status(401).json({ fehler: "Ungültiger Google-Token", details: error.message });
  }
};

exports.requestPhoneCode = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ fehler: "Telefonnummer fehlt" });

    const normalizedPhone = phone.trim();

    const snapshot = await db.collection('users')
      .where('phone', '==', normalizedPhone)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ fehler: "Nummer nicht gefunden" });
    }

    const code = process.env.NODE_ENV === "production"
      ? String(Math.floor(100000 + Math.random() * 900000))
      : "123456";

    await db.collection('phoneCodes').doc(normalizedPhone).set({
      code,
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Dummy-Code für ${normalizedPhone}: ${code}`);
    return res.status(200).json({ nachricht: `Code gesendet (DEV: ${code})` });
  } catch (error) {
    return res.status(500).json({ fehler: error.message });
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

    const userSnapshot = await db.collection('users')
      .where('phone', '==', normalizedPhone)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      await codeRef.delete();
      return res.status(404).json({ fehler: "User nicht gefunden" });
    }

    const user = userSnapshot.docs[0].data();
    await codeRef.delete();

    return res.status(200).json({
      nachricht: "Login erfolgreich",
      user: {
        email: user.email,
        userData: user.userData || { workouts: [], progress: {}, lastSync: null, notes: "" }
      }
    });
  } catch (error) {
    return res.status(500).json({ fehler: error.message });
  }
};