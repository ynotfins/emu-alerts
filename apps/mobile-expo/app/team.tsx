import { View, Text, FlatList } from 'react-native';
import { spacing, typeScale, lineHeights, colors, radius } from '../theme/tokens';
import MapView, { Marker } from 'react-native-maps';
import { useTeamPresence } from '../hooks/useTeamPresence';

export default function TeamScreen() {
  const { team, loading } = useTeamPresence();
  const markers = team.filter((m) => typeof m.lastLat === 'number' && typeof m.lastLng === 'number');
  const first = markers[0];
  const region = first
    ? { latitude: first.lastLat!, longitude: first.lastLng!, latitudeDelta: 0.2, longitudeDelta: 0.2 }
    : { latitude: 39.8283, longitude: -98.5795, latitudeDelta: 30, longitudeDelta: 30 }; // USA center fallback

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 220, margin: spacing(2), borderRadius: radius.xl, overflow: 'hidden' }}>
        <MapView style={{ flex: 1 }} initialRegion={region}>
          {markers.map((m) => (
            <Marker key={m.id} coordinate={{ latitude: m.lastLat!, longitude: m.lastLng! }} title={m.displayName || 'Responder'} />
          ))}
        </MapView>
      </View>
      <FlatList
        data={team}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: spacing(2), paddingBottom: spacing(3) }}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: spacing(1) }}>
            <Text style={{ fontSize: typeScale.body, lineHeight: lineHeights.body, color: colors.text }} numberOfLines={1}>
              {item.displayName || 'Responder'}
            </Text>
            <Text style={{ fontSize: typeScale.caption, lineHeight: lineHeights.caption, color: colors.secondaryText }} numberOfLines={1}>
              {item.updatedAt ? timeAgo(item.updatedAt.toDate()) : '—'}
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#EEE' }} />}
        ListEmptyComponent={() => (
          <View style={{ padding: spacing(2) }}>
            <Text style={{ color: colors.secondaryText }}>{loading ? 'Loading…' : 'No one sharing location.'}</Text>
          </View>
        )}
      />
    </View>
  );
}

const timeAgo = (d: Date) => {
  const mins = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return `${days} d ago`;
};


