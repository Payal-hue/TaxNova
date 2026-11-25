require('dotenv').config({
  path: require('path').join(__dirname, '../.env')
});
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const port = Number(process.env.PORT || 3000);
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5500'
}));
app.use(express.json({ limit: '10kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'TaxNova API is running.' }));
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use((error, _req, res, _next) => {
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'An account already exists for this email address.' });
  console.error(error);
  return res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Unable to register right now.' });
});
db.getConnection().then(connection => { connection.release(); app.listen(port, () => console.log(`TaxNova API listening on http://localhost:${port}`)); })
.catch(error => {
  console.error('MySQL Connection Error:');
  console.error('Code:', error.code);
  console.error('Message:', error.message);
  console.error('Details:', error);
  process.exit(1);
});
