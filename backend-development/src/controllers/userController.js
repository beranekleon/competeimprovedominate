const bcrypt = require('bcrypt');
const { admin, db } = require('../config/firebase');
const { normalizeEmail } = require('../utils/helpers');

exports.saveData = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { userData } = req.body;
        const userRef = db.collection('users').doc(email);
        
        await userRef.update({
            userData: userData ?? { workouts: [], progress: {} },
            lastUpdate: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(200).json({ nachricht: "Daten synchronisiert." });
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