import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzcu5j0Hl9EmShYIXuWaEo8_KU00F9n6A",
  authDomain: "magic-conch-8987e.firebaseapp.com",
  projectId: "magic-conch-8987e",
  storageBucket: "magic-conch-8987e.firebasestorage.app",
  messagingSenderId: "439201183726",
  appId: "1:439201183726:web:cb6545fc813c8c274780ff"
};

// Initialize Firebase only if it hasn't been initialized already (Next.js hot reload safe)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
