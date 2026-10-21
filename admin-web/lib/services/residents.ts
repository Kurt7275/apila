import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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

export async function createResident(data: Omit<Resident, "id" | "createdAt" | "updatedAt">) {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    isVerified: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function toggleResidentVerification(id: string, isVerified: boolean) {
  const ref = doc(db, COL, id);
  await updateDoc(ref, { isVerified, updatedAt: serverTimestamp() });
}

export async function updateResident(id: string, data: Partial<Resident>) {
  const ref = doc(db, COL, id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}
