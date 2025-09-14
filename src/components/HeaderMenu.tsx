import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";

type Props = { onPress?: () => void; style?: ViewStyle };

export default function HeaderMenu({ onPress, style }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.btn, style]} hitSlop={12}>
      <Text style={styles.dots}>⋯</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: 12, paddingVertical: 6 },
  dots: { fontSize: 24, fontWeight: "700" },
});