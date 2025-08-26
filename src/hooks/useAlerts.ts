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

  const parseRawTextToAlert = useCallback((doc: any): Alert | null => {
    const data = doc.data();
    const id = data.incidentId;
    const rawText = data.rawText;
    const timestamp = data.ts?.toDate()?.getTime() || Date.now();

    if (!id || !rawText) return null;

    const parts = rawText.split('|').map((part: string) => part.trim());
    let state = parts[0] || '';
    if (state.startsWith('U/D')) {
      state = state.replace('U/D', '').trim();
    }
    const county = parts[1] || '';
    const city = parts[2] || '';
    const type = parts[3] || '';
    const message = parts.slice(4).join(' | ');

    const title = [state, county, city, type]
      .filter(part => part.length > 0)
      .join(' | ');

    return {
      id,
      title,
      message,
      timestamp,
    };
  }, []);

  const processAlertsData = useCallback((snapshot: any) => {
    console.log(`Got snapshot with ${snapshot.docs.length} documents`);
    
    // STEP 1: Parse ALL documents using rawText logic
    const allParsedAlerts: Alert[] = [];
    
    snapshot.forEach((doc: any) => {
      const alert = parseRawTextToAlert(doc);
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
  }, [parseRawTextToAlert]);

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
