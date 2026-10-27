import { Program, ProgramCategory, ProgramStatus, RegistrationStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Heart,
  Briefcase,
  Users,
  GraduationCap,
  Trophy,
  BookOpen,
  Leaf,
  Shield,
} from "lucide-react";

// ---- Category Badge ----
const categoryConfig: Record<
  ProgramCategory,
  { label: string; className: string; Icon: React.ElementType }
> = {
  Health: {
    label: "Health",
    className: "bg-red-100 text-red-700 border-red-200",
    Icon: Heart,
  },
  Livelihood: {
    label: "Livelihood",
    className: "bg-orange-100 text-orange-700 border-orange-200",
    Icon: Briefcase,
  },
  Youth: {
    label: "Youth",
    className: "bg-purple-100 text-purple-700 border-purple-200",
    Icon: Users,
  },
  "Senior Citizens": {
    label: "Senior Citizens",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    Icon: GraduationCap,
  },
  Sports: {
    label: "Sports",
    className: "bg-green-100 text-green-700 border-green-200",
    Icon: Trophy,
  },
  Scholarship: {
    label: "Scholarship",
    className: "bg-cyan-100 text-cyan-700 border-cyan-200",
    Icon: BookOpen,
  },
  Environment: {
    label: "Environment",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Icon: Leaf,
  },
  "Disaster Relief": {
    label: "Disaster Relief",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Icon: Shield,
  },
  Education: {
    label: "Education",
    className: "bg-sky-100 text-sky-700 border-sky-200",
    Icon: GraduationCap,
  },
  Women: {
    label: "Women",
    className: "bg-pink-100 text-pink-700 border-pink-200",
    Icon: Users,
  },
  "Disaster Risk": {
    label: "Disaster Risk",
    className: "bg-rose-100 text-rose-700 border-rose-200",
    Icon: Shield,
  },
};

export function CategoryBadge({ category }: { category: ProgramCategory }) {
  const config = categoryConfig[category];
  const Icon = config.Icon;
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 text-xs font-medium", config.className)}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

// ---- Status Badge ----
const statusConfig: Record<ProgramStatus, { className: string }> = {
  Active: { className: "bg-green-100 text-green-700 border-green-200" },
  Upcoming: { className: "bg-blue-100 text-blue-700 border-blue-200" },
  Completed: { className: "bg-gray-100 text-gray-600 border-gray-200" },
  Cancelled: { className: "bg-red-100 text-red-600 border-red-200" },
};

export function StatusBadge({ status }: { status: ProgramStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", statusConfig[status].className)}
    >
      {status}
    </Badge>
  );
}

export { StatusBadge as ProgramStatusBadge };

// ---- Registration Status Badge ----
const regStatusConfig: Record<RegistrationStatus, { className: string }> = {
  Pending: { className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  Approved: { className: "bg-green-100 text-green-700 border-green-200" },
  Rejected: { className: "bg-red-100 text-red-600 border-red-200" },
  Completed: { className: "bg-gray-100 text-gray-600 border-gray-200" },
  Cancelled: { className: "bg-slate-100 text-slate-600 border-slate-200" },
};

export function RegistrationStatusBadge({
  status,
}: {
  status: RegistrationStatus;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", regStatusConfig[status].className)}
    >
      {status}
    </Badge>
  );
}

// ---- Slot Progress ----
export function SlotProgress({
  enrolled,
  total,
}: {
  enrolled: number;
  total: number;
}) {
  const pct = Math.round((enrolled / total) * 100);
  const isFull = enrolled >= total;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {enrolled}/{total} enrolled
        </span>
        <span className={isFull ? "text-red-500 font-medium" : ""}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-orange-500" : "bg-primary"
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

