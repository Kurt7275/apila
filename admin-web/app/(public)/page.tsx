"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building,
  Users,
  BookOpen,
  FileText,
  MapPin,
  Phone,
  Calendar,
  CheckCircle,
  Play,
  ArrowRight,
  Search,
  Bell,
  Heart,
  Briefcase,
  Trophy,
  Activity,
  X,
  ExternalLink,
  ChevronRight,
  Megaphone,
  House,
  Shield,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { mockPrograms } from "@/lib/mock-data/programs";
import ProgramCard from "@/components/shared/ProgramCard";

const BarangayMap = dynamic(() => import("@/components/shared/BarangayMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] rounded-xl bg-slate-100 flex items-center justify-center">
      <span className="text-slate-500 text-sm">Loading map…</span>
    </div>
  ),
});

const typingHeroText =
  "A Barangay Community Program Registration and Participation Management System for Barangay Lapasan, Cagayan de Oro City.";

const heroBgImages = [
  {
    url: "/api/hero-bg",
    caption: "Barangay Lapasan Aerial View - Dense Community Aerial View",
  },
  {
    url: "https://e-barangayportal.online/img/image5.png?auto=format&fit=crop&w=1920&q=80",
    caption: "Barangay Lapasan Community Center Aerial View",
  },
  {
    url: "https://e-barangayportal.online/img/image4.png?auto=format&fit=crop&w=1920&q=80",
    caption: "Lapasan Community Assembly & Enrolment Center",
  },
  {
    url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1920&q=80",
    caption: "Barangay Lapasan Disaster Risk Management Overview",
  },
];

const apilaProgramCategories = [
  {
    id: "health",
    title: "Health & Maternal Services",
    desc: "Free medical checkups, dental missions, supplemental feeding, and child immunization program registration.",
    icon: Heart,
    link: "/programs?category=Health",
  },
  {
    id: "livelihood",
    title: "Livelihood & Skills Training",
    desc: "Vocational skills workshops, meat processing, computer literacy, and micro-business starter kit grants.",
    icon: Briefcase,
    link: "/programs?category=Livelihood",
  },
  {
    id: "youth",
    title: "Youth & Sports Development",
    desc: "Barangay sports tournaments, SK leadership summits, cultural workshops, and youth empowerment activities.",
    icon: Trophy,
    link: "/programs?category=Youth",
  },
  {
    id: "senior",
    title: "Senior Citizens Assistance",
    desc: "Quarterly pension distribution schedules, wellness consultations, and senior citizen aid registration.",
    icon: Users,
    link: "/programs?category=Senior+Citizens",
  },
  {
    id: "scholarship",
    title: "Barangay Educational Grants",
    desc: "College and high school scholarship assistance programs for deserving Lapasan youth residents.",
    icon: GraduationCap,
    link: "/programs?category=Scholarship",
  },
  {
    id: "drrm",
    title: "DRRM & Emergency Relief",
    desc: "Disaster risk reduction training, flood safety preparedness, and emergency relief distribution rosters.",
    icon: Shield,
    link: "/programs?category=Disaster+Relief",
  },
];

const newsPosts = [
  {
    id: 1,
    title: "APILA COMMUNITY PROGRAM REGISTRATION PORTAL LAUNCH",
    date: "September 10, 2026",
    category: "COMMUNITY ANNOUNCEMENT",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    title: "NUTRITION MONTH & SUPPLEMENTAL FEEDING ENROLLMENT",
    date: "September 8, 2026",
    category: "HEALTH PROGRAM",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    title: "BARANGAY LAPASAN DRRM DISASTER PREPAREDNESS WORKSHOP",
    date: "September 5, 2026",
    category: "SAFETY & RELIEF",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
  },
];

export default function APILAOfficialLandingPage() {
  const [displayedText, setDisplayedText] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  // Modals
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  // Auto-cycle hero background images every 10 seconds
  useEffect(() => {
    const cycleTimer = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroBgImages.length);
    }, 10000);
    return () => clearInterval(cycleTimer);
  }, []);

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const speed = 20;
    const timer = setInterval(() => {
      if (i < typingHeroText.length) {
        setDisplayedText(typingHeroText.slice(0, i + 1));
        i++;
      } else {
        setTypingComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col pt-16 sm:pt-20">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH AERIAL BACKGROUND & ROYAL BLUE OVERLAY */}
      {/* ========================================================================= */}
      <section
        id="hero"
        className="relative bg-[#EA580C] text-white min-h-[540px] lg:min-h-[600px] flex flex-col justify-between"
      >
        {/* Background Aerial Photo Cycle */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {heroBgImages.map((img, idx) => (
            <img
              key={img.url}
              src={img.url}
              alt={img.caption}
              className={`absolute inset-0 w-full h-full object-cover filter brightness-90 contrast-105 scale-105 transition-opacity duration-[2000ms] ease-in-out ${
                idx === heroImageIndex ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            />
          ))}

          {/* Thin Soft Orange Overlay */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ backgroundColor: "rgba(234, 88, 12, 0.40)" }}
          />

        </div>

        {/* Hero Foreground Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-28 relative z-10 w-full flex-1 flex flex-col justify-center">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <p className="text-white/80 text-xs font-semibold uppercase tracking-widest">
                AI-Powered System
              </p>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-md">
                Apila Portal
              </h1>

              <p className="text-white text-lg sm:text-xl font-medium leading-relaxed drop-shadow min-h-[72px]">
                {displayedText}
                <span className="animate-cursor-blink inline-block align-middle w-[2px] h-[0.85em] bg-white rounded-sm ml-0.5" />
              </p>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center px-10 py-3.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/60 text-white font-bold text-base sm:text-lg tracking-wide backdrop-blur-md shadow-lg transition-all transform hover:scale-105 cursor-pointer active:scale-95"
                >
                  About Us
                </button>
              </div>
            </div>

            {/* Right Content — APILA Official Seal Badge */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative w-72 h-72 sm:w-88 sm:h-88 lg:w-96 lg:h-96 rounded-full bg-white/20 border-4 border-white/40 p-3 backdrop-blur-md shadow-2xl flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Barangay Lapasan Official Seal"
                  className="w-full h-full object-contain rounded-full shadow-2xl bg-white p-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3 FLOATING BIG VIBRANT ORANGE CARDS (Perfect Alignment, No Clipping) */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mb-20 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Community Programs & Enrolment */}
            <Link
              href="/programs"
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white p-8 rounded-2xl shadow-xl transition-all transform hover:-translate-y-2 cursor-pointer text-center flex flex-col items-center justify-center space-y-4 border border-white/20 group min-h-[180px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Community Programs & Enrolment</h3>
            </Link>

            {/* Card 2: News & Announcements */}
            <div
              onClick={() => {
                document.getElementById("recent-posts")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white p-8 rounded-2xl shadow-xl transition-all transform hover:-translate-y-2 cursor-pointer text-center flex flex-col items-center justify-center space-y-4 border border-white/20 group min-h-[180px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Megaphone className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">All News & Announcements</h3>
            </div>

            {/* Card 3: Barangay Lapasan Map */}
            <div
              onClick={() => setMapModalOpen(true)}
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white p-8 rounded-2xl shadow-xl transition-all transform hover:-translate-y-2 cursor-pointer text-center flex flex-col items-center justify-center space-y-4 border border-white/20 group min-h-[180px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Barangay Lapasan Map</h3>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ABOUT APILA SECTION */}
      {/* ========================================================================= */}
      <section id="about" className="pt-32 pb-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge className="bg-orange-100 text-orange-800 border-orange-200 mb-2 px-3 py-1 text-xs uppercase font-bold">
              ABOUT APILA PORTAL
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              About APILA System
            </h2>
            <p className="text-slate-600 text-base">
              Barangay Community Program Registration and Participation Management System for Barangay Lapasan, Cagayan de Oro City.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 leading-snug">
                Our main objective is to empower all 32,000+ Barangay Lapasan residents across 10 Purok sub-communities with transparent, online access to community programs.
              </h3>
              <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80"
                  alt="Barangay Lapasan Community Center"
                  className="w-full h-64 object-cover"
                />
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Derived from the Cebuano word <em>&quot;Apila&quot;</em> (to join or participate), <strong>APILA</strong> connects residents directly with barangay officials and program coordinators. Residents can view available slots, submit one-click online registrations, track application approval statuses in real time, and receive instant SMS advisories for medical missions, livelihood training, youth leagues, and DRRM relief distribution.
              </p>
            </div>

            {/* Right Column — Registration Guide + Video Container */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 italic">
                APILA Resident Account Registration Guide
              </h3>

              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Step 1:</strong> Click on the &quot;Register&quot; button in the navigation header to create your resident account.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Step 2:</strong> Fill in your personal details and select your Barangay Lapasan Purok residence (Puroks 1 to 10).
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Step 3:</strong> Once your profile is verified, log in to browse active community programs and enrol with 1 click.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Additional Information:</strong> Watch the tutorial video below for a complete walk-through of the APILA registration process.
                  </span>
                </li>
              </ul>

              {/* Video Player Container */}
              <div className="relative rounded-2xl overflow-hidden h-72 bg-slate-900 shadow-xl border-4 border-slate-100 flex items-center justify-center group">
                <img
                  src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80"
                  alt="Video Thumbnail"
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => setVideoModalOpen(true)}
                  className="absolute z-10 w-20 h-20 rounded-full bg-orange-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                  aria-label="Play Guide Video"
                >
                  <Play className="w-10 h-10 fill-white ml-1" />
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setVideoModalOpen(true)}
                  className="text-sm font-semibold text-orange-600 hover:underline"
                >
                  Watch APILA System Tutorial Video →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. APILA PROGRAM CATEGORIES & COMMUNITY SERVICES */}
      {/* ========================================================================= */}
      <section id="services" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              APILA Program Categories & Services
            </h2>
            <p className="text-slate-600 text-base">
              Online Registration & Participation Management across all Barangay Lapasan community service sectors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apilaProgramCategories.map((s) => {
              const Icon = s.icon;
              return (
                <Card
                  key={s.id}
                  className="bg-white border-slate-200 hover:border-orange-500 transition-all hover:shadow-lg flex flex-col justify-between"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="font-bold text-xl text-slate-900">{s.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>

                    <div className="pt-4 border-t border-slate-100">
                      <Link
                        href={s.link}
                        className="text-sm font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1"
                      >
                        Enrol in Category Programs <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ACTIVE APILA COMMUNITY PROGRAMS CATALOG */}
      {/* ========================================================================= */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
                APILA PROGRAM ENROLMENT
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                Active Programs Open for Registration
              </h2>
            </div>
            <Button asChild variant="outline" className="border-orange-600 text-orange-700 hover:bg-orange-50 text-xs font-bold">
              <Link href="/programs">View All Programs ({mockPrograms.length}) →</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {mockPrograms.slice(0, 3).map((program) => (
              <ProgramCard key={program.id} program={program} linkPrefix="/programs" />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. RECENT NEWS & ANNOUNCEMENTS SECTION */}
      {/* ========================================================================= */}
      <section id="recent-posts" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              Recent News & Advisories
            </h2>
            <p className="text-slate-600 text-base">
              Keep up to date with the latest news, announcements, and program schedules from Barangay Lapasan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {newsPosts.map((post) => (
              <Card key={post.id} className="bg-white border-slate-200 overflow-hidden hover:shadow-lg transition-all">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6 space-y-3">
                  <span className="text-[11px] font-bold text-orange-600 tracking-wider">
                    {post.category}
                  </span>
                  <h3 className="font-bold text-lg text-slate-900 leading-snug hover:text-orange-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500">{post.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CONTACT & FOOTER SECTION */}
      {/* ========================================================================= */}
      <section id="contact" className="bg-[#1E293B] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid md:grid-cols-3 gap-8 border-b border-slate-700 pb-10">
            <div>
              <h4 className="font-bold text-lg mb-3">Barangay Lapasan Hall</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                CM Recto Avenue, Lapasan, Cagayan de Oro City, Misamis Oriental 9000
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3">Office Operating Hours</h4>
              <p className="text-xs text-slate-400">Monday – Friday: 8:00 AM – 5:00 PM</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3">Emergency Contact Numbers</h4>
              <p className="text-xs text-slate-400">BERT Emergency: (088) 856-9111</p>
              <p className="text-xs text-slate-400">Lapasan Police (PS3): (088) 856-4321</p>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Barangay Lapasan, Cagayan de Oro City. APILA E-Barangay Portal. All rights reserved.
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. VIDEO GUIDE MODAL */}
      {/* ========================================================================= */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Play className="w-5 h-5 text-orange-600 fill-orange-600" /> APILA Portal Tutorial Video
              </h3>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video rounded-xl bg-black overflow-hidden flex items-center justify-center">
              <iframe
                src="https://www.youtube.com/embed/__T5GuTENL4?autoplay=1"
                title="APILA Portal Guide Video"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. BARANGAY MAP MODAL */}
      {/* ========================================================================= */}
      {mapModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Barangay Lapasan Map</h3>
                  <p className="text-xs text-slate-500">CM Recto Avenue, Cagayan de Oro City</p>
                </div>
              </div>
              <button
                onClick={() => setMapModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <BarangayMap />
          </div>
        </div>
      )}
    </div>
  );
}
