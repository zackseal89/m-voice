import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebaseConfig';

interface STKPushRequest {
  invoiceId: string;
  amount: number;
  phoneNumber: string;
  accountReference: string;
  transactionDesc?: string;
}

interface STKPushResponse {
  success: boolean;
  paymentId: string;
  checkoutRequestId: string;
  customerMessage: string;
}

interface PaymentStatusResponse {
  paymentId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  reference?: string;
  stkPushDetails?: any;
}

// Initialize STK Push
export const initiateSTKPush = async (data: STKPushRequest): Promise<STKPushResponse> => {
  try {
    const initiateSTKPushFunction = httpsCallable(functions, 'initiateSTKPush');
    const result = await initiateSTKPushFunction(data);
    return result.data as STKPushResponse;
  } catch (error) {
    console.error('Error initiating STK Push:', error);
    throw new Error('Failed to initiate M-Pesa payment');
  }
};

// Check payment status
export const checkPaymentStatus = async (paymentId: string): Promise<PaymentStatusResponse> => {
  try {
    const checkPaymentStatusFunction = httpsCallable(functions, 'checkPaymentStatus');
    const result = await checkPaymentStatusFunction({ paymentId });
    return result.data as PaymentStatusResponse;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw new Error('Failed to check payment status');
  }
};

// Format phone number for M-Pesa
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format for Kenyan numbers
  if (cleaned.startsWith('254')) {
    return cleaned;
  } else if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  } else if (cleaned.length === 9) {
    return '254' + cleaned;
  }
  
  return cleaned;
};

// Validate phone number
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const formatted = formatPhoneNumber(phoneNumber);
  return formatted.length === 12 && formatted.startsWith('254');
};

// Generate account reference from invoice
export const generateAccountReference = (invoiceNumber: string): string => {
  return invoiceNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};