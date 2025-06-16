/*
export interface User { // Commenting out the old User type
  id: string;
  phone: string;
  name: string;
  businessName: string;
  email?: string;
  createdAt: Date;
}
*/
// Note: The User type will now primarily be managed by Firebase Authentication.
// We can use firebase.User or create a custom interface mapping if needed later.
// For example:
// import type { User as FirebaseUser } from 'firebase/auth';
// export type AppUser = Pick<FirebaseUser, 'uid' | 'email' | 'displayName'> & { /* custom fields */ };

import type { Timestamp } from 'firebase/firestore'; // Import Timestamp
import type { User as FirebaseUser } from 'firebase/auth'; // For convenience

// Client interface (should already be updated from previous step)
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
  userId?: string;
  createdAt?: Timestamp; // Or Date, ensure consistency
  updatedAt?: Timestamp; // Or Date
}

export interface InvoiceItem {
  id: string; // Good to have a unique ID for list keys, can be generated client-side
  description: string;
  quantity: number;
  rate: number;
  amount: number; // Calculated: quantity * rate
}

export interface Invoice {
  id: string; // Firestore document ID
  invoiceNumber: string; // Should be unique per user, potentially generated
  clientId: string; // Store client ID
  // clientName?: string; // Optional: denormalize for quick display, but keep source of truth as client doc
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number; // Store the calculated tax amount
  taxRate?: number; // Optional: store the rate used for calculation
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Timestamp; // Use Firestore Timestamp
  dueDate: Timestamp;   // Use Firestore Timestamp
  userId: string; // Ensure this is not optional for typed queries
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  notes?: string; // Optional field for any notes
}

export interface STKPushStatus {
  checkoutRequestId: string; // Primary key for STK push
  merchantRequestId: string;
  responseCode: string; // Initial response
  responseDescription: string; // Initial response
  customerMessage: string; // Initial response
  resultCode?: string;      // From callback
  resultDesc?: string;      // From callback
  // callbackMetadata?: object; // Store actual callback items if needed
  status: 'pending_confirmation' | 'successful' | 'failed' | 'cancelled_by_user' | 'timeout' | 'request_error'; // Granular status
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Any other relevant fields from M-Pesa callback
}

export interface Payment {
  id: string; // Firestore document ID
  invoiceId: string; // Link to an invoice, make it mandatory for this app context
  userId: string;    // Link to user, mandatory
  amount: number;
  currency: string; // e.g., 'KES'
  method: 'M-Pesa' | 'Bank' | 'Cash'; // Could be extended
  reference?: string; // e.g., M-Pesa transaction ID after successful payment
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionDate: Timestamp; // When the payment was recorded/attempted
  createdAt: Timestamp;
  updatedAt: Timestamp;
  stkPushDetails?: STKPushStatus; // Embed STK push details if a payment is via M-Pesa STK
  notes?: string;
}

export interface MonthlyRevenueSummary {
  month: string; // e.g., "Jan 2023" or "2023-01"
  revenue: number;
}

export interface RecentActivityItem {
  id: string; // document id of the item for linking
  type: 'invoice' | 'payment' | 'client'; // Type of activity
  description: string; // e.g., "Invoice #INV-001 sent" or "Payment for INV-001 received"
  date: Timestamp; // Date of the activity
  amount?: number; // Optional: for invoices/payments
}

export interface BusinessStats {
  totalInvoicesCount: number; // Total count of non-draft/cancelled invoices
  paidInvoicesCount: number;
  pendingInvoicesCount: number; // Sent or Overdue

  totalRevenue: number; // Sum of 'total' from 'paid' invoices
  outstandingAmount: number; // Sum of 'total' from 'sent' or 'overdue' invoices

  clientsCount: number;

  monthlyRevenue: MonthlyRevenueSummary[]; // For a chart, e.g., last 6-12 months

  // recentActivities are simpler to implement if fetched directly by UI from respective services for now
  // Or implement a basic version here
  recentInvoices?: Invoice[]; // Last 5 created/sent invoices
  recentPayments?: Payment[]; // Last 5 completed payments
}

// --- User Profile and Settings ---

export interface NotificationPreferences {
  invoiceReminders: boolean;
  paymentReceivedAlerts: boolean;
  // Add other specific notification toggles as needed
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  // Add other app-specific settings
}

// This will be the structure for documents in the 'users' collection
export interface UserProfileData {
  id: string; // Should be Firebase Auth UID
  email: string; // Copied from Firebase Auth for convenience, or rely on auth.currentUser.email
  name?: string; // User's display name
  businessName?: string;
  // Business address, contact, etc., can be added here or in a nested object
  // businessAddress?: string;
  // businessPhoneNumber?: string;
  notificationPreferences?: NotificationPreferences;
  appSettings?: AppSettings;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// You might also want a merged type for convenience in your app state
export type AppUser = FirebaseUser & Partial<Pick<UserProfileData, 'name' | 'businessName' | 'notificationPreferences' | 'appSettings'>>;