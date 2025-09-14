import React from "react";
import { Text, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, typography } from "../theme/tokens";

export default function GradientButton({
  title, onPress, disabled, style,
}: { title: string; onPress?: () => void; disabled?: boolean; style?: ViewStyle }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={disabled} style={style}>
      <LinearGradient
        colors={[colors.brandStart, colors.brandEnd]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.btn, disabled && { opacity: 0.6 }]}
      >
        <Text style={styles.txt}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  btn: { paddingVertical: 14, borderRadius: radius.lg, alignItems: "center" },
  txt: { color: "white", fontWeight: "700", fontSize: typography.body },
});