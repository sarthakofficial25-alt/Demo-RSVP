import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase.ts';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  organization?: string;
  photoURL?: string | null;
  provider: string;
  createdAt?: unknown;
  lastLoginAt?: unknown;
  hasRsvp?: boolean;
  registrationId?: string;
  isGuest?: boolean;
}

const LOCAL_PROFILE_PREFIX = 'gdg_fiem_user_profile_';

/**
 * Persists and updates user login and profile details in the Firestore 'users' collection.
 * Gracefully falls back to local cache if Firestore permissions or connectivity are restricted.
 */
export async function syncUserRecordToFirestore(
  user: User,
  additionalData?: { displayName?: string; organization?: string }
): Promise<UserProfile> {
  const displayName =
    additionalData?.displayName ||
    user.displayName ||
    (user.email ? user.email.split('@')[0] : (user.isAnonymous ? 'Guest Developer' : 'Developer'));

  const baseProfile: UserProfile = {
    uid: user.uid,
    email: user.email,
    displayName,
    organization: additionalData?.organization || 'FIEM Kolkata',
    photoURL: user.photoURL || null,
    provider: user.providerData[0]?.providerId || (user.isAnonymous ? 'anonymous' : 'password'),
    hasRsvp: false,
    isGuest: user.isAnonymous,
  };

  try {
    const userRef = doc(db, 'users', user.uid);
    const userCapRef = doc(db, 'Users', user.uid);
    const userSnap = await getDoc(userRef);
    const now = serverTimestamp();

    if (!userSnap.exists()) {
      // New user signup
      const newProfile: Partial<UserProfile> = {
        ...baseProfile,
        createdAt: now,
        lastLoginAt: now,
      };
      await Promise.allSettled([
        setDoc(userRef, newProfile, { merge: true }),
        setDoc(userCapRef, newProfile, { merge: true }),
      ]);
      const finalProfile = { ...newProfile, ...baseProfile };
      localStorage.setItem(LOCAL_PROFILE_PREFIX + user.uid, JSON.stringify(finalProfile));
      return finalProfile;
    } else {
      // Existing user login - update last login timestamp and profile fields
      const existingData = userSnap.data();
      const updates: Record<string, unknown> = {
        lastLoginAt: now,
      };
      if (additionalData?.displayName && additionalData.displayName !== existingData?.displayName) {
        updates.displayName = additionalData.displayName;
      }
      if (additionalData?.organization && additionalData.organization !== existingData?.organization) {
        updates.organization = additionalData.organization;
      }
      if (user.photoURL && user.photoURL !== existingData?.photoURL) {
        updates.photoURL = user.photoURL;
      }
      await Promise.allSettled([
        setDoc(userRef, updates, { merge: true }),
        setDoc(userCapRef, updates, { merge: true }),
      ]);
      const finalProfile = {
        ...baseProfile,
        ...existingData,
        ...updates,
      } as UserProfile;
      localStorage.setItem(LOCAL_PROFILE_PREFIX + user.uid, JSON.stringify(finalProfile));
      return finalProfile;
    }
  } catch (err: any) {
    console.warn(
      'Firestore synchronization notice: Continuing with local profile due to permission/network setting:',
      err?.message || err
    );
    // Persist locally so user state is never broken by Firestore security rules
    try {
      const cached = localStorage.getItem(LOCAL_PROFILE_PREFIX + user.uid);
      if (cached) {
        const parsed = JSON.parse(cached);
        return { ...baseProfile, ...parsed };
      }
      localStorage.setItem(LOCAL_PROFILE_PREFIX + user.uid, JSON.stringify(baseProfile));
    } catch {
      // ignore storage error
    }
    return baseProfile;
  }
}

/**
 * Sign up a new user with Email and Password and save their details to Firestore.
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  fullName: string,
  organization?: string
): Promise<{ user: User; profile: UserProfile }> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (fullName.trim()) {
    try {
      await updateProfile(cred.user, { displayName: fullName.trim() });
    } catch (err) {
      console.warn('Could not update user display name in Auth:', err);
    }
  }
  const profile = await syncUserRecordToFirestore(cred.user, {
    displayName: fullName.trim(),
    organization: organization?.trim() || '',
  });
  return { user: cred.user, profile };
}

/**
 * Sign in existing user with Email and Password and record login in Firestore.
 */
export async function signInWithEmail(
  email: string,
  pass: string
): Promise<{ user: User; profile: UserProfile }> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const profile = await syncUserRecordToFirestore(cred.user);
  return { user: cred.user, profile };
}

/**
 * Sign in or sign up with Google popup.
 */
export async function signInWithGoogle(): Promise<{ user: User; profile: UserProfile }> {
  const cred = await signInWithPopup(auth, googleProvider);
  const profile = await syncUserRecordToFirestore(cred.user);
  return { user: cred.user, profile };
}

/**
 * Sign in anonymously as a guest attendee for instant testing without domain restrictions.
 */
export async function signInAsGuest(): Promise<{ user: User; profile: UserProfile }> {
  const cred = await signInAnonymously(auth);
  const profile = await syncUserRecordToFirestore(cred.user, {
    displayName: 'Guest Attendee',
    organization: 'FIEM Community Guest',
  });
  return { user: cred.user, profile };
}

/**
 * Sign out current user.
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Send password reset email.
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Fetch user profile from Firestore or local cache.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Failed to fetch user profile from Firestore, checking local storage:', err);
  }

  // Fallback to local storage
  try {
    const cached = localStorage.getItem(LOCAL_PROFILE_PREFIX + uid);
    if (cached) {
      return JSON.parse(cached) as UserProfile;
    }
  } catch {
    // ignore
  }

  return null;
}
