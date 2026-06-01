import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useFonts, JetBrainsMono_400Regular, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { C } from '../constants/colors';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
    BebasNeue_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bgDark, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.red} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor={C.bgPanel} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
