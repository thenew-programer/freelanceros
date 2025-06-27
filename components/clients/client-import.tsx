'use client';

import { useState } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { bulkImportClients, detectDuplicateClients } from '@/lib/clients';
import { getCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';

interface ClientImportProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClientImport({ onSuccess, onCancel }: ClientImportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const [csvData, setCsvData] = useState<any[]>([]);

  const downloadTemplate = () => {
    const template = [
      'company_name,contact_name,contact_email,contact_phone,website,address,city,state,postal_code,country,industry,company_size,status,source,notes,tags',
      'Acme Corp,John Doe,john@acme.com,555-0123,https://acme.com,123 Main St,New York,NY,10001,United States,Technology,11-50,potential,Website,Great potential client,tech startup',
      'Beta Inc,Jane Smith,jane@beta.com,555-0456,https://beta.com,456 Oak Ave,Los Angeles,CA,90210,United States,Healthcare,51-200,active,Referral,Existing client,healthcare enterprise'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });

      setCsvData(data);
      toast.success(`Loaded ${data.length} clients from CSV`);
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (csvData.length === 0) {
      toast.error('Please upload a CSV file first');
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        toast.error('You must be logged in to import clients');
        return;
      }

      // Check for duplicates
      const duplicates = [];
      for (const client of csvData) {
        if (client.contact_email) {
          const { data } = await detectDuplicateClients(user.id, client.contact_email);
          if (data && data.length > 0) {
            duplicates.push(client);
          }
        }
      }

      // Transform CSV data to match our schema
      const clientsToImport = csvData.map(row => ({
        company_name: row.company_name || '',
        contact_name: row.contact_name || '',
        contact_email: row.contact_email || '',
        contact_phone: row.contact_phone || null,
        website: row.website || null,
        address: row.address || null,
        city: row.city || null,
        state: row.state || null,
        postal_code: row.postal_code || null,
        country: row.country || 'United States',
        industry: row.industry || null,
        company_size: row.company_size || null,
        status: row.status || 'potential',
        source: row.source || 'import',
        notes: row.notes || null,
        tags: row.tags ? row.tags.split(';').map((t: string) => t.trim()) : null,
      }));

      const { data, error } = await bulkImportClients(user.id, clientsToImport);
      
      if (error) {
        toast.error('Failed to import clients');
        return;
      }

      setImportResults({
        total: csvData.length,
        imported: data?.length || 0,
        duplicates: duplicates.length,
        failed: csvData.length - (data?.length || 0),
      });

      toast.success(`Successfully imported ${data?.length || 0} clients`);
    } catch (error) {
      toast.error('An unexpected error occurred during import');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-black dark:text-white">Import Clients</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {!importResults ? (
            <>
              {/* Instructions */}
              <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-900 dark:text-blue-100 text-lg">Import Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-blue-800 dark:text-blue-200 text-sm space-y-2">
                    <p>1. Download the CSV template to see the required format</p>
                    <p>2. Fill in your client data using the template</p>
                    <p>3. Upload your completed CSV file</p>
                    <p>4. Review and confirm the import</p>
                  </div>
                  <Button
                    onClick={downloadTemplate}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                </CardContent>
              </Card>

              {/* File Upload */}
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Upload CSV File</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                    <div className="space-y-2">
                      <p className="text-black dark:text-white font-medium">
                        Choose a CSV file to upload
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Maximum file size: 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="mt-4 block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-medium
                        file:bg-black file:text-white
                        dark:file:bg-white dark:file:text-black
                        hover:file:bg-gray-800 dark:hover:file:bg-gray-200"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              {csvData.length > 0 && (
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-black dark:text-white">
                      Preview ({csvData.length} clients)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left p-2 text-black dark:text-white">Company</th>
                            <th className="text-left p-2 text-black dark:text-white">Contact</th>
                            <th className="text-left p-2 text-black dark:text-white">Email</th>
                            <th className="text-left p-2 text-black dark:text-white">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.slice(0, 5).map((client, index) => (
                            <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="p-2 text-black dark:text-white">{client.company_name}</td>
                              <td className="p-2 text-gray-600 dark:text-gray-400">{client.contact_name}</td>
                              <td className="p-2 text-gray-600 dark:text-gray-400">{client.contact_email}</td>
                              <td className="p-2 text-gray-600 dark:text-gray-400">{client.status || 'potential'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {csvData.length > 5 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          ... and {csvData.length - 5} more clients
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={isLoading || csvData.length === 0}
                  className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  {isLoading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-pulse" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import {csvData.length} Clients
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            /* Import Results */
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-600 dark:text-green-400 mb-4" />
                <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                  Import Complete!
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                      {importResults.imported}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      Successfully Imported
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                      {importResults.duplicates}
                    </div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-400">
                      Duplicates Skipped
                    </div>
                  </CardContent>
                </Card>
              </div>

              {importResults.failed > 0 && (
                <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">
                        {importResults.failed} clients failed to import
                      </span>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Please check the data format and try again for failed entries.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={onSuccess}
                  className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}