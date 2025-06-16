import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Spacing } from '@/constants/Colors';
import { Typography, createThemedTypography } from '@/constants/Typography';
import { useTheme } from '@/hooks/useTheme';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { mockInvoices } from '@/services/mockData';
import { X, Smartphone, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Clock, RefreshCw } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';

type PaymentStatus = 'idle' | 'initiating' | 'pending' | 'success' | 'failed' | 'cancelled';

export default function MPesaPaymentScreen() {
  const { colors } = useTheme();
  const themedTypography = createThemedTypography(colors);
  const styles = createStyles(colors);
  
  const { invoiceId } = useLocalSearchParams();
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [transactionId, setTransactionId] = useState('');
  const [countdown, setCountdown] = useState(120); // 2 minutes

  const invoice = mockInvoices.find(i => i.id === invoiceId);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'pending' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && status === 'pending') {
      setStatus('failed');
    }
    return () => clearTimeout(timer);
  }, [status, countdown]);

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatPhone = (phoneNumber: string) => {
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

  const validatePhone = (phoneNumber: string) => {
    const formatted = formatPhone(phoneNumber);
    return formatted.length === 12 && formatted.startsWith('254');
  };

  const initiateStkPush = async () => {
    if (!validatePhone(phone)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid Kenyan phone number');
      return;
    }
    
    if (!invoice) {
      Alert.alert('Error', 'Invoice not found');
      return;
    }

    setStatus('initiating');
    
    // Simulate API call delay
    setTimeout(() => {
      const mockTransactionId = `MPX${Date.now()}`;
      setTransactionId(mockTransactionId);
      setStatus('pending');
      setCountdown(120);
      
      // Simulate random success/failure after some time
      setTimeout(() => {
        const randomOutcome = Math.random();
        if (randomOutcome > 0.3) { // 70% success rate
          setStatus('success');
        } else {
          setStatus('failed');
        }
      }, Math.random() * 15000 + 5000); // Random between 5-20 seconds
    }, 2000);
  };

  const handleRetry = () => {
    setStatus('idle');
    setTransactionId('');
    setCountdown(120);
  };

  const handleCancel = () => {
    if (status === 'pending') {
      setStatus('cancelled');
    } else {
      router.back();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!invoice) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.error} />
          <Text style={[themedTypography.h3, { marginTop: Spacing.md }]}>Invoice not found</Text>
          <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: Spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  const StatusIndicator = () => {
    switch (status) {
      case 'initiating':
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color={colors.mpesaGreen} />
            <Text style={[themedTypography.h3, { marginTop: Spacing.md }]}>Initiating Payment</Text>
            <Text style={themedTypography.bodySmall}>Setting up M-Pesa payment...</Text>
          </View>
        );
      
      case 'pending':
        return (
          <View style={styles.statusContainer}>
            <View style={styles.pendingIndicator}>
              <Smartphone size={48} color={colors.mpesaGreen} />
              <View style={styles.pulseAnimation} />
            </View>
            <Text style={[themedTypography.h3, { marginTop: Spacing.md }]}>Payment Pending</Text>
            <Text style={themedTypography.bodySmall}>
              Check your phone for M-Pesa prompt
            </Text>
            <Text style={[themedTypography.h4, { color: colors.warning, marginTop: Spacing.sm }]}>
              Time remaining: {formatTime(countdown)}
            </Text>
          </View>
        );
      
      case 'success':
        return (
          <View style={styles.statusContainer}>
            <CheckCircle size={48} color={colors.success} />
            <Text style={[themedTypography.h3, { marginTop: Spacing.md, color: colors.success }]}>
              Payment Successful!
            </Text>
            <Text style={themedTypography.bodySmall}>
              Payment received successfully
            </Text>
            <Text style={[themedTypography.caption, { marginTop: Spacing.sm }]}>
              Transaction ID: {transactionId}
            </Text>
          </View>
        );
      
      case 'failed':
        return (
          <View style={styles.statusContainer}>
            <AlertCircle size={48} color={colors.error} />
            <Text style={[themedTypography.h3, { marginTop: Spacing.md, color: colors.error }]}>
              Payment Failed
            </Text>
            <Text style={themedTypography.bodySmall}>
              The payment could not be completed
            </Text>
          </View>
        );
      
      case 'cancelled':
        return (
          <View style={styles.statusContainer}>
            <X size={48} color={colors.textLight} />
            <Text style={[themedTypography.h3, { marginTop: Spacing.md }]}>Payment Cancelled</Text>
            <Text style={themedTypography.bodySmall}>
              The payment was cancelled
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={themedTypography.h2}>M-Pesa Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Invoice Summary */}
        <Card style={styles.invoiceCard}>
          <View style={styles.invoiceHeader}>
            <Text style={themedTypography.h3}>Invoice {invoice.number}</Text>
            <Text style={[themedTypography.h2, { color: colors.primary }]}>
              {formatCurrency(invoice.total)}
            </Text>
          </View>
          <Text style={themedTypography.bodySmall}>
            {invoice.client?.name}
          </Text>
        </Card>

        {status === 'idle' && (
          <>
            {/* M-Pesa Logo/Branding */}
            <Card style={styles.mpesaCard}>
              <View style={styles.mpesaHeader}>
                <View style={styles.mpesaLogo}>
                  <Smartphone size={32} color={colors.mpesaGreen} />
                </View>
                <View>
                  <Text style={[themedTypography.h3, { color: colors.mpesaGreen }]}>M-Pesa</Text>
                  <Text style={themedTypography.bodySmall}>Pay with M-Pesa</Text>
                </View>
              </View>
            </Card>

            {/* Phone Input */}
            <Card style={styles.inputCard}>
              <Text style={[themedTypography.h4, { marginBottom: Spacing.md }]}>
                Enter Phone Number
              </Text>
              <Input
                label="M-Pesa Phone Number"
                value={phone}
                onChangeText={setPhone}
                placeholder="0712345678"
                keyboardType="phone-pad"
                maxLength={12}
              />
              <Text style={themedTypography.caption}>
                Enter the phone number registered with M-Pesa
              </Text>
            </Card>

            {/* QR Code Alternative */}
            <Card style={styles.qrCard}>
              <Text style={[themedTypography.h4, { marginBottom: Spacing.md, textAlign: 'center' }]}>
                Or Scan QR Code
              </Text>
              <View style={styles.qrContainer}>
                <QRCode
                  value={`mpesa://pay?amount=${invoice.total}&reference=${invoice.number}&business=123456`}
                  size={120}
                  color={colors.text}
                  backgroundColor={colors.surface}
                />
              </View>
              <Text style={[themedTypography.caption, { textAlign: 'center', marginTop: Spacing.sm }]}>
                Scan with M-Pesa app
              </Text>
            </Card>
          </>
        )}

        {status !== 'idle' && (
          <Card style={styles.statusCard}>
            <StatusIndicator />
          </Card>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {status === 'idle' && (
          <>
            <Button
              title="Cancel"
              variant="outline"
              onPress={handleCancel}
              style={{ flex: 1, marginRight: Spacing.sm }}
            />
            <Button
              title="Pay Now"
              onPress={initiateStkPush}
              disabled={!validatePhone(phone)}
              style={{ flex: 2, marginLeft: Spacing.sm }}
            />
          </>
        )}
        
        {status === 'pending' && (
          <Button
            title="Cancel Payment"
            variant="outline"
            onPress={handleCancel}
            fullWidth
          />
        )}
        
        {status === 'success' && (
          <Button
            title="Done"
            onPress={() => router.back()}
            fullWidth
          />
        )}
        
        {(status === 'failed' || status === 'cancelled') && (
          <>
            <Button
              title="Try Again"
              onPress={handleRetry}
              style={{ flex: 1, marginRight: Spacing.sm }}
            />
            <Button
              title="Close"
              variant="outline"
              onPress={() => router.back()}
              style={{ flex: 1, marginLeft: Spacing.sm }}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  invoiceCard: {
    marginBottom: Spacing.lg,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  mpesaCard: {
    marginBottom: Spacing.lg,
    backgroundColor: colors.mpesaGreen + '05',
    borderColor: colors.mpesaGreen + '20',
  },
  mpesaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mpesaLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.mpesaGreen + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  inputCard: {
    marginBottom: Spacing.lg,
  },
  qrCard: {
    marginBottom: Spacing.lg,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  statusCard: {
    flex: 1,
    justifyContent: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  pendingIndicator: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseAnimation: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.mpesaGreen + '30',
    // Animation would be handled by Reanimated in a real app
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});