import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert as ReactAlert,
} from 'react-native';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  Unsubscribe 
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { firestore, auth } from '../firebase/config';
import { Alert } from '../types/Alert';
import AlertItem from '../components/AlertItem';

interface MainScreenProps {
  navigation: any;
}

export default function MainScreen({ navigation }: MainScreenProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;

    // Set up real-time listener (like Android's onStart)
    const setupFirestoreListener = () => {
      const alertsQuery = query(
        collection(firestore, 'alerts'),
        orderBy('ts', 'desc'),
        limit(200)
      );

      unsubscribe = onSnapshot(
        alertsQuery,
        (snapshot) => {
          console.log(`Got snapshot with ${snapshot.docs.length} documents`);
          
          // STEP 1: Parse ALL documents using rawText logic (exactly like Android)
          const allParsedAlerts: Alert[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            const id = data.incidentId;
            const rawText = data.rawText;
            const timestamp = data.ts?.toDate()?.getTime() || Date.now();

            if (!id || !rawText) return;

            const parts = rawText.split('|').map((part: string) => part.trim());
            let state = parts[0] || '';
            if (state.startsWith('U/D')) {
              state = state.replace('U/D', '').trim();
            }
            const county = parts[1] || '';
            const city = parts[2] || '';
            const type = parts[3] || '';
            const message = parts.slice(4).join(' | ');

            const title = [state, county, city, type]
              .filter(part => part.length > 0)
              .join(' | ');

            allParsedAlerts.push({
              id,
              title,
              message,
              timestamp,
            });
          });

          // STEP 2: Group by incidentId
          const groupedAlerts = allParsedAlerts.reduce((groups, alert) => {
            if (!groups[alert.id]) {
              groups[alert.id] = [];
            }
            groups[alert.id].push(alert);
            return groups;
          }, {} as Record<string, Alert[]>);

          // STEP 3: Get most recent from each group
          const latestAlerts: Alert[] = Object.values(groupedAlerts).map(group => 
            group.reduce((latest, current) => 
              current.timestamp > latest.timestamp ? current : latest
            )
          );

          // STEP 4: Update UI
          setAlerts(latestAlerts);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error fetching alerts:', error);
          setIsLoading(false);
        }
      );
    };

    setupFirestoreListener();

    // Cleanup function (like Android's onStop)
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleAlertPress = (alert: Alert) => {
    // Show toast-like alert (like Android's Toast.makeText)
    ReactAlert.alert('Opening Incident', `Opening #${alert.id}`);
    
    // Navigate to details screen
    navigation.navigate('AlertDetails', { incidentId: alert.id });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace('SignIn');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleTestCrash = () => {
    // Test crash functionality (like Android menu action)
    ReactAlert.alert(
      'Test Crash',
      'This would trigger a test crash in production',
      [{ text: 'OK' }]
    );
  };

  const renderAlert = ({ item }: { item: Alert }) => (
    <AlertItem alert={item} onPress={handleAlertPress} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No alerts yet</Text>
    </View>
  );

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

      {/* Alerts List (like RecyclerView) */}
      <FlatList
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        contentContainerStyle={alerts.length === 0 ? styles.emptyListContainer : styles.listContainer}
        showsVerticalScrollIndicator={true}
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
  },
});
