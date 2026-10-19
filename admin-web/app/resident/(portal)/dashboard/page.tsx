import type { Metadata } from "next";
import Link from "next/link";
import { demoResidentRegistrations } from "@/lib/mock-data/registrations";
import { mockNotifications } from "@/lib/mock-data/notifications";
import { mockPrograms } from "@/lib/mock-data/programs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RegistrationStatusBadge,
  CategoryBadge,
} from "@/components/shared/StatusBadges";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Bell,
  BookOpen,
  ArrowRight,
  Calendar,
  MapPin,
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard — Resident Portal" };

const upcomingPrograms = mockPrograms
  .filter((p) => p.status === "Active" || p.status === "Upcoming")
  .slice(0, 3);

const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

export default function ResidentDashboardPage() {
  const registrations = demoResidentRegistrations;
  const approved = registrations.filter((r) => r.status === "Approved").length;
  const pending = registrations.filter((r) => r.status === "Pending").length;
  const completed = registrations.filter((r) => r.status === "Completed").length;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Good day, Jose! 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back to your APILA Resident Portal. Here&apos;s what&apos;s
          happening.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Registrations",
            value: registrations.length,
            icon: ClipboardList,
            color: "text-primary",
            bg: "bg-apila-blue-light",
          },
          {
            label: "Approved",
            value: approved,
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Pending",
            value: pending,
            icon: Clock,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
          },
          {
            label: "Unread Notifications",
            value: unreadCount,
            icon: Bell,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Registrations (recent) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">My Registrations</h2>
            <Button variant="ghost" size="sm" className="text-xs text-primary" asChild>
              <Link href="/resident/my-registrations">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {registrations.map((reg) => (
              <Card key={reg.id} className="border-border/60">
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground leading-snug line-clamp-1">
                      {reg.programTitle}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Registered:{" "}
                      {new Date(reg.registeredAt).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <RegistrationStatusBadge status={reg.status} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Programs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Available Programs</h2>
            <Button variant="ghost" size="sm" className="text-xs text-primary" asChild>
              <Link href="/resident/programs">
                Browse All <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingPrograms.map((prog) => (
              <Card
                key={prog.id}
                className="border-border/60 hover:border-primary/30 transition-colors"
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm text-foreground line-clamp-1 flex-1">
                      {prog.title}
                    </p>
                    <CategoryBadge category={prog.category} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {prog.startDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {prog.location.split(",")[0]}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-7"
                    asChild
                  >
                    <Link href={`/resident/programs/${prog.id}`}>
                      View &amp; Register
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent Notifications</h2>
          <Button variant="ghost" size="sm" className="text-xs text-primary" asChild>
            <Link href="/resident/notifications">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="space-y-2">
          {mockNotifications.slice(0, 4).map((notif) => (
            <Card
              key={notif.id}
              className={`border-border/60 transition-colors ${!notif.isRead ? "border-l-4 border-l-primary bg-apila-blue-light/30" : ""}`}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-sm text-foreground">
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notif.createdAt).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
