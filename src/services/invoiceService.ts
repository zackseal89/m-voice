import { db, auth } from '../config/firebaseConfig'; // Adjust path
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  writeBatch, // For potential complex operations like deleting related items if needed
  getDoc // For getInvoiceById
} from 'firebase/firestore';
import type { Invoice, InvoiceItem } from '../../types'; // Adjust path

const INVOICES_COLLECTION = 'invoices';

// Helper to generate a unique ID for invoice items if needed client-side
// Or rely on array index if items are never individually manipulated outside the invoice doc
export const generateInvoiceItemId = (): string => {
  // This generates a unique ID for any Firestore document, useful for sub-collection items if they were separate docs
  // For items within an array, you might use a different UUID library or simpler counter if scope is limited.
  return doc(collection(db, '_')).id;
};

// Function to add a new invoice
export const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'invoiceNumber'>): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated. Cannot add invoice.');
  }

  // Placeholder for invoice number generation.
  // This should be robust, e.g., sequential per user, possibly using a Cloud Function or a transaction to read a counter.
  const newInvoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  try {
    const docRef = await addDoc(collection(db, INVOICES_COLLECTION), {
      ...invoiceData,
      userId: currentUser.uid,
      invoiceNumber: newInvoiceNumber, // Assign generated invoice number
      status: invoiceData.status || 'draft', // Default status to draft if not provided
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding invoice: ", error);
    throw new Error('Failed to add invoice: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Function to get all invoices for the current user
export const getInvoices = async (statusFilter?: Invoice['status']): Promise<Invoice[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated. Cannot fetch invoices.');
  }
  try {
    let q = query(collection(db, INVOICES_COLLECTION), where('userId', '==', currentUser.uid));
    if (statusFilter) {
      q = query(q, where('status', '==', statusFilter));
    }
    // Consider adding orderBy, e.g., orderBy('issueDate', 'desc')
    // q = query(q, orderBy('issueDate', 'desc'));

    const querySnapshot = await getDocs(q);
    const invoices: Invoice[] = [];
    querySnapshot.forEach((doc) => {
      invoices.push({ id: doc.id, ...doc.data() } as Invoice); // Ensure data matches Invoice type
    });
    return invoices;
  } catch (error) {
    console.error("Error fetching invoices: ", error);
    throw new Error('Failed to fetch invoices: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Function to get a single invoice by its ID
export const getInvoiceById = async (invoiceId: string): Promise<Invoice | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated. Cannot fetch invoice.');
  }
  try {
    const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
    const docSnap = await getDoc(invoiceRef);

    if (docSnap.exists()) {
      const invoice = { id: docSnap.id, ...docSnap.data() } as Invoice;
      // Security check: ensure the fetched invoice belongs to the current user
      // This is a client-side check; strong enforcement should be via Firestore Security Rules
      if (invoice.userId !== currentUser.uid) {
        console.warn("User attempted to fetch an invoice belonging to another user.");
        // Depending on policy, either return null or throw an error for unauthorized access
        throw new Error("Access denied: Invoice does not belong to the current user.");
      }
      return invoice;
    } else {
      console.log("No such invoice found!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching invoice by ID: ", error);
    // Re-throw or handle specific errors as needed
    if (error instanceof Error && error.message.startsWith("Access denied")) {
        throw error;
    }
    throw new Error('Failed to fetch invoice by ID: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Function to update an existing invoice
export const updateInvoice = async (invoiceId: string, invoiceData: Partial<Omit<Invoice, 'id' | 'userId' | 'createdAt' | 'invoiceNumber'>>): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated. Cannot update invoice.');
  }

  const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);

  // Client-side check for ownership (optional but good for UX, security rules are primary)
  const docSnap = await getDoc(invoiceRef);
  if (!docSnap.exists() || docSnap.data()?.userId !== currentUser.uid) {
    throw new Error("Access denied: Invoice not found or does not belong to the current user.");
  }

  try {
    await updateDoc(invoiceRef, {
      ...invoiceData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating invoice: ", error);
    throw new Error('Failed to update invoice: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Function to delete an invoice
export const deleteInvoice = async (invoiceId: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated. Cannot delete invoice.');
  }

  const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);

  // Client-side check for ownership
  const docSnap = await getDoc(invoiceRef);
  if (!docSnap.exists() || docSnap.data()?.userId !== currentUser.uid) {
     throw new Error("Access denied: Invoice not found or does not belong to the current user.");
  }

  try {
    await deleteDoc(invoiceRef);
  } catch (error) {
    console.error("Error deleting invoice: ", error);
    throw new Error('Failed to delete invoice: ' + (error instanceof Error ? error.message : String(error)));
  }
};
