import Link from "next/link";
import { Program } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryBadge, StatusBadge, SlotProgress } from "@/components/shared/StatusBadges";
import { MapPin, Calendar, ArrowRight, UserCheck } from "lucide-react";

interface ProgramCardProps {
  program: Program;
  linkPrefix?: string; // e.g. "/programs" or "/resident/programs"
  showRegisterButton?: boolean;
}

export default function ProgramCard({
  program,
  linkPrefix = "/programs",
  showRegisterButton = false,
}: ProgramCardProps) {
  const isFull = program.enrolled >= program.slots;

  return (
    <Card className="flex flex-col h-full bg-white border border-slate-200 hover:border-emerald-500 transition-all duration-300 hover:shadow-lg overflow-hidden group rounded-xl">
      {/* Top Banner Image */}
      <div className="h-40 overflow-hidden relative bg-slate-100">
        <img
          src={
            program.imageUrl ||
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80"
          }
          alt={program.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <CategoryBadge category={program.category} />
          <StatusBadge status={program.status} />
        </div>
      </div>

      <CardContent className="flex-1 p-5 space-y-4">
        {/* Title */}
        <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
          {program.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {program.description}
        </p>

        {/* Meta Info */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-start gap-2 text-xs text-slate-700 font-medium">
            <Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-600" />
            <span className="line-clamp-1">{program.schedule}</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
            <span className="line-clamp-1">{program.location}</span>
          </div>
        </div>

        {/* Slots */}
        <div className="pt-2 border-t border-slate-100">
          <SlotProgress enrolled={program.enrolled} total={program.slots} />
        </div>
      </CardContent>

      <CardFooter className="px-5 pb-5 pt-0 gap-2 flex">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold rounded-lg"
          asChild
        >
          <Link href={`${linkPrefix}/${program.id}`}>
            View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </Button>
        {showRegisterButton && !isFull && program.status !== "Completed" && (
          <Button
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex-1 rounded-lg shadow-sm"
            asChild
          >
            <Link href={`${linkPrefix}/${program.id}#register`}>Register</Link>
          </Button>
        )}
        {isFull && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-rose-600 border-rose-200 bg-rose-50 text-xs font-bold"
            disabled
          >
            Slots Full
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
