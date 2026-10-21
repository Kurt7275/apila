import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBaTrL0f9IYorgNJ1h96LlPhJmSm9065m0",
  authDomain: "apila-barangay.firebaseapp.com",
  projectId: "apila-barangay",
  storageBucket: "apila-barangay.firebasestorage.app",
  messagingSenderId: "686449307162",
  appId: "1:686449307162:web:66df4e62ddec2993de2ba3",
  measurementId: "G-3GZYM9LS65",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
