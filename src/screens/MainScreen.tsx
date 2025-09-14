import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import HeaderMenu from '../components/HeaderMenu';

interface MainScreenProps {
  navigation: any;
}

interface AlertItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
}

export default function MainScreen({ navigation }: MainScreenProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: '1',
      title: 'Emergency Alert',
      description: 'This is a sample emergency alert',
      timestamp: new Date().toLocaleString(),
      severity: 'high',
    },
    {
      id: '2',
      title: 'Weather Update',
      description: 'Severe weather warning in your area',
      timestamp: new Date().toLocaleString(),
      severity: 'medium',
    },
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleAlertPress = (alert: AlertItem) => {
    navigation.navigate('AlertDetails', { alert });
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => navigation.replace('SignIn'),
        },
      ]
    );
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const renderAlert = ({ item }: { item: AlertItem }) => (
    <TouchableOpacity
      style={[
        styles.alertItem,
        item.severity === 'high' && styles.highSeverity,
        item.severity === 'medium' && styles.mediumSeverity,
      ]}
      onPress={() => handleAlertPress(item)}
    >
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>{item.title}</Text>
        <Text style={styles.alertDescription}>{item.description}</Text>
        <Text style={styles.alertTimestamp}>{item.timestamp}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No alerts available</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderMenu
        title="EMU Alerts"
        onSettingsPress={handleSettings}
        onSignOutPress={handleSignOut}
      />

      <FlatList
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={alerts.length === 0 ? styles.emptyListContainer : styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#1976d2"
            colors={['#1976d2']}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    padding: 16,
  },
  alertItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  highSeverity: {
    borderLeftColor: '#f44336',
  },
  mediumSeverity: {
    borderLeftColor: '#ff9800',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  alertTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});