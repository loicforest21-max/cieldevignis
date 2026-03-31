// ═══════════════════════════════════════════════════
// FIREBASE — Configuration & Firestore helpers
// ═══════════════════════════════════════════════════
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, getDocs, query,
  orderBy, limit, Timestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ═══════════════════════════════════════════
// CRUD Operations
// ═══════════════════════════════════════════

async function publishBuild({ code, name, description, author, race, raceEvo, primaryClass, secondaryClass, role, level, prestige, augments, topStats, tags }) {
  const doc = await addDoc(collection(db, "builds"), {
    code,
    name: name.trim(),
    description: (description || "").trim(),
    author: author.trim(),
    race: race || "",
    raceEvo: raceEvo || "",
    primaryClass: primaryClass || "",
    secondaryClass: secondaryClass || "",
    role: role || "",
    level: level || 1,
    prestige: prestige || 0,
    augments: augments || [],
    topStats: topStats || {},
    tags: tags || [],
    votes: 0,
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
