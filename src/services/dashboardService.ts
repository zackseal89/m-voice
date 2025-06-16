import { db, auth } from '../config/firebaseConfig';
import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import type { Invoice, Client, Payment, BusinessStats, MonthlyRevenueSummary } from '../../types'; // Adjust path

// Helper to format month string (e.g., "Jan 2023")
const formatMonthYear = (date: Date): string => {
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${month} ${year}`;
};

export const getBusinessStats = async (): Promise<BusinessStats> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated.');
  }
  const userId = currentUser.uid;

  let totalInvoicesCount = 0;
  let paidInvoicesCount = 0;
  let pendingInvoicesCount = 0;
  let totalRevenue = 0;
  let outstandingAmount = 0;
  const monthlyRevenueMap = new Map<string, number>();

  // --- Invoice Stats ---
  const invoicesQuery = query(collection(db, 'invoices'), where('userId', '==', userId));
  const invoicesSnapshot = await getDocs(invoicesQuery);
  const allUserInvoices: Invoice[] = [];
  invoicesSnapshot.forEach(doc => allUserInvoices.push({ id: doc.id, ...doc.data() } as Invoice));

  allUserInvoices.forEach((invoice: Invoice) => {
    if (invoice.status !== 'draft' && invoice.status !== 'cancelled') {
      totalInvoicesCount++;
    }

    if (invoice.status === 'paid') {
      paidInvoicesCount++;
      totalRevenue += invoice.total; // Ensure invoice.total is a number
      // Check if issueDate is a Firestore Timestamp and convert
      if (invoice.issueDate && typeof invoice.issueDate.toDate === 'function') {
        const issueDate = invoice.issueDate.toDate();
        const monthYear = formatMonthYear(issueDate);
        monthlyRevenueMap.set(monthYear, (monthlyRevenueMap.get(monthYear) || 0) + invoice.total);
      }
    } else if (invoice.status === 'sent' || invoice.status === 'overdue') {
      pendingInvoicesCount++;
      outstandingAmount += invoice.total; // Ensure invoice.total is a number
    }
  });

  // Generate monthly revenue for the last 6 months, including months with 0 revenue.
  const monthlyRevenue: MonthlyRevenueSummary[] = [];
  const M_FORMAT = 'YYYY-MM'; // For map key
  const L_FORMAT = 'MMM YYYY'; // For display label

  // Use a library like date-fns or moment.js for robust date manipulation in a real app.
  // Simple manual approach for demonstration:
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = formatMonthYear(date); // Using "Jan 2023" as key directly from map
    monthlyRevenue.push({
      month: monthKey, // Or format as 'YYYY-MM' if preferred for sorting then reformat for display
      revenue: monthlyRevenueMap.get(monthKey) || 0,
    });
  }
  // The monthlyRevenue array is now sorted chronologically for the last 6 months.

  // --- Clients Count ---
  const clientsQuery = query(collection(db, 'clients'), where('userId', '==', userId));
  const clientsSnapshot = await getDocs(clientsQuery);
  const clientsCount = clientsSnapshot.size;

  // --- Recent Invoices (example: last 3 created/sent, not draft/cancelled) ---
  // Ensure createdAt field exists and is a Timestamp for ordering.
  const recentInvoicesQuery = query(
    collection(db, 'invoices'),
    where('userId', '==', userId),
    where('status', 'in', ['sent', 'paid', 'overdue']),
    orderBy('createdAt', 'desc'),
    limit(3)
  );
  const recentInvoicesSnapshot = await getDocs(recentInvoicesQuery);
  const recentInvoices: Invoice[] = [];
  recentInvoicesSnapshot.forEach(doc => recentInvoices.push({ id: doc.id, ...doc.data()} as Invoice));

  // --- Recent Payments (example: last 3 completed) ---
  // Ensure transactionDate field exists and is a Timestamp for ordering.
  const recentPaymentsQuery = query(
    collection(db, 'payments'),
    where('userId', '==', userId),
    where('status', '==', 'completed'),
    orderBy('transactionDate', 'desc'),
    limit(3)
  );
  const recentPaymentsSnapshot = await getDocs(recentPaymentsQuery);
  const recentPayments: Payment[] = [];
  recentPaymentsSnapshot.forEach(doc => recentPayments.push({ id: doc.id, ...doc.data()} as Payment));

  return {
    totalInvoicesCount,
    paidInvoicesCount,
    pendingInvoicesCount,
    totalRevenue,
    outstandingAmount,
    clientsCount,
    monthlyRevenue, // This is now sorted chronologically for the last 6 months
    recentInvoices,
    recentPayments,
  };
};
