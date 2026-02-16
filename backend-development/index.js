const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const cors = require('cors');
const crypto = require('crypto');
const { getFirestore } = require('firebase-admin/firestore');

const app = express();
app.use(cors());
app.use(express.json());

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = getFirestore("cid-development-database");

let nodemailer = null;
try {
    nodemailer = require('nodemailer');
} catch (e) {}

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

async function sendResetCode(email, code) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (!nodemailer || !SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
        console.log(`[DEV] Passwort-Reset Code für ${email}: ${code}`);
        return;
    }

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
        from: SMTP_FROM,
        to: email,
        subject: 'Passwort zurücksetzen',
        text: `Dein Code zum Zurücksetzen lautet: ${code}\nGültig für 15 Minuten.`,
    });
}

app.get('/status', (req, res) => {
    res.json({ nachricht: "Backend ist online! Hallo Welt!" });
});

app.post('/register', async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { password } = req.body;

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

        res.status(201).json({ nachricht: "Registrierung erfolgreich." });
    } catch (error) {
        res.status(500).json({ fehler: `Fehler bei der Registrierung: ${error.message}` });
    }
});

app.post('/login', async (req, res) => {
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
        const email = normalizeEmail(req.body.email);
        const { userData } = req.body;

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

        res.status(200).json({ nachricht: "Daten erfolgreich synchronisiert." });
    } catch (error) {
        res.status(500).json({ fehler: `Fehler beim Speichern der Daten: ${error.message}` });
    }
});

app.post('/delete-user', async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { password } = req.body;

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

app.post('/request-password-reset', async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        if (!email) {
            return res.status(400).json({ fehler: "E-Mail fehlt." });
        }

        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(200).json({ nachricht: "Wenn das Konto existiert, wurde ein Code gesendet." });
        }

        const code = String(Math.floor(100000 + Math.random() * 900000));
        const codeHash = hashToken(code);
        const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 15 * 60 * 1000));

        await userRef.update({
            resetCodeHash: codeHash,
            resetCodeExpiresAt: expiresAt,
            resetRequestedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await sendResetCode(email, code);

        res.status(200).json({ nachricht: "Wenn das Konto existiert, wurde ein Code gesendet." });
    } catch (error) {
        res.status(500).json({ fehler: `Fehler beim Anfordern: ${error.message}` });
    }
});

app.post('/reset-password', async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ fehler: "Daten unvollständig." });
        }

        if (String(newPassword).length < 8) {
            return res.status(400).json({ fehler: "Passwort muss mindestens 8 Zeichen haben." });
        }

        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(400).json({ fehler: "Ungültiger Code oder abgelaufen." });
        }

        const user = doc.data();
        const expiresAt = user.resetCodeExpiresAt;

        if (!user.resetCodeHash || !expiresAt || expiresAt.toDate() < new Date()) {
            return res.status(400).json({ fehler: "Ungültiger Code oder abgelaufen." });
        }

        const incomingHash = hashToken(String(code).trim());
        if (incomingHash !== user.resetCodeHash) {
            return res.status(400).json({ fehler: "Ungültiger Code oder abgelaufen." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await userRef.update({
            password: hashedPassword,
            resetCodeHash: admin.firestore.FieldValue.delete(),
            resetCodeExpiresAt: admin.firestore.FieldValue.delete(),
            passwordResetAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(200).json({ nachricht: "Passwort wurde erfolgreich zurückgesetzt." });
    } catch (error) {
        res.status(500).json({ fehler: `Fehler beim Zurücksetzen: ${error.message}` });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server läuft auf Port ${PORT}`);
});