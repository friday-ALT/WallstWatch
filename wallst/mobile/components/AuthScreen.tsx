import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandTitle } from './BrandTitle';
import { SurfaceCard } from './SurfaceCard';
import { useAuth } from '../context/AuthContext';
import { useColors } from '../context/ThemeContext';
import { F, radius, space } from '../constants/theme';

type Mode = 'login' | 'signup';

export function AuthScreen({ mode }: { mode: Mode }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { login, signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await signup(name.trim(), email.trim(), password);
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)/fedwatch');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: colors.bgPanel,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: F.sans.regular,
    fontSize: 16,
    color: colors.textPrimary,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bgDark }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: space.lg,
          paddingTop: insets.top + space.lg,
          paddingBottom: insets.bottom + space.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', marginBottom: space.xl }}>
          <BrandTitle size="lg" />
          <Text
            style={{
              fontFamily: F.sans.regular,
              fontSize: 15,
              color: colors.textSecondary,
              marginTop: space.sm,
            }}
          >
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </Text>
        </View>

        <SurfaceCard>
          {mode === 'signup' && (
            <View style={{ marginBottom: space.md }}>
              <Text style={labelStyle(colors)}>Full name</Text>
              <TextInput
                style={inputStyle}
                placeholder="John Smith"
                placeholderTextColor={colors.textDim}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={{ marginBottom: space.md }}>
            <Text style={labelStyle(colors)}>Email</Text>
            <TextInput
              style={inputStyle}
              placeholder="you@example.com"
              placeholderTextColor={colors.textDim}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={{ marginBottom: space.md }}>
            <Text style={labelStyle(colors)}>Password</Text>
            <TextInput
              style={inputStyle}
              placeholder="••••••••"
              placeholderTextColor={colors.textDim}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {mode === 'login' && (
            <Text
              style={{
                fontFamily: F.sans.regular,
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: space.md,
                lineHeight: 20,
              }}
            >
              Same login as the website — one account everywhere.
            </Text>
          )}

          {error ? (
            <View
              style={{
                backgroundColor: colors.red + '18',
                borderRadius: radius.md,
                padding: 12,
                marginBottom: space.md,
              }}
            >
              <Text style={{ fontFamily: F.sans.medium, fontSize: 14, color: colors.red }}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={submit}
            disabled={loading}
            style={{
              backgroundColor: loading ? colors.textDim : colors.textPrimary,
              borderRadius: radius.pill,
              paddingVertical: 16,
              alignItems: 'center',
            }}
          >
            {loading ? (
              <ActivityIndicator color={colors.bgDark} />
            ) : (
              <Text style={{ fontFamily: F.sans.bold, fontSize: 16, color: colors.bgDark }}>
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </Text>
            )}
          </TouchableOpacity>
        </SurfaceCard>

        <TouchableOpacity
          onPress={() => router.replace(mode === 'login' ? '/signup' : '/login')}
          style={{ marginTop: space.lg, alignItems: 'center' }}
        >
          <Text style={{ fontFamily: F.sans.regular, fontSize: 15, color: colors.textSecondary }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Text style={{ color: colors.red, fontFamily: F.sans.semibold }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: space.md, alignItems: 'center' }}>
          <Text style={{ fontFamily: F.sans.medium, fontSize: 15, color: colors.textDim }}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function labelStyle(colors: { textDim: string }) {
  return {
    fontFamily: F.sans.medium,
    fontSize: 14,
    color: colors.textDim,
    marginBottom: 8,
  };
}
