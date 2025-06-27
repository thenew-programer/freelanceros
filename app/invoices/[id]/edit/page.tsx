'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoicePreview } from '@/components/invoices/invoice-preview';
import { getCurrentUser, getProfile } from '@/lib/auth';
import { getInvoiceById, getInvoiceItems, updateInvoice } from '@/lib/invoices';
import { getBusinessSettings } from '@/lib/settings';
import { toast } from 'sonner';

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

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

      // Get profile, business settings, and items
      const [
        { data: profileData },
        { data: businessData },
        { data: itemsData }
      ] = await Promise.all([
        getProfile(user.id),
        getBusinessSettings(user.id),
        getInvoiceItems(invoiceData.id)
      ]);

      // Combine all data
      const fullInvoice = {
        ...invoiceData,
        items: itemsData || []
      };

      setInvoice(fullInvoice);
      setProfile(profileData);
      setBusinessSettings(businessData);

      // Set form values
      setTitle(fullInvoice.title);
      setDescription(fullInvoice.description || '');
      setIssueDate(fullInvoice.issue_date);
      setDueDate(fullInvoice.due_date);
      setNotes(fullInvoice.notes || '');
      setTaxRate(fullInvoice.tax_rate);
      setDiscountAmount(fullInvoice.discount_amount);
    } catch (error) {
      toast.error('Failed to load invoice');
      router.push('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!invoice) return;

    setSaving(true);
    try {
      const updates = {
        title,
        description: description || null,
        issue_date: issueDate,
        due_date: dueDate,
        notes: notes || null,
        tax_rate: taxRate,
        discount_amount: discountAmount,
      };

      const { error } = await updateInvoice(invoice.id, updates);
      if (error) {
        toast.error('Failed to update invoice');
        return;
      }

      toast.success('Invoice updated successfully!');
      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      toast.error('Failed to update invoice');
    } finally {
      setSaving(false);
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

  const previewInvoice = {
    ...invoice,
    title,
    description,
    issue_date: issueDate,
    due_date: dueDate,
    notes,
    tax_rate: taxRate,
    discount_amount: discountAmount,
    tax_amount: (invoice.subtotal - discountAmount) * (taxRate / 100),
    total_amount: invoice.subtotal + ((invoice.subtotal - discountAmount) * (taxRate / 100)) - discountAmount,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-gray-300 dark:border-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Edit Invoice {invoice.invoice_number}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Update invoice details and settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              className="border-gray-300 dark:border-gray-600"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {saving ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-pulse" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-6">
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-black dark:text-white">
                    Invoice Title *
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Website Development Services"
                    className="border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-black dark:text-white">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the work performed..."
                    rows={3}
                    className="border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issue_date" className="text-black dark:text-white">
                      Issue Date *
                    </Label>
                    <Input
                      id="issue_date"
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due_date" className="text-black dark:text-white">
                      Due Date *
                    </Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax_rate" className="text-black dark:text-white">
                      Tax Rate (%)
                    </Label>
                    <Input
                      id="tax_rate"
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.01"
                      className="border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount" className="text-black dark:text-white">
                      Discount Amount
                    </Label>
                    <Input
                      id="discount"
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-black dark:text-white">
                    Notes & Terms
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Payment terms, additional notes, or special instructions..."
                    rows={4}
                    className="border-gray-300 dark:border-gray-600"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="text-black dark:text-white font-medium">
                      ${invoice.subtotal.toFixed(2)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                      <span className="text-black dark:text-white font-medium">
                        -${discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax ({taxRate}%):</span>
                    <span className="text-black dark:text-white font-medium">
                      ${((invoice.subtotal - discountAmount) * (taxRate / 100)).toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-black dark:text-white">Total:</span>
                      <span className="text-black dark:text-white">
                        ${(invoice.subtotal + ((invoice.subtotal - discountAmount) * (taxRate / 100)) - discountAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Client Information</CardTitle>
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
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <InvoicePreview
            invoice={previewInvoice}
            profile={profile}
            businessSettings={businessSettings}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}