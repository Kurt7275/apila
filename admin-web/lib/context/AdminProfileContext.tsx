"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  AdminProfile,
  DEFAULT_PROFILE,
  getAdminProfile,
  saveAdminProfile,
  resetAdminProfile,
} from "@/lib/services/adminProfile";

export type { AdminProfile };

interface AdminProfileContextType {
  profile: AdminProfile;
  isLoading: boolean;
  updateProfile: (updated: Partial<AdminProfile>) => Promise<void>;
  resetProfile: () => Promise<void>;
  loadProfileForEmail: (email: string) => Promise<void>;
}

const AdminProfileContext = createContext<AdminProfileContextType | undefined>(undefined);

export function AdminProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<AdminProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEmail, setCurrentEmail] = useState("admin@lapasan.gov.ph");

  // On mount: determine which admin is logged in and load their profile
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        // Get email from session marker (set during login)
        let email = "admin@lapasan.gov.ph";
        if (typeof window !== "undefined") {
          const stored = sessionStorage.getItem("apila_admin_email");
          if (stored) email = stored;
        }
        setCurrentEmail(email);
        const loaded = await getAdminProfile(email);
        setProfile(loaded);
      } catch {
        setProfile(DEFAULT_PROFILE);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const loadProfileForEmail = async (email: string) => {
    setIsLoading(true);
    try {
      setCurrentEmail(email);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("apila_admin_email", email);
      }
      const loaded = await getAdminProfile(email);
      setProfile(loaded);
    } catch {
      setProfile(DEFAULT_PROFILE);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updated: Partial<AdminProfile>) => {
    // Auto-compute initials if name changed
    const next = { ...profile, ...updated };
    if (updated.name && !updated.initials) {
      const parts = updated.name.trim().split(/\s+/);
      if (parts.length >= 2) {
        next.initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      } else if (parts.length === 1 && parts[0].length > 0) {
        next.initials = parts[0].slice(0, 2).toUpperCase();
      }
    }
    setProfile(next);
    await saveAdminProfile(currentEmail, next);
  };

  const resetProfile = async () => {
    const defaults: AdminProfile = {
      ...DEFAULT_PROFILE,
      email: currentEmail,
      isOwner: currentEmail === "admin@lapasan.gov.ph",
    };
    setProfile(defaults);
    await resetAdminProfile(currentEmail);
  };

  return (
    <AdminProfileContext.Provider
      value={{ profile, isLoading, updateProfile, resetProfile, loadProfileForEmail }}
    >
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
