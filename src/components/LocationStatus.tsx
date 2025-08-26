import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocation } from '../hooks/useLocation';

interface LocationStatusProps {
  incidentLatitude?: number;
  incidentLongitude?: number;
  showDistance?: boolean;
  onLocationPress?: (latitude: number, longitude: number) => void;
}

export default function LocationStatus({ 
  incidentLatitude, 
  incidentLongitude, 
  showDistance = true,
  onLocationPress 
}: LocationStatusProps) {
  const { 
    location, 
    isLoading, 
    error, 
    hasPermission, 
    requestPermission, 
    getCurrentLocation,
    calculateDistance 
  } = useLocation();

  const distance = useMemo(() => {
    if (!showDistance || !incidentLatitude || !incidentLongitude) return null;
    return calculateDistance(incidentLatitude, incidentLongitude);
  }, [showDistance, incidentLatitude, incidentLongitude, calculateDistance]);

  const handleLocationPress = useCallback(async () => {
    if (!hasPermission) {
      Alert.alert(
        'Location Permission Required',
        'This app needs location permission to show your proximity to incidents and provide location-based features.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Grant Permission', 
            onPress: async () => {
              const granted = await requestPermission();
              if (granted) {
                await getCurrentLocation();
              }
            }
          }
        ]
      );
      return;
    }

    if (!location) {
      await getCurrentLocation();
      return;
    }

    if (onLocationPress) {
      onLocationPress(location.latitude, location.longitude);
    }
  }, [hasPermission, location, requestPermission, getCurrentLocation, onLocationPress]);

  const formatDistance = useCallback((dist: number): string => {
    if (dist < 1) {
      return `${Math.round(dist * 1000)}m away`;
    } else if (dist < 10) {
      return `${dist.toFixed(1)}km away`;
    } else {
      return `${Math.round(dist)}km away`;
    }
  }, []);

  const getLocationStatusText = useCallback(() => {
    if (isLoading) return 'Getting location...';
    if (error) return 'Location error';
    if (!hasPermission) return 'Tap to enable location';
    if (!location) return 'Tap to get location';
    
    if (distance !== null) {
      return formatDistance(distance);
    }
    
    return `📍 ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }, [isLoading, error, hasPermission, location, distance, formatDistance]);

  const getStatusColor = useCallback(() => {
    if (error) return '#d32f2f';
    if (!hasPermission) return '#ff9800';
    if (distance !== null) {
      if (distance < 1) return '#4caf50'; // Green - very close
      if (distance < 5) return '#ff9800'; // Orange - nearby
      return '#666'; // Gray - far
    }
    return '#1976d2'; // Blue - default
  }, [error, hasPermission, distance]);

  return (
    <TouchableOpacity onPress={handleLocationPress} style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getLocationStatusText()}
        </Text>
        {location && location.accuracy && (
          <Text style={styles.accuracyText}>
            ±{Math.round(location.accuracy)}m accuracy
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  content: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  accuracyText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
});
