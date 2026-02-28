'use client';

import React, { useState, useEffect } from 'react';
import { notificationManager, type ReminderSchedule } from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  const [reminders, setReminders] = useState<ReminderSchedule[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    message: '',
    time: '06:00',
    type: 'daily' as const,
  });

  useEffect(() => {
    setReminders(notificationManager.getReminders());
  }, []);

  const handleCreateReminder = () => {
    if (newReminder.title && newReminder.message) {
      const reminder = notificationManager.createReminder(
        newReminder.title,
        newReminder.message,
        newReminder.time,
        newReminder.type
      );
      setReminders([...reminders, reminder]);
      setNewReminder({ title: '', message: '', time: '06:00', type: 'daily' });
      setIsCreating(false);
    }
  };

  const handleToggleReminder = (id: string) => {
    const reminder = reminders.find((r) => r.id === id);
    if (reminder) {
      notificationManager.updateReminder(id, { enabled: !reminder.enabled });
      setReminders(reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
    }
  };

  const handleDeleteReminder = (id: string) => {
    notificationManager.deleteReminder(id);
    setReminders(reminders.filter((r) => r.id !== id));
  };

  const handleRequestPermission = async () => {
    const permission = await notificationManager.requestPermission();
    alert(`Notification permission: ${permission}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-foreground/70 text-sm mt-1">Notifications & Reminders</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/profile">Back</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Notifications Permission */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Enable browser notifications for alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRequestPermission}>
              Enable Browser Notifications
            </Button>
          </CardContent>
        </Card>

        {/* Reminders */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Reminders</CardTitle>
                <CardDescription>Set up recurring reminders</CardDescription>
              </div>
              <Button onClick={() => setIsCreating(true)}>+ Add Reminder</Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Create Form */}
            {isCreating && (
              <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/30">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newReminder.title}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, title: e.target.value })
                    }
                    placeholder="e.g. Morning Workout"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <textarea
                    value={newReminder.message}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, message: e.target.value })
                    }
                    placeholder="e.g. Check the air quality before going out"
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={newReminder.time}
                      onChange={(e) =>
                        setNewReminder({ ...newReminder, time: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Type
                    </label>
                    <select
                      value={newReminder.type}
                      onChange={(e) =>
                        setNewReminder({
                          ...newReminder,
                          type: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateReminder} className="flex-1">
                    Create
                  </Button>
                  <Button
                    onClick={() => setIsCreating(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Reminders List */}
            {reminders.length === 0 && !isCreating ? (
              <p className="text-center text-foreground/60 py-8">No reminders set up yet</p>
            ) : (
              <div className="space-y-2">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{reminder.title}</p>
                      <p className="text-sm text-foreground/70 mt-1">{reminder.message}</p>
                      <p className="text-xs text-foreground/50 mt-2">
                        {reminder.time} • {reminder.type}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleToggleReminder(reminder.id)}
                        variant={reminder.enabled ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs"
                      >
                        {reminder.enabled ? 'On' : 'Off'}
                      </Button>
                      <Button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        variant="destructive"
                        size="sm"
                        className="text-xs"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
