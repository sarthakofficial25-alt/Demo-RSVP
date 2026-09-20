import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Web app's Firebase configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyDLDTCiUGh6wwn1DZMGT26tNpBYwZyOdP4",
  authDomain: "sarthak-62d28.firebaseapp.com",
  projectId: "sarthak-62d28",
  storageBucket: "sarthak-62d28.firebasestorage.app",
  messagingSenderId: "1054787449987",
  appId: "1:1054787449987:web:df367b1e091439013757b6",
  measurementId: "G-DD6H5LTP2M"
};

// Initialize Firebase safely preventing duplicate instances
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Analytics safely in browser environment
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn('Firebase analytics initialization skipped:', e);
      }
    }
  });
}
