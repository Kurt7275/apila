import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AttendanceRecord {
  id?: string;
  programId: string;
  residentId: string;
  residentName: string;
  status: "Present" | "Absent";
  markedAt?: Timestamp;
  updatedAt?: Timestamp;
}

const COL = "attendance";

export async function getAttendanceByProgram(programId: string): Promise<AttendanceRecord[]> {
  const q = query(collection(db, COL), where("programId", "==", programId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord));
}

export function subscribeToAttendanceByProgram(
  programId: string,
  callback: (attendance: AttendanceRecord[]) => void
): () => void {
  const q = query(collection(db, COL), where("programId", "==", programId));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord));
      callback(list);
    },
    (err) => {
      console.warn("Attendance by program listener fallback:", err);
    }
  );
}

export function subscribeToAttendance(
  callback: (attendance: AttendanceRecord[]) => void
): () => void {
  const q = query(collection(db, COL));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord));
      callback(list);
    },
    (err) => {
      console.warn("Attendance listener fallback:", err);
    }
  );
}

export async function markAttendance(
  programId: string,
  residentId: string,
  residentName: string,
  status: "Present" | "Absent"
) {
  // Check if record exists
  const q = query(
    collection(db, COL),
    where("programId", "==", programId),
    where("residentId", "==", residentId)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    const ref = doc(db, COL, snap.docs[0].id);
    await updateDoc(ref, { status, updatedAt: serverTimestamp() });
  } else {
    await addDoc(collection(db, COL), {
      programId,
      residentId,
      residentName,
      status,
      markedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}
