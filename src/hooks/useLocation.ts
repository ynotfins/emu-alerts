import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

interface UseLocationReturn {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<void>;
  startWatching: () => void;
  stopWatching: () => void;
  calculateDistance: (lat: number, lon: number) => number | null;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [watchSubscription, setWatchSubscription] = useState<Location.LocationSubscription | null>(null);

  // Check initial permission status
  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      
      if (!granted) {
        setError('Location permission denied. Please enable location access in your device settings.');
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setError('Failed to request location permission');
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<void> => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        maximumAge: 10000, // Use cached location if less than 10 seconds old
      });

      setLocation({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
        accuracy: locationData.coords.accuracy || undefined,
        timestamp: locationData.timestamp,
      });
    } catch (error: any) {
      console.error('Error getting current location:', error);
      setError(error.message || 'Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, requestPermission]);

  const startWatching = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    if (watchSubscription) {
      // Already watching
      return;
    }

    setError(null);

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000, // Update every 30 seconds
          distanceInterval: 100, // Update when moved 100 meters
        },
        (locationData) => {
          setLocation({
            latitude: locationData.coords.latitude,
            longitude: locationData.coords.longitude,
            accuracy: locationData.coords.accuracy || undefined,
            timestamp: locationData.timestamp,
          });
        }
      );

      setWatchSubscription(subscription);
    } catch (error: any) {
      console.error('Error starting location watch:', error);
      setError(error.message || 'Failed to start location tracking');
    }
  }, [hasPermission, requestPermission, watchSubscription]);

  const stopWatching = useCallback(() => {
    if (watchSubscription) {
      watchSubscription.remove();
      setWatchSubscription(null);
    }
  }, [watchSubscription]);

  // Calculate distance between user location and a point in kilometers
  const calculateDistance = useCallback((lat: number, lon: number): number | null => {
    if (!location) return null;

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat - location.latitude) * Math.PI / 180;
    const dLon = (lon - location.longitude) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(location.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }, [location]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    location,
    isLoading,
    error,
    hasPermission,
    requestPermission,
    getCurrentLocation,
    startWatching,
    stopWatching,
    calculateDistance,
  };
}
