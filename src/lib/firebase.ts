import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, setLogLevel } from 'firebase/firestore';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lively-mix-sln7n",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:57383845857:web:c0688aeac6d333edb31ca0",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCgZTBmLkvEUMPebaXHj0JLQKo3k54s73o",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lively-mix-sln7n.firebaseapp.com",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-4ea0192c-31ac-475c-be5d-6e79ea653f9d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lively-mix-sln7n.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "57383845857"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

// Suppress noisy offline connection warnings
setLogLevel('error');

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}, firebaseConfig.firestoreDatabaseId);
