import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { spacing, typeScale, lineHeights, colors, radius } from '../theme/tokens';
import { useAuth } from '../src/firebase/auth';
import { useEffect } from 'react';

export default function SignInScreen({ navigation }: any) {
  const { signIn, signUp, role, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);

  const onSignIn = async () => {
    try {
      setBusy(true);
      await signIn(email.trim(), password);
    } catch (e: any) {
      Alert.alert('Sign in failed', e?.message ?? 'Try again');
    } finally {
      setBusy(false);
    }
  };

  const onSignUp = async () => {
    try {
      setBusy(true);
      await signUp(email.trim(), password, displayName.trim() || undefined);
      Alert.alert('Account created', 'Please sign in again if prompted.');
    } catch (e: any) {
      Alert.alert('Sign up failed', e?.message ?? 'Try again');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (user && !role) {
      navigation.replace('Pending');
    }
  }, [user, role, navigation]);

  return (
    <View style={{ flex: 1, padding: spacing(2), gap: spacing(1.5), justifyContent: 'center' }}>
      <Text style={{ fontSize: typeScale.title, lineHeight: lineHeights.title, color: colors.text }}>Welcome</Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderRadius: radius.xl, padding: spacing(1.5), backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6E6E6' }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderRadius: radius.xl, padding: spacing(1.5), backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6E6E6' }}
      />
      <TextInput
        placeholder="Display name (for new accounts)"
        value={displayName}
        onChangeText={setDisplayName}
        style={{ borderRadius: radius.xl, padding: spacing(1.5), backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6E6E6' }}
      />
      <Pressable onPress={onSignIn} disabled={busy} style={{ backgroundColor: colors.accent, padding: spacing(1.5), borderRadius: radius.xl, alignItems: 'center' }}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: typeScale.body }}>Sign In</Text>}
      </Pressable>
      <Pressable onPress={onSignUp} disabled={busy} style={{ backgroundColor: '#EFEFEF', padding: spacing(1.5), borderRadius: radius.xl, alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontSize: typeScale.body }}>Create Account</Text>
      </Pressable>
      <Text style={{ fontSize: typeScale.caption, lineHeight: lineHeights.caption, color: colors.secondaryText }}>
        If your role is pending, sign out/in once after an admin approves you.
      </Text>
    </View>
  );
}


