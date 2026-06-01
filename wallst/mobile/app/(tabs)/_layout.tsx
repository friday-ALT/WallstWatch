import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { C } from '../../constants/colors';
import { AppHeader } from '../../components/AppHeader';
import { TickerBar } from '../../components/TickerBar';

function Header() {
  return (
    <View>
      <AppHeader />
      <TickerBar />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: C.bgPanel,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: 56,
        },
        tabBarActiveTintColor: C.red,
        tabBarInactiveTintColor: C.textDim,
        tabBarLabelStyle: {
          fontSize: 9,
          fontFamily: 'JetBrainsMono_700Bold',
          letterSpacing: 0.5,
          marginBottom: 4,
        },
        tabBarIconStyle: { marginTop: 4 },
        header: () => <Header />,
        headerStyle: { backgroundColor: C.bgPanel },
        sceneStyle: { backgroundColor: C.bgDark },
      }}
    >
      <Tabs.Screen name="index"      options={{ title: 'BANKS',    tabBarIcon: ({ color }) => <TabIcon label="◆" color={color} /> }} />
      <Tabs.Screen name="credit"     options={{ title: 'CREDIT',   tabBarIcon: ({ color }) => <TabIcon label="⬛" color={color} /> }} />
      <Tabs.Screen name="macro"      options={{ title: 'MACRO',    tabBarIcon: ({ color }) => <TabIcon label="▲" color={color} /> }} />
      <Tabs.Screen name="earnings"   options={{ title: 'EARNINGS', tabBarIcon: ({ color }) => <TabIcon label="◑" color={color} /> }} />
      <Tabs.Screen name="insider"    options={{ title: 'INSIDER',  tabBarIcon: ({ color }) => <TabIcon label="◈" color={color} /> }} />
      <Tabs.Screen name="fedwatch"   options={{ title: 'FED',      tabBarIcon: ({ color }) => <TabIcon label="⊕" color={color} /> }} />
    </Tabs>
  );
}

function TabIcon({ label, color }: { label: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ color, fontSize: 14 }}>{label}</Text>;
}
