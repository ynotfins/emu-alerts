import { memo } from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import { View, Pressable, Text, Linking } from 'react-native';
import { radius, spacing, colors } from '../theme/tokens';

type Props = {
  lat?: number;
  lng?: number;
  title?: string;
};

const toAppleMapsUrl = (lat: number, lng: number, label?: string) => {
  const q = encodeURIComponent(label ?? 'Incident');
  return `https://maps.apple.com/?q=${q}&ll=${lat},${lng}`;
};

export const MapHeader = memo(({ lat, lng, title }: Props) => {
  if (lat == null || lng == null) {
    return (
      <Pressable
        onPress={() => Linking.openURL('https://maps.google.com')}
        style={{
          height: 220,
          margin: spacing(2),
          borderRadius: radius.xl,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: colors.accent }}>Open in Maps</Text>
      </Pressable>
    );
  }

  const region: Region = {
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={{ height: 220, margin: spacing(2), borderRadius: radius.xl, overflow: 'hidden' }}>
      <MapView style={{ flex: 1 }} initialRegion={region} pointerEvents="none">
        <Marker coordinate={{ latitude: lat, longitude: lng }} title={title ?? 'Incident'} />
      </MapView>
    </View>
  );
});


