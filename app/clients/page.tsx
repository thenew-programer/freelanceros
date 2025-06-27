'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Grid, List, Download, Upload, Users, Building, TrendingUp, DollarSign } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClientForm } from '@/components/clients/client-form';
import { ClientImport } from '@/components/clients/client-import';
import { getCurrentUser } from '@/lib/auth';
import { getClients, getClientStats, exportClientsData } from '@/lib/clients';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Client } from '@/lib/supabase';

const statusColors = {
  potential: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  past: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadClients();
    loadStats();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadClients();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter]);

  const loadClients = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await getClients(user.id, {
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      if (error) {
        toast.error('Failed to load clients');
        return;
      }

      setClients(data || []);
    } catch (error) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await getClientStats(user.id);
      if (error) {
        toast.error('Failed to load client statistics');
        return;
      }

      setStats(data);
    } catch (error) {
      toast.error('Failed to load client statistics');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await exportClientsData(user.id);
      if (error) {
        toast.error('Failed to export client data');
        return;
      }

      // Create and download CSV
      const csvContent = [
        Object.keys(data[0] || {}).join(','),
        ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Client data exported successfully!');
    } catch (error) {
      toast.error('Failed to export client data');
    } finally {
      setExporting(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    loadClients();
    loadStats();
  };

  const handleImportSuccess = () => {
    setShowImport(false);
    loadClients();
    loadStats();
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
            <h1 className="text-3xl font-bold text-black dark:text-white">Clients</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your client relationships and track business opportunities.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleExport}
              disabled={exporting}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {exporting ? (
                <>
                  <Download className="mr-2 h-4 w-4 animate-pulse" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowImport(true)}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black dark:text-white">{stats.total}</div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {stats.active} active, {stats.potential} potential
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black dark:text-white">
                  ${stats.totalValue.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Across {stats.totalProjects} projects
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black dark:text-white">
                  ${Math.round(stats.averageValue).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Per client
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</CardTitle>
                <Building className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black dark:text-white">{stats.totalProjects}</div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Total projects
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and View Controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search clients..."
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
                <SelectItem value="potential">Potential</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'border-gray-300 dark:border-gray-600'
              }
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'border-gray-300 dark:border-gray-600'
              }
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Clients Display */}
        {clients.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <Card key={client.id} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-black dark:text-white truncate">
                          {client.company_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {client.contact_name}
                        </p>
                      </div>
                      <Badge className={statusColors[client.status as keyof typeof statusColors]}>
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p className="truncate">{client.contact_email}</p>
                      {client.contact_phone && (
                        <p className="truncate">{client.contact_phone}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Projects:</span>
                      <span className="font-medium text-black dark:text-white">{client.project_count}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Value:</span>
                      <span className="font-medium text-black dark:text-white">
                        ${(client.total_project_value ?? 0).toLocaleString()}
                      </span>
                    </div>

                    {client.last_contact_date && (
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        Last contact: {format(new Date(client.last_contact_date), 'MMM d, yyyy')}
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Link href={`/clients/${client.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Projects
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Last Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {clients.map((client) => (
                        <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-black dark:text-white">
                                {client.company_name}
                              </div>
                              {client.industry && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {client.industry}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-black dark:text-white">{client.contact_name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{client.contact_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={statusColors[client.status as keyof typeof statusColors]}>
                              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                            {client.project_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                            ${(client.total_project_value ?? 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {client.last_contact_date 
                              ? format(new Date(client.last_contact_date), 'MMM d, yyyy')
                              : 'Never'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Link href={`/clients/${client.id}`}>
                                View
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No clients found' : 'No clients yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start building your client base by adding your first client.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Client
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        {showForm && (
          <ClientForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        )}

        {showImport && (
          <ClientImport
            onSuccess={handleImportSuccess}
            onCancel={() => setShowImport(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}