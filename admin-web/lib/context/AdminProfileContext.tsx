"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface AdminProfile {
  name: string;
  role: string;
  email: string;
  phone: string;
  office: string;
  jurisdiction: string;
  initials: string;
  status: string;
  isOwner?: boolean;
}

const DEFAULT_PROFILE: AdminProfile = {
  name: "Barangay Admin",
  role: "System Owner / Head Admin",
  email: "admin@lapasan.gov.ph",
  phone: "+63 917 123 4567",
  office: "Office of the Punong Barangay / Owner",
  jurisdiction: "Barangay Lapasan, Cagayan de Oro City",
  initials: "AD",
  status: "Active Session",
  isOwner: true,
};

interface AdminProfileContextType {
  profile: AdminProfile;
  updateProfile: (updated: Partial<AdminProfile>) => void;
  resetProfile: () => void;
}

const AdminProfileContext = createContext<AdminProfileContextType | undefined>(undefined);

const STORAGE_KEY = "apila_admin_profile";

export function AdminProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<AdminProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name === "Maria Santos") {
          setProfile(DEFAULT_PROFILE);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
        } else {
          setProfile(parsed);
        }
      }
    } catch {
      // Fallback to default if localStorage is unavailable
    }
    setIsLoaded(true);
  }, []);

  const updateProfile = (updated: Partial<AdminProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updated };
      // Auto-compute initials if name changed and initials weren't explicitly provided
      if (updated.name && !updated.initials) {
        const parts = updated.name.trim().split(/\s+/);
        if (parts.length >= 2) {
          next.initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        } else if (parts.length === 1 && parts[0].length > 0) {
          next.initials = parts[0].slice(0, 2).toUpperCase();
        }
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage quota / privacy mode fallback
      }
      return next;
    });
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <AdminProfileContext.Provider value={{ profile, updateProfile, resetProfile }}>
      {children}
    </AdminProfileContext.Provider>
  );
}

export function useAdminProfile() {
  const context = useContext(AdminProfileContext);
  if (!context) {
    throw new Error("useAdminProfile must be used within an AdminProfileProvider");
  }
  return context;
}
