import { useEffect, useState } from 'react';
import { View, Text, Switch, Alert } from 'react-native';
import { spacing, typeScale, colors } from '../theme/tokens';
import * as Location from 'expo-location';
import { auth, db } from '../src/firebase/init';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

export default function ProfileScreen() {
  const [sharing, setSharing] = useState(false);
  const [busy, setBusy] = useState(false);

  const writePresence = async (enabled: boolean) => {
    const user = auth.currentUser;
    if (!user) return;
    let lastLat: number | undefined;
    let lastLng: number | undefined;
    if (enabled) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          lastLat = pos.coords.latitude;
          lastLng = pos.coords.longitude;
        }
      } catch {
        // ignore
      }
    }
    await setDoc(
      doc(db, 'employees', user.uid),
      { sharing: enabled, updatedAt: serverTimestamp(), lastLat, lastLng },
      { merge: true }
    );
  };

  const toggle = async (value: boolean) => {
    try {
      setBusy(true);
      await writePresence(value);
      setSharing(value);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to update sharing');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: spacing(2), gap: spacing(2) }}>
      <Text style={{ fontSize: typeScale.section, color: colors.text }}>Profile</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.text }}>Share my location</Text>
        <Switch value={sharing} onValueChange={toggle} disabled={busy} />
      </View>
    </View>
  );
}


