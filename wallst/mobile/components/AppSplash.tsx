import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { F } from '../constants/theme';
import { darkColors } from '../constants/colors';

const BG = darkColors.bgDark;
const MIN_VISIBLE_MS = 2200;

function formatDayLine(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

type Props = {
  onFinish: () => void;
};

export function AppSplash({ onFinish }: Props) {
  const dateOpacity = useRef(new Animated.Value(0)).current;
  const dateTranslate = useRef(new Animated.Value(6)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const finished = useRef(false);

  useEffect(() => {
    const dayDelay = Animated.delay(420);
    const dayIn = Animated.parallel([
      Animated.timing(dateOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(dateTranslate, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]);

    const hold = Animated.delay(MIN_VISIBLE_MS);
    const fadeOut = Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 480,
      useNativeDriver: true,
    });

    const run = Animated.sequence([dayDelay, dayIn, hold, fadeOut]);
    run.start(({ finished: done }) => {
      if (done && !finished.current) {
        finished.current = true;
        onFinish();
      }
    });

    return () => run.stop();
  }, [dateOpacity, dateTranslate, screenOpacity, onFinish]);

  return (
    <Animated.View style={[styles.screen, { opacity: screenOpacity }]}>
      <View style={styles.center}>
        <Text style={styles.title}>
          <Text style={styles.titleWallst}>WALLST </Text>
          <Text style={styles.titleWatch}>WATCH</Text>
        </Text>
        <Animated.Text
          style={[
            styles.date,
            {
              opacity: dateOpacity,
              transform: [{ translateY: dateTranslate }],
            },
          ]}
        >
          {formatDayLine()}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BG,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    textAlign: 'center',
  },
  titleWallst: {
    fontFamily: F.display,
    fontSize: 42,
    letterSpacing: 4,
    color: darkColors.textPrimary,
  },
  titleWatch: {
    fontFamily: F.display,
    fontSize: 42,
    letterSpacing: 4,
    color: darkColors.red,
  },
  date: {
    marginTop: 20,
    fontSize: 17,
    lineHeight: 24,
    color: darkColors.textSecondary,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: F.sans.regular,
    }),
    fontStyle: 'italic',
  },
});
