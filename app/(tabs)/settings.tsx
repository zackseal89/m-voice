import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Spacing } from '@/constants/Colors';
import { Typography, createThemedTypography } from '@/constants/Typography';
import { useTheme } from '@/hooks/useTheme';
import Card from '@/components/ui/Card';
import { mockUser } from '@/services/mockData';
import { User, Building2, Bell, Palette, CircleHelp as HelpCircle, Shield, LogOut, ChevronRight, Phone, Mail, CreditCard, Moon, Sun } from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const themedTypography = createThemedTypography(colors);
  
  const [notifications, setNotifications] = useState({
    invoiceReminders: true,
    paymentReceived: true,
    overdueAlerts: true,
    monthlyReports: false,
  });

  const styles = createStyles(colors);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Handle logout logic
            router.replace('/auth/signin');
          }
        }
      ]
    );
  };

  const SettingsItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent,
    showChevron = true 
  }: any) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsLeft}>
        <View style={styles.settingsIcon}>
          {icon}
        </View>
        <View>
          <Text style={themedTypography.body}>{title}</Text>
          {subtitle && <Text style={themedTypography.bodySmall}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingsRight}>
        {rightComponent}
        {showChevron && <ChevronRight size={16} color={colors.textLight} />}
      </View>
    </TouchableOpacity>
  );

  const SettingsSection = ({ title, children }: any) => (
    <Card style={styles.settingsSection}>
      <Text style={[themedTypography.h4, styles.sectionTitle]}>{title}</Text>
      {children}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={themedTypography.h1}>Settings</Text>
        </View>

        {/* Profile Section */}
        <Card style={styles.profileCard}>
          <TouchableOpacity style={styles.profileContent}>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarText}>
                {mockUser.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[themedTypography.body, { fontWeight: '600' }]}>
                {mockUser.name}
              </Text>
              <Text style={themedTypography.bodySmall}>{mockUser.businessName}</Text>
              <Text style={themedTypography.caption}>{mockUser.phone}</Text>
            </View>
            <ChevronRight size={16} color={colors.textLight} />
          </TouchableOpacity>
        </Card>

        {/* Business Settings */}
        <SettingsSection title="Business">
          <SettingsItem
            icon={<Building2 size={20} color={colors.primary} />}
            title="Business Profile"
            subtitle="Update business information"
            onPress={() => router.push('/settings/business-profile')}
          />
          <SettingsItem
            icon={<CreditCard size={20} color={colors.primary} />}
            title="Payment Methods"
            subtitle="Manage M-Pesa and bank details"
            onPress={() => router.push('/settings/payment-methods')}
          />
          <SettingsItem
            icon={<Shield size={20} color={colors.primary} />}
            title="Tax Settings"
            subtitle="Configure VAT and KRA settings"
            onPress={() => router.push('/settings/tax-settings')}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingsItem
            icon={<Bell size={20} color={colors.primary} />}
            title="Invoice Reminders"
            subtitle="Get notified about upcoming due dates"
            rightComponent={
              <Switch
                value={notifications.invoiceReminders}
                onValueChange={(value) => 
                  setNotifications({...notifications, invoiceReminders: value})
                }
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            }
            showChevron={false}
            onPress={() => 
              setNotifications({
                ...notifications, 
                invoiceReminders: !notifications.invoiceReminders
              })
            }
          />
          <SettingsItem
            icon={<Bell size={20} color={colors.success} />}
            title="Payment Received"
            subtitle="Get notified when payments are received"
            rightComponent={
              <Switch
                value={notifications.paymentReceived}
                onValueChange={(value) => 
                  setNotifications({...notifications, paymentReceived: value})
                }
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            }
            showChevron={false}
            onPress={() => 
              setNotifications({
                ...notifications, 
                paymentReceived: !notifications.paymentReceived
              })
            }
          />
          <SettingsItem
            icon={<Bell size={20} color={colors.error} />}
            title="Overdue Alerts"
            subtitle="Get notified about overdue invoices"
            rightComponent={
              <Switch
                value={notifications.overdueAlerts}
                onValueChange={(value) => 
                  setNotifications({...notifications, overdueAlerts: value})
                }
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            }
            showChevron={false}
            onPress={() => 
              setNotifications({
                ...notifications, 
                overdueAlerts: !notifications.overdueAlerts
              })
            }
          />
          <SettingsItem
            icon={<Bell size={20} color={colors.accent} />}
            title="Monthly Reports"
            subtitle="Receive monthly business reports"
            rightComponent={
              <Switch
                value={notifications.monthlyReports}
                onValueChange={(value) => 
                  setNotifications({...notifications, monthlyReports: value})
                }
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            }
            showChevron={false}
            onPress={() => 
              setNotifications({
                ...notifications, 
                monthlyReports: !notifications.monthlyReports
              })
            }
          />
        </SettingsSection>

        {/* App Settings */}
        <SettingsSection title="App">
          <SettingsItem
            icon={isDarkMode ? <Moon size={20} color={colors.primary} /> : <Sun size={20} color={colors.primary} />}
            title="Theme"
            subtitle={isDarkMode ? 'Dark mode' : 'Light mode'}
            rightComponent={
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            }
            showChevron={false}
            onPress={toggleTheme}
          />
          <SettingsItem
            icon={<HelpCircle size={20} color={colors.primary} />}
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => router.push('/settings/help')}
          />
        </SettingsSection>

        {/* Account Actions */}
        <Card style={styles.dangerSection}>
          <TouchableOpacity style={styles.dangerItem} onPress={handleLogout}>
            <View style={styles.settingsLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: colors.error + '15' }]}>
                <LogOut size={20} color={colors.error} />
              </View>
              <Text style={[themedTypography.body, { color: colors.error }]}>Logout</Text>
            </View>
            <ChevronRight size={16} color={colors.error} />
          </TouchableOpacity>
        </Card>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={themedTypography.caption}>Version 1.0.0</Text>
          <Text style={themedTypography.caption}>© 2024 Streamlined Invoicing</Text>
        </View>

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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  profileCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    ...Typography.body,
    color: colors.surface,
    fontWeight: '600',
    fontSize: 18,
  },
  profileInfo: {
    flex: 1,
  },
  settingsSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: 0,
  },
  sectionTitle: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dangerSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: 0,
    borderColor: colors.error + '30',
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  versionContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
});