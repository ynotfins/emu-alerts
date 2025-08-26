import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapViewComponent from '../components/MapView';
import LocationStatus from '../components/LocationStatus';
import { useIncidentDetails, IncidentData } from '../hooks/useIncidentDetails';

interface AlertDetailsScreenProps {
  navigation: any;
  route: any;
}

export default function AlertDetailsScreen({ navigation, route }: AlertDetailsScreenProps) {
  const { incidentId } = route.params;
  const { incidentData, isLoading, error, hasData } = useIncidentDetails(incidentId);

  const formatHeaderLocation = useCallback((data: IncidentData): string => {
    return [data.state, data.county, data.city]
      .filter(part => part.length > 0)
      .join(' · ');
  }, []);

  const formatDateTime = useCallback((date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  const formatUpdateCount = useCallback((count: number): string => {
    return count === 1 ? '1 update' : `${count} updates`;
  }, []);

  const renderLoadingState = useMemo(() => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#1976d2" />
      <Text style={styles.loadingText}>Loading incident details...</Text>
    </View>
  ), []);

  const renderEmptyState = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {error || 'No incident data available'}
      </Text>
    </View>
  ), [error]);

  const renderContent = useCallback((data: IncidentData) => (
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

      {/* Location Status */}
      <LocationStatus 
        incidentLatitude={undefined} // TODO: Add lat/lng fields to incident data
        incidentLongitude={undefined}
        showDistance={true}
      />

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
  ), [formatHeaderLocation, formatDateTime, formatUpdateCount, incidentId]);

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
        {isLoading ? renderLoadingState : (
          hasData && incidentData ? renderContent(incidentData) : renderEmptyState
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
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
