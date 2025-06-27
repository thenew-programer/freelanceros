'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateInvoicePDF } from '@/lib/invoices';

interface InvoicePreviewProps {
  invoice: any;
  profile: any;
  businessSettings: any;
  onClose: () => void;
}

export function InvoicePreview({ invoice, profile, businessSettings, onClose }: InvoicePreviewProps) {
  const htmlContent = generateInvoicePDF(invoice, profile, businessSettings);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            Invoice Preview - {invoice.invoice_number}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div 
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </div>
  );
}