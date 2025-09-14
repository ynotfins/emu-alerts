import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  Unsubscribe 
} from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import { Alert } from '../types/Alert';

interface UseAlertsReturn {
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;
  refreshAlerts: () => void;
}

export function useAlerts(): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseAlertDocument = useCallback((doc: any): Alert | null => {
    const data = doc.data();
    const id = data.alertId || doc.id; // Use alertId field or document ID
    const timestamp = data.lastUpdatedAt?.toDate()?.getTime() || 
                     data.createdAt?.toDate()?.getTime() || 
                     Date.now();

    if (!id) return null;

    // Use the structured fields from the new Cloud Function
    const state = data.state || '';
    const county = data.county || '';
    const city = data.city || '';
    const alertType = data.alertType || '';
    const title = data.title || ''; // Title from Macrodroid
    const initialMessage = data.initialMessage || '';

    // Create clean display title
    const locationTitle = [state, county, city, alertType]
      .filter(part => part && part.length > 0)
      .join(' · ');

    return {
      id,
      title: title || locationTitle || 'Alert', // Use Macrodroid title or location-based title
      message: initialMessage || 'No message available',
      timestamp,
    };
  }, []);

  const processAlertsData = useCallback((snapshot: any) => {
    console.log(`Got snapshot with ${snapshot.docs.length} alert documents`);
    
    // With the new structure, each document IS a unique alert - no grouping needed!
    const alerts: Alert[] = [];
    
    snapshot.forEach((doc: any) => {
      const alert = parseAlertDocument(doc);
      if (alert) {
        alerts.push(alert);
      }
    });

    // Alerts are already sorted by lastUpdatedAt desc from the query
    setAlerts(alerts);
    setIsLoading(false);
    setError(null);
  }, [parseAlertDocument]);

  const setupFirestoreListener = useCallback(() => {
    let unsubscribe: Unsubscribe | null = null;

    const alertsQuery = query(
      collection(firestore, 'alerts'),
      orderBy('lastUpdatedAt', 'desc'),
      limit(200)
    );

    unsubscribe = onSnapshot(
      alertsQuery,
      processAlertsData,
      (error) => {
        console.error('Error fetching alerts:', error);
        setError('Failed to load alerts. Please try again.');
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [processAlertsData]);

  const refreshAlerts = useCallback(() => {
    setIsLoading(true);
    setError(null);
    // The listener will automatically get new data
  }, []);

  useEffect(() => {
    const unsubscribe = setupFirestoreListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setupFirestoreListener]);

  return {
    alerts,
    isLoading,
    error,
    refreshAlerts,
  };
}
