import { View, Text, FlatList } from 'react-native';
import { spacing, typeScale, lineHeights, colors } from '../theme/tokens';
import ChatComposer from '../components/ChatComposer';
import { useChat } from '../hooks/useChat';

export default function ChatGlobalScreen() {
  const { messages, send } = useChat('chats/global/messages');
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: spacing(2), paddingTop: spacing(2), paddingBottom: spacing(1) }}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: spacing(1) }}>
            <Text style={{ fontSize: typeScale.caption, lineHeight: lineHeights.caption, color: colors.secondaryText }}>
              {item.displayName || 'User'}
            </Text>
            <Text style={{ fontSize: typeScale.body, lineHeight: lineHeights.body, color: colors.text }}>{item.text}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#EEE' }} />}
        ListEmptyComponent={() => (
          <View style={{ padding: spacing(2) }}>
            <Text style={{ color: colors.secondaryText }}>No messages yet.</Text>
          </View>
        )}
      />
      <ChatComposer onSend={async (t) => { await send(t); }} />
    </View>
  );
}


