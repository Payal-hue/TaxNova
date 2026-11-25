
const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const {
  getTransactions,
  addTransaction
} = require('../controllers/transactionController');

const router = express.Router();

router.use(requireAuth);

router.get('/', getTransactions);
router.post('/', addTransaction);

module.exports = router;
