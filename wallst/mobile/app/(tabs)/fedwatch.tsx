import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';
import { openExternalUrl } from '../../utils/openUrl';
import { ListRow } from '../../components/ListRow';
import { SectionLabel } from '../../components/SectionLabel';
import { SurfaceCard } from '../../components/SurfaceCard';
import { ThemeSettings } from '../../components/ThemeSettings';
import { F, space, radius } from '../../constants/theme';
import { useScreenPad } from '../../hooks/useScreenPad';
import { useColors } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import type { AppColors } from '../../constants/colors';

const makeStyles = (c: AppColors) => ({
  root: { flex: 1, backgroundColor: c.bgDark },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: space.sm,
  },
  avatarText: { fontFamily: F.sans.bold, fontSize: 24, color: '#fff' },
  profileName: { fontFamily: F.sans.bold, fontSize: 24, color: c.textPrimary, letterSpacing: -0.3 },
  profileEmail: { fontFamily: F.sans.regular, fontSize: 15, color: c.textSecondary, marginTop: 4 },
  planPill: {
    alignSelf: 'flex-start' as const,
    marginTop: space.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: c.red + '22',
  },
  planText: { fontFamily: F.sans.semibold, fontSize: 13, color: c.red },
  body: { fontFamily: F.sans.regular, fontSize: 15, lineHeight: 22, color: c.textSecondary },
  btnPrimary: {
    marginTop: space.md,
    backgroundColor: c.textPrimary,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center' as const,
  },
  btnPrimaryText: { color: c.bgDark, fontFamily: F.sans.bold, fontSize: 16 },
  btnOutline: {
    marginTop: space.sm,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center' as const,
    backgroundColor: c.bgCard,
  },
  btnOutlineText: { color: c.textPrimary, fontFamily: F.sans.semibold, fontSize: 16 },
  sectionGap: { marginTop: space.lg },
});

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default function AccountScreen() {
  const router = useRouter();
  const { user, loading: authLoading, logout, planLabel, updateNotificationPrefs, syncPushToken } = useAuth();
  const colors = useColors();
  const s = useThemedStyles(makeStyles);
  const screenPad = useScreenPad({ gap: space.lg });
  const [apiUp, setApiUp] = useState<boolean | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [newsPush, setNewsPush] = useState(true);
  const [pricePush, setPricePush] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    if (user) {
      setNewsPush(user.pushNewsAlerts !== false);
      setPricePush(user.pushPriceAlerts !== false);
    }
  }, [user]);

  useEffect(() => {
    apiFetch('/health')
      .then(() => setApiUp(true))
      .catch(() => setApiUp(false));
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  const toggleNewsPush = async (value: boolean) => {
    setNewsPush(value);
    setSavingPrefs(true);
    try {
      await updateNotificationPrefs({ pushNewsAlerts: value });
      if (value) await syncPushToken();
    } catch {
      setNewsPush(!value);
    } finally {
      setSavingPrefs(false);
    }
  };

  const togglePricePush = async (value: boolean) => {
    setPricePush(value);
    setSavingPrefs(true);
    try {
      await updateNotificationPrefs({ pushPriceAlerts: value });
      if (value) await syncPushToken();
    } catch {
      setPricePush(!value);
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={screenPad}>
      {authLoading ? (
        <ActivityIndicator color={colors.red} style={{ marginTop: space.lg }} />
      ) : user ? (
        <View>
          <View style={[s.avatar, { backgroundColor: colors.red }]}>
            <Text style={s.avatarText}>{initials(user.name)}</Text>
          </View>
          <Text style={s.profileName}>{user.name}</Text>
          <Text style={s.profileEmail}>{user.email}</Text>
          <View style={s.planPill}>
            <Text style={s.planText}>{planLabel}</Text>
          </View>
        </View>
      ) : (
        <View>
          <SectionLabel subtitle="One account for web and app">Profile</SectionLabel>
          <Text style={s.body}>
            Sign in with the same email you use on wallst-watch.vercel.app.
          </Text>
          <TouchableOpacity style={s.btnPrimary} onPress={() => router.push('/login')}>
            <Text style={s.btnPrimaryText}>Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnOutline} onPress={() => router.push('/signup')}>
            <Text style={s.btnOutlineText}>Create account</Text>
          </TouchableOpacity>
        </View>
      )}

      {user ? (
        <View style={s.sectionGap}>
          <SectionLabel subtitle="Lock-screen alerts for news and price moves">Notifications</SectionLabel>
          <SurfaceCard padded={false}>
            <View style={{ paddingHorizontal: space.md, paddingVertical: space.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
                <View style={{ flex: 1, paddingRight: space.md }}>
                  <Text style={{ fontFamily: F.sans.semibold, fontSize: 16, color: colors.textPrimary }}>Breaking news</Text>
                  <Text style={{ fontFamily: F.sans.regular, fontSize: 13, color: colors.textDim, marginTop: 4 }}>
                    Market headlines and watchlist news on your lock screen
                  </Text>
                </View>
                <Switch
                  value={newsPush}
                  onValueChange={toggleNewsPush}
                  disabled={savingPrefs}
                  trackColor={{ false: colors.bgCard, true: colors.red + '88' }}
                  thumbColor={newsPush ? colors.red : colors.textDim}
                />
              </View>
              <View style={{ height: 1, backgroundColor: colors.border + '55' }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
                <View style={{ flex: 1, paddingRight: space.md }}>
                  <Text style={{ fontFamily: F.sans.semibold, fontSize: 16, color: colors.textPrimary }}>Price alerts</Text>
                  <Text style={{ fontFamily: F.sans.regular, fontSize: 13, color: colors.textDim, marginTop: 4 }}>
                    Push when your alert rules fire
                  </Text>
                </View>
                <Switch
                  value={pricePush}
                  onValueChange={togglePricePush}
                  disabled={savingPrefs}
                  trackColor={{ false: colors.bgCard, true: colors.red + '88' }}
                  thumbColor={pricePush ? colors.red : colors.textDim}
                />
              </View>
            </View>
          </SurfaceCard>
        </View>
      ) : null}

      {user ? (
        <View style={s.sectionGap}>
          <SurfaceCard padded={false}>
            <View style={{ paddingHorizontal: space.md }}>
              <ListRow
                label="Manage subscription"
                icon="card-outline"
                onPress={() => openExternalUrl('https://wallst-watch.vercel.app/pricing')}
              />
              <ListRow
                label="Web dashboard"
                icon="laptop-outline"
                onPress={() => openExternalUrl('https://wallst-watch.vercel.app/dashboard')}
              />
              <ListRow
                label="Privacy policy"
                icon="shield-outline"
                onPress={() => openExternalUrl('https://wallst-watch.vercel.app/privacy')}
              />
              <ListRow
                label="Terms of service"
                icon="document-text-outline"
                onPress={() => openExternalUrl('https://wallst-watch.vercel.app/terms')}
              />
              <ListRow
                label="Market map"
                icon="map-outline"
                onPress={() => openExternalUrl('https://wallst-watch.vercel.app/map')}
                last
              />
            </View>
          </SurfaceCard>
        </View>
      ) : null}

      <View style={s.sectionGap}>
        <SurfaceCard>
          <ThemeSettings />
        </SurfaceCard>
      </View>

      <View style={s.sectionGap}>
        <SectionLabel subtitle="Service health">Status</SectionLabel>
        <SurfaceCard padded={false}>
          <View style={{ paddingHorizontal: space.md }}>
            <ListRow label="Web app" value="Online" showChevron={false} />
            <ListRow
              label="API"
              value={apiUp === null ? 'Checking' : apiUp ? 'Healthy' : 'Down'}
              showChevron={false}
              last
            />
          </View>
        </SurfaceCard>
      </View>

      {user ? (
        <TouchableOpacity style={s.btnOutline} onPress={handleLogout} disabled={loggingOut}>
          <Text style={[s.btnOutlineText, { color: colors.red }]}>
            {loggingOut ? 'Signing out…' : 'Sign out'}
          </Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}
