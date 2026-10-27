import {
  collection,
  doc,
  getDocs,
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

export interface Announcement {
  id?: string;
  title: string;
  category: string;
  priority: "Urgent" | "Important" | "Normal";
  targetAudience: string;
  message: string;
  pushNotification: boolean;
  publishedBy: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const COL = "announcements";

export async function getAnnouncements(): Promise<Announcement[]> {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement));
}

export function subscribeToAnnouncements(
  callback: (list: Announcement[]) => void
): () => void {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement)));
    },
    (err) => console.warn("Announcements listener error:", err)
  );
}

export async function createAnnouncement(
  data: Omit<Announcement, "id" | "createdAt" | "updatedAt">
) {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateAnnouncement(id: string, data: Partial<Announcement>) {
  const ref = doc(db, COL, id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteAnnouncement(id: string) {
  await deleteDoc(doc(db, COL, id));
}
