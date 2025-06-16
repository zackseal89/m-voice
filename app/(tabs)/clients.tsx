import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Spacing } from '@/constants/Colors';
import { Typography, createThemedTypography } from '@/constants/Typography';
import { useTheme } from '@/hooks/useTheme';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { mockClients } from '@/services/mockData';
import { Client } from '@/types';
import { Plus, Search, Building2, Phone, Mail, MapPin, CreditCard as Edit, Trash2 } from 'lucide-react-native';

export default function ClientsScreen() {
  const { colors } = useTheme();
  const themedTypography = createThemedTypography(colors);
  const styles = createStyles(colors);
  
  const [clients, setClients] = useState(mockClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClient = (clientId: string) => {
    Alert.alert(
      'Delete Client',
      'Are you sure you want to delete this client?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setClients(clients.filter(c => c.id !== clientId));
          }
        }
      ]
    );
  };

  const AddClientForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      address: '',
      taxPin: '',
    });

    const handleSubmit = () => {
      if (!formData.name.trim()) {
        Alert.alert('Error', 'Please enter client name');
        return;
      }

      const newClient: Client = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        taxPin: formData.taxPin || undefined,
        createdAt: new Date(),
        userId: '1',
      };

      setClients([...clients, newClient]);
      setShowAddForm(false);
      setFormData({ name: '', email: '', phone: '', address: '', taxPin: '' });
      Alert.alert('Success', 'Client added successfully');
    };

    return (
      <Card style={styles.formCard}>
        <Text style={[themedTypography.h3, { marginBottom: Spacing.lg }]}>Add New Client</Text>
        
        <Input
          label="Client Name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Enter client name"
          required
        />
        
        <Input
          label="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          placeholder="Enter email address"
          keyboardType="email-address"
        />
        
        <Input
          label="Phone"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />
        
        <Input
          label="Address"
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
          placeholder="Enter address"
          multiline
          numberOfLines={3}
        />
        
        <Input
          label="Tax PIN (KRA)"
          value={formData.taxPin}
          onChangeText={(text) => setFormData({ ...formData, taxPin: text })}
          placeholder="Enter KRA PIN"
        />
        
        <View style={styles.formButtons}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => setShowAddForm(false)}
            style={{ flex: 1, marginRight: Spacing.sm }}
          />
          <Button
            title="Add Client"
            onPress={handleSubmit}
            style={{ flex: 1, marginLeft: Spacing.sm }}
          />
        </View>
      </Card>
    );
  };

  const renderClientItem = ({ item }: { item: Client }) => (
    <TouchableOpacity 
      style={styles.clientItem}
      onPress={() => router.push(`/clients/${item.id}`)}
    >
      <Card style={styles.clientCard}>
        <View style={styles.clientHeader}>
          <View style={styles.clientIcon}>
            <Building2 size={20} color={colors.primary} />
          </View>
          <View style={styles.clientInfo}>
            <Text style={[themedTypography.body, { fontWeight: '600' }]}>{item.name}</Text>
            <Text style={themedTypography.bodySmall}>
              Added {item.createdAt.toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.clientActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push(`/clients/${item.id}/edit`)}
            >
              <Edit size={16} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteClient(item.id)}
            >
              <Trash2 size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.clientDetails}>
          {item.email && (
            <View style={styles.detailRow}>
              <Mail size={14} color={colors.textLight} />
              <Text style={[themedTypography.bodySmall, { marginLeft: Spacing.sm }]}>
                {item.email}
              </Text>
            </View>
          )}
          
          {item.phone && (
            <View style={styles.detailRow}>
              <Phone size={14} color={colors.textLight} />
              <Text style={[themedTypography.bodySmall, { marginLeft: Spacing.sm }]}>
                {item.phone}
              </Text>
            </View>
          )}
          
          {item.address && (
            <View style={styles.detailRow}>
              <MapPin size={14} color={colors.textLight} />
              <Text style={[themedTypography.bodySmall, { marginLeft: Spacing.sm, flex: 1 }]}>
                {item.address}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={themedTypography.h1}>Clients</Text>
        <Button
          title="Add Client"
          size="small"
          onPress={() => setShowAddForm(true)}
        />
      </View>

      {!showAddForm && (
        <>
          {/* Search */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color={colors.textLight} />
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search clients..."
                style={styles.searchInput}
                containerStyle={styles.searchInputWrapper}
              />
            </View>
          </View>

          {/* Clients List */}
          <FlatList
            data={filteredClients}
            renderItem={renderClientItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Card style={styles.emptyState}>
                <Building2 size={48} color={colors.textLight} />
                <Text style={[themedTypography.h3, { marginTop: Spacing.md, textAlign: 'center' }]}>
                  {searchQuery ? 'No clients found' : 'No clients yet'}
                </Text>
                <Text style={[themedTypography.bodySmall, { textAlign: 'center', marginTop: Spacing.sm }]}>
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Add your first client to get started'
                  }
                </Text>
                {!searchQuery && (
                  <Button
                    title="Add Client"
                    onPress={() => setShowAddForm(true)}
                    style={{ marginTop: Spacing.lg }}
                  />
                )}
              </Card>
            }
          />
        </>
      )}

      {/* Add Client Form */}
      {showAddForm && (
        <ScrollView style={styles.formContainer}>
          <AddClientForm />
        </ScrollView>
      )}

      {/* Floating Action Button */}
      {!showAddForm && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setShowAddForm(true)}
        >
          <Plus size={24} color={colors.surface} />
        </TouchableOpacity>
      )}
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
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    borderWidth: 0,
  },
  searchInputWrapper: {
    marginBottom: 0,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  clientItem: {
    marginBottom: Spacing.md,
  },
  clientCard: {
    padding: Spacing.md,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  clientIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  clientInfo: {
    flex: 1,
  },
  clientActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.sm,
    borderRadius: 6,
    backgroundColor: colors.background,
  },
  clientDetails: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xl,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  formCard: {
    padding: Spacing.lg,
  },
  formButtons: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
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