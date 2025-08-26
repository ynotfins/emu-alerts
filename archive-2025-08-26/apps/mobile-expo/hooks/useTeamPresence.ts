import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../src/firebase/init';

export type TeamMember = {
  id: string;
  displayName?: string;
  lastLat?: number;
  lastLng?: number;
  updatedAt?: Timestamp;
  sharing: boolean;
};

export const useTeamPresence = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'employees'), where('sharing', '==', true));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setTeam(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { team, loading, error };
};


