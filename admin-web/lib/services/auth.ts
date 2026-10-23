import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { logAuditEvent } from "./auditLogs";

export async function adminLogin(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Check Primary Owner Admin Account
  if (cleanEmail === "admin@lapasan.gov.ph") {
    const BUILT_IN_PASSWORDS = ["admin2026", "123456", "admin"];
    let customPassword: string | null = null;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("apila_owner_credentials");
        if (saved) customPassword = JSON.parse(saved).password || null;
      } catch {}
    }
    const isValidPassword =
      BUILT_IN_PASSWORDS.includes(password) || (customPassword !== null && customPassword === password);

    if (!isValidPassword) {
      throw new Error("Invalid administrator email or password.");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("apila_admin_logged_in", "true");
      localStorage.setItem(
        "apila_admin_profile",
        JSON.stringify({
          name: "Barangay Admin",
          role: "System Owner / Head Admin",
          email: "admin@lapasan.gov.ph",
          phone: "+63 917 123 4567",
          office: "Office of the Punong Barangay / Owner",
          jurisdiction: "Barangay Lapasan, Cagayan de Oro City",
          initials: "AD",
          status: "Active Session",
          isOwner: true,
        })
      );
    }
    try {
      await logAuditEvent({
        officer: "Barangay Admin",
        action: "Owner signed into Admin Console",
        category: "Security",
        status: "Success",
        ipTerminal: "Admin Console (Owner)",
      });
    } catch {}

    return {
      email: "admin@lapasan.gov.ph",
      uid: "owner-admin",
      displayName: "Barangay Admin",
    } as unknown as User;
  }

  // 2. Check Staff Admin Accounts from Firestore "admins" collection
  try {
    const adminDocRef = doc(db, "admins", cleanEmail);
    const snap = await getDoc(adminDocRef);

    if (snap.exists()) {
      const data = snap.data();
      if (data.status === "Inactive") {
        throw new Error("This administrator account has been deactivated by the Owner.");
      }

      if (data.password === password) {
        if (typeof window !== "undefined") {
          localStorage.setItem("apila_admin_logged_in", "true");
          localStorage.setItem(
            "apila_admin_profile",
            JSON.stringify({
              name: data.name || "Admin Officer",
              role: data.role || "Barangay Officer",
              email: cleanEmail,
              phone: data.phone || "+63 917 000 0000",
              office: data.office || "Barangay Administration",
              jurisdiction: "Barangay Lapasan, Cagayan de Oro City",
              initials: data.initials || "AO",
              status: "Active Session",
              isOwner: false,
            })
          );
        }

        try {
          await logAuditEvent({
            officer: data.name || "Admin Officer",
            action: `${data.name} signed into Admin Console`,
            category: "Security",
            status: "Success",
            ipTerminal: "Admin Console",
          });
        } catch {}

        return {
          email: cleanEmail,
          uid: data.id || `admin-${cleanEmail}`,
          displayName: data.name,
        } as unknown as User;
      }
    }
  } catch (err: any) {
    if (err.message?.includes("deactivated")) {
      throw err;
    }
    console.warn("Firestore admin lookup note:", err);
  }

  // 3. Fallback to Firebase Auth (if user was created via Auth SDK directly)
  try {
    const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
    if (typeof window !== "undefined") {
      localStorage.setItem("apila_admin_logged_in", "true");
      // Check if Firestore has profile info
      try {
        const snap = await getDoc(doc(db, "admins", cleanEmail));
        if (snap.exists()) {
          const data = snap.data();
          localStorage.setItem(
            "apila_admin_profile",
            JSON.stringify({
              name: data.name || result.user.displayName || "Admin Officer",
              role: data.role || "Barangay Officer",
              email: cleanEmail,
              phone: data.phone || "+63 917 000 0000",
              office: data.office || "Barangay Administration",
              jurisdiction: "Barangay Lapasan, Cagayan de Oro City",
              initials: data.initials || "AO",
              status: "Active Session",
              isOwner: false,
            })
          );
        }
      } catch {}
    }
    return result.user;
  } catch (err: any) {
    throw new Error("Invalid administrator email or password.");
  }
}

export async function adminLogout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("apila_admin_logged_in");
  }
  try {
    await signOut(auth);
  } catch {}
}

export function onAuthChange(callback: (user: User | null) => void) {
  const isLocal =
    typeof window !== "undefined" &&
    localStorage.getItem("apila_admin_logged_in") === "true";

  if (isLocal) {
    let savedProfile: any = null;
    try {
      const p = localStorage.getItem("apila_admin_profile");
      if (p) savedProfile = JSON.parse(p);
    } catch {}

    callback({
      email: savedProfile?.email || "admin@lapasan.gov.ph",
      uid: "admin-session",
      displayName: savedProfile?.name || "Barangay Admin",
    } as unknown as User);
  }

  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      callback(user);
    } else if (
      typeof window !== "undefined" &&
      localStorage.getItem("apila_admin_logged_in") === "true"
    ) {
      let savedProfile: any = null;
      try {
        const p = localStorage.getItem("apila_admin_profile");
        if (p) savedProfile = JSON.parse(p);
      } catch {}

      callback({
        email: savedProfile?.email || "admin@lapasan.gov.ph",
        uid: "admin-session",
        displayName: savedProfile?.name || "Barangay Admin",
      } as unknown as User);
    } else {
      callback(null);
    }
  });
}
