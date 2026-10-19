import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Shield,
  Users,
  Award,
  Calendar,
  Building,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Barangay Lapasan | APILA Community Portal",
  description:
    "Learn about Barangay Lapasan, Cagayan de Oro City, its leadership, vision, mission, and community program services.",
};

const barangayOfficials = [
  {
    name: "Hon. Ronald S. Ackman",
    title: "Punong Barangay",
    role: "Barangay Chairman",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Hon. Maria Santos",
    title: "Barangay Kagawad",
    role: "Committee on Health & Sanitation",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Hon. Roberto Del Rosario",
    title: "Barangay Kagawad",
    role: "Committee on Youth & Sports Development",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Hon. Elena Cruz",
    title: "Barangay Kagawad",
    role: "Committee on Social Services & Livelihood",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Hon. Juan Gabriel",
    title: "Barangay Kagawad",
    role: "Committee on Disaster Risk Reduction",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Ms. Jennifer Reyes",
    title: "Barangay Secretary",
    role: "Administrative & Public Records",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  },
];

const puroks = [
  "Purok 1 — San Pedro",
  "Purok 2 — Sto. Niño",
  "Purok 3 — San Roque",
  "Purok 4 — Sta. Cruz",
  "Purok 5 — San Jose",
  "Purok 6 — Sagrado Corazon",
  "Purok 7 — Fatima",
  "Purok 8 — San Juan",
  "Purok 9 — Immaculate Concepcion",
  "Purok 10 — Riverside",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-emerald-950 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/60 border border-emerald-700/50 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Building className="w-4 h-4 text-emerald-400" />
            Cagayan de Oro City, District II
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            About Barangay Lapasan
          </h1>
          <p className="text-emerald-100/90 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Serving over 32,000 residents with transparent governance, inclusive community development, and accessible public welfare programs.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Mission & Vision Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-emerald-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-600 text-white">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Our Vision
                  </CardTitle>
                  <p className="text-xs text-slate-500 font-normal">
                    Future-Ready Barangay Lapasan
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-600 leading-relaxed">
                Barangay Lapasan envisions a progressive, peaceful, resilient, and eco-friendly coastal community where every resident enjoys equal opportunity, efficient public service delivery, empowered youth, and a vibrant local economy in Cagayan de Oro City.
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-600 text-white">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Our Mission
                  </CardTitle>
                  <p className="text-xs text-slate-500 font-normal">
                    Dedicated Service & Integrity
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-600 leading-relaxed">
                To deliver proactive, transparent, and digitally accessible public services through sustainable social welfare programs, continuous skills training, disaster resilience planning, and active community participation under the APILA portal.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What is APILA Section */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="max-w-3xl">
            <span className="text-emerald-700 font-bold text-xs tracking-wider uppercase">
              Digital Government Platform
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1 mb-4">
              What is APILA?
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-emerald-800">APILA</strong> (Barangay Community Program Registration and Participation Management System) is the official digital portal for Barangay Lapasan. Derived from the Cebuano word <em>"Apila"</em> (to join or participate), the platform bridges residents and barangay officials.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {[
                "Instant Program Online Registration",
                "Real-Time Approval & Status Updates",
                "SMS & Email Program Notifications",
                "Transparent Participant Rosters",
                "Fair Allocation per Purok",
                "Digital Resident Identification",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700 text-sm font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Barangay Officials Grid */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Barangay Leadership & Officials
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Dedicated public servants working continuously to improve Barangay Lapasan.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {barangayOfficials.map((official, idx) => (
              <Card key={idx} className="bg-white border-slate-200 overflow-hidden hover:border-emerald-300 transition-all">
                <div className="h-48 bg-slate-100 relative">
                  <img
                    src={official.image}
                    alt={official.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="font-bold text-lg leading-tight">{official.name}</h3>
                    <p className="text-xs text-emerald-300 font-medium">{official.title}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-slate-600">{official.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Coverage Area / Puroks */}
        <section className="bg-emerald-900 text-white rounded-2xl p-8 shadow-md">
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Barangay Lapasan Purok Coverage
            </h2>
            <p className="text-emerald-200 text-sm">
              APILA serves residents across all 10 Purok sub-communities in Barangay Lapasan, Cagayan de Oro City.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {puroks.map((purok, idx) => (
              <div
                key={idx}
                className="bg-emerald-800/80 border border-emerald-700 rounded-lg p-3 text-center text-xs font-semibold text-emerald-100 hover:bg-emerald-700 transition-colors"
              >
                {purok}
              </div>
            ))}
          </div>
        </section>

        {/* Contact & Location Info */}
        <section className="grid md:grid-cols-2 gap-8">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Barangay Hall Location & Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Barangay Hall Address</p>
                  <p>CM Recto Avenue, Lapasan, Cagayan de Oro City, Misamis Oriental 9000</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Office Operating Hours</p>
                  <p>Monday – Friday: 8:00 AM – 5:00 PM</p>
                  <p className="text-xs text-slate-400">Closed on Weekends and Official Holidays</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Telephone / Hotline</p>
                  <p>(088) 856-1234 / (0917) 890-LAPASAN</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Email Address</p>
                  <p>info@lapasan.gov.ph / apila@lapasan.gov.ph</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Location Mock */}
          <Card className="bg-white border-slate-200 overflow-hidden flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-slate-900">
                Interactive Map Location
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative min-h-[240px] bg-slate-100 flex items-center justify-center">
              <div className="text-center p-6 space-y-2">
                <MapPin className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-bold text-slate-800">Barangay Lapasan Hall</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Located near Limketkai Center & USTP Campus, CM Recto Avenue, CDO City
                </p>
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                    Open in Google Maps
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Footer Callout */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 rounded-2xl p-8 text-white text-center sm:text-left sm:flex items-center justify-between shadow-md">
          <div>
            <h3 className="text-xl font-bold">Ready to participate in Lapasan community programs?</h3>
            <p className="text-emerald-100 text-sm mt-1">Register for an APILA account today or view active programs.</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3 shrink-0">
            <Button asChild className="bg-white text-emerald-950 hover:bg-slate-100 font-semibold">
              <Link href="/resident/register">Create Account</Link>
            </Button>
            <Button asChild variant="outline" className="border-emerald-300 text-white hover:bg-emerald-800">
              <Link href="/programs">Browse Programs</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
