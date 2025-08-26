import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '../src/firebase/init';

export type IncidentUpdate = {
  id: string;
  ts: Timestamp;
  message: string;
};

export const useIncidentUpdates = (incidentId?: string) => {
  const [updates, setUpdates] = useState<IncidentUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!incidentId) return;
    const q = query(
      collection(db, 'incidents', incidentId, 'updates'),
      orderBy('ts', 'asc')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setUpdates(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [incidentId]);

  return { updates, loading, error };
};


