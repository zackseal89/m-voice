import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Spacing } from '@/constants/Colors';
import { Typography, createThemedTypography } from '@/constants/Typography';
import { useTheme } from '@/hooks/useTheme';
import Card from '@/components/ui/Card';
import { mockBusinessStats, mockInvoices, mockUser } from '@/services/mockData';
import { Plus, FileText, Users, ChartBar as BarChart3, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Clock, ArrowRight } from 'lucide-react-native';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const themedTypography = createThemedTypography(colors);
  const styles = createStyles(colors);
  
  const stats = mockBusinessStats;
  const recentInvoices = mockInvoices.slice(0, 3);

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return colors.success;
      case 'overdue': return colors.error;
      case 'sent': return colors.warning;
      default: return colors.textLight;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle size={16} color={colors.success} />;
      case 'overdue': return <AlertCircle size={16} color={colors.error} />;
      case 'sent': return <Clock size={16} color={colors.warning} />;
      default: return <FileText size={16} color={colors.textLight} />;
    }
  };

  const QuickActionButton = ({ icon, title, onPress, color = colors.primary }: any) => (
    <TouchableOpacity style={[styles.quickAction, { borderColor: color }]} onPress={onPress}>
      {icon}
      <Text style={[styles.quickActionText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={themedTypography.h1}>Welcome back!</Text>
            <Text style={themedTypography.bodySmall}>{mockUser.businessName}</Text>
          </View>
          <TouchableOpacity style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {mockUser.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(stats.outstandingAmount)}</Text>
            <Text style={styles.statLabel}>Outstanding</Text>
          </Card>
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalInvoices}</Text>
            <Text style={styles.statLabel}>Total Invoices</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.overdueInvoices}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <Card style={styles.section}>
          <Text style={[themedTypography.h3, styles.sectionTitle]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              icon={<Plus size={24} color={colors.primary} />}
              title="New Invoice"
              onPress={() => router.push('/invoices/create')}
            />
            <QuickActionButton
              icon={<Users size={24} color={colors.secondary} />}
              title="Add Client"
              onPress={() => router.push('/clients/create')}
              color={colors.secondary}
            />
            <QuickActionButton
              icon={<FileText size={24} color={colors.accent} />}
              title="View Invoices"
              onPress={() => router.push('/invoices')}
              color={colors.accent}
            />
            <QuickActionButton
              icon={<BarChart3 size={24} color={colors.success} />}
              title="Reports"
              onPress={() => router.push('/reports')}
              color={colors.success}
            />
          </View>
        </Card>

        {/* Recent Invoices */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[themedTypography.h3, styles.sectionTitle]}>Recent Invoices</Text>
            <TouchableOpacity onPress={() => router.push('/invoices')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentInvoices.map((invoice) => (
            <TouchableOpacity 
              key={invoice.id} 
              style={styles.invoiceItem}
              onPress={() => router.push(`/invoices/${invoice.id}`)}
            >
              <View style={styles.invoiceLeft}>
                {getStatusIcon(invoice.status)}
                <View style={styles.invoiceDetails}>
                  <Text style={themedTypography.body}>{invoice.number}</Text>
                  <Text style={themedTypography.bodySmall}>{invoice.client?.name}</Text>
                </View>
              </View>
              <View style={styles.invoiceRight}>
                <Text style={[themedTypography.body, { fontWeight: '600' }]}>
                  {formatCurrency(invoice.total)}
                </Text>
                <Text style={[
                  Typography.caption, 
                  { color: getStatusColor(invoice.status), textTransform: 'capitalize' }
                ]}>
                  {invoice.status}
                </Text>
              </View>
              <ArrowRight size={16} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>
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
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    color: colors.primary,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.bodySmall,
    marginTop: Spacing.xs,
    color: colors.textSecondary,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  seeAllText: {
    ...Typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  quickActionText: {
    ...Typography.bodySmall,
    marginTop: Spacing.sm,
    fontWeight: '600',
  },
  invoiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  invoiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  invoiceDetails: {
    marginLeft: Spacing.md,
  },
  invoiceRight: {
    alignItems: 'flex-end',
    marginRight: Spacing.md,
  },
});