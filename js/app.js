/* ==========================================================================
   TaxNova - Main Application Controller & UI Binder
   ========================================================================== */

let incomeVsExpenseChart = null;
let categoryChart = null;

document.addEventListener('DOMContentLoaded', () => {
  // Check auth session
  initApp();
});

function initApp() {
  const user = AuthManager.getCurrentUser();
  updateUserUI(user);

  // Initialize Event Listeners
  setupNavigation();
  setupAuthModals();
  setupTransactionActions();
  setupInvoiceActions();
  setupAICopilot();

  // Initial Data Render
  renderDashboard();
  renderTransactionsTable();
  renderTaxEstimator();
  renderInvoicesTable();
}

/* User Session UI Updater */
function updateUserUI(user) {
  const authBtnGroup = document.getElementById('auth-btn-group');
  const userBadge = document.getElementById('user-profile-badge');

  if (user) {
    if (authBtnGroup) authBtnGroup.style.display = 'none';
    if (userBadge) {
      userBadge.style.display = 'flex';
      document.getElementById('user-display-name').textContent = user.fullName;
      document.getElementById('user-avatar-initial').textContent = user.fullName.charAt(0).toUpperCase();
    }
  } else {
    if (authBtnGroup) authBtnGroup.style.display = 'flex';
    if (userBadge) userBadge.style.display = 'none';
  }
}

/* Navigation Router */
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-tab]');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute('data-tab');

      // Update Active Nav Link
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Update Tab Content
      document.querySelectorAll('.tab-view').forEach(view => {
        view.classList.remove('active');
      });

      const activeView = document.getElementById(`tab-${targetTab}`);
      if (activeView) {
        activeView.classList.add('active');
        if (targetTab === 'overview') renderCharts();
      }
    });
  });
}

/* Auth Modals & Flow Handlers */
function setupAuthModals() {
  const modalOverlay = document.getElementById('auth-modal-overlay');
  const openLoginBtn = document.getElementById('btn-open-login');
  const openSignupBtn = document.getElementById('btn-open-signup');
  const closeModalBtn = document.getElementById('auth-modal-close');

  const formLogin = document.getElementById('form-login');
  const formSignup = document.getElementById('form-signup');
  const formOtp = document.getElementById('form-otp');
  const formForgot = document.getElementById('form-forgot');

  const switchSignupLink = document.getElementById('link-to-signup');
  const switchLoginLink = document.getElementById('link-to-login');
  const forgotPasswordLink = document.getElementById('link-to-forgot');
  const backToLoginLink = document.getElementById('link-back-login');

  const googleLoginBtn = document.getElementById('btn-google-login');
  const userLogoutBtn = document.getElementById('btn-logout');

  function openAuthModal(viewName = 'login') {
    modalOverlay.classList.add('active');
    showAuthForm(viewName);
  }

  function showAuthForm(viewName) {
    formLogin.style.display = 'none';
    formSignup.style.display = 'none';
    formOtp.style.display = 'none';
    formForgot.style.display = 'none';

    if (viewName === 'login') formLogin.style.display = 'block';
    if (viewName === 'signup') formSignup.style.display = 'block';
    if (viewName === 'otp') formOtp.style.display = 'block';
    if (viewName === 'forgot') formForgot.style.display = 'block';
  }

  if (openLoginBtn) openLoginBtn.addEventListener('click', () => openAuthModal('login'));
  if (openSignupBtn) openSignupBtn.addEventListener('click', () => openAuthModal('signup'));
  if (closeModalBtn) closeModalBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));

  if (switchSignupLink) switchSignupLink.addEventListener('click', () => showAuthForm('signup'));
  if (switchLoginLink) switchLoginLink.addEventListener('click', () => showAuthForm('login'));
  if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', () => showAuthForm('forgot'));
  if (backToLoginLink) backToLoginLink.addEventListener('click', () => showAuthForm('login'));

  // Submit Login
  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;

    const res = AuthManager.login(email, pass);
    if (res.success) {
      modalOverlay.classList.remove('active');
      updateUserUI(res.user);
      showToast('Logged in successfully with JWT Token!', 'success');
      renderDashboard();
    } else {
      showToast(res.message, 'error');
    }
  });

  // Submit Sign Up
  formSignup.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const pass = document.getElementById('signup-password').value;
    const bizType = document.getElementById('signup-biztype').value;

    const res = AuthManager.signUp(name, email, pass, bizType);
    if (res.success) {
      showAuthForm('otp');
      showToast(res.message, 'info');
      document.getElementById('otp-demo-hint').textContent = `Demo Code: ${res.otpDemo}`;
    } else {
      showToast(res.message, 'error');
    }
  });

  // Submit OTP Verification
  formOtp.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('otp-code').value;
    const res = AuthManager.verifyOTP(code);
    if (res.success) {
      modalOverlay.classList.remove('active');
      updateUserUI(res.user);
      showToast(res.message, 'success');
      renderDashboard();
    } else {
      showToast(res.message, 'error');
    }
  });

  // Submit Forgot Password
  formForgot.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    const res = AuthManager.requestPasswordReset(email);
    showToast(res.message, 'info');
    showAuthForm('login');
  });

  // Google Login
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
      const res = AuthManager.loginWithGoogle();
      modalOverlay.classList.remove('active');
      updateUserUI(res.user);
      showToast(res.message, 'success');
      renderDashboard();
    });
  }

  // Logout
  if (userLogoutBtn) {
    userLogoutBtn.addEventListener('click', () => {
      AuthManager.logout();
    });
  }
}

/* Dashboard Metrics & Charts */
function renderDashboard() {
  const transactions = DataStore.get('transactions') || [];
  const fin = TaxEngine.calculateFinancials(transactions);

  document.getElementById('kpi-income').textContent = `$${fin.totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('kpi-expense').textContent = `$${fin.totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('kpi-net').textContent = `$${fin.netIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('kpi-tax-reserve').textContent = `$${fin.quarterlyEstimate.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  const health = AIAdvisorEngine.calculateHealthScore(fin);
  document.getElementById('health-score-val').textContent = `${health.score}/100`;
  document.getElementById('health-score-grade').textContent = health.grade;
  document.getElementById('health-score-summary').textContent = health.summary;

  renderCharts();
}

function renderCharts() {
  const transactions = DataStore.get('transactions') || [];
  const fin = TaxEngine.calculateFinancials(transactions);

  // Income vs Expense Bar Chart
  const ctxBar = document.getElementById('incomeExpenseChart');
  if (ctxBar) {
    if (incomeVsExpenseChart) incomeVsExpenseChart.destroy();
    incomeVsExpenseChart = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: ['Gross Income', 'Total Expenses', 'Net Profit', 'Est. Quarterly Tax'],
        datasets: [{
          data: [fin.totalIncome, fin.totalExpenses, fin.netIncome, fin.quarterlyEstimate],
          backgroundColor: ['#10b981', '#6366f1', '#06b6d4', '#f59e0b'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
        }
      }
    });
  }

  // Expenses by Category Donut Chart
  const ctxDonut = document.getElementById('categoryChart');
  if (ctxDonut) {
    if (categoryChart) categoryChart.destroy();

    const categories = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + parseFloat(t.amount);
    });

    categoryChart = new Chart(ctxDonut, {
      type: 'doughnut',
      data: {
        labels: Object.keys(categories),
        datasets: [{
          data: Object.values(categories),
          backgroundColor: ['#6366f1', '#06b6d4', '#f59e0b', '#f43f5e', '#10b981'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
      }
    });
  }
}

/* Transactions Module */
function renderTransactionsTable() {
  const transactions = DataStore.get('transactions') || [];
  const tbody = document.getElementById('transactions-tbody');
  if (!tbody) return;

  tbody.innerHTML = transactions.map(tx => `
    <tr>
      <td>${tx.date}</td>
      <td><strong>${tx.description}</strong><br><small style="color:var(--text-dim);">${tx.notes || ''}</small></td>
      <td><span class="badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}">${tx.category}</span></td>
      <td>${tx.deductiblePercent}% Deductible</td>
      <td style="font-weight: bold; color: ${tx.type === 'income' ? 'var(--primary)' : 'var(--text-main)'};">
        ${tx.type === 'income' ? '+' : '-'}$${parseFloat(tx.amount).toFixed(2)}
      </td>
    </tr>
  `).join('');
}

function setupTransactionActions() {
  const modal = document.getElementById('modal-add-tx');
  const btnOpen = document.getElementById('btn-open-add-tx');
  const btnClose = document.getElementById('modal-add-tx-close');
  const form = document.getElementById('form-add-tx');
  const btnScanReceipt = document.getElementById('btn-scan-receipt');

  if (btnOpen) btnOpen.addEventListener('click', () => modal.classList.add('active'));
  if (btnClose) btnClose.addEventListener('click', () => modal.classList.remove('active'));

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const transactions = DataStore.get('transactions') || [];
      const newTx = {
        id: `tx_${Math.floor(1000 + Math.random() * 9000)}`,
        date: document.getElementById('tx-date').value,
        description: document.getElementById('tx-desc').value,
        category: document.getElementById('tx-category').value,
        type: document.getElementById('tx-type').value,
        amount: parseFloat(document.getElementById('tx-amount').value),
        deductiblePercent: parseInt(document.getElementById('tx-deductible').value) || 100,
        notes: document.getElementById('tx-notes').value
      };

      transactions.unshift(newTx);
      DataStore.set('transactions', transactions);
      modal.classList.remove('active');
      form.reset();

      renderDashboard();
      renderTransactionsTable();
      showToast('Transaction recorded & tax deduction calculated!', 'success');
    });
  }

  // Simulated AI OCR Receipt Upload
  if (btnScanReceipt) {
    btnScanReceipt.addEventListener('click', () => {
      showToast('AI OCR Scanning receipt image...', 'info');
      setTimeout(() => {
        const result = AIAdvisorEngine.scanReceiptMock('receipt_invoice_july.jpg');
        const transactions = DataStore.get('transactions') || [];
        transactions.unshift(result.data);
        DataStore.set('transactions', transactions);

        renderDashboard();
        renderTransactionsTable();
        showToast(`AI extracted: $${result.data.amount} for ${result.data.description}!`, 'success');
      }, 1200);
    });
  }
}

/* Tax Estimator Module */
function renderTaxEstimator() {
  const transactions = DataStore.get('transactions') || [];
  const fin = TaxEngine.calculateFinancials(transactions);

  document.getElementById('tax-gross-income').textContent = `$${fin.totalIncome.toFixed(2)}`;
  document.getElementById('tax-total-deductions').textContent = `$${fin.totalDeductions.toFixed(2)}`;
  document.getElementById('tax-taxable-net').textContent = `$${fin.taxableIncome.toFixed(2)}`;
  document.getElementById('tax-se-amount').textContent = `$${fin.seTax.toFixed(2)}`;
  document.getElementById('tax-fed-amount').textContent = `$${fin.fedTax.toFixed(2)}`;
  document.getElementById('tax-state-amount').textContent = `$${fin.stateTax.toFixed(2)}`;
  document.getElementById('tax-quarterly-amount').textContent = `$${fin.quarterlyEstimate.toFixed(2)}`;

  // Opportunities
  const opps = TaxEngine.findTaxSavingsOpportunities(transactions);
  const container = document.getElementById('tax-savings-container');
  if (container) {
    container.innerHTML = opps.map(o => `
      <div class="glass-panel" style="padding: 1.25rem; margin-bottom: 1rem; border-left: 4px solid var(--accent-cyan);">
        <div class="flex-between">
          <h4 style="color: var(--accent-cyan);">${o.title}</h4>
          <span class="badge badge-paid">Est. Savings: $${o.estimatedSavings}</span>
        </div>
        <p style="font-size: 0.875rem; color: var(--text-muted); margin: 0.5rem 0;">${o.description}</p>
        <button class="btn btn-sm btn-outline-purple">${o.actionText}</button>
      </div>
    `).join('');
  }
}

/* Invoices Module */
function renderInvoicesTable() {
  const invoices = InvoiceEngine.getInvoices();
  const tbody = document.getElementById('invoices-tbody');
  if (!tbody) return;

  tbody.innerHTML = invoices.map(inv => `
    <tr>
      <td><strong>${inv.id}</strong></td>
      <td>${inv.clientName}<br><small style="color:var(--text-dim);">${inv.clientEmail}</small></td>
      <td>${inv.issueDate} / ${inv.dueDate}</td>
      <td style="font-weight: bold;">$${parseFloat(inv.total).toFixed(2)}</td>
      <td><span class="badge badge-${inv.status}">${inv.status.toUpperCase()}</span></td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="previewInvoice('${inv.id}')">Preview</button>
        ${inv.status !== 'paid' ? `<button class="btn btn-sm btn-primary" onclick="markInvoicePaid('${inv.id}')">Mark Paid</button>` : ''}
      </td>
    </tr>
  `).join('');
}

function previewInvoice(invId) {
  const invoices = InvoiceEngine.getInvoices();
  const inv = invoices.find(i => i.id === invId);
  if (!inv) return;

  const html = InvoiceEngine.renderInvoiceHTML(inv);
  const win = window.open('', '_blank');
  win.document.write(`<html><head><title>Invoice ${inv.id}</title></head><body>${html}</body></html>`);
  win.document.close();
}

function markInvoicePaid(invId) {
  if (InvoiceEngine.updateStatus(invId, 'paid')) {
    renderInvoicesTable();
    showToast(`Invoice ${invId} marked as Paid!`, 'success');
  }
}

function setupInvoiceActions() {
  const modal = document.getElementById('modal-create-inv');
  const btnOpen = document.getElementById('btn-open-create-inv');
  const btnClose = document.getElementById('modal-create-inv-close');
  const form = document.getElementById('form-create-inv');

  if (btnOpen) btnOpen.addEventListener('click', () => {
    document.getElementById('inv-id').value = InvoiceEngine.generateInvoiceId();
    modal.classList.add('active');
  });
  if (btnClose) btnClose.addEventListener('click', () => modal.classList.remove('active'));

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const newInv = {
        id: document.getElementById('inv-id').value,
        clientName: document.getElementById('inv-client-name').value,
        clientEmail: document.getElementById('inv-client-email').value,
        issueDate: document.getElementById('inv-issue-date').value,
        dueDate: document.getElementById('inv-due-date').value,
        items: [
          {
            description: document.getElementById('inv-item-desc').value,
            quantity: parseFloat(document.getElementById('inv-item-qty').value),
            rate: parseFloat(document.getElementById('inv-item-rate').value),
            amount: parseFloat(document.getElementById('inv-item-qty').value) * parseFloat(document.getElementById('inv-item-rate').value)
          }
        ],
        taxRate: 0,
        total: parseFloat(document.getElementById('inv-item-qty').value) * parseFloat(document.getElementById('inv-item-rate').value),
        status: "sent",
        notes: document.getElementById('inv-notes').value
      };

      InvoiceEngine.saveInvoice(newInv);
      modal.classList.remove('active');
      form.reset();

      renderInvoicesTable();
      showToast(`Invoice ${newInv.id} created & sent to ${newInv.clientName}!`, 'success');
    });
  }
}

/* AI Copilot View */
function setupAICopilot() {
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input-field');
  const chatSendBtn = document.getElementById('btn-chat-send');

  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Append User message
    chatMessages.innerHTML += `
      <div class="message-bubble message-user">${text}</div>
    `;
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Generate AI response
    setTimeout(() => {
      const transactions = DataStore.get('transactions') || [];
      const fin = TaxEngine.calculateFinancials(transactions);
      const reply = AIAdvisorEngine.askNovaAI(text, fin);

      chatMessages.innerHTML += `
        <div class="message-bubble message-ai">
          <strong>Nova AI:</strong><br>${reply.replace(/\n/g, '<br>')}
        </div>
      `;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 600);
  }

  if (chatSendBtn) chatSendBtn.addEventListener('click', sendMessage);
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }
}

/* Toast System */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'error') toast.style.borderLeftColor = 'var(--accent-rose)';
  if (type === 'success') toast.style.borderLeftColor = 'var(--primary)';

  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}
