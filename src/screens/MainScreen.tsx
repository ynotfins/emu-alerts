import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert as ReactAlert,
  RefreshControl,
} from 'react-native';
import { Alert } from '../types/Alert';
import AlertItem from '../components/AlertItem';
import AlertFilters from '../components/AlertFilters';
import { useAlerts } from '../hooks/useAlerts';
import { useAuth } from '../hooks/useAuth';

interface MainScreenProps {
  navigation: any;
}

export default function MainScreen({ navigation }: MainScreenProps) {
  const { alerts, isLoading, error, refreshAlerts } = useAlerts();
  const { signOut } = useAuth();
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);

  // Update filtered alerts when base alerts change
  useEffect(() => {
    if (filteredAlerts.length === 0 || !filteredAlerts.some(fa => alerts.some(a => a.id === fa.id))) {
      setFilteredAlerts(alerts);
    }
  }, [alerts, filteredAlerts]);

  const handleFilteredAlertsChange = useCallback((newFilteredAlerts: Alert[]) => {
    setFilteredAlerts(newFilteredAlerts);
  }, []);

  const handleAlertPress = useCallback((alert: Alert) => {
    // Navigate directly to details screen without popup
    navigation.navigate('AlertDetails', { incidentId: alert.id });
  }, [navigation]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigation.replace('SignIn');
    } catch (error) {
      console.error('Sign out error:', error);
      ReactAlert.alert('Error', 'Failed to sign out. Please try again.');
    }
  }, [signOut, navigation]);

  const handleTestCrash = useCallback(() => {
    // Test crash functionality (like Android menu action)
    ReactAlert.alert(
      'Test Crash',
      'This would trigger a test crash in production',
      [{ text: 'OK' }]
    );
  }, []);

  const renderAlert = useCallback(({ item }: { item: Alert }) => (
    <AlertItem alert={item} onPress={handleAlertPress} />
  ), [handleAlertPress]);

  const renderEmptyState = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {error ? 'Failed to load alerts' : 'No alerts yet'}
      </Text>
      {error && (
        <TouchableOpacity onPress={refreshAlerts} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [error, refreshAlerts]);

  const keyExtractor = useCallback((item: Alert) => item.id, []);

  const refreshControl = useMemo(() => (
    <RefreshControl
      refreshing={isLoading}
      onRefresh={refreshAlerts}
      tintColor="#1976d2"
      colors={['#1976d2']}
    />
  ), [isLoading, refreshAlerts]);

  return (
    <View style={styles.container}>
      {/* Header/Toolbar (like MaterialToolbar) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>EMU Alerts</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleTestCrash} style={styles.menuButton}>
            <Text style={styles.menuButtonText}>Test</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignOut} style={styles.menuButton}>
            <Text style={styles.menuButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filters */}
      {alerts.length > 0 && (
        <AlertFilters
          alerts={alerts}
          onFilteredAlertsChange={handleFilteredAlertsChange}
        />
      )}

      {/* Alerts List (like RecyclerView) */}
      <FlatList
        data={filteredAlerts}
        renderItem={renderAlert}
        keyExtractor={keyExtractor}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        contentContainerStyle={filteredAlerts.length === 0 ? styles.emptyListContainer : styles.listContainer}
        showsVerticalScrollIndicator={true}
        refreshControl={refreshControl}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 80, // Approximate item height
          offset: 80 * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    paddingTop: 44, // Safe area for iOS
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  menuButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
