import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface MapViewComponentProps {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export default function MapViewComponent({ latitude, longitude, address }: MapViewComponentProps) {
  // If we have coordinates, show the map
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
