'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Download, Send, Eye, MoreHorizontal, FileText, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { getCurrentUser, getProfile } from '@/lib/auth';
import { getInvoices, getInvoiceStats, sendInvoice, bulkUpdateInvoiceStatus, getInvoiceById, generateInvoicePDF, downloadPDF } from '@/lib/invoices';
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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
    loadStats();
    loadUserData();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadInvoices();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter]);

  const loadInvoices = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await getInvoices(user.id, {
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      if (error) {
        toast.error('Failed to load invoices');
        return;
      }

      setInvoices(data || []);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await getInvoiceStats(user.id);
      if (error) {
        toast.error('Failed to load invoice statistics');
        return;
      }

      setStats(data);
    } catch (error) {
      toast.error('Failed to load invoice statistics');
    }
  };

  const loadUserData = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const [{ data: profileData }, { data: businessData }] = await Promise.all([
        getProfile(user.id),
        getBusinessSettings(user.id)
      ]);

      setProfile(profileData);
      setBusinessSettings(businessData);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      setActionLoading(invoiceId);
      const { error } = await sendInvoice(invoiceId, user.id);
      if (error) {
        toast.error('Failed to send invoice');
        return;
      }

      toast.success('Invoice sent successfully!');
      loadInvoices();
      loadStats();
    } catch (error) {
      toast.error('Failed to send invoice');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadPDF = async (invoiceId: string) => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      setActionLoading(invoiceId);
      
      // Get the full invoice data
      const { data: invoiceData, error } = await getInvoiceById(invoiceId, user.id);
      
      if (error || !invoiceData) {
        toast.error('Failed to load invoice data');
        return;
      }
      
      // Generate and download PDF
      const htmlContent = generateInvoicePDF(invoiceData, profile, businessSettings);
      downloadPDF(htmlContent, `invoice-${invoiceData.invoice_number}.pdf`);
      
      toast.success('Invoice PDF generated successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedInvoices.length === 0) {
      toast.error('Please select invoices to update');
      return;
    }

    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { error } = await bulkUpdateInvoiceStatus(selectedInvoices, status, user.id);
      if (error) {
        toast.error('Failed to update invoices');
        return;
      }

      toast.success(`Updated ${selectedInvoices.length} invoices`);
      setSelectedInvoices([]);
      loadInvoices();
      loadStats();
    } catch (error) {
      toast.error('Failed to update invoices');
    }
  };

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedInvoices(prev => 
      prev.length === invoices.length ? [] : invoices.map(i => i.id)
    );
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">Invoices</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create, manage, and track your invoices and payments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              asChild
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              <Link href="/invoices/new">
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black dark:text-white">{stats.total}</div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {stats.paid} paid, {stats.overdue} overdue
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black dark:text-white">
                  ${stats.totalAmount.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  ${stats.paidAmount.toLocaleString()} collected
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Outstanding</CardTitle>
                <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black dark:text-white">
                  ${stats.outstandingAmount.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Pending payment
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Require attention
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Bulk Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 dark:border-gray-600"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 border-gray-300 dark:border-gray-600">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="partial">Partially Paid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedInvoices.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedInvoices.length} selected
              </span>
              <Button
                onClick={() => handleBulkStatusUpdate('sent')}
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-600"
              >
                Mark as Sent
              </Button>
              <Button
                onClick={() => handleBulkStatusUpdate('paid')}
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-600"
              >
                Mark as Paid
              </Button>
            </div>
          )}
        </div>

        {/* Invoices Table */}
        {invoices.length > 0 ? (
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.length === invoices.length}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                      </TableHead>
                      <TableHead className="text-black dark:text-white font-medium">Invoice</TableHead>
                      <TableHead className="text-black dark:text-white font-medium">Client</TableHead>
                      <TableHead className="text-black dark:text-white font-medium">Amount</TableHead>
                      <TableHead className="text-black dark:text-white font-medium">Status</TableHead>
                      <TableHead className="text-black dark:text-white font-medium">Due Date</TableHead>
                      <TableHead className="text-black dark:text-white font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedInvoices.includes(invoice.id)}
                            onChange={() => toggleInvoiceSelection(invoice.id)}
                            className="rounded border-gray-300 dark:border-gray-600"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-black dark:text-white">
                              {invoice.invoice_number}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {invoice.title}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {invoice.client_name || 'No client'}
                        </TableCell>
                        <TableCell>
                          <div className="text-black dark:text-white font-medium">
                            ${invoice.total_amount.toLocaleString()}
                          </div>
                          {invoice.paid_amount > 0 && (
                            <div className="text-sm text-green-600 dark:text-green-400">
                              ${invoice.paid_amount.toLocaleString()} paid
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[invoice.status as keyof typeof statusColors]}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="border-gray-300 dark:border-gray-600"
                            >
                              <Link href={`/invoices/${invoice.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            
                            {invoice.status === 'draft' && (
                              <Button
                                onClick={() => handleSendInvoice(invoice.id)}
                                disabled={actionLoading === invoice.id}
                                variant="outline"
                                size="sm"
                                className="border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400"
                              >
                                {actionLoading === invoice.id ? (
                                  <span className="animate-pulse">...</span>
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800">
                                <DropdownMenuItem asChild>
                                  <Link href={`/invoices/${invoice.id}/edit`}>
                                    Edit Invoice
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadPDF(invoice.id)}>
                                  {actionLoading === invoice.id ? 'Generating PDF...' : 'Download PDF'}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No invoices found' : 'No invoices yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first invoice to start billing clients.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button
                  asChild
                  className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  <Link href="/invoices/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Invoice
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}