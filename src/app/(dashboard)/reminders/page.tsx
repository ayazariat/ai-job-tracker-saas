"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ReminderWithApp {
  id: string;
  type: "FOLLOW_UP" | "INTERVIEW" | "DEADLINE";
  sendAt: string;
  sent: boolean;
  sentAt: string | null;
  message: string | null;
  application: {
    id: string;
    company: string;
    role: string;
    status: string;
  };
}

const TYPE_CONFIG = {
  FOLLOW_UP: { label: "Follow-up", variant: "default" as const, icon: "📬" },
  INTERVIEW: { label: "Interview", variant: "warning" as const, icon: "🎯" },
  DEADLINE: { label: "Deadline", variant: "destructive" as const, icon: "⏰" },
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState<ReminderWithApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetch("/api/reminders")
      .then((res) => res.json())
      .then((data) => {
        setReminders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleProcessReminders = async () => {
    setProcessing(true);
    try {
      const res = await fetch("/api/reminders/process", { method: "POST" });
      const data = await res.json();
      // Refresh reminders
      const updated = await fetch("/api/reminders").then((r) => r.json());
      setReminders(Array.isArray(updated) ? updated : []);
      alert(`Processed ${data.processed} reminders`);
    } catch (err) {
      console.error("Failed to process reminders:", err);
    } finally {
      setProcessing(false);
    }
  };

  const pendingReminders = reminders.filter((r) => !r.sent);
  const sentReminders = reminders.filter((r) => r.sent);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Reminders</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Automated follow-ups and deadline alerts
          </p>
        </div>
        <Button onClick={handleProcessReminders} disabled={processing}>
          {processing ? "Processing..." : "Process Pending"}
        </Button>
      </div>

      {/* Pending Reminders */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Pending ({pendingReminders.length})
        </h2>
        {pendingReminders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                No pending reminders. They&apos;ll be created automatically when you add applications.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingReminders.map((reminder) => {
              const config = TYPE_CONFIG[reminder.type];
              const isOverdue = new Date(reminder.sendAt) < new Date();

              return (
                <Card key={reminder.id} className={isOverdue ? "border-amber-300 dark:border-amber-700" : ""}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{config.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {reminder.application.company} — {reminder.application.role}
                          </p>
                          <Badge variant={config.variant}>{config.label}</Badge>
                          {isOverdue && <Badge variant="warning">Overdue</Badge>}
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {reminder.message || `Scheduled for ${new Date(reminder.sendAt).toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400">
                      {new Date(reminder.sendAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Sent Reminders */}
      {sentReminders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Sent ({sentReminders.length})
          </h2>
          <div className="space-y-3">
            {sentReminders.map((reminder) => {
              const config = TYPE_CONFIG[reminder.type];

              return (
                <Card key={reminder.id} className="opacity-60">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">✉️</span>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {reminder.application.company} — {reminder.application.role}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Sent {reminder.sentAt ? new Date(reminder.sentAt).toLocaleString() : ""}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{config.label}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
