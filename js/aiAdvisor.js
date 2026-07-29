/* ==========================================================================
   TaxNova - AI Copilot ("Nova AI") & Receipt Scanner Engine
   ========================================================================== */

class AIAdvisorEngine {
  // Knowledge Base & AI Chat Response Generator
  static askNovaAI(userMessage, financialContext) {
    const query = userMessage.toLowerCase();
    const { totalIncome, totalExpenses, netIncome, totalEstimatedTax, quarterlyEstimate } = financialContext;

    if (query.includes('tax') && (query.includes('how much') || query.includes('estimate') || query.includes('reserve'))) {
      return `Based on your current YTD income of **$${totalIncome.toLocaleString()}**, your total estimated tax liability is approximately **$${totalEstimatedTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}**. We recommend putting aside **$${quarterlyEstimate.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}** for your upcoming quarterly estimated tax payment due Sept 15, 2026.`;
    }

    if (query.includes('deduct') || query.includes('write-off') || query.includes('save')) {
      return `Here are top tax-saving opportunities for your business type:\n\n1. **Home Office Deduction**: If you use a dedicated workspace at home, claim $5/sq ft (up to $1,500/yr).\n2. **Software & Subscriptions**: 100% tax-deductible for design, domain, and productivity tools.\n3. **Equipment & Section 179**: Immediate write-offs for new laptops, monitors, or office furniture.\n4. **Health Insurance Premiums**: Solopreneurs can deduct 100% of self-employed health insurance.`;
    }

    if (query.includes('invoice') || query.includes('unpaid') || query.includes('cash flow')) {
      return `Your current Net Income is **$${netIncome.toLocaleString()}**. You have 1 overdue invoice for Starlight Media ($1,500.00). Sending an automated payment reminder could increase your liquid cash reserve by 18%!`;
    }

    if (query.includes('health') || query.includes('score')) {
      const score = AIAdvisorEngine.calculateHealthScore(financialContext);
      return `Your **Financial Health Score is ${score.score}/100** (${score.grade}). ${score.summary}`;
    }

    // Default intelligent response
    return `Nova AI analyzed your financial data: You currently have **$${totalIncome.toLocaleString()}** in income against **$${totalExpenses.toLocaleString()}** in expenses, leaving a clean **$${netIncome.toLocaleString()}** net profit. Is there a specific tax category or invoice you would like me to optimize?`;
  }

  // Calculate 0-100 Financial Health Scorecard
  static calculateHealthScore(financials) {
    const { totalIncome, totalExpenses, netIncome, totalEstimatedTax } = financials;
    if (totalIncome === 0) {
      return { score: 70, grade: "Good", summary: "Add more transactions to calculate your full health score." };
    }

    const profitMargin = (netIncome / totalIncome) * 100;
    let score = 50;

    if (profitMargin > 50) score += 30;
    else if (profitMargin > 30) score += 20;
    else if (profitMargin > 10) score += 10;

    if (totalExpenses < totalIncome * 0.4) score += 20;

    score = Math.min(100, Math.max(20, Math.round(score)));

    let grade = "Solid";
    let summary = "Your profit margin is strong and tax reserve ratio is well protected.";
    if (score >= 85) {
      grade = "Excellent";
      summary = "Outstanding cash flow control! Your business is operating with minimal tax exposure.";
    } else if (score < 60) {
      grade = "Needs Attention";
      summary = "High expense ratio detected. Consider reviewing software subscriptions and claiming missing deductions.";
    }

    return { score, grade, summary };
  }

  // Simulated AI OCR Receipt Scanner
  static scanReceiptMock(fileName) {
    const sampleVendors = [
      { vendor: "Adobe Creative Cloud", amount: 54.99, category: "Software & Tools", deductible: 100, notes: "Monthly Creative Cloud All Apps" },
      { vendor: "Best Buy Tech Store", amount: 249.00, category: "Equipment & Hardware", deductible: 100, notes: "4K External Monitor for office" },
      { vendor: "Uber Business Travel", amount: 38.50, category: "Travel & Auto", deductible: 100, notes: "Client onsite visit transport" },
      { vendor: "Starbucks Coffee", amount: 14.75, category: "Meals & Entertainment", deductible: 50, notes: "Client discovery session" }
    ];

    // Pick random or match
    const match = sampleVendors[Math.floor(Math.random() * sampleVendors.length)];
    const today = new Date().toISOString().split('T')[0];

    return {
      success: true,
      data: {
        id: `tx_${Math.floor(1000 + Math.random() * 9000)}`,
        date: today,
        description: match.vendor,
        category: match.category,
        type: "expense",
        amount: match.amount,
        deductiblePercent: match.deductible,
        notes: `[AI OCR Scanned from ${fileName}] ${match.notes}`,
        receiptUrl: fileName
      }
    };
  }
}
