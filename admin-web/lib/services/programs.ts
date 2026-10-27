import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Program {
  id?: string;
  title: string;
  category: string;
  description: string;
  schedule: string;
  location: string;
  registrationDeadline: string;
  slots: number;
  enrolledCount: number;
  officer: string;
  status: "Active" | "Upcoming" | "Completed" | "Cancelled";
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const COL = "programs";

export async function getPrograms(): Promise<Program[]> {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Program));
}

export function subscribeToPrograms(
  callback: (programs: Program[]) => void
): () => void {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Program));
      callback(list);
    },
    (err) => {
      console.warn("Programs listener fallback:", err);
    }
  );
}

export async function getProgramById(id: string): Promise<Program | null> {
  const ref = doc(db, COL, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Program;
}

export async function createProgram(data: Omit<Program, "id" | "createdAt" | "updatedAt">) {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    enrolledCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProgram(id: string, data: Partial<Program>) {
  const ref = doc(db, COL, id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProgram(id: string) {
  await deleteDoc(doc(db, COL, id));
}
