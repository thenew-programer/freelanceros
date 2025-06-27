import { supabase } from './supabase';
import type { Invoice, InvoiceItem, InvoicePayment, InvoiceTemplate } from './supabase';

// Invoice CRUD Operations
export async function getInvoices(userId: string, filters?: {
  status?: string;
  clientId?: string;
  projectId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.clientId) {
    query = query.eq('client_id', filters.clientId);
  }

  if (filters?.projectId) {
    query = query.eq('project_id', filters.projectId);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,invoice_number.ilike.%${filters.search}%,client_name.ilike.%${filters.search}%`);
  }

  if (filters?.startDate) {
    query = query.gte('issue_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('issue_date', filters.endDate);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, (filters.offset + (filters.limit || 25)) - 1);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getInvoiceById(id: string, userId: string) {
  // First get the invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (invoiceError || !invoice) {
    return { data: null, error: invoiceError };
  }

  // Get related data separately
  const [
    { data: items },
    { data: payments },
    { data: client },
    { data: project }
  ] = await Promise.all([
    // Get invoice items
    supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id)
      .order('sort_order', { ascending: true }),
    
    // Get payments
    supabase
      .from('invoice_payments')
      .select('*')
      .eq('invoice_id', id)
      .order('payment_date', { ascending: false }),
    
    // Get client if client_id exists
    invoice.client_id ? supabase
      .from('clients')
      .select('*')
      .eq('id', invoice.client_id)
      .single() : Promise.resolve({ data: null, error: null }),
    
    // Get project if project_id exists
    invoice.project_id ? supabase
      .from('projects')
      .select('*')
      .eq('id', invoice.project_id)
      .single() : Promise.resolve({ data: null, error: null })
  ]);

  // Combine all data
  const invoiceWithDetails = {
    ...invoice,
    items: items || [],
    payments: payments || [],
    client: client || null,
    project: project || null
  };

  return { data: invoiceWithDetails, error: null };
}

export async function createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'invoice_number'>) {
  // Generate invoice number
  const { data: invoiceNumber, error: rpcError } = await supabase.rpc('generate_invoice_number', {
    user_uuid: invoice.user_id
  });

  if (rpcError || !invoiceNumber) {
    return { data: null, error: rpcError || new Error('Failed to generate invoice number') };
  }

  const { data, error } = await supabase
    .from('invoices')
    .insert([{ ...invoice, invoice_number: invoiceNumber }])
    .select()
    .single();

  return { data, error };
}

export async function updateInvoice(id: string, updates: Partial<Invoice>) {
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteInvoice(id: string) {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  return { error };
}

// Invoice Items
export async function getInvoiceItems(invoiceId: string) {
  const { data, error } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('sort_order', { ascending: true });

  return { data, error };
}

export async function createInvoiceItem(item: Omit<InvoiceItem, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('invoice_items')
    .insert([item])
    .select()
    .single();

  return { data, error };
}

export async function updateInvoiceItem(id: string, updates: Partial<InvoiceItem>) {
  const { data, error } = await supabase
    .from('invoice_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteInvoiceItem(id: string) {
  const { error } = await supabase
    .from('invoice_items')
    .delete()
    .eq('id', id);

  return { error };
}

export async function bulkUpdateInvoiceItems(items: Partial<InvoiceItem>[]) {
  const { data, error } = await supabase
    .from('invoice_items')
    .upsert(items)
    .select();

  return { data, error };
}

// Invoice Payments
export async function getInvoicePayments(invoiceId: string) {
  const { data, error } = await supabase
    .from('invoice_payments')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('payment_date', { ascending: false });

  return { data, error };
}

export async function createInvoicePayment(payment: Omit<InvoicePayment, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('invoice_payments')
    .insert([payment])
    .select()
    .single();

  return { data, error };
}

export async function updateInvoicePayment(id: string, updates: Partial<InvoicePayment>) {
  const { data, error } = await supabase
    .from('invoice_payments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteInvoicePayment(id: string) {
  const { error } = await supabase
    .from('invoice_payments')
    .delete()
    .eq('id', id);

  return { error };
}

// Invoice Templates
export async function getInvoiceTemplates(userId: string) {
  const { data, error } = await supabase
    .from('invoice_templates')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  return { data, error };
}

export async function getDefaultInvoiceTemplate(userId: string) {
  const { data, error } = await supabase
    .from('invoice_templates')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single();

  return { data, error };
}

export async function createInvoiceTemplate(template: Omit<InvoiceTemplate, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('invoice_templates')
    .insert([template])
    .select()
    .single();

  return { data, error };
}

export async function updateInvoiceTemplate(id: string, updates: Partial<InvoiceTemplate>) {
  const { data, error } = await supabase
    .from('invoice_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteInvoiceTemplate(id: string) {
  const { error } = await supabase
    .from('invoice_templates')
    .delete()
    .eq('id', id);

  return { error };
}

export async function setDefaultTemplate(userId: string, templateId: string) {
  // First, unset all default templates
  await supabase
    .from('invoice_templates')
    .update({ is_default: false })
    .eq('user_id', userId);

  // Then set the new default
  const { data, error } = await supabase
    .from('invoice_templates')
    .update({ is_default: true })
    .eq('id', templateId)
    .eq('user_id', userId)
    .select()
    .single();

  return { data, error };
}

// Analytics and Reporting
export async function getInvoiceStats(userId: string, filters?: {
  startDate?: string;
  endDate?: string;
}) {
  let query = supabase
    .from('invoices')
    .select('status, total_amount, paid_amount, issue_date, due_date')
    .eq('user_id', userId);

  if (filters?.startDate) {
    query = query.gte('issue_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('issue_date', filters.endDate);
  }

  const { data: invoices, error } = await query;

  if (error) return { data: null, error };

  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.total_amount, 0),
    paidAmount: invoices.reduce((sum, i) => sum + i.paid_amount, 0),
    outstandingAmount: invoices.reduce((sum, i) => sum + (i.total_amount - i.paid_amount), 0),
    averageAmount: invoices.length > 0 ? invoices.reduce((sum, i) => sum + i.total_amount, 0) / invoices.length : 0,
  };

  return { data: stats, error: null };
}

export async function getRevenueAnalytics(userId: string, months: number = 12) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const { data, error } = await supabase
    .from('invoices')
    .select('total_amount, paid_amount, issue_date, status')
    .eq('user_id', userId)
    .gte('issue_date', startDate.toISOString().split('T')[0])
    .order('issue_date', { ascending: true });

  if (error) return { data: null, error };

  // Group by month
  const monthlyRevenue: Record<string, { invoiced: number; paid: number }> = {};
  
  data?.forEach(invoice => {
    const month = invoice.issue_date.slice(0, 7); // YYYY-MM
    if (!monthlyRevenue[month]) {
      monthlyRevenue[month] = { invoiced: 0, paid: 0 };
    }
    monthlyRevenue[month].invoiced += invoice.total_amount;
    monthlyRevenue[month].paid += invoice.paid_amount;
  });

  return { data: monthlyRevenue, error: null };
}

export async function getOverdueInvoices(userId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'overdue')
    .order('due_date', { ascending: true });

  return { data, error };
}

// Email and PDF generation
export async function sendInvoice(invoiceId: string, userId: string) {
  // Mark invoice as sent
  const { data, error } = await supabase
    .from('invoices')
    .update({ 
      status: 'sent', 
      sent_at: new Date().toISOString() 
    })
    .eq('id', invoiceId)
    .eq('user_id', userId)
    .select()
    .single();

  return { data, error };
}

export async function markInvoiceViewed(invoiceId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .update({ 
      viewed_at: new Date().toISOString(),
      status: 'viewed'
    })
    .eq('id', invoiceId)
    .select()
    .single();

  return { data, error };
}

// Bulk operations
export async function bulkUpdateInvoiceStatus(invoiceIds: string[], status: string, userId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .update({ status })
    .in('id', invoiceIds)
    .eq('user_id', userId)
    .select();

  return { data, error };
}

export async function bulkDeleteInvoices(invoiceIds: string[], userId: string) {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .in('id', invoiceIds)
    .eq('user_id', userId);

  return { error };
}

// PDF Generation utilities
export function generateInvoicePDF(invoice: any, profile: any, businessSettings: any): string {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
        }
        .logo-section h1 {
          font-size: 32px;
          font-weight: 700;
          margin: 0;
          color: #000;
        }
        .invoice-details {
          text-align: right;
        }
        .invoice-number {
          font-size: 24px;
          font-weight: 600;
          color: #000;
          margin: 0;
        }
        .invoice-date {
          color: #666;
          margin: 5px 0 0 0;
        }
        .addresses {
          display: flex;
          justify-content: space-between;
          margin: 40px 0;
        }
        .address-block {
          flex: 1;
        }
        .address-block h3 {
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          color: #666;
          margin: 0 0 10px 0;
          letter-spacing: 0.5px;
        }
        .address-content {
          color: #333;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 40px 0;
        }
        .items-table th {
          background: #f8f9fa;
          padding: 15px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #dee2e6;
          color: #495057;
        }
        .items-table td {
          padding: 15px;
          border-bottom: 1px solid #dee2e6;
        }
        .items-table .text-right {
          text-align: right;
        }
        .totals {
          margin-left: auto;
          width: 300px;
          margin-top: 20px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }
        .total-row.final {
          border-top: 2px solid #000;
          font-weight: 700;
          font-size: 18px;
          margin-top: 10px;
          padding-top: 15px;
        }
        .notes {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }
        .notes h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 10px 0;
        }
        .footer {
          margin-top: 60px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-section">
          <h1>${businessSettings?.business_name || profile?.full_name || 'FreelancerOS'}</h1>
          ${businessSettings?.business_address ? `<div class="address-content">${businessSettings.business_address}</div>` : ''}
          ${businessSettings?.business_email ? `<div class="address-content">${businessSettings.business_email}</div>` : ''}
          ${businessSettings?.business_phone ? `<div class="address-content">${businessSettings.business_phone}</div>` : ''}
        </div>
        <div class="invoice-details">
          <h2 class="invoice-number">INVOICE ${invoice.invoice_number}</h2>
          <p class="invoice-date">Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}</p>
          <p class="invoice-date">Due Date: ${new Date(invoice.due_date).toLocaleDateString()}</p>
        </div>
      </div>

      <div class="addresses">
        <div class="address-block">
          <h3>Bill To:</h3>
          <div class="address-content">
            <strong>${invoice.client_name || 'Client'}</strong><br>
            ${invoice.client_email || ''}<br>
            ${invoice.client_address || ''}
          </div>
        </div>
        <div class="address-block">
          <h3>Invoice Details:</h3>
          <div class="address-content">
            <strong>Status:</strong> ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}<br>
            <strong>Payment Terms:</strong> ${invoice.payment_terms} days<br>
            <strong>Currency:</strong> ${invoice.currency}
          </div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Rate</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items?.map((item: any) => `
            <tr>
              <td>${item.description}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">$${item.unit_price.toFixed(2)}</td>
              <td class="text-right">$${item.total_price.toFixed(2)}</td>
            </tr>
          `).join('') || ''}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>$${invoice.subtotal.toFixed(2)}</span>
        </div>
        ${invoice.discount_amount > 0 ? `
          <div class="total-row">
            <span>Discount:</span>
            <span>-$${invoice.discount_amount.toFixed(2)}</span>
          </div>
        ` : ''}
        ${invoice.tax_amount > 0 ? `
          <div class="total-row">
            <span>Tax (${invoice.tax_rate}%):</span>
            <span>$${invoice.tax_amount.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="total-row final">
          <span>Total:</span>
          <span>$${invoice.total_amount.toFixed(2)}</span>
        </div>
        ${invoice.paid_amount > 0 ? `
          <div class="total-row">
            <span>Paid:</span>
            <span>$${invoice.paid_amount.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Balance Due:</span>
            <span>$${(invoice.total_amount - invoice.paid_amount).toFixed(2)}</span>
          </div>
        ` : ''}
      </div>

      ${invoice.notes ? `
        <div class="notes">
          <h3>Notes</h3>
          <p>${invoice.notes}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p>Thank you for your business!</p>
        ${businessSettings?.business_name ? `<p>${businessSettings.business_name}</p>` : ''}
      </div>
    </body>
    </html>
  `;

  return html;
}

export function downloadPDF(htmlContent: string, filename: string) {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }
}