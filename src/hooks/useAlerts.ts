import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  Unsubscribe 
} from 'firebase/firestore';
import { firestore } from '../firebase/config';
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

  const parseFirestoreAlert = useCallback((doc: any): Alert | null => {
    const data = doc.data();
    const id = data.incidentId;
    const timestamp = data.ts?.toDate()?.getTime() || Date.now();

    if (!id) return null;

    // Use the properly parsed fields from Cloud Function instead of rawText
    const state = data.state || '';
    const county = data.county || '';
    const city = data.city || '';
    const alertType = data.alertType || '';
    const alertMessage = data.alertMessage || '';

    // Create clean title from parsed fields
    const title = [state, county, city, alertType]
      .filter(part => part && part.length > 0)
      .join(' · ');

    return {
      id,
      title: title || 'Alert', // Fallback title if no location data
      message: alertMessage || 'No message available',
      timestamp,
    };
  }, []);

  const processAlertsData = useCallback((snapshot: any) => {
    console.log(`Got snapshot with ${snapshot.docs.length} documents`);
    
    // STEP 1: Parse ALL documents using proper Firestore fields
    const allParsedAlerts: Alert[] = [];
    
    snapshot.forEach((doc: any) => {
      const alert = parseFirestoreAlert(doc);
      if (alert) {
        allParsedAlerts.push(alert);
      }
    });

    // STEP 2: Group by incidentId and get most recent from each group
    const groupedAlerts = allParsedAlerts.reduce((groups, alert) => {
      if (!groups[alert.id]) {
        groups[alert.id] = [];
      }
      groups[alert.id].push(alert);
      return groups;
    }, {} as Record<string, Alert[]>);

    // STEP 3: Get most recent from each group
    const latestAlerts: Alert[] = Object.values(groupedAlerts).map(group => 
      group.reduce((latest, current) => 
        current.timestamp > latest.timestamp ? current : latest
      )
    );

    setAlerts(latestAlerts);
    setIsLoading(false);
    setError(null);
  }, [parseFirestoreAlert]);

  const setupFirestoreListener = useCallback(() => {
    let unsubscribe: Unsubscribe | null = null;

    const alertsQuery = query(
      collection(firestore, 'alerts'),
      orderBy('ts', 'desc'),
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
