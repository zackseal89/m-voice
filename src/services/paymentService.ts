import { db, auth } from '../config/firebaseConfig'; // Adjust path
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  Timestamp,
  // serverTimestamp // Not used in the provided example, Timestamp.now() is used.
  getDoc // Needed for client-side ownership checks if implemented
} from 'firebase/firestore';
import type { Payment, STKPushStatus } from '../../types'; // Adjust path

const PAYMENTS_COLLECTION = 'payments';

// Function to add a new payment record
// Input type allows status and transactionDate to be optional, providing defaults if not given.
export const addPayment = async (paymentInput: Omit<Payment, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status' | 'transactionDate'> & { status?: Payment['status'], transactionDate?: Timestamp }): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated. Cannot add payment.');
  }
  try {
    // Construct the full Payment object, omitting 'id' which Firestore generates.
    const paymentData: Omit<Payment, 'id'> = {
      ...paymentInput, // Spread the input which includes invoiceId, amount, currency, method, etc.
      userId: currentUser.uid,
      status: paymentInput.status || 'pending', // Default status to 'pending'
      transactionDate: paymentInput.transactionDate || Timestamp.now(), // Default transactionDate to now
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      // stkPushDetails and notes are optional and will be included if present in paymentInput
    };
    const docRef = await addDoc(collection(db, PAYMENTS_COLLECTION), paymentData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding payment: ", error);
    throw new Error('Failed to add payment: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Function to get payments for a specific invoice
export const getPaymentsForInvoice = async (invoiceId: string): Promise<Payment[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated. Cannot fetch payments.');
  }
  try {
    const q = query(
      collection(db, PAYMENTS_COLLECTION),
      where('invoiceId', '==', invoiceId),
      where('userId', '==', currentUser.uid) // Ensure user owns the payments
    );
    const querySnapshot = await getDocs(q);
    const payments: Payment[] = [];
    querySnapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() } as Payment);
    });
    return payments;
  } catch (error) {
    console.error("Error fetching payments for invoice: ", error);
    throw new Error('Failed to fetch payments for invoice: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Function to get all payments for the current user
export const getPaymentsForUser = async (): Promise<Payment[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated. Cannot fetch user payments.');
  }
  try {
    const q = query(collection(db, PAYMENTS_COLLECTION), where('userId', '==', currentUser.uid));
    const querySnapshot = await getDocs(q);
    const payments: Payment[] = [];
    querySnapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() } as Payment);
    });
    return payments;
  } catch (error) {
    console.error("Error fetching user payments: ", error);
    throw new Error('Failed to fetch user payments: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Function to update payment details, especially status or reference
export const updatePayment = async (paymentId: string, updates: Partial<Omit<Payment, 'id' | 'userId' | 'invoiceId' | 'createdAt'>>): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated. Cannot update payment.');
  }

  const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);

  // Optional: Client-side check for ownership. Firestore rules are primary.
  const docSnap = await getDoc(paymentRef);
  if (!docSnap.exists() || docSnap.data()?.userId !== currentUser.uid) {
      throw new Error("Access denied: Payment not found or does not belong to the current user.");
  }

  try {
    await updateDoc(paymentRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating payment: ", error);
    throw new Error('Failed to update payment: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// --- M-Pesa STK Push Simulation Specific Functions ---

export const initiateSTKPushSimulation = async (paymentId: string, phoneNumber: string, amount: number): Promise<Partial<STKPushStatus>> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated for STK push initiation.');
  }

  const simulatedSTKData: STKPushStatus = {
    checkoutRequestId: `sim_crID_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    merchantRequestId: `sim_mrID_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    responseCode: "0",
    responseDescription: "Simulation: Success. Request accepted for processing.",
    customerMessage: "Simulation: Please enter your M-Pesa PIN to complete the payment.",
    status: 'pending_confirmation',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
  try {
    const paymentDoc = await getDoc(paymentRef);
    if (!paymentDoc.exists() || paymentDoc.data()?.userId !== currentUser.uid) {
      throw new Error("Payment not found or access denied for STK push.");
    }

    await updateDoc(paymentRef, {
      stkPushDetails: simulatedSTKData,
      status: 'pending', // Ensure payment status reflects STK push initiation
      updatedAt: Timestamp.now(),
    });
    return {
        checkoutRequestId: simulatedSTKData.checkoutRequestId,
        customerMessage: simulatedSTKData.customerMessage
    };
  } catch (error) {
    console.error("Error initiating STK push simulation: ", error);
    throw new Error('Failed to initiate STK push simulation: ' + (error instanceof Error ? error.message : String(error)));
  }
};

export const simulateSTKCallback = async (checkoutRequestId: string, callbackResult: { success: boolean; resultCode?: string; resultDesc?: string, reference?: string }): Promise<void> => {
  // Note: In a real backend, we wouldn't have auth.currentUser directly.
  // The query to find the payment would rely solely on checkoutRequestId.
  // Access control for this callback endpoint would be via secret keys or IP whitelisting with M-Pesa.

  const q = query(collection(db, PAYMENTS_COLLECTION), where('stkPushDetails.checkoutRequestId', '==', checkoutRequestId));

  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error(`Simulation: No payment found with CheckoutRequestID: ${checkoutRequestId}`);
    }

    const paymentDoc = querySnapshot.docs[0];
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentDoc.id);
    const existingSTKDetails = paymentDoc.data().stkPushDetails as STKPushStatus;

    const updatedSTKDetails: STKPushStatus = {
      ...existingSTKDetails,
      resultCode: callbackResult.resultCode || (callbackResult.success ? "0" : "1032"), // Example M-Pesa result codes
      resultDesc: callbackResult.resultDesc || (callbackResult.success ? "The service request is processed successfully." : "Request cancelled by user."),
      status: callbackResult.success ? 'successful' : (callbackResult.resultCode === "1032" ? 'cancelled_by_user' : 'failed'),
      updatedAt: Timestamp.now(),
    };

    const paymentUpdates: Partial<Omit<Payment, 'id'>> = { // Use Omit to satisfy type for updateDoc
        stkPushDetails: updatedSTKDetails,
        status: callbackResult.success ? 'completed' : (updatedSTKDetails.status === 'cancelled_by_user' ? 'cancelled' : 'failed'),
        updatedAt: Timestamp.now()
    };

    if (callbackResult.success && callbackResult.reference) {
        paymentUpdates.reference = callbackResult.reference;
    }

    await updateDoc(paymentRef, paymentUpdates);
    console.log(`Simulated STK callback processed for ${checkoutRequestId}. Payment status: ${paymentUpdates.status}`);

    // TODO: If payment is 'completed', update the associated invoice's status.
    // This would require fetching the invoiceId from paymentDoc.data() and then calling invoiceService.updateInvoice.
    // Example:
    // if (paymentUpdates.status === 'completed') {
    //   const invoiceId = paymentDoc.data().invoiceId;
    //   // await updateInvoiceStatus(invoiceId, 'paid'); // Hypothetical function in invoiceService
    // }

  } catch (error) {
    console.error("Error simulating STK callback: ", error);
    throw new Error('Failed to simulate STK callback: ' + (error instanceof Error ? error.message : String(error)));
  }
};
