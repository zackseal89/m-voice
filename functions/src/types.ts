export interface STKPushRequest {
  invoiceId: string;
  amount: number;
  phoneNumber: string;
  accountReference: string;
  transactionDesc?: string;
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface CallbackMetadataItem {
  Name: string;
  Value: string | number;
}

export interface STKCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: CallbackMetadataItem[];
  };
}

export interface CallbackData {
  Body: {
    stkCallback: STKCallback;
  };
}

export interface PaymentRecord {
  id?: string;
  userId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  phoneNumber: string;
  merchantRequestId: string;
  checkoutRequestId: string;
  reference?: string;
  mpesaReceiptNumber?: string;
  mpesaTransactionDate?: string;
  stkPushDetails: {
    checkoutRequestId: string;
    merchantRequestId: string;
    responseCode: string;
    responseDescription: string;
    customerMessage: string;
    resultCode?: number;
    resultDesc?: string;
    status: 'pending_confirmation' | 'successful' | 'failed' | 'cancelled_by_user';
    createdAt: any;
    updatedAt: any;
  };
  transactionDate: any;
  createdAt: any;
  updatedAt: any;
}