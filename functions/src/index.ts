import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import { defineSecret } from 'firebase-functions/params';

// Initialize Firebase Admin
admin.initializeApp();

// Define secrets
const mpesaConsumerKey = defineSecret('mpesa.consumer_key');
const mpesaConsumerSecret = defineSecret('mpesa.consumer_secret');
const mpesaShortcode = defineSecret('mpesa.shortcode');
const mpesaPasskey = defineSecret('mpesa.passkey');
const mpesaCallbackUrl = defineSecret('mpesa.callback_url');

// M-Pesa API endpoints
const MPESA_BASE_URL = 'https://sandbox.safaricom.co.ke'; // Use production URL for live
const AUTH_URL = `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;
const STK_PUSH_URL = `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`;

interface STKPushRequest {
  invoiceId: string;
  amount: number;
  phoneNumber: string;
  accountReference: string;
  transactionDesc: string;
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

interface CallbackData {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

// Helper function to get M-Pesa access token
async function getMpesaAccessToken(): Promise<string> {
  try {
    const auth = Buffer.from(`${mpesaConsumerKey.value()}:${mpesaConsumerSecret.value()}`).toString('base64');
    
    const response = await axios.get(AUTH_URL, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting M-Pesa access token:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get M-Pesa access token');
  }
}

// Helper function to generate timestamp
function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hour}${minute}${second}`;
}

// Helper function to generate password
function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
  const data = shortcode + passkey + timestamp;
  return Buffer.from(data).toString('base64');
}

// Cloud Function to initiate STK Push
export const initiateSTKPush = functions
  .runWith({
    secrets: [mpesaConsumerKey, mpesaConsumerSecret, mpesaShortcode, mpesaPasskey, mpesaCallbackUrl],
  })
  .https.onCall(async (data: STKPushRequest, context) => {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { invoiceId, amount, phoneNumber, accountReference, transactionDesc } = data;

    // Validate input
    if (!invoiceId || !amount || !phoneNumber || !accountReference) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
    }

    // Validate phone number format (Kenyan format)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    let formattedPhone = '';
    
    if (cleanPhone.startsWith('254')) {
      formattedPhone = cleanPhone;
    } else if (cleanPhone.startsWith('0')) {
      formattedPhone = '254' + cleanPhone.substring(1);
    } else if (cleanPhone.length === 9) {
      formattedPhone = '254' + cleanPhone;
    } else {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid phone number format');
    }

    try {
      // Get access token
      const accessToken = await getMpesaAccessToken();
      
      // Generate timestamp and password
      const timestamp = generateTimestamp();
      const password = generatePassword(mpesaShortcode.value(), mpesaPasskey.value(), timestamp);

      // Prepare STK Push request
      const stkPushData = {
        BusinessShortCode: mpesaShortcode.value(),
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount), // Ensure amount is integer
        PartyA: formattedPhone,
        PartyB: mpesaShortcode.value(),
        PhoneNumber: formattedPhone,
        CallBackURL: mpesaCallbackUrl.value(),
        AccountReference: accountReference,
        TransactionDesc: transactionDesc || `Payment for invoice ${invoiceId}`,
      };

      // Make STK Push request
      const response = await axios.post(STK_PUSH_URL, stkPushData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const stkResponse: STKPushResponse = response.data;

      // Store payment record in Firestore
      const paymentData = {
        userId: context.auth.uid,
        invoiceId,
        amount,
        currency: 'KES',
        method: 'M-Pesa',
        status: 'pending',
        phoneNumber: formattedPhone,
        merchantRequestId: stkResponse.MerchantRequestID,
        checkoutRequestId: stkResponse.CheckoutRequestID,
        stkPushDetails: {
          checkoutRequestId: stkResponse.CheckoutRequestID,
          merchantRequestId: stkResponse.MerchantRequestID,
          responseCode: stkResponse.ResponseCode,
          responseDescription: stkResponse.ResponseDescription,
          customerMessage: stkResponse.CustomerMessage,
          status: 'pending_confirmation',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        transactionDate: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Save to Firestore
      const paymentRef = await admin.firestore().collection('payments').add(paymentData);

      return {
        success: true,
        paymentId: paymentRef.id,
        checkoutRequestId: stkResponse.CheckoutRequestID,
        customerMessage: stkResponse.CustomerMessage,
      };

    } catch (error) {
      console.error('STK Push error:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('M-Pesa API Error:', error.response?.data);
        throw new functions.https.HttpsError('internal', `M-Pesa API Error: ${error.response?.data?.errorMessage || error.message}`);
      }
      
      throw new functions.https.HttpsError('internal', 'Failed to initiate STK Push');
    }
  });

// Cloud Function to handle M-Pesa callback
export const mpesaCallback = functions
  .runWith({
    secrets: [mpesaConsumerKey, mpesaConsumerSecret, mpesaShortcode, mpesaPasskey],
  })
  .https.onRequest(async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const callbackData: CallbackData = req.body;
      const stkCallback = callbackData.Body.stkCallback;

      console.log('M-Pesa Callback received:', JSON.stringify(stkCallback, null, 2));

      // Find the payment record by CheckoutRequestID
      const paymentsQuery = await admin.firestore()
        .collection('payments')
        .where('checkoutRequestId', '==', stkCallback.CheckoutRequestID)
        .limit(1)
        .get();

      if (paymentsQuery.empty) {
        console.error('Payment not found for CheckoutRequestID:', stkCallback.CheckoutRequestID);
        res.status(404).send('Payment not found');
        return;
      }

      const paymentDoc = paymentsQuery.docs[0];
      const paymentRef = paymentDoc.ref;
      const paymentData = paymentDoc.data();

      // Process callback based on result code
      const isSuccess = stkCallback.ResultCode === 0;
      let mpesaReceiptNumber = '';
      let transactionDate = '';

      if (isSuccess && stkCallback.CallbackMetadata) {
        // Extract transaction details from callback metadata
        const metadata = stkCallback.CallbackMetadata.Item;
        
        for (const item of metadata) {
          if (item.Name === 'MpesaReceiptNumber') {
            mpesaReceiptNumber = String(item.Value);
          } else if (item.Name === 'TransactionDate') {
            transactionDate = String(item.Value);
          }
        }
      }

      // Update payment record
      const updateData: any = {
        status: isSuccess ? 'completed' : 'failed',
        'stkPushDetails.resultCode': stkCallback.ResultCode,
        'stkPushDetails.resultDesc': stkCallback.ResultDesc,
        'stkPushDetails.status': isSuccess ? 'successful' : 'failed',
        'stkPushDetails.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (isSuccess) {
        updateData.reference = mpesaReceiptNumber;
        updateData.mpesaReceiptNumber = mpesaReceiptNumber;
        if (transactionDate) {
          updateData.mpesaTransactionDate = transactionDate;
        }
      }

      await paymentRef.update(updateData);

      // If payment is successful, update the invoice status
      if (isSuccess) {
        try {
          const invoiceRef = admin.firestore().collection('invoices').doc(paymentData.invoiceId);
          await invoiceRef.update({
            status: 'paid',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          
          console.log(`Invoice ${paymentData.invoiceId} marked as paid`);
        } catch (invoiceError) {
          console.error('Error updating invoice status:', invoiceError);
          // Don't fail the callback if invoice update fails
        }
      }

      console.log(`Payment ${paymentDoc.id} updated with status: ${isSuccess ? 'completed' : 'failed'}`);

      // Respond to M-Pesa
      res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Callback processed successfully',
      });

    } catch (error) {
      console.error('Error processing M-Pesa callback:', error);
      res.status(500).json({
        ResultCode: 1,
        ResultDesc: 'Internal server error',
      });
    }
  });

// Cloud Function to check payment status
export const checkPaymentStatus = functions
  .runWith({
    secrets: [mpesaConsumerKey, mpesaConsumerSecret],
  })
  .https.onCall(async (data: { paymentId: string }, context) => {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { paymentId } = data;

    if (!paymentId) {
      throw new functions.https.HttpsError('invalid-argument', 'Payment ID is required');
    }

    try {
      const paymentDoc = await admin.firestore().collection('payments').doc(paymentId).get();

      if (!paymentDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Payment not found');
      }

      const paymentData = paymentDoc.data();

      // Verify user owns this payment
      if (paymentData?.userId !== context.auth.uid) {
        throw new functions.https.HttpsError('permission-denied', 'Access denied');
      }

      return {
        paymentId,
        status: paymentData.status,
        amount: paymentData.amount,
        reference: paymentData.reference || null,
        stkPushDetails: paymentData.stkPushDetails || null,
      };

    } catch (error) {
      console.error('Error checking payment status:', error);
      throw new functions.https.HttpsError('internal', 'Failed to check payment status');
    }
  });