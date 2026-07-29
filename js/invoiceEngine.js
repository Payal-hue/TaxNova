/* ==========================================================================
   TaxNova - Invoice Studio & Management Module
   ========================================================================== */

class InvoiceEngine {
  static getInvoices() {
    return DataStore.get("invoices") || [];
  }

  static saveInvoice(invoiceData) {
    const invoices = InvoiceEngine.getInvoices();
    const existingIndex = invoices.findIndex(i => i.id === invoiceData.id);

    if (existingIndex >= 0) {
      invoices[existingIndex] = invoiceData;
    } else {
      invoices.unshift(invoiceData);
    }

    DataStore.set("invoices", invoices);
    return invoiceData;
  }

  static updateStatus(invoiceId, newStatus) {
    const invoices = InvoiceEngine.getInvoices();
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice) {
      invoice.status = newStatus;
      DataStore.set("invoices", invoices);
      return true;
    }
    return false;
  }

  static generateInvoiceId() {
    const invoices = InvoiceEngine.getInvoices();
    const count = invoices.length + 1;
    return `INV-2026-${count.toString().padStart(3, '0')}`;
  }

  static renderInvoiceHTML(invoice) {
    const user = DataStore.get("userProfile");
    
    const itemsRows = invoice.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.description}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${parseFloat(item.rate).toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">$${parseFloat(item.amount).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <div style="font-family: Arial, sans-serif; padding: 40px; color: #1e293b; background: #ffffff; border-radius: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
          <div>
            <h1 style="color: #0f172a; margin: 0; font-size: 28px;">INVOICE</h1>
            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;"># ${invoice.id}</p>
          </div>
          <div style="text-align: right;">
            <h3 style="margin: 0; color: #10b981;">${user.businessName}</h3>
            <p style="margin: 3px 0; color: #64748b; font-size: 13px;">${user.email}</p>
            <p style="margin: 0; color: #64748b; font-size: 13px;">${user.state}, USA</p>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 30px;">

        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <p style="font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; font-weight: bold;">Billed To:</p>
            <h3 style="margin: 0; font-size: 16px;">${invoice.clientName}</h3>
            <p style="margin: 3px 0; color: #64748b; font-size: 14px;">${invoice.clientEmail}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 3px 0; font-size: 14px;"><strong>Issue Date:</strong> ${invoice.issueDate}</p>
            <p style="margin: 3px 0; font-size: 14px;"><strong>Due Date:</strong> ${invoice.dueDate}</p>
            <p style="margin: 3px 0; font-size: 14px;"><strong>Status:</strong> <span style="text-transform: uppercase; color: ${invoice.status === 'paid' ? '#10b981' : invoice.status === 'overdue' ? '#f43f5e' : '#f59e0b'}; font-weight: bold;">${invoice.status}</span></p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 12px; text-align: left; color: #64748b; font-size: 12px; text-transform: uppercase;">Description</th>
              <th style="padding: 12px; text-align: center; color: #64748b; font-size: 12px; text-transform: uppercase;">Qty/Hrs</th>
              <th style="padding: 12px; text-align: right; color: #64748b; font-size: 12px; text-transform: uppercase;">Rate</th>
              <th style="padding: 12px; text-align: right; color: #64748b; font-size: 12px; text-transform: uppercase;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end;">
          <div style="width: 250px; text-align: right;">
            <p style="font-size: 18px; font-weight: bold; color: #0f172a; margin: 10px 0;">Total: $${parseFloat(invoice.total).toFixed(2)}</p>
          </div>
        </div>

        <div style="margin-top: 40px; padding: 15px; background: #f8fafc; border-radius: 8px; font-size: 13px; color: #64748b;">
          <strong>Notes:</strong> ${invoice.notes || 'Thank you for your business!'}
        </div>
      </div>
    `;
  }
}
