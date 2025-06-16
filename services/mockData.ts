import { Client, Invoice, Payment, BusinessStats, User } from '@/types';

// Mock user data
export const mockUser: User = {
  id: '1',
  phone: '+254712345678',
  name: 'John Kariuki',
  businessName: 'Kariuki Enterprises',
  email: 'john@kariukient.com',
  createdAt: new Date(),
};

// Mock clients data
export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Safaricom Ltd',
    email: 'procurement@safaricom.co.ke',
    phone: '+254722000000',
    address: 'Safaricom House, Waiyaki Way, Nairobi',
    taxPin: 'P051000000A',
    createdAt: new Date('2024-01-15'),
    userId: '1',
  },
  {
    id: '2',
    name: 'Kenya Commercial Bank',
    email: 'suppliers@kcbgroup.com',
    phone: '+254711000000',
    address: 'KCB Centre, Upper Hill, Nairobi',
    taxPin: 'P051000001B',
    createdAt: new Date('2024-02-10'),
    userId: '1',
  },
  {
    id: '3',
    name: 'Nakumatt Holdings',
    email: 'accounts@nakumatt.net',
    phone: '+254733000000',
    address: 'Nakumatt Lifestyle, Nairobi',
    taxPin: 'P051000002C',
    createdAt: new Date('2024-01-20'),
    userId: '1',
  },
];

// Mock invoices data
export const mockInvoices: Invoice[] = [
  {
    id: '1',
    number: 'INV-2024-001',
    clientId: '1',
    client: mockClients[0],
    items: [
      {
        id: '1',
        description: 'Software Development Services',
        quantity: 40,
        rate: 2500,
        amount: 100000,
      },
      {
        id: '2',
        description: 'System Maintenance',
        quantity: 1,
        rate: 15000,
        amount: 15000,
      },
    ],
    subtotal: 115000,
    tax: 18400, // 16% VAT
    total: 133400,
    status: 'sent',
    issueDate: new Date('2024-01-15'),
    dueDate: new Date('2024-02-14'),
    notes: 'Payment due within 30 days',
    createdAt: new Date('2024-01-15'),
    userId: '1',
  },
  {
    id: '2',
    number: 'INV-2024-002',
    clientId: '2',
    client: mockClients[1],
    items: [
      {
        id: '3',
        description: 'Financial Consulting',
        quantity: 20,
        rate: 5000,
        amount: 100000,
      },
    ],
    subtotal: 100000,
    tax: 16000,
    total: 116000,
    status: 'paid',
    issueDate: new Date('2024-01-20'),
    dueDate: new Date('2024-02-19'),
    createdAt: new Date('2024-01-20'),
    userId: '1',
  },
  {
    id: '3',
    number: 'INV-2024-003',
    clientId: '3',
    client: mockClients[2],
    items: [
      {
        id: '4',
        description: 'Retail System Setup',
        quantity: 1,
        rate: 250000,
        amount: 250000,
      },
    ],
    subtotal: 250000,
    tax: 40000,
    total: 290000,
    status: 'overdue',
    issueDate: new Date('2024-01-05'),
    dueDate: new Date('2024-01-20'),
    createdAt: new Date('2024-01-05'),
    userId: '1',
  },
];

// Mock payments data
export const mockPayments: Payment[] = [
  {
    id: '1',
    invoiceId: '2',
    amount: 116000,
    currency: 'KES',
    method: 'mpesa',
    reference: 'QBK12X3YZ9',
    status: 'completed',
    transactionId: 'MPESA123456789',
    payerPhone: '+254711000000',
    createdAt: new Date('2024-01-25'),
    userId: '1',
  },
  {
    id: '2',
    amount: 50000,
    currency: 'KES',
    method: 'mpesa',
    reference: 'QCL45M7NP2',
    status: 'completed',
    transactionId: 'MPESA987654321',
    payerPhone: '+254722111111',
    createdAt: new Date('2024-01-28'),
    userId: '1',
  },
];

// Mock business stats
export const mockBusinessStats: BusinessStats = {
  totalInvoices: 3,
  totalRevenue: 539400,
  outstandingAmount: 423400,
  paidInvoices: 1,
  overdueInvoices: 1,
  thisMonth: {
    revenue: 116000,
    invoices: 1,
  },
};

// Helper functions
export const getClientById = (id: string): Client | undefined => {
  return mockClients.find(client => client.id === id);
};

export const getInvoiceById = (id: string): Invoice | undefined => {
  return mockInvoices.find(invoice => invoice.id === id);
};

export const getInvoicesByStatus = (status: Invoice['status']): Invoice[] => {
  return mockInvoices.filter(invoice => invoice.status === status);
};

export const getUnmatchedPayments = (): Payment[] => {
  return mockPayments.filter(payment => !payment.invoiceId);
};