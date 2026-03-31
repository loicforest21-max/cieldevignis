// ═══════════════════════════════════════════════════
// FIREBASE — Configuration & Firestore helpers
// ═══════════════════════════════════════════════════
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, getDocs, query,
  orderBy, limit, Timestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIWQ_47QeB6bral6yBYHun9vZaGUwmHc8",
  authDomain: "cieldevignis.firebaseapp.com",
  projectId: "cieldevignis",
  storageBucket: "cieldevignis.firebasestorage.app",
  messagingSenderId: "362464412412",
  appId: "1:362464412412:web:15b61a3c1074ecbed60d79",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ═══════════════════════════════════════════
// CRUD Operations
// ═══════════════════════════════════════════

async function publishBuild({ code, name, description, author, race, primaryClass, secondaryClass, role, level, prestige }) {
  const doc = await addDoc(collection(db, "builds"), {
    code,
    name: name.trim(),
    description: (description || "").trim(),
    author: author.trim(),
    race: race || "",
    primaryClass: primaryClass || "",
    secondaryClass: secondaryClass || "",
    role: role || "",
    level: level || 1,
    prestige: prestige || 0,
    createdAt: Timestamp.now(),
  });
  return doc.id;
}

async function fetchBuilds() {
  const snapshot = await getDocs(query(
    collection(db, "builds"),
    orderBy("createdAt", "desc"),
    limit(200)
  ));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export { db, publishBuild, fetchBuilds };
