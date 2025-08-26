import * as Location from 'expo-location';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './init';

export type RespondOptions = {
  incidentId: string;
  withLocation?: boolean;
};

export const respondToIncident = async ({ incidentId, withLocation = true }: RespondOptions) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');

  let lastLat: number | undefined;
  let lastLng: number | undefined;

  if (withLocation) {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lastLat = pos.coords.latitude;
        lastLng = pos.coords.longitude;
      }
    } catch {
      // Ignore location errors; proceed without coords
    }
  }

  const responderRef = doc(db, 'incidents', incidentId, 'responders', user.uid);
  const employeeRef = doc(db, 'employees', user.uid);

  await setDoc(
    responderRef,
    {
      joinedAt: serverTimestamp(),
      displayName: user.displayName ?? '',
      latestLat: lastLat,
      latestLng: lastLng,
    },
    { merge: true }
  );

  await setDoc(
    employeeRef,
    {
      activeIncidentId: incidentId,
      lastLat,
      lastLng,
      updatedAt: serverTimestamp(),
      sharing: true,
    },
    { merge: true }
  );
};


