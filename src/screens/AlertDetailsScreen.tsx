import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { 
  doc, 
  onSnapshot,
  Unsubscribe 
} from 'firebase/firestore';
import { firestore } from '../firebase/config';
import MapViewComponent from '../components/MapView';

interface AlertDetailsScreenProps {
  navigation: any;
  route: any;
}

interface IncidentData {
  state: string;
  county: string;
  city: string;
  address: string;
  lastType: string;
  lastMessage: string;
  lastTs: Date;
  updateCount: number;
}

export default function AlertDetailsScreen({ navigation, route }: AlertDetailsScreenProps) {
  const { incidentId } = route.params;
  const [incidentData, setIncidentData] = useState<IncidentData | null>(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (!incidentId) {
      navigation.goBack();
      return;
    }

    let unsubscribe: Unsubscribe | null = null;

    // Set up real-time listener for incident details (like Android's onStart)
    const setupListener = () => {
      const incidentRef = doc(firestore, 'incidents', incidentId);
      
      unsubscribe = onSnapshot(
        incidentRef,
        (snapshot) => {
          const hasValidData = snapshot.exists();
          setHasData(hasValidData);
          
          if (!hasValidData) {
            setIncidentData(null);
            return;
          }

          const data = snapshot.data();
          
          const state = data.state || '';
          const county = data.county || '';
          const city = data.city || '';
          const address = data.address || '';
          const lastType = data.lastType || '';
          const lastMessage = data.lastMessage || '';
          const lastTs = (data.lastTs || data.firstSeenAt)?.toDate() || new Date();
          const updateCount = data.updateCount || 0;

          setIncidentData({
            state,
            county,
            city,
            address,
            lastType,
            lastMessage,
            lastTs,
            updateCount,
          });
        },
        (error) => {
          console.error('Error fetching incident details:', error);
          setHasData(false);
          setIncidentData(null);
        }
      );
    };

    setupListener();

    // Cleanup function (like Android's onStop)
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [incidentId, navigation]);

  const formatHeaderLocation = (data: IncidentData): string => {
    return [data.state, data.county, data.city]
      .filter(part => part.length > 0)
      .join(' · ');
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatUpdateCount = (count: number): string => {
    return count === 1 ? '1 update' : `${count} updates`;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No incident data available</Text>
    </View>
  );

  const renderContent = (data: IncidentData) => (
    <View style={styles.content}>
      {/* Header line: State | County | City */}
      <Text style={styles.headerLocation}>
        {formatHeaderLocation(data)}
      </Text>

      {/* Type (e.g., Working Fire / Update) */}
      <Text style={styles.headerType}>
        {data.lastType || 'Update'}
      </Text>

      {/* Address */}
      {data.address ? (
        <Text style={styles.headerAddress}>{data.address}</Text>
      ) : null}

      {/* Map View */}
      <MapViewComponent 
        latitude={undefined} // TODO: Add lat/lng fields to incident data
        longitude={undefined}
        address={data.address}
      />

      {/* Time */}
      <Text style={styles.headerTime}>
        {formatDateTime(data.lastTs)}
      </Text>

      {/* Message body */}
      <Text style={styles.message}>{data.lastMessage}</Text>

      {/* Footer row: incident id (left) and updates count (right) */}
      <View style={styles.footer}>
        <Text style={styles.incidentId}>#{incidentId}</Text>
        <Text style={styles.updateCount}>
          {formatUpdateCount(data.updateCount)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header/Toolbar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EMU Alerts</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {hasData && incidentData ? renderContent(incidentData) : renderEmptyState()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    paddingTop: 44, // Safe area for iOS
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  headerSpacer: {
    width: 40, // Balance the back button
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerLocation: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  headerType: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  headerAddress: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  headerTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incidentId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  updateCount: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
