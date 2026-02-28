export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface Reminder {
  id: string;
  name: string;
  schedule: 'daily' | 'weekly' | 'custom';
  time?: string;
  enabled: boolean;
}

class NotificationManager {
  private notifications: Map<string, Notification> = new Map();
  private reminders: Map<string, Reminder> = new Map();
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  createNotification(title: string, options?: { message?: string; type?: 'info' | 'success' | 'warning' | 'error' }): Notification {
    const notification: Notification = {
      id: `notif_${Date.now()}`,
      title,
      message: options?.message,
      type: options?.type || 'info',
      read: false,
      createdAt: new Date().toISOString(),
    };

    this.notifications.set(notification.id, notification);
    this.saveToStorage();
    this.notifyListeners();
    return notification;
  }

  getNotifications(): Notification[] {
    return Array.from(this.notifications.values());
  }

  dismissNotification(id: string): void {
    this.notifications.delete(id);
    this.saveToStorage();
    this.notifyListeners();
  }

  createReminder(name: string, schedule: 'daily' | 'weekly' | 'custom', time?: string): Reminder {
    const reminder: Reminder = {
      id: `rem_${Date.now()}`,
      name,
      schedule,
      time,
      enabled: true,
    };

    this.reminders.set(reminder.id, reminder);
    this.saveToStorage();
    return reminder;
  }

  getReminders(): Reminder[] {
    return Array.from(this.reminders.values());
  }

  removeReminder(id: string): void {
    this.reminders.delete(id);
    this.saveToStorage();
  }

  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const notifications = this.getNotifications();
    this.listeners.forEach((listener) => listener(notifications));
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const notifications = Array.from(this.notifications.entries());
      const reminders = Array.from(this.reminders.entries());
      localStorage.setItem('app_notifications', JSON.stringify(notifications));
      localStorage.setItem('app_reminders', JSON.stringify(reminders));
    } catch (error) {
      console.error('[v0] Error saving notifications:', error);
    }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const notifications = localStorage.getItem('app_notifications');
      if (notifications) {
        const entries = JSON.parse(notifications);
        this.notifications = new Map(entries);
      }

      const reminders = localStorage.getItem('app_reminders');
      if (reminders) {
        const entries = JSON.parse(reminders);
        this.reminders = new Map(entries);
      }
    } catch (error) {
      console.error('[v0] Error loading notifications:', error);
    }
  }
}

let notificationInstance: NotificationManager | null = null;

export function getNotificationManager(): NotificationManager {
  if (typeof window === 'undefined') {
    return new NotificationManager();
  }
  if (!notificationInstance) {
    notificationInstance = new NotificationManager();
  }
  return notificationInstance;
}

export const notificationManager = {
  createNotification: (title: string, options?: any) => getNotificationManager().createNotification(title, options),
  dismissNotification: (id: string) => getNotificationManager().dismissNotification(id),
  getNotifications: () => getNotificationManager().getNotifications(),
  createReminder: (name: string, schedule: any, time?: string) => getNotificationManager().createReminder(name, schedule, time),
  removeReminder: (id: string) => getNotificationManager().removeReminder(id),
  getReminders: () => getNotificationManager().getReminders(),
  subscribe: (listener: any) => getNotificationManager().subscribe(listener),
};
