import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../context/ThemeContext';
import { F, space } from '../constants/theme';

type Props = {
  label: string;
  onPress?: () => void;
  value?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  showChevron?: boolean;
  last?: boolean;
};

export function ListRow({
  label,
  onPress,
  value,
  icon,
  destructive,
  showChevron = !!onPress,
  last,
}: Props) {
  const colors = useColors();
  const tint = destructive ? colors.red : colors.textPrimary;

  const inner = (
    <View style={[s.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      {icon ? (
        <View style={[s.iconWrap, { backgroundColor: colors.bgPanel }]}>
          <Ionicons name={icon} size={18} color={colors.textSecondary} />
        </View>
      ) : null}
      <Text style={[s.label, { color: tint, flex: 1 }]}>{label}</Text>
      {value ? <Text style={[s.value, { color: colors.textDim }]}>{value}</Text> : null}
      {showChevron && onPress ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.65}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: space.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: F.sans.medium,
    fontSize: 16,
  },
  value: {
    fontFamily: F.sans.regular,
    fontSize: 14,
    marginRight: 4,
  },
});
