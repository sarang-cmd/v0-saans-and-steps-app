export type NotificationType = 
  | 'optimal-window'
  | 'air-quality-alert'
  | 'weather-alert'
  | 'reminder'
  | 'achievement'
  | 'family-update';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface ReminderSchedule {
  id: string;
  type: 'daily' | 'weekly' | 'custom';
  title: string;
  message: string;
  time: string; // HH:mm format
  days?: number[]; // 0-6, 0 = Sunday
  enabled: boolean;
  lastTriggered?: string;
}

class NotificationManager {
  private notifications: Map<string, Notification> = new Map();
  private reminders: Map<string, ReminderSchedule> = new Map();
  private notificationPermission: NotificationPermission = 'default';
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.checkPermissions();
  }

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('[v0] Notifications not supported');
      return 'denied';
    }

    if (this.notificationPermission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      return permission;
    } catch (error) {
      console.error('[v0] Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Send a browser notification
   */
  async sendNotification(notification: Notification): Promise<void> {
    if (this.notificationPermission !== 'granted') {
      console.log('[v0] Notification permission not granted');
      return;
    }

    if ('Notification' in window) {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: notification.icon,
          tag: notification.id,
          requireInteraction: notification.priority === 'high',
        });

        if (notification.actionUrl) {
          browserNotification.onclick = () => {
            window.location.href = notification.actionUrl!;
          };
        }
      } catch (error) {
        console.error('[v0] Error sending notification:', error);
      }
    }
  }

  /**
   * Create and store a notification
   */
  async createNotification(
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      icon?: string;
      actionUrl?: string;
      priority?: 'low' | 'medium' | 'high';
      sendBrowserNotification?: boolean;
    }
  ): Promise<Notification> {
    const notification: Notification = {
      id: 'notif_' + Math.random().toString(36).substring(7),
      type,
      title,
      message,
      icon: options?.icon,
      actionUrl: options?.actionUrl,
      timestamp: new Date().toISOString(),
      read: false,
      priority: options?.priority || 'medium',
    };

    this.notifications.set(notification.id, notification);
    this.saveToStorage();
    this.notifyListeners();

    if (options?.sendBrowserNotification !== false) {
      await this.sendNotification(notification);
    }

    return notification;
  }

  /**
   * Create optimal window notification
   */
  async notifyOptimalWindow(
    city: string,
    time: string,
    score: number
  ): Promise<void> {
    await this.createNotification(
      'optimal-window',
      'Optimal Workout Window',
      `Great time to exercise in ${city} at ${time} (Score: ${score}%)`,
      {
        icon: '🏃',
        actionUrl: '/',
        priority: 'high',
      }
    );
  }

  /**
   * Create air quality alert
   */
  async notifyAirQualityAlert(
    city: string,
    aqi: number,
    status: string
  ): Promise<void> {
    const priority = aqi > 200 ? 'high' : 'medium';
    await this.createNotification(
      'air-quality-alert',
      'Air Quality Alert',
      `Air quality in ${city} is ${status} (AQI: ${aqi})`,
      {
        icon: '🌫️',
        actionUrl: '/',
        priority,
      }
    );
  }

  /**
   * Get all notifications
   */
  getNotifications(unreadOnly = false): Notification[] {
    const notifs = Array.from(this.notifications.values());
    if (unreadOnly) {
      return notifs.filter((n) => !n.read);
    }
    return notifs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    const notif = this.notifications.get(id);
    if (notif) {
      notif.read = true;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Delete notification
   */
  deleteNotification(id: string): void {
    this.notifications.delete(id);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Create reminder schedule
   */
  createReminder(
    title: string,
    message: string,
    time: string,
    type: 'daily' | 'weekly' | 'custom' = 'daily',
    days?: number[]
  ): ReminderSchedule {
    const reminder: ReminderSchedule = {
      id: 'reminder_' + Math.random().toString(36).substring(7),
      type,
      title,
      message,
      time,
      days: days || [0, 1, 2, 3, 4, 5, 6], // All days by default
      enabled: true,
    };

    this.reminders.set(reminder.id, reminder);
    this.saveToStorage();
    this.scheduleReminder(reminder);

    return reminder;
  }

  /**
   * Get all reminders
   */
  getReminders(): ReminderSchedule[] {
    return Array.from(this.reminders.values());
  }

  /**
   * Update reminder
   */
  updateReminder(id: string, updates: Partial<ReminderSchedule>): void {
    const reminder = this.reminders.get(id);
    if (reminder) {
      Object.assign(reminder, updates);
      this.saveToStorage();
    }
  }

  /**
   * Delete reminder
   */
  deleteReminder(id: string): void {
    this.reminders.delete(id);
    this.saveToStorage();
  }

  /**
   * Schedule reminder to trigger at specified time
   */
  private scheduleReminder(reminder: ReminderSchedule): void {
    if (!reminder.enabled) return;

    const checkReminder = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      const currentDay = now.getDay();

      if (currentTime === reminder.time && reminder.days?.includes(currentDay)) {
        if (!reminder.lastTriggered || !this.isToday(reminder.lastTriggered)) {
          this.createNotification(
            'reminder',
            reminder.title,
            reminder.message,
            {
              icon: '⏰',
              priority: 'medium',
              sendBrowserNotification: true,
            }
          );

          reminder.lastTriggered = new Date().toISOString();
          this.saveToStorage();
        }
      }

      // Check again in 1 minute
      setTimeout(checkReminder, 60000);
    };

    checkReminder();
  }

  /**
   * Check if date is today
   */
  private isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const notifications = this.getNotifications();
    this.listeners.forEach((listener) => listener(notifications));
  }

  /**
   * Check browser notification permissions
   */
  private checkPermissions(): void {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
    }
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    try {
      const notifications = Array.from(this.notifications.entries());
      const reminders = Array.from(this.reminders.entries());
      localStorage.setItem('app_notifications', JSON.stringify(notifications));
      localStorage.setItem('app_reminders', JSON.stringify(reminders));
    } catch (error) {
      console.error('[v0] Error saving notifications:', error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
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

        // Reschedule reminders on load
        this.reminders.forEach((reminder) => {
          if (reminder.enabled) {
            this.scheduleReminder(reminder);
          }
        });
      }
    } catch (error) {
      console.error('[v0] Error loading notifications:', error);
    }
  }
}

// Singleton instance
export const notificationManager = new NotificationManager();
