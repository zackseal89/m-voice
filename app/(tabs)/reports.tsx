import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '@/constants/Colors';
import { Typography, createThemedTypography } from '@/constants/Typography';
import { useTheme } from '@/hooks/useTheme';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { mockBusinessStats, mockInvoices, mockPayments } from '@/services/mockData';
import { Download, Calendar, TrendingUp, DollarSign, FileText, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Mail, Share, FileSpreadsheet, Printer, Cloud, Zap } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function ReportsScreen() {
  const { colors } = useTheme();
  const themedTypography = createThemedTypography(colors);
  const styles = createStyles(colors);
  
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [exportAnimation] = useState(new Animated.Value(0));
  const stats = mockBusinessStats;

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const periods = [
    { key: 'thisWeek', label: 'This Week' },
    { key: 'thisMonth', label: 'This Month' },
    { key: 'thisQuarter', label: 'This Quarter' },
    { key: 'thisYear', label: 'This Year' },
  ];

  const revenueData = [
    { month: 'Jan', amount: 150000 },
    { month: 'Feb', amount: 280000 },
    { month: 'Mar', amount: 320000 },
    { month: 'Apr', amount: 290000 },
    { month: 'May', amount: 420000 },
    { month: 'Jun', amount: 380000 },
  ];

  const agingData = [
    { label: 'Current', amount: 150000, percentage: 35, color: colors.success },
    { label: '1-30 days', amount: 120000, percentage: 28, color: colors.warning },
    { label: '31-60 days', amount: 80000, percentage: 19, color: colors.accent },
    { label: '60+ days', amount: 73400, percentage: 18, color: colors.error },
  ];

  const exportOptions = [
    {
      id: 'pdf',
      title: 'PDF Report',
      subtitle: 'Professional formatted report',
      icon: FileText,
      color: colors.error,
      gradient: ['#FF6B6B', '#FF8E8E'],
      action: () => handleExport('pdf')
    },
    {
      id: 'excel',
      title: 'Excel Export',
      subtitle: 'Spreadsheet with raw data',
      icon: FileSpreadsheet,
      color: colors.success,
      gradient: ['#51CF66', '#69DB7C'],
      action: () => handleExport('excel')
    },
    {
      id: 'email',
      title: 'Email Report',
      subtitle: 'Send to stakeholders',
      icon: Mail,
      color: colors.primary,
      gradient: ['#339AF0', '#74C0FC'],
      action: () => handleExport('email')
    },
    {
      id: 'print',
      title: 'Print Report',
      subtitle: 'Physical copy',
      icon: Printer,
      color: colors.textSecondary,
      gradient: ['#868E96', '#ADB5BD'],
      action: () => handleExport('print')
    },
    {
      id: 'cloud',
      title: 'Cloud Backup',
      subtitle: 'Save to cloud storage',
      icon: Cloud,
      color: colors.accent,
      gradient: ['#FFD43B', '#FFF3BF'],
      action: () => handleExport('cloud')
    },
    {
      id: 'instant',
      title: 'Quick Share',
      subtitle: 'Instant sharing link',
      icon: Zap,
      color: '#9775FA',
      gradient: ['#9775FA', '#B197FC'],
      action: () => handleExport('instant')
    }
  ];

  const handleExport = (type: string) => {
    // Trigger animation
    Animated.sequence([
      Animated.timing(exportAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(exportAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Handle export logic here
    console.log(`Exporting ${type} report...`);
  };

  const SimpleBarChart = ({ data }: { data: typeof revenueData }) => {
    const maxAmount = Math.max(...data.map(d => d.amount));
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.barChart}>
          {data.map((item, index) => (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      height: `${(item.amount / maxAmount) * 100}%`,
                      backgroundColor: colors.primary,
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.barLabel, { color: colors.textLight }]}>{item.month}</Text>
            </View>
          ))}
        </View>
        <View style={styles.chartLegend}>
          <Text style={[themedTypography.caption, { color: colors.textLight }]}>Monthly Revenue (KES)</Text>
        </View>
      </View>
    );
  };

  const DonutChart = ({ data }: { data: typeof agingData }) => {
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    
    return (
      <View style={styles.donutContainer}>
        <View style={styles.donutLegend}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <View style={styles.legendText}>
                <Text style={themedTypography.bodySmall}>{item.label}</Text>
                <Text style={[themedTypography.caption, { fontWeight: '600' }]}>
                  {formatCurrency(item.amount)} ({item.percentage}%)
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const MetricCard = ({ icon, title, value, subtitle, trend }: any) => (
    <Card style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: colors.primary + '15' }]}>
          {icon}
        </View>
        {trend && (
          <View style={[styles.trendBadge, { 
            backgroundColor: trend > 0 ? colors.success + '15' : colors.error + '15' 
          }]}>
            <TrendingUp 
              size={12} 
              color={trend > 0 ? colors.success : colors.error}
              style={{ transform: [{ rotate: trend > 0 ? '0deg' : '180deg' }] }}
            />
            <Text style={[
              themedTypography.caption, 
              { 
                color: trend > 0 ? colors.success : colors.error,
                marginLeft: 2,
                fontWeight: '600'
              }
            ]}>
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={[themedTypography.h2, { marginVertical: Spacing.sm }]}>{value}</Text>
      <Text style={themedTypography.bodySmall}>{title}</Text>
      {subtitle && <Text style={themedTypography.caption}>{subtitle}</Text>}
    </Card>
  );

  const ExportCard = ({ option, index }: { option: any, index: number }) => {
    const IconComponent = option.icon;
    
    return (
      <TouchableOpacity 
        style={[styles.exportCard, { 
          backgroundColor: colors.surface,
          borderColor: option.color + '20',
          borderWidth: 1,
        }]}
        onPress={option.action}
        activeOpacity={0.8}
      >
        <View style={styles.exportCardContent}>
          <View style={[styles.exportIconContainer, { backgroundColor: option.color + '15' }]}>
            <IconComponent size={24} color={option.color} />
          </View>
          
          <View style={styles.exportTextContainer}>
            <Text style={[themedTypography.body, { fontWeight: '600' }]}>
              {option.title}
            </Text>
            <Text style={[themedTypography.caption, { color: colors.textLight }]}>
              {option.subtitle}
            </Text>
          </View>
          
          <View style={[styles.exportArrow, { backgroundColor: option.color + '10' }]}>
            <Download size={16} color={option.color} />
          </View>
        </View>
        
        {/* Animated overlay for feedback */}
        <Animated.View 
          style={[
            styles.exportOverlay,
            {
              opacity: exportAnimation,
              backgroundColor: option.color + '20',
            }
          ]}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={themedTypography.h1}>Reports</Text>
          <Button
            title="Export"
            size="small"
            variant="outline"
            onPress={() => {}}
            style={styles.exportButton}
          />
        </View>

        {/* Period Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.periodContainer}
          contentContainerStyle={styles.periodContent}
        >
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodTab,
                selectedPeriod === period.key && styles.periodTabActive
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period.key && styles.periodTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricsRow}>
            <MetricCard
              icon={<DollarSign size={20} color={colors.primary} />}
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              subtitle="All time"
              trend={12}
            />
            <MetricCard
              icon={<Clock size={20} color={colors.warning} />}
              title="Outstanding"
              value={formatCurrency(stats.outstandingAmount)}
              subtitle={`${stats.overdueInvoices} overdue`}
              trend={-5}
            />
          </View>
          
          <View style={styles.metricsRow}>
            <MetricCard
              icon={<FileText size={20} color={colors.secondary} />}
              title="Total Invoices"
              value={stats.totalInvoices.toString()}
              subtitle="This month: 2"
            />
            <MetricCard
              icon={<CheckCircle size={20} color={colors.success} />}
              title="Collection Rate"
              value="67%"
              subtitle="Paid on time"
              trend={8}
            />
          </View>
        </View>

        {/* Revenue Chart */}
        <Card style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <Text style={themedTypography.h3}>Revenue Trend</Text>
            <TouchableOpacity>
              <Calendar size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <SimpleBarChart data={revenueData} />
        </Card>

        {/* Aging Report */}
        <Card style={styles.chartCard}>
          <Text style={[themedTypography.h3, { marginBottom: Spacing.lg }]}>
            Accounts Receivable Aging
          </Text>
          <DonutChart data={agingData} />
        </Card>

        {/* Quick Stats */}
        <Card style={styles.quickStatsCard}>
          <Text style={[themedTypography.h3, { marginBottom: Spacing.lg }]}>
            Quick Stats
          </Text>
          
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={themedTypography.caption}>Average Invoice Value</Text>
              <Text style={[themedTypography.h4, { color: colors.primary }]}>
                {formatCurrency(stats.totalRevenue / stats.totalInvoices)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={themedTypography.caption}>Payment Days (Avg)</Text>
              <Text style={[themedTypography.h4, { color: colors.secondary }]}>
                24 days
              </Text>
            </View>
          </View>
          
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={themedTypography.caption}>This Month Revenue</Text>
              <Text style={[themedTypography.h4, { color: colors.success }]}>
                {formatCurrency(stats.thisMonth.revenue)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={themedTypography.caption}>Growth Rate</Text>
              <Text style={[themedTypography.h4, { color: colors.accent }]}>
                +15.2%
              </Text>
            </View>
          </View>
        </Card>

        {/* Creative Export Options */}
        <Card style={styles.exportOptionsCard}>
          <View style={styles.exportHeader}>
            <View>
              <Text style={[themedTypography.h3, { marginBottom: Spacing.xs }]}>
                Export & Share
              </Text>
              <Text style={[themedTypography.bodySmall, { color: colors.textLight }]}>
                Choose your preferred export format
              </Text>
            </View>
            <View style={[styles.exportBadge, { backgroundColor: colors.accent + '15' }]}>
              <Share size={16} color={colors.accent} />
            </View>
          </View>
          
          <View style={styles.exportGrid}>
            {exportOptions.map((option, index) => (
              <ExportCard key={option.id} option={option} index={index} />
            ))}
          </View>
          
          {/* Quick Actions Row */}
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[themedTypography.bodySmall, { color: colors.primary, fontWeight: '600' }]}>
                Schedule Report
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.success + '10' }]}>
              <Text style={[themedTypography.bodySmall, { color: colors.success, fontWeight: '600' }]}>
                Auto-Export
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  exportButton: {
    paddingHorizontal: Spacing.lg,
  },
  periodContainer: {
    maxHeight: 60,
  },
  periodContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  periodTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodText: {
    ...Typography.bodySmall,
    fontWeight: '500',
    color: colors.text,
  },
  periodTextActive: {
    color: colors.surface,
  },
  metricsContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  metricCard: {
    flex: 1,
    padding: Spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  chartCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  chartContainer: {
    height: 200,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 160,
    paddingBottom: Spacing.md,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    width: '60%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    ...Typography.caption,
    marginTop: Spacing.sm,
  },
  chartLegend: {
    alignItems: 'center',
  },
  donutContainer: {
    alignItems: 'center',
  },
  donutLegend: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.md,
  },
  legendText: {
    flex: 1,
  },
  quickStatsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  exportOptionsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  exportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  exportBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportGrid: {
    gap: Spacing.md,
  },
  exportCard: {
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  exportCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  exportTextContainer: {
    flex: 1,
  },
  exportArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  quickAction: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
});