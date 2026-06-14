import { sendEmail, getSiteSettings } from './email';
import { generateInvoiceHtml, InvoiceWithItems } from './pdf-generator';

function emailWrapper(siteName: string, content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f5f5f5}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,#059669,#0d9488);color:white;padding:30px;text-align:center;border-radius:12px 12px 0 0}.header h1{margin:0;font-size:24px}.content{background:white;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}.footer{text-align:center;padding:20px;color:#9ca3af;font-size:12px}.btn{display:inline-block;background:#059669;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600}</style></head><body><div class="container"><div class="header"><h1>${siteName}</h1></div><div class="content">${content}</div><div class="footer"><p>This email was sent from ${siteName}. Do not reply to this email.</p></div></div></body></html>`;
}

export function buildInvoiceHtml(invoice: InvoiceWithItems, siteName: string): string {
  const fmt = (n: number) => `${invoice.currency} ${n.toFixed(2)}`;

  const itemsTable = invoice.items.map((item) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #f3f4f6;font-size:13px">${item.name}${item.sku ? `<br><span style="color:#9ca3af;font-size:11px">${item.sku}</span>` : ''}</td>
      <td style="padding:8px;text-align:center;border-bottom:1px solid #f3f4f6;font-size:13px">${item.quantity}</td>
      <td style="padding:8px;text-align:right;border-bottom:1px solid #f3f4f6;font-size:13px">${fmt(item.price)}</td>
      <td style="padding:8px;text-align:right;border-bottom:1px solid #f3f4f6;font-size:13px">${fmt(item.total)}</td>
    </tr>
  `).join('');

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  let content = `
    <h2 style="margin-top:0;color:#1f2937">Invoice #${invoice.invoiceNumber}</h2>
    <p style="color:#6b7280;margin-bottom:20px">An invoice has been generated for you by ${siteName}.</p>
    <div style="margin:20px 0;padding:16px;background:#f0fdf4;border-radius:8px;border-left:4px solid #059669">
      <p style="margin:0;color:#065f46"><strong>Total Amount: ${fmt(invoice.total)}</strong></p>
      <p style="margin:4px 0 0;color:#065f46">Due Date: ${formatDate(invoice.dueDate)} | Status: ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</p>
    </div>
  `;

  if (invoice.billingName) {
    content += `<p style="margin-top:16px;margin-bottom:4px;color:#374151"><strong>Bill To:</strong> ${invoice.billingName}</p>`;
  }

  content += `
    <h3 style="font-size:14px;margin-top:20px;margin-bottom:8px;color:#374151">Items</h3>
    <table style="width:100%;border-collapse:collapse">
      <tr style="background:#f9fafb">
        <th style="padding:8px;text-align:left;border-bottom:1px solid #e5e7eb;font-size:12px;text-transform:uppercase;color:#6b7280">Item</th>
        <th style="padding:8px;text-align:center;border-bottom:1px solid #e5e7eb;font-size:12px;text-transform:uppercase;color:#6b7280">Qty</th>
        <th style="padding:8px;text-align:right;border-bottom:1px solid #e5e7eb;font-size:12px;text-transform:uppercase;color:#6b7280">Price</th>
        <th style="padding:8px;text-align:right;border-bottom:1px solid #e5e7eb;font-size:12px;text-transform:uppercase;color:#6b7280">Total</th>
      </tr>
      ${itemsTable}
    </table>
  `;

  content += `
    <div style="margin-top:20px;text-align:right">
      ${invoice.discount > 0 ? `<p style="margin:4px 0;color:#6b7280">Subtotal: ${fmt(invoice.subtotal)}</p>` : ''}
      ${invoice.discount > 0 ? `<p style="margin:4px 0;color:#6b7280">Discount: -${fmt(invoice.discount)}</p>` : ''}
      <p style="margin:4px 0;color:#6b7280">Tax (${invoice.taxRate}%): ${fmt(invoice.tax)}</p>
      <p style="margin:8px 0 0;font-size:18px;font-weight:700;color:#059669">Total: ${fmt(invoice.total)}</p>
    </div>
  `;

  if (invoice.notes) {
    content += `<p style="margin-top:16px;padding:12px;background:#f9fafb;border-radius:6px;font-size:13px;color:#6b7280"><strong>Notes:</strong> ${invoice.notes}</p>`;
  }

  content += `
    <div style="margin-top:24px;text-align:center">
      <p style="color:#6b7280;font-size:13px">Please make payment by the due date. If you have any questions, contact us.</p>
    </div>
  `;

  return emailWrapper(siteName, content);
}

export async function sendInvoiceEmail(invoice: InvoiceWithItems): Promise<boolean> {
  if (!invoice.billingEmail) return false;

  const getSetting = await getSiteSettings();
  const siteName = getSetting('site_name') || 'Store';

  const html = buildInvoiceHtml(invoice, siteName);
  return sendEmail(
    invoice.billingEmail,
    `Invoice #${invoice.invoiceNumber} from ${siteName}`,
    html
  );
}
