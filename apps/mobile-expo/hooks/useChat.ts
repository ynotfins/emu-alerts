import { useCallback, useEffect, useState } from 'react';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../src/firebase/init';
import { auth } from '../src/firebase/init';

export type ChatMessage = {
  id: string;
  uid: string;
  displayName?: string;
  text: string;
  createdAt?: Timestamp;
};

export const useChat = (collectionPath?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!collectionPath) return;
    const q = query(collection(db, collectionPath), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ChatMessage[]);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [collectionPath]);

  const send = useCallback(async (text: string) => {
    if (!collectionPath) return;
    const user = auth.currentUser;
    if (!user) throw new Error('Not signed in');
    const payload = {
      uid: user.uid,
      displayName: user.displayName ?? '',
      text,
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, collectionPath), payload);
  }, [collectionPath]);

  return { messages, loading, error, send };
};


