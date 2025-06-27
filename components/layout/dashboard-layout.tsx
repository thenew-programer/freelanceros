'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Zap, Plus, FileText, FolderOpen, Clock, Users, Settings, ChevronDown } from 'lucide-react';
import { Sidebar } from './sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { UpgradePrompt } from '@/components/subscription/upgrade-prompt';
import { getCurrentUser, signOut } from '@/lib/auth';
import { getUserSubscription } from '@/lib/subscriptions';
import { useSidebarStore } from '@/lib/stores/sidebar-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { isCollapsed } = useSidebarStore();
  const [notifications] = useState([
    { id: 1, title: 'New proposal approved', message: 'E-commerce Website Development has been approved', time: '2 hours ago', unread: true },
    { id: 2, title: 'Milestone completed', message: 'Project Kickoff milestone marked as complete', time: '1 day ago', unread: true },
    { id: 3, title: 'Time entry reminder', message: 'Don\'t forget to log your hours for today', time: '2 days ago', unread: false },
  ]);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const { user, error } = await getCurrentUser();
      
      if (error || !user) {
        router.push('/auth/signin');
        return;
      }
      
      setUser(user);
      
      // Load subscription data
      const { data: subscriptionData } = await getUserSubscription(user.id);
      setSubscription(subscriptionData);
      
      // Show upgrade prompt for free users (with 20% probability)
      if (!subscriptionData || subscriptionData.plan.price_monthly === 0) {
        if (Math.random() < 0.2) {
          setShowUpgradePrompt(true);
        }
      }
      
      setLoading(false);
    }

    loadUser();
  }, [router]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      router.push('/auth/signin');
    }
    setShowSignOutDialog(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-proposal':
        router.push('/proposals');
        break;
      case 'new-project':
        router.push('/projects');
        break;
      case 'start-timer':
        router.push('/time-tracking');
        break;
      case 'view-dashboard':
        router.push('/dashboard');
        break;
      case 'manage-clients':
        router.push('/proposals');
        break;
      case 'settings':
        router.push('/settings');
        break;
      default:
        break;
    }
  };

  const markNotificationAsRead = (notificationId: number) => {
    // In a real app, this would update the notification status in the backend
    toast.success('Notification marked as read');
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex">
      <Sidebar 
        onSignOut={() => setShowSignOutDialog(true)}
        userEmail={user?.email}
        subscription={subscription}
      />
      
      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
      isCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        {/* Sticky Header with rounded corners and better background */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4 flex-shrink-0 mx-4 mt-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            {/* Left side - Search */}
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects, proposals..."
                  className="pl-10 border-gray-300 dark:border-gray-600 bg-white dark:bg-black text-black dark:text-white rounded-lg"
                />
              </div>
            </div>

            {/* Right side - Quick actions and notifications */}
            <div className="flex items-center gap-3">
              {/* Quick Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
                  >
                    <Zap className="h-4 w-4" />
                    <span className="hidden md:inline">Quick Actions</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <DropdownMenuItem 
                    onClick={() => handleQuickAction('new-proposal')}
                    className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    New Proposal
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleQuickAction('new-project')}
                    className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md"
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    New Project
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleQuickAction('start-timer')}
                    className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Start Timer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem 
                    onClick={() => handleQuickAction('view-dashboard')}
                    className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    View Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleQuickAction('manage-clients')}
                    className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Manage Clients
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem 
                    onClick={() => handleQuickAction('settings')}
                    className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative border-gray-300 dark:border-gray-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-80 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-black dark:text-white">Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                    </p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <DropdownMenuItem 
                          key={notification.id}
                          onClick={() => markNotificationAsRead(notification.id)}
                          className={cn(
                            "flex flex-col items-start p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md",
                            notification.unread && "bg-blue-50 dark:bg-blue-900/20"
                          )}
                        >
                          <div className="flex items-start justify-between w-full">
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-medium truncate",
                                notification.unread 
                                  ? "text-black dark:text-white" 
                                  : "text-gray-600 dark:text-gray-400"
                              )}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                                {notification.time}
                              </p>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1 ml-2"></div>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <Bell className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md"
                        asChild
                      >
                        <Link href="/notifications">View All Notifications</Link>
                      </Button>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content - Scrollable with proper spacing */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <ConfirmationDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        title="Sign Out"
        description="Are you sure you want to sign out? You'll need to sign in again to access your account."
        confirmText="Sign Out"
        onConfirm={handleSignOut}
        variant="destructive"
      />

      {/* Upgrade Prompt */}
      {showUpgradePrompt && (
        <UpgradePrompt onClose={() => setShowUpgradePrompt(false)} />
      )}
    </div>
  );
}