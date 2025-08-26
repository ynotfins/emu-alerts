import React from 'react';
import { View, Text, StyleSheet, Platform, Linking, TouchableOpacity } from 'react-native';

interface MapViewComponentProps {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export default function MapViewComponent({ latitude, longitude, address }: MapViewComponentProps) {
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

  // For web and development, always show the Google Maps button
  // For mobile production, this would be replaced with native maps
  if (address || (typeof latitude === 'number' && typeof longitude === 'number')) {
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

  // Fallback for when no location data is available
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>No location data available</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
