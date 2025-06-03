import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check } from 'lucide-react';
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
                'mb-4 rounded-lg border border-nav p-4 transition-colors last:mb-0',
                !notification.read && 'bg-nav/50'
              )}
            >
              <div className="flex items-start justify-between">
                <p className="text-sm text-text-primary">{notification.message}</p>
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
              <p className="mt-1 text-xs text-text-muted">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}