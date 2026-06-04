import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { F, space, radius } from '../constants/theme';
import type { ThemeMode } from '../context/ThemeContext';

const MODES: { id: ThemeMode; label: string }[] = [
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
  { id: 'system', label: 'System' },
];

export function ThemeSettings() {
  const { mode, isDark, colors, setMode } = useTheme();

  return (
    <View style={s.wrap}>
      <Text style={[s.title, { color: colors.textPrimary }]}>Appearance</Text>
      <Text style={[s.sub, { color: colors.textSecondary }]}>
        Choose light or dark, or match your device.
      </Text>

      <View style={s.row}>
        <Text style={[s.label, { color: colors.textPrimary }]}>Dark mode</Text>
        <Switch
          value={isDark}
          onValueChange={(on) => setMode(on ? 'dark' : 'light')}
          trackColor={{ false: colors.border, true: colors.red + '88' }}
          thumbColor={isDark ? colors.red : colors.bgPanel}
        />
      </View>

      <View style={s.chips}>
        {MODES.map((m) => {
          const active = mode === m.id;
          return (
            <TouchableOpacity
              key={m.id}
              style={[
                s.chip,
                { backgroundColor: active ? colors.red + '28' : colors.bgCard },
              ]}
              onPress={() => setMode(m.id)}
            >
              <Text style={[s.chipText, { color: active ? colors.red : colors.textSecondary }]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: space.sm },
  title: { fontFamily: F.sans.semibold, fontSize: 17 },
  sub: { fontFamily: F.sans.regular, fontSize: 14, lineHeight: 20, marginBottom: space.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.sm,
  },
  label: { fontFamily: F.sans.medium, fontSize: 16 },
  chips: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
  chip: { borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 10 },
  chipText: { fontFamily: F.sans.semibold, fontSize: 14 },
});
