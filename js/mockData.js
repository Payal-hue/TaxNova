/* ==========================================================================
   TaxNova - Initial Mock Data & Persistence Layer
   ========================================================================== */

const INITIAL_MOCK_DATA = {
  userProfile: {
    id: "user_789452",
    fullName: "Alex Rivera",
    email: "alex@riveradesign.co",
    businessName: "Rivera Digital Studio",
    businessType: "Freelance Designer / Solopreneur",
    taxFilingStatus: "Single",
    state: "California",
    isVerified: true,
    avatarUrl: null
  },
  
  transactions: [
    {
      id: "tx_101",
      date: "2026-07-20",
      description: "Figma Professional Subscription",
      category: "Software & Tools",
      type: "expense",
      amount: 45.00,
      deductiblePercent: 100,
      notes: "Monthly UX design tool subscription",
      receiptUrl: "figma_invoice_july.pdf"
    },
    {
      id: "tx_102",
      date: "2026-07-18",
      description: "Acme Corp Web Redesign Deposit",
      category: "Client Payment",
      type: "income",
      amount: 3500.00,
      deductiblePercent: 0,
      notes: "50% upfront payment for website redesign"
    },
    {
      id: "tx_103",
      date: "2026-07-15",
      description: "Apple MacBook Pro M3 Repair",
      category: "Equipment & Hardware",
      type: "expense",
      amount: 480.00,
      deductiblePercent: 100,
      notes: "Screen replacement for primary workstation"
    },
    {
      id: "tx_104",
      date: "2026-07-10",
      description: "Client Lunch - Horizon Tech",
      category: "Meals & Entertainment",
      type: "expense",
      amount: 112.50,
      deductiblePercent: 50,
      notes: "Project kickoff meeting meal"
    },
    {
      id: "tx_105",
      date: "2026-07-05",
      description: "Stripe Invoice Payment #1042",
      category: "Client Payment",
      type: "income",
      amount: 2200.00,
      deductiblePercent: 0,
      notes: "Brand identity package payment"
    },
    {
      id: "tx_106",
      date: "2026-06-28",
      description: "Home Office Internet (50% Business split)",
      category: "Utilities & Office",
      type: "expense",
      amount: 65.00,
      deductiblePercent: 100,
      notes: "Monthly fiber internet bill"
    },
    {
      id: "tx_107",
      date: "2026-06-20",
      description: "Google Cloud & Workspace",
      category: "Software & Tools",
      type: "expense",
      amount: 28.00,
      deductiblePercent: 100,
      notes: "Domain email & cloud storage"
    }
  ],

  invoices: [
    {
      id: "INV-2026-001",
      clientName: "Horizon Technologies Inc.",
      clientEmail: "billing@horizontech.io",
      issueDate: "2026-07-01",
      dueDate: "2026-07-31",
      items: [
        { description: "Mobile App UI/UX Architecture", quantity: 40, rate: 85, amount: 3400 },
        { description: "Design System Tokens Export", quantity: 1, rate: 600, amount: 600 }
      ],
      taxRate: 0,
      total: 4000.00,
      status: "sent",
      notes: "Thank you for your business! Payment due within 30 days."
    },
    {
      id: "INV-2026-002",
      clientName: "Vanguard Retail Group",
      clientEmail: "accounts@vanguardretail.com",
      issueDate: "2026-06-15",
      dueDate: "2026-07-15",
      items: [
        { description: "E-Commerce Rebranding & Assets", quantity: 1, rate: 2500, amount: 2500 }
      ],
      taxRate: 0,
      total: 2500.00,
      status: "paid",
      notes: "Paid via Direct Bank Transfer."
    },
    {
      id: "INV-2026-003",
      clientName: "Starlight Media House",
      clientEmail: "ops@starlightmedia.co",
      issueDate: "2026-05-10",
      dueDate: "2026-06-10",
      items: [
        { description: "Quarterly Marketing Graphics", quantity: 20, rate: 75, amount: 1500 }
      ],
      taxRate: 0,
      total: 1500.00,
      status: "overdue",
      notes: "Payment is overdue. Automatic reminder sent."
    }
  ],

  taxSettings: {
    estimatedFederalRate: 0.15,
    selfEmploymentTaxRate: 0.153, // 15.3% SE tax
    stateRate: 0.06,
    quarterlyDeadlines: [
      { quarter: "Q1", period: "Jan 1 - Mar 31", dueDate: "2026-04-15", status: "Paid" },
      { quarter: "Q2", period: "Apr 1 - May 31", dueDate: "2026-06-15", status: "Paid" },
      { quarter: "Q3", period: "Jun 1 - Aug 31", dueDate: "2026-09-15", status: "Upcoming" },
      { quarter: "Q4", period: "Sep 1 - Dec 31", dueDate: "2027-01-15", status: "Upcoming" }
    ]
  }
};

// Data persistence helper
class DataStore {
  static get(key) {
    const raw = localStorage.getItem(`taxnova_${key}`);
    if (!raw) {
      if (INITIAL_MOCK_DATA[key]) {
        DataStore.set(key, INITIAL_MOCK_DATA[key]);
        return INITIAL_MOCK_DATA[key];
      }
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return INITIAL_MOCK_DATA[key] || null;
    }
  }

  static set(key, value) {
    localStorage.setItem(`taxnova_${key}`, JSON.stringify(value));
  }
}
