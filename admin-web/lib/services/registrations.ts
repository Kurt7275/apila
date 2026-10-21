import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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

export async function getRegistrationsByProgram(programId: string): Promise<Registration[]> {
  const q = query(collection(db, COL), where("programId", "==", programId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration));
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
  status: Registration["status"]
) {
  const ref = doc(db, COL, id);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
}
