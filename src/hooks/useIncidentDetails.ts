import { useState, useEffect, useCallback } from 'react';
import { 
  doc, 
  onSnapshot,
  Unsubscribe 
} from 'firebase/firestore';
import { firestore } from '../firebase/config';

export interface IncidentData {
  state: string;
  county: string;
  city: string;
  address: string;
  lastType: string;
  lastMessage: string;
  lastTs: Date;
  updateCount: number;
}

interface UseIncidentDetailsReturn {
  incidentData: IncidentData | null;
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
}

export function useIncidentDetails(incidentId: string | undefined): UseIncidentDetailsReturn {
  const [incidentData, setIncidentData] = useState<IncidentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  const processIncidentData = useCallback((snapshot: any) => {
    const hasValidData = snapshot.exists();
    setHasData(hasValidData);
    setIsLoading(false);
    
    if (!hasValidData) {
      setIncidentData(null);
      setError('Incident not found');
      return;
    }

    const data = snapshot.data();
    
    const state = data.state || '';
    const county = data.county || '';
    const city = data.city || '';
    const address = data.address || '';
    const lastType = data.lastType || '';
    const lastMessage = data.lastMessage || '';
    const lastTs = (data.lastTs || data.firstSeenAt)?.toDate() || new Date();
    const updateCount = data.updateCount || 0;

    setIncidentData({
      state,
      county,
      city,
      address,
      lastType,
      lastMessage,
      lastTs,
      updateCount,
    });
    setError(null);
  }, []);

  const setupListener = useCallback(() => {
    if (!incidentId) {
      setError('No incident ID provided');
      setIsLoading(false);
      return null;
    }

    let unsubscribe: Unsubscribe | null = null;
    const incidentRef = doc(firestore, 'incidents', incidentId);
    
    unsubscribe = onSnapshot(
      incidentRef,
      processIncidentData,
      (error) => {
        console.error('Error fetching incident details:', error);
        setError('Failed to load incident details');
        setIsLoading(false);
        setHasData(false);
        setIncidentData(null);
      }
    );

    return unsubscribe;
  }, [incidentId, processIncidentData]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    const unsubscribe = setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setupListener]);

  return {
    incidentData,
    isLoading,
    error,
    hasData,
  };
}
