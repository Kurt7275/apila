import Link from "next/link";
import { Building2, Phone, Mail, MapPin, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.18_0.04_255)] text-white/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-lg leading-tight">APILA</p>
                <p className="text-xs text-white/50 leading-none">
                  Barangay Lapasan, CDO
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              A Web-Based Barangay Community Program Registration and Participation
              Management System for Barangay Lapasan, Cagayan de Oro City.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/programs", label: "Browse Programs" },
                { href: "/about", label: "About Barangay Lapasan" },
                { href: "/resident/login", label: "Resident Sign In" },
                { href: "/resident/register", label: "Register as Resident" },
                { href: "/admin/login", label: "Admin Login" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Contact Information
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-white/40" />
                <span>
                  Barangay Hall, Lapasan, Cagayan de Oro City, Misamis Oriental
                  9000
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Phone className="w-4 h-4 shrink-0 text-white/40" />
                <span>(088) 858-1234</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Mail className="w-4 h-4 shrink-0 text-white/40" />
                <span>lapasan.brgy@cdocity.gov.ph</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/60">
                <Clock className="w-4 h-4 mt-0.5 shrink-0 text-white/40" />
                <span>Monday – Friday: 8:00 AM – 5:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Barangay Lapasan, Cagayan de Oro City. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            APILA — Barangay Community Program Management System
          </p>
        </div>
      </div>
    </footer>
  );
}
