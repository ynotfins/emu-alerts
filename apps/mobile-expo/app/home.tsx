import { FlatList, View, ActivityIndicator, Text } from 'react-native';
import { IncidentRow } from '../components/IncidentRow';
import { spacing, colors } from '../theme/tokens';
import { useIncidents } from '../hooks/useIncidents';

export default function HomeScreen({ navigation }: any) {
  const { incidents, loading, error } = useIncidents();
  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={{ padding: spacing(2) }}>
          <Text style={{ color: 'red' }}>Failed to load incidents.</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingVertical: spacing(1) }}
          data={incidents}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <IncidentRow
              timestamp={(item as any).lastTs ?? Date.now()}
              message={(item as any).latest ?? ''}
              onPress={() => navigation.navigate('Details', { incidentId: item.id })}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.divider }} />}
          ListEmptyComponent={() => (
            <View style={{ padding: spacing(2) }}>
              <Text style={{ color: colors.secondaryText }}>No incidents.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}


