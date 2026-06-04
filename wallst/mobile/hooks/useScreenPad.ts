import { ViewStyle } from 'react-native';
import { space } from '../constants/theme';

/** Horizontal + bottom padding for scroll content inside tab screens. */
export function useScreenPad(extra?: ViewStyle): ViewStyle {
  return {
    paddingHorizontal: space.md,
    paddingBottom: space.xl + 8,
    ...extra,
  };
}

/** Tab bar height including home-indicator safe area. */
export function tabBarHeight(bottomInset: number) {
  const TAB_CONTENT = 52;
  return TAB_CONTENT + bottomInset;
}
