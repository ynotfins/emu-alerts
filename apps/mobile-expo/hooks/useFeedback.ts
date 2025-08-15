import { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../src/firebase/init';

export type Feedback = {
  id: string; // uid
  stars: number;
  comment?: string;
  createdAt?: any;
  updatedAt?: any;
};

export const useMyFeedback = (incidentId?: string) => {
  const [mine, setMine] = useState<Feedback | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!incidentId || !user) return;
    const ref = doc(db, 'incidents', incidentId, 'feedback', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      setMine(snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as Feedback) : null);
    });
    return () => unsub();
  }, [incidentId]);

  const upsert = async (stars: number, comment?: string) => {
    const user = auth.currentUser;
    if (!incidentId || !user) return;
    const ref = doc(db, 'incidents', incidentId, 'feedback', user.uid);
    await setDoc(ref, { stars, comment, updatedAt: serverTimestamp(), createdAt: serverTimestamp() }, { merge: true });
  };

  return { mine, upsert };
};

export const useIncidentFeedback = (incidentId?: string) => {
  const [list, setList] = useState<Feedback[]>([]);

  useEffect(() => {
    if (!incidentId) return;
    const q = query(collection(db, 'incidents', incidentId, 'feedback'), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => setList(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Feedback[]));
    return () => unsub();
  }, [incidentId]);

  const average = useMemo(() => {
    if (list.length === 0) return 0;
    return list.reduce((s, f) => s + (f.stars || 0), 0) / list.length;
  }, [list]);

  const recentComments = useMemo(() => list.filter((f) => !!f.comment).slice(0, 10), [list]);

  return { list, average, recentComments };
};


