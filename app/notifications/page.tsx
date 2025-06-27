'use client';

import { useState } from 'react';
import { Bell, Check, Trash2, Settings, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'proposal' | 'project' | 'time' | 'system';
  priority: 'low' | 'medium' | 'high';
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: 'New proposal approved',
    message: 'E-commerce Website Development has been approved by TechCorp Solutions. You can now convert it to a project.',
    time: '2 hours ago',
    unread: true,
    type: 'proposal',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Milestone completed',
    message: 'Project Kickoff milestone for Mobile App Development has been marked as complete.',
    time: '1 day ago',
    unread: true,
    type: 'project',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Time entry reminder',
    message: 'Don\'t forget to log your hours for today. You have 2 active projects that need time tracking.',
    time: '2 days ago',
    unread: false,
    type: 'time',
    priority: 'low'
  },
  {
    id: 4,
    title: 'System maintenance scheduled',
    message: 'FreelancerOS will undergo scheduled maintenance on Sunday, 2:00 AM - 4:00 AM EST.',
    time: '3 days ago',
    unread: false,
    type: 'system',
    priority: 'medium'
  },
  {
    id: 5,
    title: 'Payment received',
    message: 'Payment of $5,000 has been received for Brand Identity Package project.',
    time: '1 week ago',
    unread: false,
    type: 'project',
    priority: 'high'
  },
];

const typeColors = {
  proposal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  project: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  time: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  system: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

const priorityColors = {
  low: 'border-l-gray-300 dark:border-l-gray-600',
  medium: 'border-l-yellow-400 dark:border-l-yellow-500',
  high: 'border-l-red-400 dark:border-l-red-500',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<string>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingNotification, setDeletingNotification] = useState<number | null>(null);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return notification.unread;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, unread: false }
          : notification
      )
    );
    toast.success('Notification marked as read');
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, unread: false }))
    );
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    toast.success('Notification deleted');
    setShowDeleteDialog(false);
    setDeletingNotification(null);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Stay updated with your latest activities and important updates.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                size="sm"
                className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                <Check className="mr-2 h-4 w-4" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Stats and Filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-black dark:text-white">{notifications.length}</span> total notifications
              {unreadCount > 0 && (
                <span className="ml-2">
                  • <span className="font-medium text-blue-600 dark:text-blue-400">{unreadCount}</span> unread
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48 border-gray-300 dark:border-gray-600">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter notifications" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="proposal">Proposals</SelectItem>
                <SelectItem value="project">Projects</SelectItem>
                <SelectItem value="time">Time Tracking</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            {notifications.length > 0 && (
              <Button
                onClick={clearAllNotifications}
                variant="outline"
                size="sm"
                className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={cn(
                  "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 border-l-4 transition-all duration-200 hover:shadow-md",
                  priorityColors[notification.priority],
                  notification.unread && "bg-blue-50 dark:bg-blue-900/10"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={cn(
                          "font-semibold truncate",
                          notification.unread 
                            ? "text-black dark:text-white" 
                            : "text-gray-700 dark:text-gray-300"
                        )}>
                          {notification.title}
                        </h3>
                        <Badge className={typeColors[notification.type]}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </Badge>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {notification.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {notification.unread && (
                        <Button
                          onClick={() => markAsRead(notification.id)}
                          variant="outline"
                          size="sm"
                          className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setDeletingNotification(notification.id);
                          setShowDeleteDialog(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="p-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'all' 
                  ? 'You\'re all caught up! New notifications will appear here.'
                  : `No ${filter} notifications found. Try changing your filter.`
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Notification"
          description="Are you sure you want to delete this notification? This action cannot be undone."
          confirmText="Delete"
          onConfirm={() => deletingNotification && deleteNotification(deletingNotification)}
          variant="destructive"
          icon={<Trash2 className="h-5 w-5" />}
        />
      </div>
    </DashboardLayout>
  );
}