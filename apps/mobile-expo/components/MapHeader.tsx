import { memo } from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import { Pressable, Text, Linking, Platform } from 'react-native';
import { radius, spacing, colors } from '../theme/tokens';

type Props = {
  lat?: number;
  lng?: number;
  title?: string;
};

const openNavigation = (lat: number, lng: number) => {
    const url = Platform.select({
        ios: `https://maps.apple.com/?daddr=${lat},${lng}`,
        android: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    });

    if (url) {
        Linking.openURL(url).catch(err => console.error('An error occurred', err));
    }
}

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
    <Pressable onPress={() => openNavigation(lat, lng)} style={{ height: 220, margin: spacing(2), borderRadius: radius.xl, overflow: 'hidden' }}>
      <MapView style={{ flex: 1 }} initialRegion={region} pointerEvents="none">
        <Marker coordinate={{ latitude: lat, longitude: lng }} title={title ?? 'Incident'} />
      </MapView>
    </Pressable>
  );
});
