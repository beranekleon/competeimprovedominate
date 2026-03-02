const express = require('express');
const cors = require('cors');
const authController = require('./src/controllers/authController');
const userController = require('./src/controllers/userController');

const app = express();
app.use(cors());
app.use(express.json());

// Status
app.get('/status', (req, res) => res.json({ message: "Backend online!" }));

// Auth Routing
app.post('/register', authController.register);
app.post('/login', authController.login);
app.post('/google-login', authController.googleLogin);
app.post('/login-phone', authController.loginPhone);

app.post('/request-phone-code', authController.requestPhoneCode);
app.post('/verify-phone-code', authController.verifyPhoneCode);

// ✅ NUR DAS HIER NEU HINZUGEFÜGT
app.get('/verify-email', authController.verifyEmail);

// User/Data Routing
app.post('/save-data', userController.saveData);
app.post('/save-session', userController.saveSession);
app.post('/delete-user', userController.deleteUser);

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});