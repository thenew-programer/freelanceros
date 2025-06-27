'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Send, 
  Edit, 
  Trash2, 
  Eye, 
  DollarSign, 
  Calendar,
  User,
  FileText,
  CreditCard,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { InvoicePreview } from '@/components/invoices/invoice-preview';
import { getCurrentUser, getProfile } from '@/lib/auth';
import { getInvoiceById, getInvoiceItems, getInvoicePayments, deleteInvoice, sendInvoice, generateInvoicePDF, downloadPDF } from '@/lib/invoices';
import { getBusinessSettings } from '@/lib/settings';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Invoice } from '@/lib/supabase';

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  viewed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

interface InvoiceWithDetails extends Invoice {
  client?: any;
  project?: any;
  items?: any[];
  payments?: any[];
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadInvoice();
    }
  }, [params.id]);

  const loadInvoice = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      // Get invoice basic data
      const { data: invoiceData, error: invoiceError } = await getInvoiceById(params.id as string, user.id);
      
      if (invoiceError || !invoiceData) {
        toast.error('Invoice not found');
        router.push('/invoices');
        return;
      }

      // Get profile and business settings
      const [
        { data: profileData },
        { data: businessData },
        { data: itemsData },
        { data: paymentsData }
      ] = await Promise.all([
        getProfile(user.id),
        getBusinessSettings(user.id),
        getInvoiceItems(invoiceData.id),
        getInvoicePayments(invoiceData.id)
      ]);

      // Combine all data
      const fullInvoice = {
        ...invoiceData,
        items: itemsData || [],
        payments: paymentsData || []
      };

      setInvoice(fullInvoice);
      setProfile(profileData);
      setBusinessSettings(businessData);
    } catch (error) {
      toast.error('Failed to load invoice');
      router.push('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!invoice) return;
    
    setActionLoading('send');
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { error } = await sendInvoice(invoice.id, user.id);
      if (error) {
        toast.error('Failed to send invoice');
        return;
      }

      toast.success('Invoice sent successfully!');
      loadInvoice();
    } catch (error) {
      toast.error('Failed to send invoice');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadPDF = () => {
    if (!invoice) return;

    setActionLoading('download');
    try {
      const htmlContent = generateInvoicePDF(invoice, profile, businessSettings);
      downloadPDF(htmlContent, `invoice-${invoice.invoice_number}.pdf`);
      toast.success('PDF generated successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;

    try {
      const { error } = await deleteInvoice(invoice.id);
      if (error) {
        toast.error('Failed to delete invoice');
        return;
      }

      toast.success('Invoice deleted successfully');
      router.push('/invoices');
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Invoice not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const balanceDue = invoice.total_amount - invoice.paid_amount;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-gray-300 dark:border-gray-600 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white truncate">
                Invoice {invoice.invoice_number}
              </h1>
              <Badge className={`${statusColors[invoice.status as keyof typeof statusColors]} flex-shrink-0`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {invoice.client_name} • ${invoice.total_amount.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleDownloadPDF}
              disabled={actionLoading === 'download'}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {actionLoading === 'download' ? (
                <>
                  <Download className="mr-2 h-4 w-4 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
            
            {invoice.status === 'draft' && (
              <Button
                onClick={handleSendInvoice}
                disabled={actionLoading === 'send'}
                className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                {actionLoading === 'send' ? (
                  <>
                    <Send className="mr-2 h-4 w-4 animate-pulse" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Invoice
                  </>
                )}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <DropdownMenuItem 
                  onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                  className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Invoice
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Invoice
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Invoice Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-black dark:text-white text-base">
                <DollarSign className="h-4 w-4" />
                Total Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">
                ${invoice.total_amount.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {invoice.currency}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-black dark:text-white text-base">
                <CreditCard className="h-4 w-4" />
                Paid Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${invoice.paid_amount.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {invoice.payments?.length || 0} payments
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-black dark:text-white text-base">
                <FileText className="h-4 w-4" />
                Balance Due
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balanceDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                ${balanceDue.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {balanceDue > 0 ? 'Outstanding' : 'Paid in full'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-black dark:text-white text-base">
                <Calendar className="h-4 w-4" />
                Due Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-black dark:text-white">
                {format(new Date(invoice.due_date), 'MMM d, yyyy')}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {invoice.payment_terms} day terms
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <User className="h-5 w-5" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Client Name</p>
                  <p className="font-medium text-black dark:text-white">{invoice.client_name}</p>
                </div>
                {invoice.client_email && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-black dark:text-white">{invoice.client_email}</p>
                  </div>
                )}
                {invoice.client_address && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                    <p className="font-medium text-black dark:text-white">{invoice.client_address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800">
                        <TableHead className="text-black dark:text-white font-medium">Description</TableHead>
                        <TableHead className="text-black dark:text-white font-medium text-right">Qty</TableHead>
                        <TableHead className="text-black dark:text-white font-medium text-right">Rate</TableHead>
                        <TableHead className="text-black dark:text-white font-medium text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.items?.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableCell className="font-medium text-black dark:text-white">
                            {item.description}
                          </TableCell>
                          <TableCell className="text-right text-gray-600 dark:text-gray-400">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right text-gray-600 dark:text-gray-400">
                            ${item.unit_price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-black dark:text-white">
                            ${item.total_price.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal:</span>
                    <span>${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.discount_amount > 0 && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Discount:</span>
                      <span>-${invoice.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.tax_amount > 0 && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Tax ({invoice.tax_rate}%):</span>
                      <span>${invoice.tax_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-black dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span>Total:</span>
                    <span>${invoice.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {invoice.notes && (
              <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {invoice.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Invoice Details */}
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Issue Date</p>
                  <p className="font-medium text-black dark:text-white">
                    {format(new Date(invoice.issue_date), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                  <p className="font-medium text-black dark:text-white">
                    {format(new Date(invoice.due_date), 'MMMM d, yyyy')}
                  </p>
                </div>
                {invoice.sent_at && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sent Date</p>
                    <p className="font-medium text-black dark:text-white">
                      {format(new Date(invoice.sent_at), 'MMMM d, yyyy')}
                    </p>
                  </div>
                )}
                {invoice.paid_at && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Paid Date</p>
                    <p className="font-medium text-black dark:text-white">
                      {format(new Date(invoice.paid_at), 'MMMM d, yyyy')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            {invoice.payments && invoice.payments.length > 0 && (
              <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invoice.payments.map((payment: any) => (
                      <div key={payment.id} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-200">
                            ${payment.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {format(new Date(payment.payment_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        {payment.payment_method && (
                          <Badge variant="secondary" className="text-xs">
                            {payment.payment_method}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setShowPreview(true)}
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Invoice
                </Button>
                
                {balanceDue > 0 && (
                  <Button
                    variant="outline"
                    className="w-full border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Record Payment
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Invoice"
          description="Are you sure you want to delete this invoice? This action cannot be undone and will remove all associated data."
          confirmText="Delete Invoice"
          onConfirm={handleDelete}
          variant="destructive"
          icon={<Trash2 className="h-5 w-5" />}
        />

        {/* Preview Modal */}
        {showPreview && (
          <InvoicePreview
            invoice={invoice}
            profile={profile}
            businessSettings={businessSettings}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}