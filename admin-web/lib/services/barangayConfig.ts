import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface BarangayConfig {
  barangayName: string;
  captain: string;
  address: string;
  hotline: string;
  updatedAt?: any;
}

const DOC_REF = () => doc(db, "barangayConfig", "lapasan");

const DEFAULTS: BarangayConfig = {
  barangayName: "Barangay Lapasan, District II",
  captain: "Hon. Julito O. Ogsimer",
  address: "J.R. Borja Extension, Lapasan, Cagayan de Oro City",
  hotline: "(088) 856-1234 / 911",
};

export async function getBarangayConfig(): Promise<BarangayConfig> {
  try {
    const snap = await getDoc(DOC_REF());
    if (snap.exists()) {
      return snap.data() as BarangayConfig;
    }
    // First-time: seed defaults into Firestore
    await setDoc(DOC_REF(), { ...DEFAULTS, updatedAt: serverTimestamp() });
    return DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export async function saveBarangayConfig(data: BarangayConfig): Promise<void> {
  await setDoc(DOC_REF(), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
