import { View, Text } from 'react-native';
import { colors, spacing, typeScale, lineHeights } from '../theme/tokens';

export default function PendingScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing(2), gap: spacing(1) }}>
      <Text style={{ fontSize: typeScale.section, lineHeight: lineHeights.section, color: colors.text }}>Not authorized</Text>
      <Text style={{ fontSize: typeScale.body, lineHeight: lineHeights.body, color: colors.secondaryText, textAlign: 'center' }}>
        Your role is pending. Ask an admin to grant employee or manager. Sign out/in once after approval.
      </Text>
    </View>
  );
}


