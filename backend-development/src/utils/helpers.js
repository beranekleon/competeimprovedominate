const crypto = require('crypto');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = { normalizeEmail, hashToken };