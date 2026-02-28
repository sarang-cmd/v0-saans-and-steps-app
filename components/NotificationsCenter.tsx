'use client';

import React, { useState, useEffect } from 'react';
import { notificationManager, type Notification } from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function NotificationsCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateNotifications = (notifs: Notification[]) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    };

    updateNotifications(notificationManager.getNotifications());
    const unsubscribe = notificationManager.subscribe(updateNotifications);

    return unsubscribe;
  }, []);

  const handleMarkAsRead = (id: string) => {
    // Mark as read via update (functionality preserved)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDelete = (id: string) => {
    notificationManager.deleteNotification(id);
  };

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      'optimal-window': '✓',
      'air-quality-alert': '!',
      'weather-alert': '⛅',
      'reminder': '⏰',
      'achievement': '⭐',
      'family-update': '👥',
    };
    return icons[type] || '●';
  };

  return (
    <div className="fixed top-20 right-4 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-card border border-border rounded-full p-3 shadow-lg hover:shadow-xl transition"
          title="Notifications"
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-destructive text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
              {unreadCount}
            </span>
          )}
        </button>
      ) : (
        <Card className="w-96 shadow-2xl max-h-96 overflow-hidden flex flex-col">
          <CardHeader className="border-b bg-card">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <button
                onClick={() => setIsOpen(false)}
                className="text-foreground/60 hover:text-foreground"
              >
                ✕
              </button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-0">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-foreground/60">
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 transition hover:bg-muted/30 ${
                      !notif.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="text-lg flex-shrink-0">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground">
                          {notif.title}
                        </p>
                        <p className="text-xs text-foreground/70 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-foreground/50 mt-2">
                          {new Date(notif.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        {!notif.read && (
                          <Button
                            onClick={() => handleMarkAsRead(notif.id)}
                            size="sm"
                            variant="ghost"
                            className="text-xs"
                          >
                            Read
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDelete(notif.id)}
                          size="sm"
                          variant="ghost"
                          className="text-xs"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
