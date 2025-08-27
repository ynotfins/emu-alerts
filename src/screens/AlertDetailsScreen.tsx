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
import { useAlertDetails, AlertData } from '../hooks/useIncidentDetails';

interface AlertDetailsScreenProps {
  navigation: any;
  route: any;
}

export default function AlertDetailsScreen({ navigation, route }: AlertDetailsScreenProps) {
  const { incidentId: alertId } = route.params; // Rename for clarity with new structure
  const { alertData, isLoading, error, hasData } = useAlertDetails(alertId);

  const formatHeaderLocation = useCallback((data: AlertData): string => {
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

  const formatMessageCount = useCallback((count: number): string => {
    return count === 1 ? '1 message' : `${count} messages`;
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

  const renderContent = useCallback((data: AlertData) => (
    <View style={styles.content}>
      {/* Header: Title from Macrodroid */}
      <Text style={styles.alertTitle}>{data.title}</Text>

      {/* Location line: State · County · City */}
      <Text style={styles.headerLocation}>
        {formatHeaderLocation(data)}
      </Text>

      {/* Alert Type */}
      <Text style={styles.headerType}>
        {data.alertType || 'Alert'}
      </Text>

      {/* Address */}
      {(data.address || data.addressForMaps || data.formattedAddress) && (
        <Text style={styles.headerAddress}>
          {data.formattedAddress || data.addressForMaps || data.address}
        </Text>
      )}

      {/* Location Status & Map */}
      {data.geo && (
        <>
          <LocationStatus 
            incidentLatitude={data.geo.latitude}
            incidentLongitude={data.geo.longitude}
            showDistance={true}
          />
          <MapViewComponent 
            latitude={data.geo.latitude}
            longitude={data.geo.longitude}
            address={data.formattedAddress || data.address}
          />
        </>
      )}

      {/* Alert Metadata */}
      <View style={styles.metadata}>
        <Text style={styles.metadataText}>
          Created: {formatDateTime(data.createdAt)}
        </Text>
        <Text style={styles.metadataText}>
          Last Updated: {formatDateTime(data.lastUpdatedAt)}
        </Text>
      </View>

      {/* Chronological Messages */}
      <View style={styles.messagesSection}>
        <Text style={styles.messagesHeader}>
          Messages ({formatMessageCount(data.messages.length)})
        </Text>
        
        {data.messages.map((message, index) => (
          <View key={message.id} style={styles.messageItem}>
            <Text style={styles.messageTime}>
              {message.receivedAtText || formatDateTime(message.serverTimestamp)}
            </Text>
            <Text style={styles.messageText}>{message.message}</Text>
          </View>
        ))}
      </View>

      {/* Footer: Alert ID */}
      <View style={styles.footer}>
        <Text style={styles.alertId}>#{data.alertId}</Text>
      </View>
    </View>
  ), [formatHeaderLocation, formatDateTime, formatMessageCount]);

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
          hasData && alertData ? renderContent(alertData) : renderEmptyState
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
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  metadata: {
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messagesSection: {
    marginTop: 16,
  },
  messagesHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  messageItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1976d2',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  alertId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
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
