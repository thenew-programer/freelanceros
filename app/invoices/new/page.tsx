'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Send, Plus, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getCurrentUser } from '@/lib/auth';
import { getClients } from '@/lib/clients';
import { getProjects } from '@/lib/projects';
import { getBusinessSettings } from '@/lib/settings';
import { createInvoice, createInvoiceItem } from '@/lib/invoices';
import { toast } from 'sonner';
import type { Client, Project } from '@/lib/supabase';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [businessSettings, setBusinessSettings] = useState<any>(null);

  // Invoice form data
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0, total_price: 0 }
  ]);

  // Calculated totals
  const [taxRate, setTaxRate] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Calculate due date based on payment terms
    if (businessSettings?.payment_terms && issueDate) {
      const due = new Date(issueDate);
      due.setDate(due.getDate() + businessSettings.payment_terms);
      setDueDate(due.toISOString().split('T')[0]);
    }
  }, [issueDate, businessSettings]);

  useEffect(() => {
    // Update item totals when quantity or price changes
    setItems(prev => prev.map(item => ({
      ...item,
      total_price: item.quantity * item.unit_price
    })));
  }, []);

  const loadInitialData = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const [clientsResult, projectsResult, settingsResult] = await Promise.all([
        getClients(user.id),
        getProjects(user.id),
        getBusinessSettings(user.id)
      ]);

      if (clientsResult.data) setClients(clientsResult.data);
      if (projectsResult.data) setProjects(projectsResult.data);
      if (settingsResult.data) {
        setBusinessSettings(settingsResult.data);
        setTaxRate(settingsResult.data.tax_rate || 0);
      }
    } catch (error) {
      toast.error('Failed to load initial data');
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit_price: businessSettings?.default_hourly_rate || 0,
      total_price: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updated.total_price = updated.quantity * updated.unit_price;
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
    const total = subtotal + taxAmount - discountAmount;

    return {
      subtotal,
      taxAmount,
      total
    };
  };

  const handleSave = async (sendImmediately = false) => {
    if (!title.trim()) {
      toast.error('Please enter an invoice title');
      return;
    }

    if (items.some(item => !item.description.trim())) {
      toast.error('Please fill in all item descriptions');
      return;
    }

    setLoading(true);
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const selectedClient = clients.find(c => c.id === selectedClientId);
      const totals = calculateTotals();

      // Create invoice
      const invoiceData = {
        user_id: user.id,
        client_id: selectedClientId || null,
        project_id: selectedProjectId || null,
        title,
        description: description || null,
        issue_date: issueDate,
        due_date: dueDate,
        currency: businessSettings?.currency || 'USD',
        subtotal: totals.subtotal,
        tax_rate: taxRate,
        tax_amount: totals.taxAmount,
        discount_amount: discountAmount,
        total_amount: totals.total,
        paid_amount: 0,
        status: sendImmediately ? 'sent' : 'draft',
        payment_terms: businessSettings?.payment_terms || 30,
        notes: notes || null,
        client_name: selectedClient?.company_name || null,
        client_email: selectedClient?.contact_email || null,
        client_address: selectedClient ? 
          [selectedClient.address, selectedClient.city, selectedClient.state, selectedClient.postal_code]
            .filter(Boolean).join(', ') : null,
        sent_at: sendImmediately ? new Date().toISOString() : null,
      };

      const { data: invoice, error: invoiceError } = await createInvoice(invoiceData as any);
      
      if (invoiceError || !invoice) {
        toast.error('Failed to create invoice');
        return;
      }

      // Create invoice items
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await createInvoiceItem({
          invoice_id: invoice.id,
          time_entry_id: null,
          milestone_id: null,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          sort_order: i,
        });
      }

      toast.success(sendImmediately ? 'Invoice created and sent!' : 'Invoice saved as draft');
      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      toast.error('Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

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
            <h1 className="text-3xl font-bold text-black dark:text-white">Create New Invoice</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create a professional invoice for your client
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleSave(false)}
              disabled={loading}
              variant="outline"
              className="border-gray-300 dark:border-gray-600"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={loading}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              <Send className="mr-2 h-4 w-4" />
              Save & Send
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label className="text-black dark:text-white">Client</Label>
                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                      <SelectTrigger className="border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800">
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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

                <div className="space-y-2">
                  <Label className="text-black dark:text-white">Project (Optional)</Label>
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger className="border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800">
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-black dark:text-white">Line Items</CardTitle>
                  <Button
                    onClick={addItem}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 dark:border-gray-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-5 space-y-2">
                      {index === 0 && (
                        <Label className="text-black dark:text-white">Description</Label>
                      )}
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Description of work"
                        className="border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      {index === 0 && (
                        <Label className="text-black dark:text-white">Qty</Label>
                      )}
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      {index === 0 && (
                        <Label className="text-black dark:text-white">Rate</Label>
                      )}
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      {index === 0 && (
                        <Label className="text-black dark:text-white">Total</Label>
                      )}
                      <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                        <span className="text-black dark:text-white font-medium">
                          ${item.total_price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-1">
                      {items.length > 1 && (
                        <Button
                          onClick={() => removeItem(item.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
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

          {/* Summary Sidebar */}
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
                      ${totals.subtotal.toFixed(2)}
                    </span>
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

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                    <span className="text-black dark:text-white font-medium">
                      ${totals.taxAmount.toFixed(2)}
                    </span>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-black dark:text-white">Total:</span>
                    <span className="text-black dark:text-white">
                      ${totals.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}