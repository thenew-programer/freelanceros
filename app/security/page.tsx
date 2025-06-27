'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Shield, 
  Key, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Monitor, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { getCurrentUser } from '@/lib/auth';
import { 
  changePassword, 
  validatePasswordStrength, 
  getUserSessions, 
  revokeSession, 
  revokeAllSessions,
  deleteUserAccount
} from '@/lib/settings';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { UserSession } from '@/lib/supabase';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SecurityPage() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ isValid: boolean; score: number; feedback: string[] }>({ isValid: false, score: 0, feedback: [] });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRevokeAllDialog, setShowRevokeAllDialog] = useState(false);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const newPassword = watch('newPassword');

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (newPassword) {
      setPasswordStrength(validatePasswordStrength(newPassword));
    } else {
      setPasswordStrength({ isValid: false, score: 0, feedback: [] });
    }
  }, [newPassword]);

  const loadSessions = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await getUserSessions(user.id);
      if (error) {
        toast.error('Failed to load sessions');
        return;
      }

      setSessions(data || []);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (data: PasswordFormData) => {
    setChangingPassword(true);
    try {
      const { error } = await changePassword(data.newPassword);
      if (error) {
        toast.error(error.message || 'Failed to change password');
        return;
      }

      toast.success('Password changed successfully!');
      reset();
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSession(sessionId);
    try {
      const { error } = await revokeSession(sessionId);
      if (error) {
        toast.error('Failed to revoke session');
        return;
      }

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success('Session revoked successfully');
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setRevokingSession(null);
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { error } = await revokeAllSessions(user.id);
      if (error) {
        toast.error('Failed to revoke sessions');
        return;
      }

      setSessions([]);
      toast.success('All sessions revoked successfully');
      setShowRevokeAllDialog(false);
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { error } = await deleteUserAccount(user.id);
      if (error) {
        toast.error('Failed to delete account');
        return;
      }

      toast.success('Account deleted successfully');
      // Redirect will happen automatically due to auth state change
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Medium';
    return 'Strong';
  };

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return Monitor;
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return Smartphone;
    }
    return Monitor;
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
            <h1 className="text-3xl font-bold text-black dark:text-white">Security</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account security and authentication settings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Password Change */}
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-black dark:text-white">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      className="pr-10 border-gray-300 dark:border-gray-600"
                      {...register('currentPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-sm text-red-600">{errors.currentPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-black dark:text-white">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      className="pr-10 border-gray-300 dark:border-gray-600"
                      {...register('newPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-sm text-red-600">{errors.newPassword.message}</p>
                  )}
                  
                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Password Strength</span>
                        <span className={`text-sm font-medium ${
                          passwordStrength.score <= 2 ? 'text-red-600' :
                          passwordStrength.score <= 4 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {getPasswordStrengthText(passwordStrength.score)}
                        </span>
                      </div>
                      <Progress 
                        value={(passwordStrength.score / 6) * 100} 
                        className={`h-2 ${getPasswordStrengthColor(passwordStrength.score)}`}
                      />
                      {passwordStrength.feedback.length > 0 && (
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {passwordStrength.feedback.map((item, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <X className="h-3 w-3 text-red-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-black dark:text-white">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      className="pr-10 border-gray-300 dark:border-gray-600"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={changingPassword || !passwordStrength.isValid}
                  className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  {changingPassword ? 'Changing Password...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">Not Enabled</p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                  >
                    Enable 2FA
                  </Button>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p>Two-factor authentication adds an extra layer of security by requiring:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Your password (something you know)</li>
                    <li>Your phone or authenticator app (something you have)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Sessions */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              {sessions.length > 1 && (
                <Button
                  onClick={() => setShowRevokeAllDialog(true)}
                  variant="outline"
                  size="sm"
                  className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Revoke All Sessions
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session) => {
                  const DeviceIcon = getDeviceIcon(session.user_agent);
                  const isCurrentSession = session.session_token === 'current'; // This would need to be determined properly
                  
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <DeviceIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-black dark:text-white">
                              {session.user_agent?.includes('Chrome') ? 'Chrome' :
                               session.user_agent?.includes('Firefox') ? 'Firefox' :
                               session.user_agent?.includes('Safari') ? 'Safari' :
                               session.user_agent?.includes('Edge') ? 'Edge' : 'Unknown Browser'}
                            </p>
                            {isCurrentSession && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Current
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {session.ip_address} • Last active {format(new Date(session.last_activity), 'MMM d, yyyy \'at\' h:mm a')}
                          </p>
                        </div>
                      </div>
                      
                      {!isCurrentSession && (
                        <Button
                          onClick={() => handleRevokeSession(session.id)}
                          disabled={revokingSession === session.id}
                          variant="outline"
                          size="sm"
                          className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {revokingSession === session.id ? 'Revoking...' : 'Revoke'}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Monitor className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No active sessions found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-800 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-red-800 dark:text-red-200">Delete Account</h3>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowDeleteDialog(true)}
                    variant="outline"
                    className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Dialogs */}
        <ConfirmationDialog
          open={showRevokeAllDialog}
          onOpenChange={setShowRevokeAllDialog}
          title="Revoke All Sessions"
          description="This will sign you out of all devices except this one. You'll need to sign in again on other devices."
          confirmText="Revoke All Sessions"
          onConfirm={handleRevokeAllSessions}
          variant="destructive"
          icon={<Monitor className="h-5 w-5" />}
        />

        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Account"
          description="This will permanently delete your account and all associated data including proposals, projects, time entries, and settings. This action cannot be undone."
          confirmText="Delete Account"
          onConfirm={handleDeleteAccount}
          variant="destructive"
          icon={<Trash2 className="h-5 w-5" />}
        />
      </div>
    </DashboardLayout>
  );
}