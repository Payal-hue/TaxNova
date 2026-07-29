const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, message: 'Registration successful. Welcome to TaxNova.', ...result });
  } catch (error) { next(error); }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, message: 'Login successful.', ...result });
  } catch (error) { next(error); }
}

function currentUser(req, res) {
  return res.json({ success: true, user: { id: req.auth.sub, email: req.auth.email, role: req.auth.role } });
}

module.exports = { register, login, currentUser };
