'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Plus, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Building, 
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ClientForm } from '@/components/clients/client-form';
import { InteractionForm } from '@/components/clients/interaction-form';
import { getCurrentUser } from '@/lib/auth';
import { getClientById, deleteClient } from '@/lib/clients';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Client } from '@/lib/supabase';

const statusColors = {
  potential: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  past: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const interactionTypeColors = {
  email: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  phone: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  meeting: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  proposal: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  contract: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  note: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  follow_up: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadClient();
    }
  }, [params.id]);

  const loadClient = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await getClientById(params.id as string, user.id);
      if (error || !data) {
        toast.error('Client not found');
        router.push('/clients');
        return;
      }

      setClient(data);
    } catch (error) {
      toast.error('Failed to load client');
      router.push('/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await deleteClient(params.id as string);
      if (error) {
        toast.error('Failed to delete client');
        return;
      }

      toast.success('Client deleted successfully');
      router.push('/clients');
    } catch (error) {
      toast.error('Failed to delete client');
    }
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    loadClient();
  };

  const handleInteractionSuccess = () => {
    setShowInteractionForm(false);
    loadClient();
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

  if (!client) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Client not found</p>
        </div>
      </DashboardLayout>
    );
  }

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
                {client.company_name}
              </h1>
              <Badge className={`${statusColors[client.status as keyof typeof statusColors]} flex-shrink-0`}>
                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {client.contact_name} • {client.contact_email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowInteractionForm(true)}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Log Interaction
            </Button>
            <Button
              onClick={() => setShowEditForm(true)}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="outline"
              className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Client Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</CardTitle>
              <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">{client.project_count}</div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">
                ${client.total_project_value.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Proposals</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">
                {client.proposals?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Interactions</CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">
                {client.interactions?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="projects" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
            >
              Projects
            </TabsTrigger>
            <TabsTrigger 
              value="interactions" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
            >
              Interactions
            </TabsTrigger>
            <TabsTrigger 
              value="proposals" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
            >
              Proposals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <a 
                        href={`mailto:${client.contact_email}`}
                        className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {client.contact_email}
                      </a>
                    </div>
                  </div>

                  {client.contact_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                        <a 
                          href={`tel:${client.contact_phone}`}
                          className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {client.contact_phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {client.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Website</p>
                        <a 
                          href={client.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {client.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  )}

                  {(client.address || client.city || client.state) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                        <div className="text-black dark:text-white">
                          {client.address && <p>{client.address}</p>}
                          {(client.city || client.state) && (
                            <p>
                              {client.city}{client.city && client.state && ', '}{client.state} {client.postal_code}
                            </p>
                          )}
                          {client.country && <p>{client.country}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Company Details */}
              <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Company Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {client.industry && (
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Industry</p>
                        <p className="text-black dark:text-white">{client.industry}</p>
                      </div>
                    </div>
                  )}

                  {client.company_size && (
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Company Size</p>
                        <p className="text-black dark:text-white">{client.company_size} employees</p>
                      </div>
                    </div>
                  )}

                  {client.source && (
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Source</p>
                        <p className="text-black dark:text-white">{client.source}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Client Since</p>
                      <p className="text-black dark:text-white">
                        {format(new Date(client.created_at), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  {client.last_contact_date && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Last Contact</p>
                        <p className="text-black dark:text-white">
                          {format(new Date(client.last_contact_date), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  )}

                  {client.tags && client.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {client.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            {client.notes && (
              <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {client.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {client.projects && client.projects.length > 0 ? (
                  <div className="space-y-4">
                    {client.projects.map((project: any) => (
                      <div key={project.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-black dark:text-white">{project.title}</h4>
                          <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </Badge>
                        </div>
                        {project.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {project.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Created {format(new Date(project.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No projects yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-6">
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-black dark:text-white">Communication History</CardTitle>
                  <Button
                    onClick={() => setShowInteractionForm(true)}
                    size="sm"
                    className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Interaction
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {client.interactions && client.interactions.length > 0 ? (
                  <div className="space-y-4">
                    {client.interactions.map((interaction: any) => (
                      <div key={interaction.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={interactionTypeColors[interaction.type as keyof typeof interactionTypeColors]}>
                              {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}
                            </Badge>
                            <h4 className="font-medium text-black dark:text-white">{interaction.subject}</h4>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {format(new Date(interaction.interaction_date), 'MMM d, yyyy \'at\' h:mm a')}
                          </p>
                        </div>
                        {interaction.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {interaction.description}
                          </p>
                        )}
                        {interaction.outcome && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Outcome:</strong> {interaction.outcome}
                          </p>
                        )}
                        {interaction.follow_up_required && (
                          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              Follow-up required
                              {interaction.follow_up_date && (
                                <span> by {format(new Date(interaction.follow_up_date), 'MMM d, yyyy')}</span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No interactions recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proposals" className="space-y-6">
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                {client.proposals && client.proposals.length > 0 ? (
                  <div className="space-y-4">
                    {client.proposals.map((proposal: any) => (
                      <div key={proposal.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-black dark:text-white">{proposal.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-black dark:text-white">
                              ${proposal.amount.toLocaleString()}
                            </span>
                            <Badge className={statusColors[proposal.status as keyof typeof statusColors]}>
                              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        {proposal.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {proposal.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Created {format(new Date(proposal.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No proposals yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {showEditForm && (
          <ClientForm
            client={client}
            onSuccess={handleEditSuccess}
            onCancel={() => setShowEditForm(false)}
          />
        )}

        {showInteractionForm && (
          <InteractionForm
            clientId={client.id}
            onSuccess={handleInteractionSuccess}
            onCancel={() => setShowInteractionForm(false)}
          />
        )}

        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Client"
          description="Are you sure you want to delete this client? This action cannot be undone and will remove all associated data."
          confirmText="Delete Client"
          onConfirm={handleDelete}
          variant="destructive"
          icon={<Trash2 className="h-5 w-5" />}
        />
      </div>
    </DashboardLayout>
  );
}