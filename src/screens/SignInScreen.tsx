import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase"; // <— NOTE: lib/firebase, not firebase/config
import GradientButton from "../components/GradientButton";
import { colors, spacing } from "../theme/tokens";

const isEmail = (v: string) => /\S+@\S+\.\S+/.test(v);

export default function SignInScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    if (!isEmail(email)) return setError("Enter a valid email.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (loading) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace("Main");
    } catch (e: any) {
      console.log("SIGNIN ERROR", e?.code, e?.message);
      const map: Record<string, string> = {
        "auth/invalid-credential": "Invalid email or password.",
        "auth/user-not-found": "No account found for that email.",
        "auth/wrong-password": "Invalid email or password.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
        "auth/network-request-failed": "Network error. Check your connection.",
      };
      setError(map[e?.code] ?? "Sign-in failed. Check your credentials and network.");
      // Optional visual ping so you always see *something* happen
      if (!map[e?.code]) Alert.alert("Sign in failed", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        <Text style={styles.title}>EMU Alerts</Text>
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <GradientButton
          title={loading ? "Signing in..." : "Sign In"}
          onPress={handleSignIn}
          disabled={loading}
          style={{ marginTop: spacing.md }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: spacing.lg, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, textAlign: "center", marginBottom: spacing.xl },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: spacing.md, paddingVertical: 12, marginBottom: spacing.md, backgroundColor: "#fff",
  },
  error: { color: "#DC2626", marginTop: 6, textAlign: "center" },
});