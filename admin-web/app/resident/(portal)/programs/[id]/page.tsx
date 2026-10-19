"use client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { mockPrograms } from "@/lib/mock-data/programs";
import { demoResidentRegistrations } from "@/lib/mock-data/registrations";
import { CategoryBadge, StatusBadge, SlotProgress } from "@/components/shared/StatusBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin, Calendar, User, CheckCircle2, ClipboardList,
  ArrowLeft, CheckCheck, Clock,
} from "lucide-react";
import { use } from "react";

export default function ResidentProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const program = mockPrograms.find((p) => p.id === id);
  if (!program) notFound();

  const [open, setOpen] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  const alreadyRegistered = demoResidentRegistrations.some(
    (r) => r.programId === id
  );
  const isFull = program.enrolled >= program.slots;

  const handleRegister = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRegistered(true);
      setOpen(false);
    }, 1000);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-6">
      {/* Back */}
      <Link
        href="/resident/programs"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Programs
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <CategoryBadge category={program.category} />
          <StatusBadge status={program.status} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{program.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="border-border/60">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-foreground text-lg">About this Program</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">{program.description}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-6 space-y-3">
              <h2 className="font-semibold text-foreground text-lg">Benefits</h2>
              <ul className="space-y-2">
                {program.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-6 space-y-3">
              <h2 className="font-semibold text-foreground text-lg">Requirements</h2>
              <ul className="space-y-2">
                {program.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <ClipboardList className="w-4 h-4 text-primary/60 mt-0.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-border/60">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Program Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Schedule</p>
                    <p>{program.schedule}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                    <p>{program.location}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Program Officer</p>
                    <p>{program.officer}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-foreground">Slot Availability</h3>
              <SlotProgress enrolled={program.enrolled} total={program.slots} />
            </CardContent>
          </Card>

          {/* Register Card */}
          <Card className={alreadyRegistered || registered ? "border-green-200 bg-green-50" : "border-primary/20 bg-apila-blue-light"}>
            <CardContent className="p-5 space-y-3">
              {alreadyRegistered || registered ? (
                <div className="flex items-center gap-3 text-green-700">
                  <CheckCheck className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">You are registered!</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Your registration is under review.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {isFull ? (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="w-5 h-5 shrink-0" />
                      <p className="text-sm">This program is full. No slots available.</p>
                    </div>
                  ) : program.status === "Completed" ? (
                    <p className="text-sm text-muted-foreground">This program has ended.</p>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Register for this program as Jose Lapasan.
                      </p>
                      <Button
                        className="w-full bg-apila-blue"
                        onClick={() => setOpen(true)}
                        id="register-program-btn"
                      >
                        Register for this Program
                      </Button>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Registration</DialogTitle>
            <DialogDescription>
              You are about to register for <strong>{program.title}</strong>. Your
              registration will be reviewed by the Barangay program officer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Resident:</span> Jose Lapasan
            </p>
            <p>
              <span className="font-medium text-foreground">Program:</span> {program.title}
            </p>
            <p>
              <span className="font-medium text-foreground">Schedule:</span> {program.schedule}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-apila-blue"
              onClick={handleRegister}
              disabled={loading}
              id="confirm-register-btn"
            >
              {loading ? "Submitting..." : "Confirm Registration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
