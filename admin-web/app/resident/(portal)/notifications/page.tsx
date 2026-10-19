"use client";
import { useState } from "react";
import { mockNotifications } from "@/lib/mock-data/notifications";
import { Notification, NotificationCategory } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Bell,
  CheckCheck,
  Megaphone,
  AlertCircle,
  Info,
  CheckCircle2,
} from "lucide-react";

const categoryIcon: Record<NotificationCategory, React.ElementType> = {
  Announcement: Megaphone,
  Confirmation: CheckCircle2,
  Reminder: AlertCircle,
  Update: Info,
};

const categoryColor: Record<NotificationCategory, string> = {
  Announcement: "text-purple-600 bg-purple-50",
  Confirmation: "text-green-600 bg-green-50",
  Reminder: "text-yellow-600 bg-yellow-50",
  Update: "text-blue-600 bg-blue-50",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<"All" | "Unread" | NotificationCategory>("All");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const filtered = notifications.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.isRead;
    return n.category === filter;
  });

  const filters: Array<"All" | "Unread" | NotificationCategory> = [
    "All", "Unread", "Announcement", "Confirmation", "Reminder", "Update",
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Stay updated on your programs and barangay announcements.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Badge
            key={f}
            variant={filter === f ? "default" : "outline"}
            className="cursor-pointer select-none text-xs"
            onClick={() => setFilter(f)}
          >
            {f}
            {f === "Unread" && unreadCount > 0 && (
              <span className="ml-1 bg-red-500 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Badge>
        ))}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No notifications in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => {
            const Icon = categoryIcon[notif.category];
            return (
              <Card
                key={notif.id}
                className={cn(
                  "border-border/60 cursor-pointer transition-all",
                  !notif.isRead && "border-l-4 border-l-primary"
                )}
                onClick={() => markRead(notif.id)}
              >
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", categoryColor[notif.category])}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn("font-medium text-sm", !notif.isRead ? "text-foreground" : "text-muted-foreground")}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {notif.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notif.createdAt).toLocaleDateString("en-PH", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
