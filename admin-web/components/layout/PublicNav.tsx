"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", active: true },
  { href: "/#about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/#recent-posts", label: "News & Announcements" },
  { href: "/#map", label: "Barangay Map" },
  { href: "/#contact", label: "Contact" },
  { href: "/resident/register", label: "Register" },
  { href: "/resident/login", label: "Login", isButton: true },
];

export default function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full text-white shadow-md"
      style={{ backgroundColor: "#EA580C" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Seal */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Barangay Lapasan Official Logo"
              className="w-10 h-10 object-contain rounded-full bg-white p-0.5 shadow-md group-hover:scale-105 transition-transform"
            />
            <span className="font-extrabold text-xl tracking-tight text-white">
              Barangay Lapasan
            </span>
          </Link>

          {/* Desktop Nav Links matching Screenshot */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4">
            {navLinks.map((link) => {
              if (link.isButton) {
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="ml-2 px-5 py-2 text-sm font-bold text-white rounded-xl transition-colors shadow-sm hover:opacity-90"
                    style={{ backgroundColor: "#C2410C" }}
                  >
                    {link.label}
                  </Link>
                );
              }

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${
                    link.active
                      ? "bg-white/20 text-white font-extrabold border-b-2 border-white"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div
          className="lg:hidden text-white px-4 py-4 space-y-2 border-t border-white/10 shadow-xl"
          style={{ backgroundColor: "#C2410C" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 rounded-md transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
