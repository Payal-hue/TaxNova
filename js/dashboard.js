import { authenticatedFetch } from './apiClient.js';

const userInfo = document.getElementById('user-info');
const logoutButton = document.getElementById('logout-btn');

async function loadDashboard() {
  const token = localStorage.getItem('taxnova_token');

  if (!token) {
    window.location.replace('login.html');
    return;
  }

  try {
    const response = await authenticatedFetch('/auth/me');

    if (!response.ok) {
      throw new Error('Session expired or invalid.');
    }

    const result = await response.json();

    userInfo.textContent = `Logged in as: ${result.user.email}`;
    const savedUser = JSON.parse(
  localStorage.getItem('taxnova_user') || '{}'
);

const name = savedUser.name || result.user.email.split('@')[0];

document.getElementById('welcome-heading').textContent =
  `Welcome back, ${name} ✦`;

document.getElementById('user-avatar').textContent =
  name.charAt(0).toUpperCase();
  } catch (error) {
    userInfo.textContent = error.message;
    window.location.replace('login.html');
  }
}

logoutButton.addEventListener('click', () => {
  localStorage.removeItem('taxnova_token');
  localStorage.removeItem('taxnova_user');
  window.location.replace('login.html');
});

loadDashboard();

//transaction
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);

async function loadTransactions() {
  const container = document.getElementById('recent-transactions');

  try {
    const response = await authenticatedFetch('/transactions');

    if (!response.ok) {
      throw new Error('Unable to load transactions.');
    }

    const result = await response.json();
    const transactions = result.transactions;

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    document.getElementById('total-income').textContent =
      formatCurrency(income);

    document.getElementById('total-expenses').textContent =
      formatCurrency(expenses);

    document.getElementById('net-profit').textContent =
      formatCurrency(income - expenses);

    // Tax calculation will be connected separately.
    document.getElementById('estimated-tax').textContent =
      'Not calculated';

    container.replaceChildren();

    if (transactions.length === 0) {
      container.textContent = 'No transactions recorded yet.';
      return;
    }

    const list = document.createElement('div');

    transactions.slice(0, 5).forEach(transaction => {
      const row = document.createElement('div');
      row.className = 'transaction-row';

      const details = document.createElement('span');
      details.textContent =
        `${transaction.category} — ${transaction.type}`;

      const amount = document.createElement('strong');
      amount.textContent =
        `${transaction.type === 'income' ? '+' : '-'}${formatCurrency(Number(transaction.amount))}`;

      row.append(details, amount);
      list.appendChild(row);
    });

    container.appendChild(list);
  } catch (error) {
    console.error(error);
    container.textContent = 'Could not load transactions.';
  }
}

loadTransactions();


const transactionForm = document.getElementById('transaction-form');
const transactionType = document.getElementById('transaction-type');
const transactionCategory = document.getElementById('transaction-category');
const transactionStatus = document.getElementById('transaction-status');
const transactionDate = document.getElementById('transaction-date');

const categoryOptions = {
  income: ['Salary', 'Freelance', 'Business', 'Other Income'],
  expense: ['Food', 'Travel', 'Shopping', 'Rent', 'Bills', 'Other Expense']
};

function updateCategories() {
  transactionCategory.replaceChildren();

  categoryOptions[transactionType.value].forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    transactionCategory.appendChild(option);
  });
}

transactionType.addEventListener('change', updateCategories);

transactionDate.value = new Date().toLocaleDateString('en-CA');
updateCategories();

transactionForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const saveButton = document.getElementById('save-transaction');

  const amount = Number(
    document.getElementById('transaction-amount').value
  );

  const transaction = {
    type: transactionType.value,
    amount,
    category: transactionCategory.value,
    description: document.getElementById('transaction-description').value,
    transaction_date: transactionDate.value
  };

  if (!Number.isFinite(amount) || amount <= 0) {
    transactionStatus.textContent = 'Enter a valid amount.';
    return;
  }

  saveButton.disabled = true;
  transactionStatus.textContent = 'Saving transaction...';

  try {
    const response = await authenticatedFetch('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Could not save transaction.');
    }

    transactionStatus.textContent = 'Transaction saved successfully!';
    transactionForm.reset();
    transactionDate.value = new Date().toLocaleDateString('en-CA');
    updateCategories();

    await loadTransactions();
  } catch (error) {
    transactionStatus.textContent = error.message;
  } finally {
    saveButton.disabled = false;
  }
});
