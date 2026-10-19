import { notFound } from "next/navigation";
import Link from "next/link";
import { mockPrograms } from "@/lib/mock-data/programs";
import { CategoryBadge, StatusBadge, SlotProgress } from "@/components/shared/StatusBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  ClipboardList,
  ArrowLeft,
  Lock,
} from "lucide-react";

export async function generateStaticParams() {
  return mockPrograms.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const program = mockPrograms.find((p) => p.id === id);
  return {
    title: program ? program.title : "Program Not Found",
  };
}

export default async function PublicProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = mockPrograms.find((p) => p.id === id);
  if (!program) notFound();

  const isFull = program.enrolled >= program.slots;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Back + Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/programs"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Programs
          </Link>
          <div className="flex flex-wrap items-start gap-3 mb-3">
            <CategoryBadge category={program.category} />
            <StatusBadge status={program.status} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {program.title}
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card className="border-border/60">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold text-foreground text-lg">About this Program</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {program.description}
                </p>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="border-border/60">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold text-foreground text-lg">
                  Benefits & What You Get
                </h2>
                <ul className="space-y-2">
                  {program.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="border-border/60">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold text-foreground text-lg">Requirements</h2>
                <ul className="space-y-2">
                  {program.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <ClipboardList className="w-4 h-4 text-primary/60 mt-0.5 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Program Details */}
            <Card className="border-border/60">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-foreground">Program Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Schedule</p>
                      <p className="text-foreground">{program.schedule}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                      <p className="text-foreground">{program.location}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3 text-sm">
                    <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Program Officer</p>
                      <p className="text-foreground">{program.officer}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Slot availability */}
            <Card className="border-border/60">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold text-foreground">Slot Availability</h3>
                <SlotProgress enrolled={program.enrolled} total={program.slots} />
              </CardContent>
            </Card>

            {/* Register CTA */}
            <Card className="border-primary/20 bg-apila-blue-light">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Sign in to your resident account to register for this program.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-apila-blue"
                    disabled={isFull || program.status === "Completed"}
                    asChild={!isFull}
                  >
                    {isFull ? (
                      "Program Full"
                    ) : (
                      <Link href="/resident/login">
                        Sign In to Register
                      </Link>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/resident/register">
                      New? Create an Account
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
