'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@devlider001/washlab-backend/api';
import { useStationSession } from '@/hooks/useStationSession';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Clock,
  User,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  CreditCard,
  Package,
  Fingerprint,
  Activity as ActivityIcon
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { LoadingSpinner } from '@/components/washstation/LoadingSpinner';
import { EmptyState } from '@/components/washstation/EmptyState';

export function ActivityContent() {
  const { stationToken } = useStationSession();
  const [searchQuery, setSearchQuery] = useState('');

  const activityLogs = useQuery(
    api.stations.getStationActivityLogs,
    stationToken ? { stationToken, limit: 200 } : 'skip'
  );

  const isLoading = activityLogs === undefined;

  // Filter activities by search query
  const filteredActivities = activityLogs?.filter((log) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        log.actor?.name?.toLowerCase().includes(query) ||
        log.actor?.email?.toLowerCase().includes(query) ||
        log.action?.toLowerCase().includes(query) ||
        log.entityType?.toLowerCase().includes(query) ||
        log.entityId?.toLowerCase().includes(query) ||
        log.details?.toLowerCase().includes(query)
      );
    }
    return true;
  }) ?? [];

  const getActionIcon = (action: string) => {
    if (action.includes('clock_in')) return <LogIn className="w-4 h-4" />;
    if (action.includes('clock_out')) return <LogOut className="w-4 h-4" />;
    if (action.includes('payment')) return <CreditCard className="w-4 h-4" />;
    if (action.includes('order')) return <Package className="w-4 h-4" />;
    if (action.includes('verification') || action.includes('biometric')) return <Fingerprint className="w-4 h-4" />;
    return <ActivityIcon className="w-4 h-4" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('clock_in')) return 'bg-green-500/10 text-green-600 dark:text-green-400';
    if (action.includes('clock_out')) return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    if (action.includes('payment')) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    if (action.includes('order')) return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
    if (action.includes('verification') || action.includes('biometric')) return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    if (action.includes('error') || action.includes('failed')) return 'bg-red-500/10 text-red-600 dark:text-red-400';
    return 'bg-muted text-muted-foreground';
  };

  const getActionLabel = (action: string) => {
    // Format action string to readable label
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getActorName = (actor: any) => {
    if (!actor) return 'Unknown';
    return actor.name || actor.email || 'Unknown';
  };

  const getActorTypeBadge = (actorType: string) => {
    switch (actorType) {
      case 'attendant':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400">Attendant</Badge>;
      case 'admin':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400">Admin</Badge>;
      case 'customer':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400">Customer</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="Loading activity logs..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ActivityIcon className="w-5 h-5" />
                Activity Log
              </CardTitle>
              <CardDescription className="mt-1">
                View all station activities and actions
              </CardDescription>
            </div>
            {activityLogs && activityLogs.length > 0 && (
              <Badge variant="outline" className="text-sm">
                {activityLogs.length} entries
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, action, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardContent className="p-0">
          {filteredActivities.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={ActivityIcon}
                title="No activity found"
                description={
                  searchQuery
                    ? 'Try adjusting your search query'
                    : 'No activity logs found for this station'
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredActivities.map((log) => (
                <div
                  key={log._id}
                  className="p-5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              {log.actor ? (
                                <>
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <p className="font-medium text-foreground">
                                    {getActorName(log.actor)}
                                  </p>
                                  {getActorTypeBadge(log.actor.type)}
                                </>
                              ) : (
                                <p className="font-medium text-foreground">System</p>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-foreground mb-1">
                            {getActionLabel(log.action)}
                          </p>
                          {log.entityType && log.entityId && (
                            <p className="text-xs text-muted-foreground mb-1">
                              {log.entityType}: {log.entityId.slice(0, 30)}...
                            </p>
                          )}
                          {log.attendanceId && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              Attendance Linked
                            </Badge>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium text-foreground">
                            {format(new Date(log.timestamp), 'h:mm a')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(log.timestamp), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
