import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { cn } from '../../lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function DashboardCard({
  title,
  value,
  icon,
  description,
  trend,
  className
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn('border border-nav', className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-text-muted">
            {title}
          </CardTitle>
          <div className="h-4 w-4 text-accent-blue">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-text-primary">{value}</div>
          {description && (
            <p className="mt-1 text-sm text-text-secondary">{description}</p>
          )}
          {trend && (
            <div className={cn(
              'mt-2 text-xs',
              trend.isPositive ? 'text-accent-green' : 'text-error-DEFAULT'
            )}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}