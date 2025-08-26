import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { spacing, typeScale, lineHeights, colors, radius } from '../theme/tokens';
import { MapHeader } from '../components/MapHeader';
import { useIncidentUpdates } from '../hooks/useIncidentUpdates';
import ChatComposer from '../components/ChatComposer';
import { useChat } from '../hooks/useChat';
import { Stars } from '../components/Stars';
import { useIncidentFeedback, useMyFeedback } from '../hooks/useFeedback';
import { respondToIncident } from '../src/firebase/presence';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export default function DetailsScreen({ route }: any) {
  const { incidentId } = route.params ?? {};
  const { updates, loading } = useIncidentUpdates(incidentId);
  const { messages, send } = useChat(incidentId ? `incidents/${incidentId}/chat` : undefined);
  const { mine, upsert } = useMyFeedback(incidentId);
  const { average } = useIncidentFeedback(incidentId);
  
  const [distance, setDistance] = useState<string | null>(null);

  const header = updates.length > 0 ? { lat: (updates[0] as any).lat, lng: (updates[0] as any).lng, title: (updates[0] as any).address } : { lat: undefined, lng: undefined, title: undefined };

  useEffect(() => {
    const calculateDistance = async () => {
      if (!header.lat || !header.lng) {
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${latitude},${longitude}&destination=${header.lat},${header.lng}&key=${apiKey}`;

      try {
        const response = await fetch(url);
        const json = await response.json();
        if (json.routes.length > 0 && json.routes[0].legs.length > 0) {
          setDistance(json.routes[0].legs[0].distance.text);
        }
      } catch (error) {
        console.error("Failed to fetch directions:", error);
      }
    };

    if (updates.length > 0) {
        calculateDistance();
    }
  }, [updates]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: spacing(4) }}>
      <MapHeader lat={header.lat} lng={header.lng} title={header.title} />
      <View style={{ paddingHorizontal: spacing(2), marginBottom: spacing(2), gap: spacing(1.5) }}>
        {distance && (
          <View style={{ backgroundColor: colors.surface, padding: spacing(1.5), borderRadius: radius.xl, alignItems: 'center' }}>
            <Text style={{ color: colors.accent, fontSize: typeScale.h5 }}>{distance} away</Text>
          </View>
        )}
        <Pressable
          onPress={async () => {
            try {
              await respondToIncident({ incidentId });
            } catch (e: any) {
              console.warn(e?.message ?? 'Failed to respond');
            }
          }}
          style={{ backgroundColor: colors.accent, padding: spacing(1.5), borderRadius: radius.xl, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontSize: typeScale.body }}>I'm responding</Text>
        </Pressable>
      </View>
      {loading ? (
        <View style={{ padding: spacing(2) }}>
          <ActivityIndicator />
        </View>
      ) : (
        <View style={{ paddingHorizontal: spacing(2), gap: spacing(1.5) }}>
          {updates.map((h) => (
            <View key={h.id} style={{ gap: spacing(0.5) }}>
              <Text style={{ fontSize: typeScale.caption, lineHeight: lineHeights.caption, color: colors.secondaryText }}>
                {new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(h.ts.toDate())}
              </Text>
              <Text style={{ fontSize: typeScale.body, lineHeight: lineHeights.body, color: colors.text }}>{(h as any).message}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={{ height: 1, backgroundColor: colors.divider, marginVertical: spacing(2) }} />
      <View style={{ paddingHorizontal: spacing(2), gap: spacing(1.5), marginBottom: spacing(2) }}>
        <Text style={{ color: colors.text, fontSize: typeScale.section }}>Feedback</Text>
        <Text style={{ color: colors.secondaryText }}>Average: {average ? average.toFixed(1) : '—'} ⭐</Text>
        <Stars value={mine?.stars || 0} onChange={(n) => upsert(n, mine?.comment)} />
      </View>
      <View style={{ height: 1, backgroundColor: colors.divider, marginVertical: spacing(2) }} />
      <View style={{ paddingHorizontal: spacing(2), gap: spacing(1) }}>
        {messages?.map((m) => (
          <View key={m.id} style={{ paddingVertical: spacing(0.5) }}>
            <Text style={{ color: colors.secondaryText }}>{m.displayName || 'User'}</Text>
            <Text style={{ color: colors.text }}>{m.text}</Text>
          </View>
        ))}
      </View>
      <ChatComposer onSend={async (t) => { await send(t); }} />
    </ScrollView>
  );
}
