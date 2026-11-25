
const db = require('../config/database');

// Get transactions for the logged-in user
exports.getTransactions = async (req, res, next) => {
  try {
const userId = req.auth.sub;

    const [transactions] = await db.query(
      `SELECT id, type, amount, category, description,
              transaction_date, created_at
       FROM transactions
       WHERE user_id = ?
       ORDER BY transaction_date DESC, id DESC`,
      [userId]
    );

    res.json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
};

// Add an income or expense
exports.addTransaction = async (req, res, next) => {
  try {
    const userId = req.auth.sub;
    const { type, amount, category, description, transaction_date } = req.body;

    const validAmount =
      typeof amount === 'number' &&
      Number.isFinite(amount) &&
      amount > 0 &&
      amount <= 9999999999.99 &&
      Math.round(amount * 100) / 100 === amount;

    const validDate =
      typeof transaction_date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(transaction_date) &&
      !Number.isNaN(Date.parse(transaction_date)) &&
      new Date(transaction_date).toISOString().slice(0, 10) === transaction_date;

    if (
      !['income', 'expense'].includes(type) ||
      !validAmount ||
      typeof category !== 'string' ||
      !category.trim() ||
      category.length > 100 ||
      (description != null &&
        (typeof description !== 'string' || description.length > 255)) ||
      !validDate
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please enter valid transaction details.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO transactions
       (user_id, type, amount, category, description, transaction_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        type,
        amount,
        category.trim(),
        description || null,
        transaction_date
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Transaction added successfully.',
      transactionId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};
