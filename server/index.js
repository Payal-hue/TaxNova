require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./config/database');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = Number(process.env.PORT || 3000);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:8080' }));
app.use(express.json({ limit: '10kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'TaxNova API is running.' }));
app.use('/api/auth', authRoutes);
app.use((error, _req, res, _next) => {
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'An account already exists for this email address.' });
  console.error(error);
  return res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Unable to register right now.' });
});
db.getConnection().then(connection => { connection.release(); app.listen(port, () => console.log(`TaxNova API listening on http://localhost:${port}`)); }).catch(error => { console.error('Could not connect to MySQL. Check your .env settings.', error.message); process.exit(1); });
