import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { useIncidents } from './useIncidents';

type Coords = { latitude: number; longitude: number };

const toRadians = (deg: number) => (deg * Math.PI) / 180;
const haversineMeters = (a: Coords, b: Coords) => {
  const R = 6371000; // meters
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
};

export const metersToMiles = (m: number) => m * 0.000621371;
export const formatMiles = (miles: number) => {
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
};

export const useNearest = () => {
  const { incidents, loading: loadingIncidents } = useIncidents();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [permission, setPermission] = useState<Location.PermissionStatus | 'unknown'>('unknown');
  const [locLoading, setLocLoading] = useState(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const requestLocation = useCallback(async () => {
    try {
      setLocLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermission(status);
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } else {
        setCoords(null);
      }
    } finally {
      setLocLoading(false);
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const nearest = useMemo(() => {
    if (!coords) return [] as Array<{ id: string; message?: string; lastTs?: any; lat: number; lng: number; distanceMeters: number }>;
    const candidates = incidents
      .map((it: any) => ({
        id: it.id,
        message: it.latest,
        lastTs: it.lastTs,
        lat: it.lat,
        lng: it.lng,
      }))
      .filter((x) => typeof x.lat === 'number' && typeof x.lng === 'number');

    const withDistance = candidates.map((c) => ({
      ...c,
      distanceMeters: haversineMeters(coords, { latitude: c.lat, longitude: c.lng }),
    }));

    return withDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [incidents, coords]);

  const debouncedNearest = useMemo(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    let value = nearest;
    debounceTimer.current = setTimeout(() => {}, 150);
    return value;
  }, [nearest]);

  return {
    nearest: debouncedNearest,
    loading: loadingIncidents || locLoading,
    permission,
    refreshLocation: requestLocation,
    coords,
  };
};


