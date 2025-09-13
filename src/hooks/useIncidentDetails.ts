import { useState, useEffect, useCallback } from 'react';
import { 
  doc, 
  collection,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe 
} from 'firebase/firestore';
import { firestore } from '../lib/firebase';

export interface AlertMessage {
  id: string;
  message: string;
  receivedAtText: string;
  receivedAtEpoch?: number;
  serverTimestamp: Date;
}

export interface AlertData {
  alertId: string;
  title: string;
  state: string;
  county: string;
  city: string;
  address?: string;
  addressForMaps?: string;
  formattedAddress?: string;
  alertType: string;
  geo?: {
    latitude: number;
    longitude: number;
  };
  source?: string;
  appName?: string;
  createdAt: Date;
  lastUpdatedAt: Date;
  initialMessage: string;
  messages: AlertMessage[];
}

interface UseAlertDetailsReturn {
  alertData: AlertData | null;
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
}

export function useAlertDetails(alertId: string | undefined): UseAlertDetailsReturn {
  const [alertData, setAlertData] = useState<AlertData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  const processAlertData = useCallback(async (alertDoc: any, messagesSnapshot: any) => {
    const hasValidData = alertDoc.exists();
    setHasData(hasValidData);
    
    if (!hasValidData) {
      setAlertData(null);
      setError('Alert not found');
      setIsLoading(false);
      return;
    }

    const data = alertDoc.data();
    
    // Process main alert data
    const alertId = data.alertId || alertDoc.id;
    const title = data.title || '';
    const state = data.state || '';
    const county = data.county || '';
    const city = data.city || '';
    const address = data.address || '';
    const addressForMaps = data.addressForMaps || '';
    const formattedAddress = data.formattedAddress || '';
    const alertType = data.alertType || '';
    const geo = data.geo || undefined;
    const source = data.source || '';
    const appName = data.appName || '';
    const createdAt = data.createdAt?.toDate() || new Date();
    const lastUpdatedAt = data.lastUpdatedAt?.toDate() || new Date();
    const initialMessage = data.initialMessage || '';
    
    // Process messages subcollection
    const messages: AlertMessage[] = [];
    messagesSnapshot.forEach((messageDoc: any) => {
      const messageData = messageDoc.data();
      messages.push({
        id: messageDoc.id,
        message: messageData.message || '',
        receivedAtText: messageData.receivedAtText || '',
        receivedAtEpoch: messageData.receivedAtEpoch,
        serverTimestamp: messageData.serverTimestamp?.toDate() || new Date(),
      });
    });

    // Sort messages by serverTimestamp descending (most recent first)
    messages.sort((a, b) => b.serverTimestamp.getTime() - a.serverTimestamp.getTime());

    setAlertData({
      alertId,
      title,
      state,
      county,
      city,
      address,
      addressForMaps,
      formattedAddress,
      alertType,
      geo,
      source,
      appName,
      createdAt,
      lastUpdatedAt,
      initialMessage,
      messages,
    });
    setError(null);
    setIsLoading(false);
  }, []);

  const setupListeners = useCallback(() => {
    if (!alertId) {
      setError('No alert ID provided');
      setIsLoading(false);
      return null;
    }

    let alertUnsubscribe: Unsubscribe | null = null;
    let messagesUnsubscribe: Unsubscribe | null = null;
    
    const alertRef = doc(firestore, 'alerts', alertId);
    const messagesRef = collection(firestore, 'alerts', alertId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('serverTimestamp', 'desc'));
    
    // Set up listeners for both main document and messages subcollection
    let alertDoc: any = null;
    let messagesSnapshot: any = null;
    
    const tryProcessData = async () => {
      if (alertDoc && messagesSnapshot) {
        await processAlertData(alertDoc, messagesSnapshot);
      }
    };

    // Listen to main alert document
    alertUnsubscribe = onSnapshot(
      alertRef,
      async (snapshot) => {
        alertDoc = snapshot;
        await tryProcessData();
      },
      (error) => {
        console.error('Error fetching alert details:', error);
        setError('Failed to load alert details');
        setIsLoading(false);
        setHasData(false);
        setAlertData(null);
      }
    );

    // Listen to messages subcollection
    messagesUnsubscribe = onSnapshot(
      messagesQuery,
      async (snapshot) => {
        messagesSnapshot = snapshot;
        await tryProcessData();
      },
      (error) => {
        console.error('Error fetching alert messages:', error);
        setError('Failed to load alert messages');
        setIsLoading(false);
      }
    );

    // Return cleanup function
    return () => {
      if (alertUnsubscribe) alertUnsubscribe();
      if (messagesUnsubscribe) messagesUnsubscribe();
    };
  }, [alertId, processAlertData]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    const cleanup = setupListeners();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [setupListeners]);

  return {
    alertData,
    isLoading,
    error,
    hasData,
  };
}
