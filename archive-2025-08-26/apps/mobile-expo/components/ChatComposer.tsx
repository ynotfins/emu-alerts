import { useState } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import { colors, radius, spacing, typeScale } from '../theme/tokens';

type Props = {
  onSend: (text: string) => Promise<void> | void;
};

export default function ChatComposer({ onSend }: Props) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      setBusy(true);
      setText('');
      await onSend(trimmed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flexDirection: 'row', gap: spacing(1), padding: spacing(1), borderTopWidth: 1, borderTopColor: '#EEE' }}>
      <TextInput
        placeholder="Message"
        value={text}
        onChangeText={setText}
        editable={!busy}
        style={{ flex: 1, backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing(1.5), borderWidth: 1, borderColor: '#E6E6E6' }}
      />
      <Pressable onPress={send} disabled={busy} style={{ backgroundColor: colors.accent, borderRadius: radius.xl, paddingHorizontal: spacing(2), alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontSize: typeScale.body }}>Send</Text>
      </Pressable>
    </View>
  );
}


