import React from "react";
import { Text, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = { title: string; onPress?: () => void; disabled?: boolean; style?: ViewStyle };

export default function GradientButton({ title, onPress, disabled, style }: Props) {
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} style={style} activeOpacity={0.8}>
      <LinearGradient
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        colors={["#FFD54F", "#FF8F00"]}
        style={styles.btn}
      >
        <Text style={styles.txt}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  txt: { color: "#fff", fontWeight: "700", fontSize: 16 },
});