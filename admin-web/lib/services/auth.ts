import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { logAuditEvent } from "./auditLogs";
import {
  getAdminProfile,
  saveAdminProfile,
  verifyOwnerPassword,
  DEFAULT_PROFILE,
} from "./adminProfile";

// Session marker key — only stores the logged-in email, no profile data
const SESSION_KEY = "apila_admin_email";
const LOGGED_IN_KEY = "apila_admin_logged_in";

export async function adminLogin(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Check Primary Owner Admin Account
  if (cleanEmail === "admin@lapasan.gov.ph") {
    const isValid = await verifyOwnerPassword(password);
    if (!isValid) {
      throw new Error("Invalid administrator email or password.");
    }

    // Load (or seed) owner profile from Firestore
    const ownerProfile = await getAdminProfile(cleanEmail);

    // Mark session
    if (typeof window !== "undefined") {
      sessionStorage.setItem(LOGGED_IN_KEY, "true");
      sessionStorage.setItem(SESSION_KEY, cleanEmail);
    }

    try {
      await logAuditEvent({
        officer: ownerProfile.name || "Barangay Admin",
        action: "Owner signed into Admin Console",
        category: "Security",
        status: "Success",
        ipTerminal: "Admin Console (Owner)",
      });
    } catch {}

    return {
      email: cleanEmail,
      uid: "owner-admin",
      displayName: ownerProfile.name || "Barangay Admin",
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
        // Ensure their adminProfile doc exists in Firestore with their details
        await saveAdminProfile(cleanEmail, {
          name: data.name || "Admin Officer",
          role: data.role || "Barangay Officer",
          email: cleanEmail,
          phone: data.phone || "+63 917 000 0000",
          office: data.office || "Barangay Administration",
          jurisdiction: "Barangay Lapasan, Cagayan de Oro City",
          initials: data.initials || "AO",
          status: "Active Session",
          isOwner: false,
        });

        // Mark session
        if (typeof window !== "undefined") {
          sessionStorage.setItem(LOGGED_IN_KEY, "true");
          sessionStorage.setItem(SESSION_KEY, cleanEmail);
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

    // Check if Firestore has admin profile info
    try {
      const snap = await getDoc(doc(db, "admins", cleanEmail));
      if (snap.exists()) {
        const data = snap.data();
        await saveAdminProfile(cleanEmail, {
          name: data.name || result.user.displayName || "Admin Officer",
          role: data.role || "Barangay Officer",
          email: cleanEmail,
          phone: data.phone || "+63 917 000 0000",
          office: data.office || "Barangay Administration",
          jurisdiction: "Barangay Lapasan, Cagayan de Oro City",
          initials: data.initials || "AO",
          status: "Active Session",
          isOwner: false,
        });
      }
    } catch {}

    if (typeof window !== "undefined") {
      sessionStorage.setItem(LOGGED_IN_KEY, "true");
      sessionStorage.setItem(SESSION_KEY, cleanEmail);
    }

    return result.user;
  } catch (err: any) {
    throw new Error("Invalid administrator email or password.");
  }
}

export async function adminLogout() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(LOGGED_IN_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }
  try {
    await signOut(auth);
  } catch {}
}

export function onAuthChange(callback: (user: User | null) => void) {
  const isLoggedIn =
    typeof window !== "undefined" &&
    sessionStorage.getItem(LOGGED_IN_KEY) === "true";

  if (isLoggedIn) {
    const email =
      (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) ||
      "admin@lapasan.gov.ph";

    // Provide a minimal stub — the actual profile is loaded from Firestore
    // via AdminProfileContext independently
    callback({
      email,
      uid: "admin-session",
      displayName: "Barangay Admin",
    } as unknown as User);
  }

  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      callback(user);
    } else if (
      typeof window !== "undefined" &&
      sessionStorage.getItem(LOGGED_IN_KEY) === "true"
    ) {
      const email = sessionStorage.getItem(SESSION_KEY) || "admin@lapasan.gov.ph";
      callback({
        email,
        uid: "admin-session",
        displayName: "Barangay Admin",
      } as unknown as User);
    } else {
      callback(null);
    }
  });
}
