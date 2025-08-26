import { View, Text, FlatList } from 'react-native';
import { spacing, colors, typeScale, lineHeights } from '../theme/tokens';
import { IncidentRow } from '../components/IncidentRow';
import { formatMiles, metersToMiles, useNearest } from '../hooks/useNearest';

export default function NearestScreen({ navigation }: any) {
  const { nearest, loading } = useNearest();
  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Loading…</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingVertical: spacing(1) }}
          data={nearest}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View>
              <IncidentRow
                timestamp={(item as any).lastTs ?? Date.now()}
                message={item.message ?? ''}
                onPress={() => navigation.navigate('Details', { incidentId: item.id })}
              />
              <View style={{ paddingLeft: spacing(2), paddingBottom: spacing(1) }}>
                <Text style={{ color: colors.secondaryText, fontSize: typeScale.caption, lineHeight: lineHeights.caption }}>
                  {formatMiles(metersToMiles(item.distanceMeters))}
                </Text>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#EEE' }} />}
          ListEmptyComponent={() => (
            <View style={{ padding: spacing(2) }}>
              <Text style={{ color: colors.secondaryText }}>No incidents with location.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}


