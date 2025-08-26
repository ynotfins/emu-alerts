import React from 'react';
import { View, Text, StyleSheet, Platform, Linking, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface MapViewComponentProps {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export default function MapViewComponent({ latitude, longitude, address }: MapViewComponentProps) {
  // Web platform: Use Google Maps link or embed
  if (Platform.OS === 'web') {
    const openInGoogleMaps = () => {
      let url = '';
      if (typeof latitude === 'number' && typeof longitude === 'number') {
        url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      } else if (address) {
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      }
      
      if (url) {
        Linking.openURL(url);
      }
    };

    return (
      <View style={styles.webMapContainer}>
        <TouchableOpacity onPress={openInGoogleMaps} style={styles.mapButton}>
          <Text style={styles.mapButtonText}>📍 Open in Google Maps</Text>
          <Text style={styles.mapButtonSubtext}>
            {address || `${latitude}, ${longitude}` || 'View location'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Mobile platforms: Use react-native-maps
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{ latitude, longitude }}
            title="Incident Location"
            description={address || 'Emergency incident location'}
          />
        </MapView>
      </View>
    );
  }

  // Fallback for when no coordinates are available
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>
        {address ? `Location: ${address}` : 'No location data available'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  map: {
    flex: 1,
  },
  webMapContainer: {
    marginVertical: 8,
  },
  mapButton: {
    backgroundColor: '#4285f4',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  mapButtonSubtext: {
    fontSize: 14,
    color: '#e3f2fd',
    textAlign: 'center',
  },
  placeholderContainer: {
    height: 60,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
