import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { logAuditEvent } from "./auditLogs";

export interface Resident {
  id?: string;
  name: string;
  email: string;
  phone: string;
  purok: string;
  householdId: string;
  address: string;
  birthdate: string;
  gender: string;
  civilStatus: string;
  isVerified: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const COL = "residents";

export async function getResidents(): Promise<Resident[]> {
  const q = query(collection(db, COL), orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Resident));
}

export function subscribeToResidents(
  callback: (residents: Resident[]) => void
): () => void {
  const q = query(collection(db, COL), orderBy("name", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Resident));
      callback(list);
    },
    (err) => {
      console.warn("Residents listener fallback:", err);
    }
  );
}

export async function createResident(data: Omit<Resident, "id" | "createdAt" | "updatedAt">) {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    isVerified: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function toggleResidentVerification(
  id: string,
  isVerified: boolean,
  officerName: string = "Barangay Admin"
) {
  const ref = doc(db, COL, id);
  await updateDoc(ref, { isVerified, updatedAt: serverTimestamp() });

  try {
    const userRef = doc(db, "users", id);
    await setDoc(userRef, { isVerified }, { merge: true });
  } catch {}

  // Dispatch official verification notification
  if (isVerified) {
    try {
      const resDoc = await getDoc(ref);
      const resData = resDoc.exists() ? resDoc.data() : null;
      await addDoc(collection(db, "announcements"), {
        title: "Barangay Account Verified! 🛡️",
        category: "Announcement",
        priority: "Important",
        targetAudience: resData?.purok || "All Puroks",
        message: `Mabuhay ${resData?.name || "Resident"}! Your resident account has been officially verified by the Barangay Lapasan administration. You now have full access to barangay social services, priority registrations, and official certification requests.`,
        pushNotification: true,
        publishedBy: officerName,
        residentId: id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch {}
  }

  try {
    await logAuditEvent({
      officer: officerName,
      action: `${isVerified ? "Approved verification" : "Revoked verification"} for resident record ID: ${id}`,
      category: "Registration",
      status: "Success",
      ipTerminal: "Admin Console",
    });
  } catch {}
}

export async function updateResident(
  id: string,
  data: Partial<Resident>,
  officerName: string = "Barangay Admin"
) {
  const ref = doc(db, COL, id);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });

  // Synchronize to users collection if user has registered account
  try {
    const userRef = doc(db, "users", id);
    const userUpdates: Record<string, any> = {};
    if (data.name) userUpdates.fullName = data.name;
    if (data.phone) userUpdates.phone = data.phone;
    if (data.purok) userUpdates.purok = data.purok;
    if (data.address) userUpdates.address = data.address;
    if (data.gender) userUpdates.gender = data.gender;
    if (data.birthdate) userUpdates.birthdate = data.birthdate;
    if (data.householdId) userUpdates.householdId = data.householdId;
    if (data.isVerified !== undefined) userUpdates.isVerified = data.isVerified;
    if (Object.keys(userUpdates).length > 0) {
      await setDoc(userRef, userUpdates, { merge: true });
    }
  } catch {}

  // Audit event
  try {
    await logAuditEvent({
      officer: officerName,
      action: `Updated resident record and assigned Household ID "${data.householdId || "N/A"}" for ${data.name || id}`,
      category: "Registration",
      status: "Success",
      ipTerminal: "Admin Console",
    });
  } catch {}
}
