export interface User {
  id: string;
  phone: string;
  name: string;
  businessName: string;
  email?: string;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxPin?: string;
  createdAt: Date;
  userId: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  client?: Client;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  notes?: string;
  createdAt: Date;
  userId: string;
}

export interface Payment {
  id: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  method: 'mpesa' | 'bank' | 'cash';
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  payerPhone?: string;
  createdAt: Date;
  userId: string;
}

export interface STKPushStatus {
  id: string;
  invoiceId: string;
  amount: number;
  phone: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  checkoutRequestId?: string;
  resultCode?: number;
  resultDesc?: string;
  createdAt: Date;
}

export interface BusinessStats {
  totalInvoices: number;
  totalRevenue: number;
  outstandingAmount: number;
  paidInvoices: number;
  overdueInvoices: number;
  thisMonth: {
    revenue: number;
    invoices: number;
  };
}