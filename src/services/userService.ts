import { db, auth } from '../config/firebaseConfig';
import {
  doc,
  setDoc, // Use setDoc with merge:true for creating/updating, or updateDoc for partial updates
  getDoc,
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import type { UserProfileData, NotificationPreferences, AppSettings } from '../../types'; // Adjust path

const USERS_COLLECTION = 'users';

// Function to create or update a user's profile.
// Often called after sign-up to initialize the profile, or to update it.
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<Omit<UserProfileData, 'id' | 'email' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  try {
    // Using setDoc with merge: true will create the document if it doesn't exist,
    // or update it if it does, only changing the fields provided.
    // It also ensures `updatedAt` is always fresh.
    await setDoc(userRef, {
      ...profileData,
      updatedAt: Timestamp.now(),
    }, { merge: true });

    // If it's the first time creating this profile (e.g. createdAt doesn't exist), set it.
    // Also ensure email is present, especially if profileData didn't include it.
    const userSnap = await getDoc(userRef);
    const data = userSnap.data();

    const updates: Partial<UserProfileData> = {};
    let needsExtraUpdate = false;

    if (data && !data.createdAt) {
      updates.createdAt = Timestamp.now();
      needsExtraUpdate = true;
    }

    // Ensure email is set if not already (useful if profile created separately from auth trigger)
    // Or if the auth email changed and we want to sync it (though this might need careful consideration)
    if (data && !data.email && auth.currentUser && auth.currentUser.uid === userId && auth.currentUser.email) {
        updates.email = auth.currentUser.email;
        needsExtraUpdate = true;
    }

    if (needsExtraUpdate) {
        await updateDoc(userRef, updates);
    }

  } catch (error) {
    console.error("Error updating user profile: ", error);
    throw new Error('Failed to update user profile: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Function to get a user's profile
export const getUserProfile = async (userId: string): Promise<UserProfileData | null> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as Omit<UserProfileData, 'id'>; // Data from Firestore
      // Construct the full UserProfileData object
      return {
        id: userId, // The ID is the doc key, not stored in the doc itself usually
        email: data.email || (auth.currentUser?.uid === userId ? auth.currentUser?.email : '') || '', // Prioritize stored email, fallback to auth email if current user
        name: data.name,
        businessName: data.businessName,
        notificationPreferences: data.notificationPreferences,
        appSettings: data.appSettings,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as UserProfileData; // Cast to ensure all fields are there, even if undefined from Partial
    } else {
      // No custom profile found for this user yet
      console.log(`No profile found for user ID: ${userId}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile: ", error);
    throw new Error('Failed to fetch user profile: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Specific function to update notification preferences
export const updateNotificationPreferences = async (userId: string, preferences: NotificationPreferences): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  try {
    await updateDoc(userRef, {
      notificationPreferences: preferences,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating notification preferences: ", error);
    throw new Error('Failed to update notification preferences: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Specific function to update app settings like theme
export const updateAppSettings = async (userId: string, settings: AppSettings): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  try {
    await updateDoc(userRef, {
      appSettings: settings,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating app settings: ", error);
    throw new Error('Failed to update app settings: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Function to be called on user creation (e.g. after successful Firebase Auth registration)
// to ensure a user profile document exists.
export const initializeUserProfile = async (
    userId: string,
    email: string,
    name?: string,
    businessName?: string
): Promise<UserProfileData> => {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
        const now = Timestamp.now();
        const initialProfile: UserProfileData = {
            id: userId, // This matches the UID from Firebase Auth
            email: email,
            name: name || '',
            businessName: businessName || '',
            notificationPreferences: { // Default preferences
                invoiceReminders: true,
                paymentReceivedAlerts: true,
            },
            appSettings: { // Default settings
                theme: 'system',
            },
            createdAt: now,
            updatedAt: now,
        };
        await setDoc(userRef, initialProfile);
        return initialProfile;
    } else {
        // Profile already exists, just return it, ensuring 'id' is correctly part of the object
        const existingData = docSnap.data() as Omit<UserProfileData, 'id'>;
        return { id: userId, ...existingData } as UserProfileData;
    }
};
