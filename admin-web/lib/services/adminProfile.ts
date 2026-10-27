import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  updatedAt?: any;
}

// Each admin gets their own profile doc keyed by email
// Owner always uses "owner" as docId
export function profileDocId(email: string): string {
  if (!email || email === "admin@lapasan.gov.ph") return "owner";
  return email.replace(/[^a-zA-Z0-9]/g, "_");
}

const COL = "adminProfiles";

export const DEFAULT_PROFILE: AdminProfile = {
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

export async function getAdminProfile(email: string): Promise<AdminProfile> {
  try {
    const ref = doc(db, COL, profileDocId(email));
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as AdminProfile;
    }
    // First time — seed defaults
    const defaults: AdminProfile = email === "admin@lapasan.gov.ph"
      ? DEFAULT_PROFILE
      : {
          ...DEFAULT_PROFILE,
          name: "Admin Officer",
          role: "Barangay Officer",
          email,
          isOwner: false,
          initials: "AO",
        };
    await setDoc(ref, { ...defaults, updatedAt: serverTimestamp() });
    return defaults;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function saveAdminProfile(
  email: string,
  profile: Partial<AdminProfile>
): Promise<void> {
  const ref = doc(db, COL, profileDocId(email));
  await setDoc(ref, { ...profile, updatedAt: serverTimestamp() }, { merge: true });
}

export async function resetAdminProfile(email: string): Promise<void> {
  const ref = doc(db, COL, profileDocId(email));
  await setDoc(ref, { ...DEFAULT_PROFILE, email, updatedAt: serverTimestamp() });
}

// ── Owner password stored in Firestore adminConfig/owner ──────────────────
const CONFIG_REF = () => doc(db, "adminConfig", "owner");

const BUILT_IN_PASSWORDS = ["admin2026", "123456", "admin"];

export async function getOwnerPassword(): Promise<string | null> {
  try {
    const snap = await getDoc(CONFIG_REF());
    if (snap.exists() && snap.data().password) {
      return snap.data().password as string;
    }
    return null;
  } catch {
    return null;
  }
}

export async function verifyOwnerPassword(input: string): Promise<boolean> {
  if (BUILT_IN_PASSWORDS.includes(input)) return true;
  const stored = await getOwnerPassword();
  return stored !== null && stored === input;
}

export async function updateOwnerPassword(newPassword: string): Promise<void> {
  await setDoc(
    CONFIG_REF(),
    { password: newPassword, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
