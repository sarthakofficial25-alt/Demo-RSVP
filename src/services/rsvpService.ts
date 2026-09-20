import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Registration } from '../data/eventData.ts';

export interface FirestoreRsvpRecord {
  registrationId: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  registeredAt: string;
  userId?: string | null;
  status: 'confirmed' | 'cancelled' | 'attended';
  createdAt?: unknown;
  updatedAt?: unknown;
  source: string;
  syncedToCloud?: boolean;
}

const LOCAL_RSVP_CACHE_KEY = 'gdg_fiem_cloud_rsvps_cache';

/**
 * Save an RSVP to Firestore in the 'rsvps' collection.
 * Also links with user record if logged in, with seamless fallback for permission or offline restrictions.
 */
export async function saveRsvpToFirestore(
  registration: Registration,
  userId?: string | null
): Promise<FirestoreRsvpRecord> {
  const now = serverTimestamp();

  const record: FirestoreRsvpRecord = {
    registrationId: registration.registrationId,
    fullName: registration.fullName.trim(),
    email: registration.email.trim().toLowerCase(),
    phone: registration.phone.trim(),
    organization: registration.organization.trim(),
    registeredAt: registration.registeredAt,
    userId: userId || null,
    status: 'confirmed',
    createdAt: now,
    updatedAt: now,
    source: 'web_portal',
    syncedToCloud: false,
  };

  try {
    const rsvpRef = doc(db, 'rsvps', registration.registrationId);
    await setDoc(rsvpRef, { ...record, syncedToCloud: true }, { merge: true });
    record.syncedToCloud = true;

    // If a user ID is provided, also update their user document
    if (userId) {
      try {
        const userRef = doc(db, 'users', userId);
        const userCapRef = doc(db, 'Users', userId);
        const linkData = {
          hasRsvp: true,
          registrationId: registration.registrationId,
          lastRsvpAt: now,
        };
        await Promise.allSettled([
          setDoc(userRef, linkData, { merge: true }),
          setDoc(userCapRef, linkData, { merge: true }),
        ]);
      } catch (err) {
        console.warn('Could not link RSVP to user profile doc:', err);
      }
    }
  } catch (err: any) {
    console.warn(
      'Firestore RSVP authorization/connection notice: Saved to browser secure pass cache.',
      err?.message || err
    );
    record.syncedToCloud = false;
  }

  // Always cache locally as well
  try {
    const existingRaw = localStorage.getItem(LOCAL_RSVP_CACHE_KEY);
    const existingList: FirestoreRsvpRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updatedList = [record, ...existingList.filter((r) => r.registrationId !== record.registrationId)];
    localStorage.setItem(LOCAL_RSVP_CACHE_KEY, JSON.stringify(updatedList));
  } catch {
    // ignore
  }

  return record;
}

/**
 * Permanently delete/cancel an RSVP from Cloud Firestore and local storage caches.
 */
export async function unRsvpFromFirestore(
  registrationId: string,
  userId?: string | null
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Delete the document from Cloud Firestore 'rsvps' collection
    const rsvpRef = doc(db, 'rsvps', registrationId);
    await deleteDoc(rsvpRef);

    // Also attempt uppercase collection if it exists
    try {
      const rsvpCapRef = doc(db, 'Rsvps', registrationId);
      await deleteDoc(rsvpCapRef);
    } catch {
      // ignore
    }

    // 2. If user ID is attached, clear the RSVP state in their user document
    if (userId) {
      try {
        const userRef = doc(db, 'users', userId);
        const userCapRef = doc(db, 'Users', userId);
        const clearData = {
          hasRsvp: false,
          registrationId: null,
          lastUnRsvpAt: serverTimestamp(),
        };
        await Promise.allSettled([
          setDoc(userRef, clearData, { merge: true }),
          setDoc(userCapRef, clearData, { merge: true }),
        ]);
      } catch (userErr) {
        console.warn('Could not reset RSVP status on user document:', userErr);
      }
    }

    // 3. Remove from local cache
    try {
      const existingRaw = localStorage.getItem(LOCAL_RSVP_CACHE_KEY);
      if (existingRaw) {
        const existingList: FirestoreRsvpRecord[] = JSON.parse(existingRaw);
        const updatedList = existingList.filter((r) => r.registrationId !== registrationId);
        localStorage.setItem(LOCAL_RSVP_CACHE_KEY, JSON.stringify(updatedList));
      }
    } catch {
      // ignore
    }

    return {
      success: true,
      message: 'Your registration has been removed from the RSVP list.',
    };
  } catch (err: any) {
    console.error('Error deleting RSVP from Firestore:', err);
    // Still clean local cache so UI remains consistent
    try {
      const existingRaw = localStorage.getItem(LOCAL_RSVP_CACHE_KEY);
      if (existingRaw) {
        const existingList: FirestoreRsvpRecord[] = JSON.parse(existingRaw);
        const updatedList = existingList.filter((r) => r.registrationId !== registrationId);
        localStorage.setItem(LOCAL_RSVP_CACHE_KEY, JSON.stringify(updatedList));
      }
    } catch {
      // ignore
    }

    return {
      success: false,
      message: err?.message || 'Failed to cancel RSVP in Firestore.',
    };
  }
}

/**
 * Query Firestore to check if the current user or email already has a confirmed RSVP.
 */
export async function fetchUserRsvp(
  userId?: string | null,
  email?: string | null
): Promise<Registration | null> {
  try {
    const rsvpsRef = collection(db, 'rsvps');

    // 1. Try by userId first
    if (userId) {
      const qUser = query(rsvpsRef, where('userId', '==', userId));
      const snapUser = await getDocs(qUser);
      if (!snapUser.empty) {
        const data = snapUser.docs[0].data() as FirestoreRsvpRecord;
        return {
          registrationId: data.registrationId,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          organization: data.organization,
          registeredAt: data.registeredAt,
        };
      }
    }

    // 2. Try by Email
    if (email) {
      const qEmail = query(rsvpsRef, where('email', '==', email.trim().toLowerCase()));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        const data = snapEmail.docs[0].data() as FirestoreRsvpRecord;
        return {
          registrationId: data.registrationId,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          organization: data.organization,
          registeredAt: data.registeredAt,
        };
      }
    }
  } catch (err) {
    console.error('Error fetching RSVP from Firestore:', err);
  }

  return null;
}

/**
 * Retrieve an RSVP by its unique registration code.
 */
export async function getRsvpById(registrationId: string): Promise<Registration | null> {
  try {
    const rsvpRef = doc(db, 'rsvps', registrationId);
    const snap = await getDoc(rsvpRef);
    if (snap.exists()) {
      const data = snap.data() as FirestoreRsvpRecord;
      return {
        registrationId: data.registrationId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        organization: data.organization,
        registeredAt: data.registeredAt,
      };
    }
  } catch (err) {
    console.error('Error fetching RSVP by ID:', err);
  }
  return null;
}

