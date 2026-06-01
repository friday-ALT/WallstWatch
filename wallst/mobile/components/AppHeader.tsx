import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '../constants/colors';

export function AppHeader() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={s.header}>
      <View style={s.left}>
        <Text style={s.label}>WALLST</Text>
        <Text style={s.brand}>◆ WATCH</Text>
        <View style={s.badge}><Text style={s.badgeText}>BANKING COMMAND CENTER</Text></View>
      </View>
      <View style={s.right}>
        <Text style={s.clock}>{time}</Text>
        <Text style={s.dateStr}>{date}</Text>
        <View style={s.live}><View style={s.dot}/><Text style={s.liveText}>LIVE</Text></View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.bgPanel, borderBottomWidth: 1, borderBottomColor: C.red,
    paddingHorizontal: 16, paddingVertical: 10, paddingTop: 0,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: 11, fontFamily: 'JetBrainsMono_400Regular', color: C.textDim, letterSpacing: 2 },
  brand: { fontSize: 20, fontFamily: 'BebasNeue_400Regular', color: C.textPrimary, letterSpacing: 4 },
  badge: { backgroundColor: C.red, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 },
  badgeText: { fontSize: 7, fontFamily: 'JetBrainsMono_700Bold', color: '#fff', letterSpacing: 1 },
  right: { alignItems: 'flex-end', gap: 2 },
  clock: { fontSize: 14, fontFamily: 'JetBrainsMono_700Bold', color: C.textPrimary },
  dateStr: { fontSize: 9, fontFamily: 'JetBrainsMono_400Regular', color: C.textSecondary, letterSpacing: 1 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  liveText: { fontSize: 9, fontFamily: 'JetBrainsMono_700Bold', color: C.green, letterSpacing: 1 },
});
