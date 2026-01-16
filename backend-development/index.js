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

// Zugriff auf Firestore
const db = getFirestore("cid-development-database");

app.get('/status', (req, res) => {
  res.json({ nachricht: "Backend ist online! Hallo Welt!" });
});

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ fehler: "Daten unvollständig." });

    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();
    if (doc.exists) return res.status(400).json({ fehler: "Benutzer existiert bereits." });

    const hashedPassword = await bcrypt.hash(password, 10);

    await userRef.set({
      email,
      password: hashedPassword,
      userData: "",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ nachricht: "Registrierung erfolgreich." });
  } catch (error) {
    res.status(500).json({ fehler: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (!doc.exists) return res.status(401).json({ fehler: "Benutzer nicht gefunden." });

    const user = doc.data();
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ fehler: "Ungültiges Passwort." });

    res.status(200).json({
      nachricht: "Login erfolgreich.",
      user: {
        email: user.email,
        userData: user.userData || ""
      }
    });
  } catch (error) {
    res.status(500).json({ fehler: "Interner Serverfehler." });
  }
});

app.post('/save-data', async (req, res) => {
  try {
    const { email, userData } = req.body;
    if (!email) return res.status(400).json({ fehler: "E-Mail fehlt." });

    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();
    if (!doc.exists) return res.status(404).json({ fehler: "Benutzer nicht gefunden." });

    await userRef.update({
      userData: userData ?? "",
      lastUpdate: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ nachricht: "Daten synchronisiert." });
  } catch (error) {
    res.status(500).json({ fehler: "Fehler beim Speichern." });
  }
});

// Nutzerkonto löschen (mit Passwort)
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
    return res.status(200).json({ nachricht: "User deleted successfully." });
  } catch (error) {
    return res.status(500).json({ fehler: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server läuft auf Port ${PORT}`);
});