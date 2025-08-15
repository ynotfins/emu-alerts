import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { spacing, typeScale, lineHeights, colors, radius } from '../theme/tokens';
import { MapHeader } from '../components/MapHeader';
import { useIncidentUpdates } from '../hooks/useIncidentUpdates';
import ChatComposer from '../components/ChatComposer';
import { useChat } from '../hooks/useChat';
import { Stars } from '../components/Stars';
import { useIncidentFeedback, useMyFeedback } from '../hooks/useFeedback';
import { respondToIncident } from '../src/firebase/presence';

export default function DetailsScreen({ route }: any) {
  const { incidentId } = route.params ?? {};
  const { updates, loading } = useIncidentUpdates(incidentId);
  const { messages, send } = useChat(incidentId ? `incidents/${incidentId}/chat` : undefined);
  const { mine, upsert } = useMyFeedback(incidentId);
  const { average } = useIncidentFeedback(incidentId);
  const header = { lat: undefined as number | undefined, lng: undefined as number | undefined };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: spacing(4) }}>
      <MapHeader lat={header.lat} lng={header.lng} />
      <View style={{ paddingHorizontal: spacing(2), marginBottom: spacing(2) }}>
        <Pressable
          onPress={async () => {
            try {
              await respondToIncident({ incidentId });
            } catch (e: any) {
              // In a later step, replace with toasts
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
      {/* Simple chat section */}
      <View style={{ height: 1, backgroundColor: colors.divider, marginVertical: spacing(2) }} />
      {/* Feedback section */}
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


