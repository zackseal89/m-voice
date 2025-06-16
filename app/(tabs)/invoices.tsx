import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Spacing } from '@/constants/Colors';
import { Typography, createThemedTypography } from '@/constants/Typography';
import { useTheme } from '@/hooks/useTheme';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { mockInvoices } from '@/services/mockData';
import { Invoice } from '@/types';
import { Plus, Filter, Search, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Clock, FileText, Eye } from 'lucide-react-native';

export default function InvoicesScreen() {
  const { colors } = useTheme();
  const themedTypography = createThemedTypography(colors);
  const styles = createStyles(colors);
  
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [invoices] = useState(mockInvoices);

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return colors.success;
      case 'overdue': return colors.error;
      case 'sent': return colors.warning;
      case 'draft': return colors.textLight;
      default: return colors.textLight;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle size={18} color={colors.success} />;
      case 'overdue': return <AlertCircle size={18} color={colors.error} />;
      case 'sent': return <Clock size={18} color={colors.warning} />;
      case 'draft': return <FileText size={18} color={colors.textLight} />;
      default: return <FileText size={18} color={colors.textLight} />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (selectedFilter === 'all') return true;
    return invoice.status === selectedFilter;
  });

  const filterOptions = [
    { key: 'all', label: 'All', count: invoices.length },
    { key: 'draft', label: 'Draft', count: invoices.filter(i => i.status === 'draft').length },
    { key: 'sent', label: 'Sent', count: invoices.filter(i => i.status === 'sent').length },
    { key: 'paid', label: 'Paid', count: invoices.filter(i => i.status === 'paid').length },
    { key: 'overdue', label: 'Overdue', count: invoices.filter(i => i.status === 'overdue').length },
  ];

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <TouchableOpacity 
      style={styles.invoiceItem}
      onPress={() => router.push(`/invoices/${item.id}`)}
    >
      <Card style={styles.invoiceCard}>
        <View style={styles.invoiceHeader}>
          <View style={styles.invoiceLeft}>
            {getStatusIcon(item.status)}
            <View style={styles.invoiceDetails}>
              <Text style={[themedTypography.body, { fontWeight: '600' }]}>{item.number}</Text>
              <Text style={themedTypography.bodySmall}>{item.client?.name}</Text>
            </View>
          </View>
          <View style={styles.invoiceRight}>
            <Text style={[themedTypography.body, { fontWeight: '700' }]}>
              {formatCurrency(item.total)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.invoiceFooter}>
          <Text style={[themedTypography.caption, { color: colors.textLight }]}>
            Due: {formatDate(item.dueDate)}
          </Text>
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => router.push(`/invoices/${item.id}`)}
          >
            <Eye size={14} color={colors.primary} />
            <Text style={[themedTypography.caption, { color: colors.primary, marginLeft: 4 }]}>
              View
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={themedTypography.h1}>Invoices</Text>
        <Button
          title="Create"
          size="small"
          onPress={() => router.push('/invoices/create')}
          style={styles.createButton}
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterTab,
              selectedFilter === option.key && styles.filterTabActive
            ]}
            onPress={() => setSelectedFilter(option.key)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === option.key && styles.filterTextActive
            ]}>
              {option.label} ({option.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Invoices List */}
      <FlatList
        data={filteredInvoices}
        renderItem={renderInvoiceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Card style={styles.emptyState}>
            <FileText size={48} color={colors.textLight} />
            <Text style={[themedTypography.h3, { marginTop: Spacing.md, textAlign: 'center' }]}>
              No invoices found
            </Text>
            <Text style={[themedTypography.bodySmall, { textAlign: 'center', marginTop: Spacing.sm }]}>
              Create your first invoice to get started
            </Text>
            <Button
              title="Create Invoice"
              onPress={() => router.push('/invoices/create')}
              style={{ marginTop: Spacing.lg }}
            />
          </Card>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/invoices/create')}
      >
        <Plus size={24} color={colors.surface} />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  createButton: {
    paddingHorizontal: Spacing.lg,
  },
  filterContainer: {
    maxHeight: 60,
  },
  filterContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...Typography.bodySmall,
    fontWeight: '500',
    color: colors.text,
  },
  filterTextActive: {
    color: colors.surface,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  invoiceItem: {
    marginBottom: Spacing.md,
  },
  invoiceCard: {
    padding: Spacing.md,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  invoiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  invoiceDetails: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  invoiceRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: Spacing.xs,
  },
  statusText: {
    ...Typography.caption,
    color: colors.surface,
    fontWeight: '600',
    fontSize: 10,
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
    backgroundColor: colors.primary + '10',
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xl,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});