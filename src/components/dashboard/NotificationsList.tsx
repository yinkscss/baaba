import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Calendar, Home, CreditCard, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { useNotifications } from '../../hooks/useDashboard';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';

interface NotificationsListProps {
  userId: string;
}

export function NotificationsList({ userId }: NotificationsListProps) {
  const { data: notifications, isLoading, markAsRead } = useNotifications(userId);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'inspection_request':
        return <Calendar className="h-4 w-4 text-accent-blue" />;
      case 'property':
        return <Home className="h-4 w-4 text-accent-green" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-warning-DEFAULT" />;
      case 'application':
        return <AlertTriangle className="h-4 w-4 text-accent-blue" />;
      default:
        return <Bell className="h-4 w-4 text-text-secondary" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'inspection_request':
        return 'border-l-accent-blue';
      case 'property':
        return 'border-l-accent-green';
      case 'payment':
        return 'border-l-warning-DEFAULT';
      case 'application':
        return 'border-l-accent-blue';
      default:
        return 'border-l-text-muted';
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-nav">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-r-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-nav">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Notifications</CardTitle>
        <Bell className="h-5 w-5 text-text-secondary" />
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {notifications?.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                'mb-4 rounded-lg border-l-4 border border-nav p-4 transition-colors last:mb-0',
                !notification.read && 'bg-nav/50',
                getNotificationColor(notification.type)
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">{notification.message}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead.mutate(notification.id)}
                    className="ml-2 h-6 w-6 p-0"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {notifications?.length === 0 && (
          <div className="text-center py-8">
            <Bell className="mx-auto mb-4 h-12 w-12 text-text-muted" />
            <p className="text-text-secondary">No notifications yet</p>
            <p className="text-sm text-text-muted">
              You'll see updates about your properties and requests here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}