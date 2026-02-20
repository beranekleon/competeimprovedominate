const express = require('express');
const cors = require('cors');
const authController = require('./src/controllers/authController');
const userController = require('./src/controllers/userController');

const app = express();
app.use(cors());
app.use(express.json());

// Status
app.get('/status', (req, res) => res.json({ nachricht: "Backend online!" }));

// Auth Routen
app.post('/register', authController.register);
app.post('/login', authController.login);
app.post('/google-login', authController.googleLogin);
app.post('/login-phone', authController.loginPhone);

// User/Data Routen
app.post('/save-data', userController.saveData);
app.post('/delete-user', userController.deleteUser);

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server läuft auf Port ${PORT}`);
});