const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function register({ name, email, password }) {
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (cleanName.length < 2 || cleanName.length > 100) throw fail('Please enter a name between 2 and 100 characters.', 400);
  if (!EMAIL_PATTERN.test(cleanEmail)) throw fail('Please enter a valid email address.', 400);
  if (typeof password !== 'string' || password.length < 8) throw fail('Password must be at least 8 characters long.', 400);

  const [existing] = await db.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [cleanEmail]);
  if (existing.length) throw fail('An account already exists for this email address.', 409);

  // BCrypt produces a salted one-way password hash; raw passwords are never stored.
  const passwordHash = await bcrypt.hash(password, 12);
  const [created] = await db.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [cleanName, cleanEmail, passwordHash, 'USER']);
  const user = { id: created.insertId, name: cleanName, email: cleanEmail, role: 'USER' };
  const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
  return { user, token };
}

async function login({ email, password }) {
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!EMAIL_PATTERN.test(cleanEmail) || typeof password !== 'string' || !password) {
    throw fail('Email and password are required.', 400);
  }

  const [users] = await db.execute(
    'SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1',
    [cleanEmail]
  );
  const storedUser = users[0];
  // Deliberately return the same message for a missing user or bad password.
  if (!storedUser || !(await bcrypt.compare(password, storedUser.password))) {
    throw fail('Invalid email or password.', 401);
  }

  const user = { id: storedUser.id, name: storedUser.name, email: storedUser.email, role: storedUser.role };
  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
  return { user, token };
}

module.exports = { register, login };
