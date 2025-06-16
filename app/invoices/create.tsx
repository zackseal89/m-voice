import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Spacing } from '@/constants/Colors';
import { Typography, createThemedTypography } from '@/constants/Typography';
import { useTheme } from '@/hooks/useTheme';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { mockClients } from '@/services/mockData';
import { InvoiceItem } from '@/types';
import { 
  X,
  Plus,
  Save,
  Send,
  Eye,
  Trash2,
  Calendar
} from 'lucide-react-native';

export default function CreateInvoiceScreen() {
  const { colors } = useTheme();
  const themedTypography = createThemedTypography(colors);
  const styles = createStyles(colors);
  
  const [formData, setFormData] = useState({
    clientId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    }
  ]);

  const [showClientPicker, setShowClientPicker] = useState(false);

  const selectedClient = mockClients.find(c => c.id === formData.clientId);

  const calculateItemAmount = (quantity: number, rate: number) => {
    return quantity * rate;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.16; // 16% VAT
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate amount when quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = calculateItemAmount(
        updatedItems[index].quantity,
        updatedItems[index].rate
      );
    }
    
    setItems(updatedItems);
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    if (!formData.clientId) {
      Alert.alert('Error', 'Please select a client');
      return false;
    }
    
    if (items.some(item => !item.description.trim())) {
      Alert.alert('Error', 'Please enter description for all items');
      return false;
    }
    
    if (items.some(item => item.quantity <= 0 || item.rate <= 0)) {
      Alert.alert('Error', 'Please enter valid quantity and rate for all items');
      return false;
    }
    
    return true;
  };

  const handleSave = (status: 'draft' | 'sent') => {
    if (!validateForm()) return;
    
    const { subtotal, tax, total } = calculateTotals();
    
    const invoice = {
      id: Date.now().toString(),
      number: `INV-2024-${String(Date.now()).slice(-3)}`,
      clientId: formData.clientId,
      client: selectedClient,
      items,
      subtotal,
      tax,
      total,
      status,
      issueDate: new Date(formData.issueDate),
      dueDate: new Date(formData.dueDate),
      notes: formData.notes || undefined,
      createdAt: new Date(),
      userId: '1',
    };
    
    // Save invoice logic here
    console.log('Saving invoice:', invoice);
    
    Alert.alert(
      'Success',
      `Invoice ${status === 'draft' ? 'saved as draft' : 'sent successfully'}!`,
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  const ClientPicker = () => (
    <View style={styles.overlay}>
      <View style={styles.pickerModal}>
        <View style={styles.pickerHeader}>
          <Text style={themedTypography.h3}>Select Client</Text>
          <TouchableOpacity onPress={() => setShowClientPicker(false)}>
            <X size={24} color={colors.textLight} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.clientList}>
          {mockClients.map((client) => (
            <TouchableOpacity
              key={client.id}
              style={styles.clientItem}
              onPress={() => {
                setFormData({ ...formData, clientId: client.id });
                setShowClientPicker(false);
              }}
            >
              <Text style={[themedTypography.body, { fontWeight: '600' }]}>{client.name}</Text>
              {client.email && <Text style={themedTypography.bodySmall}>{client.email}</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const totals = calculateTotals();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={themedTypography.h2}>Create Invoice</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Client Selection */}
        <Card style={styles.section}>
          <Text style={[themedTypography.h4, styles.sectionTitle]}>Client Details</Text>
          
          <TouchableOpacity 
            style={styles.clientSelector}
            onPress={() => setShowClientPicker(true)}
          >
            {selectedClient ? (
              <View>
                <Text style={[themedTypography.body, { fontWeight: '600' }]}>
                  {selectedClient.name}
                </Text>
                {selectedClient.email && (
                  <Text style={themedTypography.bodySmall}>{selectedClient.email}</Text>
                )}
              </View>
            ) : (
              <Text style={[themedTypography.body, { color: colors.textLight }]}>
                Select a client
              </Text>
            )}
          </TouchableOpacity>
        </Card>

        {/* Invoice Details */}
        <Card style={styles.section}>
          <Text style={[themedTypography.h4, styles.sectionTitle]}>Invoice Details</Text>
          
          <View style={styles.dateRow}>
            <Input
              label="Issue Date"
              value={formData.issueDate}
              onChangeText={(text) => setFormData({ ...formData, issueDate: text })}
              style={{ flex: 1, marginRight: Spacing.sm }}
            />
            <Input
              label="Due Date"
              value={formData.dueDate}
              onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
              style={{ flex: 1, marginLeft: Spacing.sm }}
            />
          </View>
        </Card>

        {/* Line Items */}
        <Card style={styles.section}>
          <View style={styles.itemsHeader}>
            <Text style={[themedTypography.h4, styles.sectionTitle]}>Items</Text>
            <TouchableOpacity onPress={addItem} style={styles.addButton}>
              <Plus size={20} color={colors.primary} />
              <Text style={[themedTypography.bodySmall, { color: colors.primary, marginLeft: 4 }]}>
                Add Item
              </Text>
            </TouchableOpacity>
          </View>
          
          {items.map((item, index) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemHeader}>
                <Text style={themedTypography.bodySmall}>Item {index + 1}</Text>
                {items.length > 1 && (
                  <TouchableOpacity onPress={() => removeItem(index)}>
                    <Trash2 size={16} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
              
              <Input
                label="Description"
                value={item.description}
                onChangeText={(text) => updateItem(index, 'description', text)}
                placeholder="Enter item description"
                required
              />
              
              <View style={styles.itemDetails}>
                <Input
                  label="Qty"
                  value={item.quantity.toString()}
                  onChangeText={(text) => updateItem(index, 'quantity', parseInt(text) || 0)}
                  keyboardType="numeric"
                  style={{ flex: 1, marginRight: Spacing.sm }}
                />
                <Input
                  label="Rate (KES)"
                  value={item.rate.toString()}
                  onChangeText={(text) => updateItem(index, 'rate', parseFloat(text) || 0)}
                  keyboardType="numeric"
                  style={{ flex: 2, marginHorizontal: Spacing.sm }}
                />
                <View style={styles.amountContainer}>
                  <Text style={themedTypography.bodySmall}>Amount</Text>
                  <Text style={[themedTypography.body, { fontWeight: '600', marginTop: 8 }]}>
                    KES {item.amount.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Card>

        {/* Totals */}
        <Card style={styles.section}>
          <Text style={[themedTypography.h4, styles.sectionTitle]}>Summary</Text>
          
          <View style={styles.totalRow}>
            <Text style={themedTypography.body}>Subtotal</Text>
            <Text style={themedTypography.body}>KES {totals.subtotal.toLocaleString()}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={themedTypography.body}>VAT (16%)</Text>
            <Text style={themedTypography.body}>KES {totals.tax.toLocaleString()}</Text>
          </View>
          
          <View style={[styles.totalRow, styles.totalFinal]}>
            <Text style={[themedTypography.h4, { color: colors.primary }]}>Total</Text>
            <Text style={[themedTypography.h4, { color: colors.primary }]}>
              KES {totals.total.toLocaleString()}
            </Text>
          </View>
        </Card>

        {/* Notes */}
        <Card style={styles.section}>
          <Input
            label="Notes (Optional)"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Add any additional notes..."
            multiline
            numberOfLines={3}
          />
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Preview"
          variant="outline"
          onPress={() => {}}
          style={{ flex: 1, marginRight: Spacing.sm }}
        />
        <Button
          title="Save Draft"
          variant="secondary"
          onPress={() => handleSave('draft')}
          style={{ flex: 1, marginHorizontal: Spacing.xs }}
        />
        <Button
          title="Send Invoice"
          onPress={() => handleSave('sent')}
          style={{ flex: 1, marginLeft: Spacing.sm }}
        />
      </View>

      {/* Client Picker Modal */}
      {showClientPicker && <ClientPicker />}
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
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  clientSelector: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    backgroundColor: colors.surface,
  },
  dateRow: {
    flexDirection: 'row',
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
    backgroundColor: colors.primary + '10',
  },
  itemRow: {
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  amountContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  totalFinal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pickerModal: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    margin: Spacing.lg,
    maxHeight: '70%',
    width: '90%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  clientList: {
    maxHeight: 300,
  },
  clientItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
});