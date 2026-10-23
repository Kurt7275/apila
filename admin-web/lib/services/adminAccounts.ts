import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "@/lib/firebase";
import { logAuditEvent } from "./auditLogs";

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  office: string;
  initials: string;
  password?: string;
  status: "Active" | "Inactive";
  createdBy: string;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

const COL = "admins";

const firebaseConfig = {
  apiKey: "AIzaSyBaTrL0f9IYorgNJ1h96LlPhJmSm9065m0",
  authDomain: "apila-barangay.firebaseapp.com",
  projectId: "apila-barangay",
  storageBucket: "apila-barangay.firebasestorage.app",
  messagingSenderId: "686449307162",
  appId: "1:686449307162:web:66df4e62ddec2993de2ba3",
  measurementId: "G-3GZYM9LS65",
};

export async function getAdminAccounts(): Promise<AdminAccount[]> {
  try {
    const q = query(collection(db, COL), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminAccount));
  } catch (err) {
    // If indexing or order issue, fallback to un-ordered fetch
    const snap = await getDocs(collection(db, COL));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminAccount));
  }
}

export async function createAdminAccount(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  office: string;
  createdBy?: string;
}): Promise<AdminAccount> {
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanName = data.name.trim();
  const cleanRole = data.role.trim();
  const cleanOffice = data.office.trim() || "Barangay Administration";

  // Compute initials
  const parts = cleanName.split(/\s+/);
  let initials = "AD";
  if (parts.length >= 2) {
    initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  } else if (parts.length === 1 && parts[0].length > 0) {
    initials = parts[0].slice(0, 2).toUpperCase();
  }

  // 1. Attempt to create the user in Firebase Auth using a secondary app
  // This ensures the current logged-in owner session is NOT switched!
  try {
    const secondaryAppName = "AdminProvisioner_" + Date.now();
    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);
    await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, data.password);
  } catch (authErr: any) {
    // If email already exists in Auth, or email auth is restricted,
    // continue to store in Firestore admins collection as authorized admin
    console.warn("Firebase Auth provision note:", authErr.message);
  }

  // 2. Save admin record in Firestore 'admins' collection
  const adminDocRef = doc(db, COL, cleanEmail);
  const newAccount: AdminAccount = {
    id: cleanEmail,
    name: cleanName,
    email: cleanEmail,
    role: cleanRole,
    office: cleanOffice,
    initials,
    password: data.password, // Stored for credential verification
    status: "Active",
    createdBy: data.createdBy || "Barangay Admin (Owner)",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(adminDocRef, newAccount, { merge: true });

  // 3. Log audit event
  try {
    await logAuditEvent({
      officer: data.createdBy || "Barangay Admin",
      action: `Created new administrator account for ${cleanName} (${cleanEmail}) as ${cleanRole}`,
      category: "Security",
      status: "Success",
      ipTerminal: "Admin Console (Owner)",
    });
  } catch {}

  return newAccount;
}

export async function toggleAdminStatus(
  adminId: string,
  newStatus: "Active" | "Inactive",
  adminName: string
) {
  const ref = doc(db, COL, adminId);
  await updateDoc(ref, {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });

  try {
    await logAuditEvent({
      officer: "Barangay Admin",
      action: `${newStatus === "Active" ? "Reactivated" : "Deactivated"} admin account for ${adminName} (${adminId})`,
      category: "Security",
      status: "Success",
      ipTerminal: "Admin Console (Owner)",
    });
  } catch {}
}

export async function deleteAdminAccount(adminId: string, adminName: string) {
  const ref = doc(db, COL, adminId);
  await deleteDoc(ref);

  try {
    await logAuditEvent({
      officer: "Barangay Admin",
      action: `Deleted administrator account for ${adminName} (${adminId})`,
      category: "Security",
      status: "Success",
      ipTerminal: "Admin Console (Owner)",
    });
  } catch {}
}
