import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AuditLog {
  id?: string;
  officer: string;
  action: string;
  category: string;
  ipTerminal: string;
  status: "Success" | "Failed";
  createdAt?: Timestamp;
}

const COL = "audit_logs";

export async function getAuditLogs(): Promise<AuditLog[]> {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog));
}

export async function logAuditEvent(data: Omit<AuditLog, "id" | "createdAt">) {
  await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
  });
}
