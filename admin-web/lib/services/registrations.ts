import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  increment,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { logAuditEvent } from "./auditLogs";

export interface Registration {
  id?: string;
  residentId: string;
  residentName: string;
  programId: string;
  programTitle: string;
  purok: string;
  phone: string;
  status: "Pending" | "Approved" | "Rejected";
  registeredAt?: Timestamp;
  updatedAt?: Timestamp;
}

const COL = "registrations";

export async function getRegistrations(): Promise<Registration[]> {
  const q = query(collection(db, COL), orderBy("registeredAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration));
}

export function subscribeToRegistrations(
  callback: (registrations: Registration[]) => void
): () => void {
  const q = query(collection(db, COL), orderBy("registeredAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration));
      callback(list);
    },
    (err) => {
      console.warn("Registrations listener fallback:", err);
    }
  );
}

export async function getRegistrationsByProgram(programId: string): Promise<Registration[]> {
  const q = query(collection(db, COL), where("programId", "==", programId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration));
}

export function subscribeToRegistrationsByProgram(
  programId: string,
  callback: (registrations: Registration[]) => void
): () => void {
  const q = query(collection(db, COL), where("programId", "==", programId));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration));
      callback(list);
    },
    (err) => {
      console.warn("Registrations by program listener fallback:", err);
    }
  );
}

export async function createRegistration(data: Omit<Registration, "id" | "registeredAt" | "updatedAt">) {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    status: "Pending",
    registeredAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateRegistrationStatus(
  id: string,
  status: Registration["status"],
  officerName: string = "Barangay Admin"
) {
  const ref = doc(db, COL, id);
  const snap = await getDoc(ref);
  const regData = snap.exists() ? snap.data() : null;

  const updates: Record<string, any> = { status, updatedAt: serverTimestamp() };
  if (status === "Approved") {
    updates.approvedAt = serverTimestamp();
  }
  await updateDoc(ref, updates);

  // 1. Program Capacity / Enrolled Count Sync
  if (regData?.programId) {
    try {
      const progRef = doc(db, "programs", regData.programId);
      if (status === "Approved" && regData.status !== "Approved") {
        await updateDoc(progRef, {
          enrolledCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      } else if (status === "Rejected" && regData.status === "Approved") {
        await updateDoc(progRef, {
          enrolledCount: increment(-1),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.warn("Program capacity adjustment skipped:", e);
    }
  }

  // 2. Dispatch Live In-App Notification / Bulletin into announcements collection
  if (regData) {
    try {
      const isApproved = status === "Approved";
      await addDoc(collection(db, "announcements"), {
        title: isApproved
          ? `Registration Confirmed: ${regData.programTitle || "Program"}`
          : `Registration Notice: ${regData.programTitle || "Program"}`,
        category: isApproved ? "Confirmation" : "Update",
        priority: isApproved ? "Important" : "Normal",
        targetAudience: regData.purok || "All Puroks",
        message: isApproved
          ? `Notice for ${regData.residentName}: Your registration pass for "${regData.programTitle}" has been officially approved! Your digital QR pass is now active for venue check-in.`
          : `Notice for ${regData.residentName}: Your registration for "${regData.programTitle}" could not be accommodated due to capacity limits or review requirements.`,
        pushNotification: true,
        publishedBy: officerName,
        targetProgramId: regData.programId,
        residentId: regData.residentId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn("Notification dispatch skipped:", e);
    }
  }

  // 3. Log Audit Event
  try {
    await logAuditEvent({
      officer: officerName,
      action: `${status} registration for ${regData?.residentName || id} in "${regData?.programTitle || "Program"}"`,
      category: "Registration",
      status: "Success",
      ipTerminal: "Admin Console",
    });
  } catch {}
}
