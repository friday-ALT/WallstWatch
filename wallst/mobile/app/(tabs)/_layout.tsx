import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { TickerBar } from '../../components/TickerBar';
import { F } from '../../constants/theme';
import { useColors } from '../../context/ThemeContext';

function Header() {
  const colors = useColors();
  return (
    <View style={{ backgroundColor: colors.bgDark }}>
      <AppHeader />
      <TickerBar />
    </View>
  );
}

type TabIconProps = { color: string; focused: boolean; name: keyof typeof Ionicons.glyphMap };

function TabIcon({ color, focused, name }: TabIconProps) {
  return <Ionicons name={name} size={22} color={color} style={{ opacity: focused ? 1 : 0.72 }} />;
}

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const tabContentHeight = 56;

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.bgDark,
          borderTopWidth: 0,
          height: tabContentHeight + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 10),
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: F.sans.medium,
          marginBottom: 0,
        },
        tabBarIconStyle: { marginTop: 0 },
        header: () => <Header />,
        headerStyle: { backgroundColor: colors.bgDark },
        sceneStyle: { backgroundColor: colors.bgDark },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name={focused ? 'home' : 'home-outline'} />,
        }}
      />
      <Tabs.Screen
        name="credit"
        options={{
          title: 'News',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name={focused ? 'newspaper' : 'newspaper-outline'} />
          ),
        }}
      />
      <Tabs.Screen
        name="macro"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name={focused ? 'grid' : 'grid-outline'} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Watchlist',
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name={focused ? 'star' : 'star-outline'} />,
        }}
      />
      <Tabs.Screen
        name="insider"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name={focused ? 'notifications' : 'notifications-outline'} />
          ),
        }}
      />
      <Tabs.Screen
        name="fedwatch"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name={focused ? 'person' : 'person-outline'} />
          ),
        }}
      />
    </Tabs>
  );
}
