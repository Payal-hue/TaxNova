/* ==========================================================================
   TaxNova - Smart Tax Engine & Deduction Finder
   ========================================================================== */

class TaxEngine {
  // Compute summary metrics for a given list of transactions
  static calculateFinancials(transactions = []) {
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalDeductions = 0;

    transactions.forEach(tx => {
      const amt = parseFloat(tx.amount) || 0;
      if (tx.type === 'income') {
        totalIncome += amt;
      } else if (tx.type === 'expense') {
        totalExpenses += amt;
        const dedPercent = (tx.deductiblePercent !== undefined) ? tx.deductiblePercent / 100 : 1.0;
        totalDeductions += (amt * dedPercent);
      }
    });

    const netIncome = Math.max(0, totalIncome - totalExpenses);
    const taxableIncome = Math.max(0, totalIncome - totalDeductions);

    // Compute Taxes
    const seTax = taxableIncome * 0.153; // 15.3% Self-Employment Tax (Social Security & Medicare)
    const fedTax = taxableIncome * 0.15;  // ~15% Estimated Federal Income Tax Bracket
    const stateTax = taxableIncome * 0.06; // ~6% Estimated State Tax

    const totalEstimatedTax = seTax + fedTax + stateTax;
    const quarterlyEstimate = totalEstimatedTax / 4;
    const recommendedTaxReservePercent = totalIncome > 0 ? (totalEstimatedTax / totalIncome) * 100 : 25;

    return {
      totalIncome,
      totalExpenses,
      totalDeductions,
      netIncome,
      taxableIncome,
      seTax,
      fedTax,
      stateTax,
      totalEstimatedTax,
      quarterlyEstimate,
      recommendedTaxReservePercent: Math.min(35, Math.max(15, recommendedTaxReservePercent))
    };
  }

  // Scan transactions to identify tax savings & write-off opportunities
  static findTaxSavingsOpportunities(transactions = []) {
    const opportunities = [];

    // 1. Check for Home Office expense
    const hasHomeOffice = transactions.some(tx => 
      tx.category.toLowerCase().includes('office') || tx.description.toLowerCase().includes('rent')
    );
    if (!hasHomeOffice) {
      opportunities.push({
        title: "Home Office Deduction Missing",
        category: "Office & Rent",
        estimatedSavings: 1500,
        description: "You haven't claimed a Home Office write-off. Solopreneurs can claim $5/sq ft (up to $1,500/yr simplified rate).",
        actionText: "Claim Home Office"
      });
    }

    // 2. Check for Software & Subscriptions
    const softwareTotal = transactions
      .filter(tx => tx.category === "Software & Tools" && tx.type === "expense")
      .reduce((sum, tx) => sum + (tx.amount * (tx.deductiblePercent / 100)), 0);
    
    if (softwareTotal > 0) {
      opportunities.push({
        title: "100% Software Expense Deduction Active",
        category: "Software & Cloud",
        estimatedSavings: Math.round(softwareTotal * 0.30),
        description: `You have $${softwareTotal.toFixed(2)} in software tools tagged as 100% tax deductible.`,
        actionText: "View Details"
      });
    }

    // 3. Check for Meals deduction compliance (50% rule)
    const meals100 = transactions.filter(tx => tx.category.toLowerCase().includes('meal') && tx.deductiblePercent > 50);
    if (meals100.length > 0) {
      opportunities.push({
        title: "Business Meal Deduction Alert",
        category: "Compliance",
        estimatedSavings: 0,
        description: "Standard business meals are 50% deductible under IRS rules. Ensure meal tags are adjusted to avoid audit flags.",
        actionText: "Fix Meal Tags"
      });
    }

    // 4. Vehicle & Mileage opportunity
    const hasMileage = transactions.some(tx => tx.description.toLowerCase().includes('mile') || tx.category.toLowerCase().includes('travel'));
    if (!hasMileage) {
      opportunities.push({
        title: "Vehicle Mileage Deduction",
        category: "Travel & Auto",
        estimatedSavings: 670,
        description: "The 2026 standard mileage rate is 67 cents/mile for business travel. Tracking 1,000 miles saves ~$670 in tax.",
        actionText: "Log Mileage"
      });
    }

    return opportunities;
  }
}
