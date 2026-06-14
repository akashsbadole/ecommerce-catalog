export interface InvoiceWithItems {
  id: string;
  invoiceNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  taxRate: number;
  total: number;
  currency: string;
  gstNumber: string | null;
  gstType: string | null;
  notes: string | null;
  billingName: string | null;
  billingEmail: string | null;
  billingAddress: string | null;
  companyName: string | null;
  companyAddress: string | null;
  companyTaxId: string | null;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  items: {
    id: string;
    name: string;
    sku: string | null;
    hsnCode: string | null;
    price: number;
    quantity: number;
    total: number;
    gstRate: number;
    gstAmount: number;
  }[];
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const dateStr = `${y}${m}${d}`;
  const time = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${dateStr}-${time}${random}`;
}

function numberToWords(num: number): string {
  if (num === 0) return 'Zero';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
    'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertBelow1000 = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertBelow1000(n % 100) : '');
  };

  const units = ['', 'Thousand', 'Million', 'Billion'];
  const parts: string[] = [];
  let remaining = Math.floor(num);

  for (let i = 0; remaining > 0 && i < units.length; i++) {
    const chunk = remaining % 1000;
    if (chunk > 0) {
      const words = convertBelow1000(chunk);
      parts.unshift(words + (units[i] ? ' ' + units[i] : ''));
    }
    remaining = Math.floor(remaining / 1000);
  }

  const decimal = Math.round((num % 1) * 100);
  let result = parts.join(' ');
  if (decimal > 0) {
    result += ' and ' + decimal + '/100';
  }

  return result || 'Zero';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function generateInvoiceHtml(
  invoice: InvoiceWithItems,
  siteName: string,
  siteLogo?: string
): string {
  const fmt = (n: number) => `${invoice.currency} ${n.toFixed(2)}`;
  const isGst = invoice.gstType === 'intra' || invoice.gstType === 'inter';

  const itemsRows = invoice.items.map((item, i) => `
            <tr>
              <td style="padding:10px 8px;text-align:center;border:1px solid #d1d5db;font-size:12px">${i + 1}</td>
              <td style="padding:10px 8px;border:1px solid #d1d5db;font-size:12px">${item.name}${item.sku ? `<br><span style="font-size:10px;color:#6b7280">SKU: ${item.sku}</span>` : ''}</td>
              <td style="padding:10px 8px;text-align:center;border:1px solid #d1d5db;font-size:11px;color:#6b7280">${item.hsnCode || '—'}</td>
              <td style="padding:10px 8px;text-align:right;border:1px solid #d1d5db;font-size:12px">${fmt(item.price)}</td>
              <td style="padding:10px 8px;text-align:center;border:1px solid #d1d5db;font-size:12px">${item.quantity}</td>
              <td style="padding:10px 8px;text-align:center;border:1px solid #d1d5db;font-size:12px">${item.gstRate}%</td>
              <td style="padding:10px 8px;text-align:right;border:1px solid #d1d5db;font-size:12px">${fmt(item.gstAmount)}</td>
              <td style="padding:10px 8px;text-align:right;border:1px solid #d1d5db;font-size:12px;font-weight:600">${fmt(item.total)}</td>
            </tr>
  `).join('');

  const totalTaxable = invoice.subtotal + invoice.shippingCost - invoice.discount;
  const isInter = invoice.gstType === 'inter';
  const gstBreakup = isGst ? `
          <div style="margin-top:16px">
            <h3 style="font-size:13px;color:#374151;margin:0 0 8px 0;border-bottom:1px solid #e5e7eb;padding-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">GST Breakup</h3>
            <table style="width:100%;border-collapse:collapse;font-size:12px">
              <tr><td style="padding:4px 8px">Taxable Amount</td><td style="padding:4px 8px;text-align:right">${fmt(totalTaxable)}</td></tr>
              ${isInter ? `
              <tr><td style="padding:4px 8px">IGST @ ${invoice.taxRate.toFixed(2)}%</td><td style="padding:4px 8px;text-align:right">${fmt(invoice.tax)}</td></tr>
              ` : `
              <tr><td style="padding:4px 8px">CGST @ ${(invoice.taxRate / 2).toFixed(2)}%</td><td style="padding:4px 8px;text-align:right">${fmt(invoice.tax / 2)}</td></tr>
              <tr><td style="padding:4px 8px">SGST @ ${(invoice.taxRate / 2).toFixed(2)}%</td><td style="padding:4px 8px;text-align:right">${fmt(invoice.tax / 2)}</td></tr>
              `}
              <tr style="font-weight:600;border-top:1px solid #d1d5db"><td style="padding:4px 8px">Total Tax</td><td style="padding:4px 8px;text-align:right">${fmt(invoice.tax)}</td></tr>
            </table>
          </div>
  ` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    @page { margin: 15mm 10mm; size: A4; }
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; color: #1f2937; font-size: 13px; line-height: 1.5; }
    .invoice-box { max-width: 210mm; margin: 0 auto; padding: 20px 30px; }
    table { border-collapse: collapse; }
    .header-table { width: 100%; border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 20px; }
    .logo-cell { width: 50%; vertical-align: top; }
    .title-cell { width: 50%; text-align: right; vertical-align: top; }
    .invoice-title { font-size: 28px; font-weight: 800; color: #059669; margin: 0; letter-spacing: 1px; }
    .invoice-subtitle { font-size: 13px; color: #6b7280; margin: 4px 0 0 0; }
    .section-title { font-size: 13px; color: #374151; margin: 0 0 8px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-table { width: 100%; margin-bottom: 20px; }
    .info-table td { vertical-align: top; padding: 4px 0; }
    .info-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px; }
    .info-value { font-size: 13px; color: #1f2937; font-weight: 500; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .items-table th { background: #059669; color: white; padding: 10px 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #059669; }
    .sum-table { width: 50%; margin-left: auto; border-collapse: collapse; }
    .sum-table td { padding: 6px 8px; font-size: 13px; }
    .sum-table .total-row td { border-top: 2px solid #059669; font-size: 16px; font-weight: 700; color: #059669; }
    .amount-words { margin-top: 16px; padding: 12px; background: #f0fdf4; border-left: 4px solid #059669; border-radius: 4px; font-size: 12px; color: #065f46; }
    .amount-words strong { font-size: 13px; }
    .footer-section { margin-top: 30px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; }
    .terms-box { margin-top: 20px; padding: 12px; background: #f9fafb; border-radius: 4px; font-size: 11px; color: #6b7280; }
    .terms-box h4 { margin: 0 0 6px 0; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.3px; }
    .terms-box p { margin: 2px 0; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="invoice-box">
    <table class="header-table">
      <tr>
        <td class="logo-cell">
          ${siteLogo ? `<img src="${siteLogo}" alt="${siteName}" style="max-height:60px;max-width:200px">` : `<h1 style="margin:0;font-size:20px;color:#059669">${siteName}</h1>`}
        </td>
        <td class="title-cell">
          <h1 class="invoice-title">INVOICE</h1>
          <p class="invoice-subtitle">#${invoice.invoiceNumber}</p>
        </td>
      </tr>
    </table>

    <table class="info-table">
      <tr>
        <td style="width:50%">
          <h3 class="section-title">Bill To</h3>
          ${invoice.billingName ? `<div class="info-value">${invoice.billingName}</div>` : ''}
          ${invoice.billingAddress ? `<div style="font-size:12px;color:#6b7280;margin-top:4px">${invoice.billingAddress.replace(/\n/g, '<br>')}</div>` : ''}
          ${invoice.billingEmail ? `<div style="font-size:12px;color:#6b7280">${invoice.billingEmail}</div>` : ''}
          ${invoice.companyName ? `<div style="font-size:12px;color:#6b7280;margin-top:4px">${invoice.companyName}</div>` : ''}
          ${invoice.companyTaxId ? `<div style="font-size:12px;color:#6b7280">Tax ID: ${invoice.companyTaxId}</div>` : ''}
        </td>
        <td style="width:50%;text-align:right">
          <h3 class="section-title" style="text-align:right">Invoice Details</h3>
          <table style="margin-left:auto;font-size:12px">
            <tr><td style="padding:2px 4px;color:#6b7280">Invoice Date</td><td style="padding:2px 4px">${formatDate(invoice.createdAt)}</td></tr>
            <tr><td style="padding:2px 4px;color:#6b7280">Due Date</td><td style="padding:2px 4px">${formatDate(invoice.dueDate)}</td></tr>
            <tr><td style="padding:2px 4px;color:#6b7280">Status</td><td style="padding:2px 4px"><span style="background:${invoice.status === 'paid' ? '#d1fae5' : invoice.status === 'sent' ? '#dbeafe' : '#fef3c7'};color:${invoice.status === 'paid' ? '#065f46' : invoice.status === 'sent' ? '#1e40af' : '#92400e'};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600">${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span></td></tr>
            ${invoice.gstNumber ? `<tr><td style="padding:2px 4px;color:#6b7280">GSTIN</td><td style="padding:2px 4px">${invoice.gstNumber}</td></tr>` : ''}
            ${invoice.gstType ? `<tr><td style="padding:2px 4px;color:#6b7280">Supply Type</td><td style="padding:2px 4px">${invoice.gstType === 'intra' ? 'Intra-State' : 'Inter-State'}</td></tr>` : ''}
          </table>
        </td>
      </tr>
    </table>

    <h3 class="section-title">Items</h3>
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:30px">#</th>
          <th style="text-align:left">Description</th>
          <th style="width:50px">HSN</th>
          <th style="width:70px">Rate</th>
          <th style="width:40px">Qty</th>
          <th style="width:50px">GST%</th>
          <th style="width:70px">GST Amt</th>
          <th style="width:80px">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <table class="sum-table">
      <tr><td style="text-align:left;color:#6b7280">Subtotal</td><td style="text-align:right">${fmt(invoice.subtotal)}</td></tr>
      ${invoice.shippingCost > 0 ? `<tr><td style="text-align:left;color:#6b7280">Shipping</td><td style="text-align:right">${fmt(invoice.shippingCost)}</td></tr>` : ''}
      ${invoice.discount > 0 ? `<tr><td style="text-align:left;color:#6b7280">Discount</td><td style="text-align:right">-${fmt(invoice.discount)}</td></tr>` : ''}
      <tr><td style="text-align:left;color:#6b7280">Tax (${invoice.taxRate}%)</td><td style="text-align:right">${fmt(invoice.tax)}</td></tr>
      <tr class="total-row"><td style="text-align:left"><strong>Total</strong></td><td style="text-align:right"><strong>${fmt(invoice.total)}</strong></td></tr>
    </table>

    ${gstBreakup}

    <div class="amount-words">
      <strong>Amount in Words:</strong> ${numberToWords(invoice.total)} ${invoice.currency}
    </div>

    ${invoice.notes ? `
    <div class="terms-box">
      <h4>Notes</h4>
      <p>${invoice.notes.replace(/\n/g, '<br>')}</p>
    </div>
    ` : ''}

    <div class="terms-box">
      <h4>Terms & Conditions</h4>
      <p>1. Payment is due within the mentioned due date.</p>
      <p>2. Late payments may incur additional charges.</p>
      <p>3. This is a computer-generated invoice and does not require a physical signature.</p>
      <p>4. Returns and exchanges are subject to company policy.</p>
    </div>

    <div class="footer-section">
      <p style="text-align:center">Thank you for your business!</p>
      <p style="text-align:center">${siteName} | Generated on ${formatDate(new Date().toISOString())}</p>
    </div>
  </div>
</body>
</html>`;
}
