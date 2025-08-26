import { memo, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, spacing, typeScale, lineHeights } from '../theme/tokens';

type FirebaseTimestampLike = { seconds: number; nanoseconds?: number };

type Props = {
  timestamp: Date | number | FirebaseTimestampLike;
  message: string;
  onPress?: () => void;
};

const toDate = (value: Props['timestamp']) => {
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  return new Date(value.seconds * 1000);
};

export const IncidentRow = memo(({ timestamp, message, onPress }: Props) => {
  const dateStr = useMemo(() => {
    const d = toDate(timestamp);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(d);
  }, [timestamp]);

  return (
    <Pressable onPress={onPress} style={{ paddingHorizontal: spacing(2), paddingVertical: spacing(1.25) }}>
      <View style={{ gap: spacing(0.5) }}>
        <Text style={{ fontSize: typeScale.caption, lineHeight: lineHeights.caption, color: colors.secondaryText }} numberOfLines={1}>
          {dateStr}
        </Text>
        <Text style={{ fontSize: typeScale.body, lineHeight: lineHeights.body, color: colors.text }} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Pressable>
  );
});


