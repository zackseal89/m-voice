import { db, auth } from '../config/firebaseConfig'; // Using auth from firebaseConfig as requested
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp // Included Timestamp in case it's needed for future date fields
} from 'firebase/firestore';
import type { Client } from '../../types'; // Path should be correct (src/services -> types)

const CLIENTS_COLLECTION = 'clients';

export const addClient = async (clientData: Omit<Client, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated. Cannot add client.');
  }
  try {
    // Add createdAt timestamp during creation
    const dataToSave = {
      ...clientData,
      userId: currentUser.uid, // Associate client with the current user
      createdAt: Timestamp.now() // Add a server timestamp
    };
    const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), dataToSave);
    return docRef.id;
  } catch (error) {
    console.error("Error adding client: ", error);
    // Consider how to handle specific error codes, e.g., permissions
    throw new Error('Failed to add client. ' + (error instanceof Error ? error.message : String(error)));
  }
};

export const getClients = async (): Promise<Client[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    // Depending on UI needs, could return [] or throw error.
    // Throwing error is clearer for mandatory auth.
    throw new Error('User not authenticated. Cannot fetch clients.');
  }
  try {
    const q = query(collection(db, CLIENTS_COLLECTION), where('userId', '==', currentUser.uid));
    const querySnapshot = await getDocs(q);
    const clients: Client[] = [];
    querySnapshot.forEach((doc) => {
      // Make sure to handle Timestamps if they exist, converting them to Date objects if needed by Client type
      // For now, Client type doesn't have Date fields other than the one we might add (createdAt)
      // which is not part of the provided Client interface for consumption.
      const data = doc.data();
      clients.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        taxId: data.taxId,
        userId: data.userId,
        // If createdAt is stored and needed in the Client object for display:
        // createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt
      } as Client); // Type assertion might be too strong if data types don't match perfectly.
    });
    return clients;
  } catch (error) {
    console.error("Error fetching clients: ", error);
    throw new Error('Failed to fetch clients. ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Omit 'id' and 'userId' as they shouldn't be updated directly via this function.
// 'createdAt' should also generally not be updated.
export const updateClient = async (clientId: string, clientData: Partial<Omit<Client, 'id' | 'userId' | 'createdAt'>>): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated. Cannot update client.');
  }

  // It's good practice to ensure the client being updated belongs to the user.
  // This can be done here by fetching the doc first and checking userId,
  // or more robustly with security rules.
  // For now, we'll rely on security rules for strict ownership.
  // However, adding a check here provides a better user experience by failing fast.

  const clientRef = doc(db, CLIENTS_COLLECTION, clientId);

  // Optional: Fetch doc to verify ownership before updating
  // const docSnap = await getDoc(clientRef);
  // if (!docSnap.exists() || docSnap.data().userId !== currentUser.uid) {
  //   throw new Error("Client not found or access denied.");
  // }

  try {
    // Add an updatedAt timestamp
    const dataToUpdate = {
      ...clientData,
      updatedAt: Timestamp.now()
    };
    await updateDoc(clientRef, dataToUpdate);
  } catch (error) {
    console.error("Error updating client: ", error);
    throw new Error('Failed to update client. ' + (error instanceof Error ? error.message : String(error)));
  }
};

export const deleteClient = async (clientId: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated. Cannot delete client.');
  }

  // Similar to update, ensure client belongs to user via security rules or an explicit check.
  const clientRef = doc(db, CLIENTS_COLLECTION, clientId);

  // Optional: Fetch doc to verify ownership before deleting
  // const docSnap = await getDoc(clientRef);
  // if (!docSnap.exists() || docSnap.data().userId !== currentUser.uid) {
  //   throw new Error("Client not found or access denied.");
  // }

  try {
    await deleteDoc(clientRef);
  } catch (error) {
    console.error("Error deleting client: ", error);
    throw new Error('Failed to delete client. ' + (error instanceof Error ? error.message : String(error)));
  }
};
