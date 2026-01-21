'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@devlider001/washlab-backend/api';
import { Id } from "@devlider001/washlab-backend/dataModel"
import { WashStationLayout } from "@/components/washstation/WashStationLayout"
import { useStationSession } from "@/hooks/useStationSession"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  Info,
  Gift,
  Filter,
  Package,
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { EmptyState } from "@/components/washstation/EmptyState"
import { LoadingSpinner } from "@/components/washstation/LoadingSpinner"
import Link from "next/link"

export default function NotificationsPage() {
  const { stationToken } = useStationSession()
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [readFilter, setReadFilter] = useState<string>("all")
  const [selectedNotification, setSelectedNotification] = useState<any>(null)

  const allNotifications =
    useQuery(
      (api.stations as any).getStationNotifications,
      stationToken ? { stationToken, limit: 100 } : "skip"
    ) ?? []

  const unreadCount =
    useQuery(
      (api.stations as any).getStationUnreadCount,
      stationToken ? { stationToken } : "skip"
    ) ?? 0

  const markAsRead = useMutation((api.stations as any).markStationNotificationAsRead)
  const markAllAsRead = useMutation(
    (api.stations as any).markAllStationNotificationsAsRead
  )

  // Filter notifications
  const filteredNotifications = allNotifications.filter((notification: any) => {
    const matchesType = typeFilter === "all" || notification.type === typeFilter
    const matchesRead =
      readFilter === "all" ||
      (readFilter === "read" && notification.isRead) ||
      (readFilter === "unread" && !notification.isRead)
    return matchesType && matchesRead
  })

  const handleMarkAsRead = async (
    notificationId: Id<"notifications"> | string
  ) => {
    if (!stationToken) return
    try {
      await markAsRead({ stationToken, notificationId: notificationId as any })
      toast.success("Marked as read")
    } catch (error) {
      toast.error("Failed to mark as read")
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!stationToken) return
    try {
      await markAllAsRead({ stationToken })
      toast.success("All notifications marked as read")
    } catch (error) {
      toast.error("Failed to mark all as read")
    }
  }

  const handleViewDetails = async (notification: any) => {
    setSelectedNotification(notification)
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className='h-5 w-5' />
      case "order_update":
        return <Bell className='h-5 w-5' />
      case "promotion":
        return <Gift className='h-5 w-5' />
      case "system":
        return <Info className='h-5 w-5' />
      case "alert":
        return <AlertCircle className='h-5 w-5' />
      case "payment":
        return <Bell className='h-5 w-5' />
      default:
        return <Bell className='h-5 w-5' />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "order":
        return "text-blue-600 bg-blue-500/10"
      case "order_update":
        return "text-blue-600 bg-blue-500/10"
      case "promotion":
        return "text-purple-600 bg-purple-500/10"
      case "system":
        return "text-gray-600 bg-gray-500/10"
      case "alert":
        return "text-red-600 bg-red-500/10"
      case "payment":
        return "text-green-600 bg-green-500/10"
      default:
        return "text-blue-600 bg-blue-500/10"
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant='destructive'>High</Badge>
      case "medium":
        return <Badge className='bg-yellow-500'>Medium</Badge>
      case "low":
        return <Badge variant='outline'>Low</Badge>
      default:
        return null
    }
  }

  const isSystemNotification = (notification: any) => {
    return notification.recipientId === "all"
  }

  if (!stationToken) {
    return (
      <WashStationLayout title='Notifications'>
        <LoadingSpinner text='Verifying session...' />
      </WashStationLayout>
    )
  }

  if (allNotifications === undefined) {
    return (
      <WashStationLayout title='Notifications'>
        <LoadingSpinner text='Loading notifications...' />
      </WashStationLayout>
    )
  }

  return (
    <WashStationLayout title='Notifications'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Notifications</h1>
            <p className='text-muted-foreground mt-2'>
              Stay updated with orders and station activities
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant='outline'>
              <CheckCheck className='mr-2 h-4 w-4' />
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className='grid gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total</CardTitle>
              <Bell className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {allNotifications.length}
              </div>
              <p className='text-xs text-muted-foreground'>All notifications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Unread</CardTitle>
              <AlertCircle className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{unreadCount}</div>
              <p className='text-xs text-muted-foreground'>Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Read</CardTitle>
              <CheckCheck className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {allNotifications.length - unreadCount}
              </div>
              <p className='text-xs text-muted-foreground'>Already seen</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className='pt-6'>
            <div className='grid gap-4 sm:grid-cols-2'>
              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder='All Types' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Types</SelectItem>
                  <SelectItem value='order'>Orders</SelectItem>
                  <SelectItem value='order_update'>Order Updates</SelectItem>
                  <SelectItem value='payment'>Payments</SelectItem>
                  <SelectItem value='promotion'>Promotions</SelectItem>
                  <SelectItem value='system'>System</SelectItem>
                  <SelectItem value='alert'>Alerts</SelectItem>
                </SelectContent>
              </Select>

              {/* Read Filter */}
              <Select value={readFilter} onValueChange={setReadFilter}>
                <SelectTrigger>
                  <SelectValue placeholder='All Notifications' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Notifications</SelectItem>
                  <SelectItem value='unread'>Unread Only</SelectItem>
                  <SelectItem value='read'>Read Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>All Notifications</CardTitle>
                <CardDescription>
                  {filteredNotifications.length} notification
                  {filteredNotifications.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <Badge variant='outline' className='gap-1'>
                <Filter className='h-3 w-3' />
                {typeFilter !== "all" || readFilter !== "all"
                  ? "Filtered"
                  : "All"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {filteredNotifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title='No notifications'
                description={
                  typeFilter !== "all" || readFilter !== "all"
                    ? "Try adjusting your filters"
                    : "You're all caught up!"
                }
              />
            ) : (
              <div className='space-y-2'>
                {filteredNotifications.map((notification: any) => (
                  <div
                    key={notification._id}
                    className={`group rounded-lg border p-4 transition-all cursor-pointer ${
                      !notification.isRead
                        ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                        : "hover:border-primary"
                    }`}
                    onClick={() => handleViewDetails(notification)}
                  >
                    <div className='flex items-start gap-3'>
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className='flex-1 min-w-0 space-y-1'>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 flex-wrap mb-1'>
                              <h3 className='font-semibold text-sm'>
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <Badge className='h-5 px-1.5 text-xs bg-blue-600'>
                                  New
                                </Badge>
                              )}
                              {getPriorityBadge(notification.priority)}
                            </div>
                            <p className='text-sm text-muted-foreground line-clamp-2'>
                              {notification.message}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center justify-between'>
                          <p className='text-xs text-muted-foreground'>
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true }
                            )}
                          </p>
                          <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                            {!notification.isRead && (
                              <Button
                                size='sm'
                                variant='ghost'
                                className='h-7 px-2'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkAsRead(notification._id)
                                }}
                              >
                                <Check className='h-3 w-3' />
                              </Button>
                            )}
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

      {/* Notification Details Dialog */}
      {selectedNotification && (
        <Dialog open={true} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent className='max-w-lg'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-full ${getNotificationColor(
                    selectedNotification.type
                  )}`}
                >
                  {getNotificationIcon(selectedNotification.type)}
                </div>
                <span>{selectedNotification.title}</span>
              </DialogTitle>
              <DialogDescription>
                {formatDistanceToNow(new Date(selectedNotification.createdAt), {
                  addSuffix: true,
                })}
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4'>
              <div>
                <h3 className='text-sm font-medium mb-2'>Message</h3>
                <p className='text-sm text-muted-foreground'>
                  {selectedNotification.message}
                </p>
              </div>

              <div className='flex items-center gap-2 flex-wrap'>
                <Badge className='capitalize'>
                  {selectedNotification.type.replace(/_/g, " ")}
                </Badge>
                {getPriorityBadge(selectedNotification.priority)}
                {selectedNotification.isRead && (
                  <Badge variant='outline'>
                    <CheckCheck className='h-3 w-3 mr-1' />
                    Read
                  </Badge>
                )}
              </div>

              {selectedNotification.actionUrl &&
                selectedNotification.actionLabel && (
                  <Button className='w-full' asChild>
                    <Link href={selectedNotification.actionUrl}>
                      {selectedNotification.actionLabel}
                    </Link>
                  </Button>
                )}

              <Separator />

              {!selectedNotification.isRead && (
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => handleMarkAsRead(selectedNotification._id)}
                >
                  <Check className='mr-2 h-4 w-4' />
                  Mark as Read
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </WashStationLayout>
  )
}
