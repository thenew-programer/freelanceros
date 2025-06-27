'use client';

import { useState } from 'react';
import { Copy, RefreshCw, ExternalLink, Check, Eye, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { getPortalUrl, regeneratePortalId } from '@/lib/portal';
import { toast } from 'sonner';
import type { Project } from '@/lib/supabase';

interface PortalLinkManagerProps {
  project: Project;
  onPortalIdUpdated: (newPortalId: string) => void;
}

export function PortalLinkManager({ project, onPortalIdUpdated }: PortalLinkManagerProps) {
  const [copied, setCopied] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const portalUrl = getPortalUrl(project.client_portal_id);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      toast.success('Portal link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link to clipboard');
    }
  };

  const handleRegeneratePortalId = async () => {
    setIsRegenerating(true);
    try {
      const { data, error } = await regeneratePortalId(project.id, project.user_id);
      
      if (error || !data) {
        toast.error('Failed to regenerate portal link');
        return;
      }

      onPortalIdUpdated(data.client_portal_id);
      toast.success('Portal link regenerated successfully!');
      setShowRegenerateDialog(false);
    } catch (error) {
      toast.error('Failed to regenerate portal link');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleOpenPortal = () => {
    window.open(portalUrl, '_blank');
  };

  return (
    <>
      <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-black dark:text-white text-base">
            <Shield className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Client Portal Access</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="portal-url" className="text-black dark:text-white text-xs font-medium">
              Secure Portal URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="portal-url"
                value={portalUrl}
                readOnly
                className="font-mono text-xs border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 min-w-0"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="flex-shrink-0 border-gray-300 dark:border-gray-600"
                title="Copy portal link"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Share this secure link with your client to give them access to the project portal.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleOpenPortal}
              variant="outline"
              size="sm"
              className="flex-1 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview Portal
            </Button>
            <Button
              onClick={() => setShowRegenerateDialog(true)}
              variant="outline"
              size="sm"
              disabled={isRegenerating}
              className="flex-1 border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate Link'}
            </Button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm min-w-0">
                <p className="font-medium text-blue-900 dark:text-blue-100">Security Features</p>
                <ul className="text-blue-700 dark:text-blue-300 mt-1 space-y-1 text-xs">
                  <li>• Unguessable 16-character portal ID</li>
                  <li>• Rate limiting to prevent abuse</li>
                  <li>• Access monitoring and logging</li>
                  <li>• No authentication required for clients</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm min-w-0">
                <p className="font-medium text-yellow-900 dark:text-yellow-100">Sharing Guidelines</p>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1 text-xs">
                  Only share this link with authorized clients. If compromised, regenerate the link immediately.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regenerate Confirmation Dialog */}
      <ConfirmationDialog
        open={showRegenerateDialog}
        onOpenChange={setShowRegenerateDialog}
        title="Regenerate Portal Link"
        description="This will create a new secure portal URL and invalidate the current one. Your client will need the new link to access the portal. This action cannot be undone."
        confirmText={isRegenerating ? "Regenerating..." : "Regenerate Link"}
        onConfirm={handleRegeneratePortalId}
        variant="default"
        icon={<RefreshCw className="h-5 w-5 text-orange-600" />}
      />
    </>
  );
}