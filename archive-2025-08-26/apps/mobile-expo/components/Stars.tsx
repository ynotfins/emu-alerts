import { memo } from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme/tokens';

type Props = {
  value: number;
  onChange?: (next: number) => void;
  size?: number;
};

export const Stars = memo(({ value, onChange, size = 24 }: Props) => {
  const handle = (n: number) => onChange?.(n);
  return (
    <View style={{ flexDirection: 'row', gap: spacing(0.5) }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => handle(n)} disabled={!onChange} hitSlop={8}>
          <Ionicons name={n <= value ? 'star' : 'star-outline'} size={size} color={colors.accent} />
        </Pressable>
      ))}
    </View>
  );
});


