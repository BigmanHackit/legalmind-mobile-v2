import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Scale } from 'lucide-react-native';

interface LoadingProps {
  onComplete?: () => void;
  duration?: number;
}

export function Loading({ onComplete, duration = 3000 }: LoadingProps) {
  const [stage, setStage] = useState<'zoom-in' | 'ring' | 'zoom-out'>('zoom-in');

  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const ringOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.8);
  const containerOpacity = useSharedValue(1);

  const colors = ['#6A9113', '#8AB918', '#141517', '#6A9113'];

  useEffect(() => {
    const timings = {
      'zoom-in': 800,
      'ring': duration - 1600,
      'zoom-out': 800,
    };

    // Zoom in animation
    logoScale.value = withTiming(1, {
      duration: timings['zoom-in'],
      easing: Easing.out(Easing.ease),
    });
    logoOpacity.value = withTiming(1, { duration: timings['zoom-in'] });

    // Ring animation
    const ringTimeout = setTimeout(() => {
      runOnJS(setStage)('ring');
      ringOpacity.value = withTiming(1, { duration: 400 });
      ringScale.value = withTiming(1, { duration: 400 });
    }, timings['zoom-in']);

    // Zoom out animation
    const zoomOutTimeout = setTimeout(() => {
      runOnJS(setStage)('zoom-out');
      logoScale.value = withTiming(0.8, {
        duration: timings['zoom-out'],
        easing: Easing.in(Easing.ease),
      });
      ringOpacity.value = withTiming(0, { duration: 400 });
      ringScale.value = withTiming(1.2, { duration: 400 });
    }, timings['zoom-in'] + timings['ring']);

    // Complete
    const completeTimeout = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 500 }, () => {
        if (onComplete) {
          runOnJS(onComplete)();
        }
      });
    }, duration);

    return () => {
      clearTimeout(ringTimeout);
      clearTimeout(zoomOutTimeout);
      clearTimeout(completeTimeout);
    };
  }, [duration, onComplete]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
        },
        containerAnimatedStyle,
      ]}
    >
      {/* Main Content Container */}
      <View style={{ width: 300, height: 300, justifyContent: 'center', alignItems: 'center' }}>
        {/* Animated Rings */}
        {stage !== 'zoom-in' && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 300,
                height: 300,
                justifyContent: 'center',
                alignItems: 'center',
              },
              ringAnimatedStyle,
            ]}
          >
            {[0, 1, 2].map((index) => (
              <RotatingRing
                key={index}
                size={200 + index * 40}
                colors={colors}
                duration={2 + index * 0.5}
                clockwise={index % 2 === 0}
                opacity={0.8 - index * 0.2}
              />
            ))}

            {/* Pulsing Particles */}
            {[...Array(8)].map((_, i) => (
              <PulsingParticle key={i} index={i} color={colors[i % colors.length]} total={8} />
            ))}
          </Animated.View>
        )}

        {/* Logo */}
        <Animated.View style={[logoAnimatedStyle, { zIndex: 10 }]}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              backgroundColor: '#6A9113',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#6A9113',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 25,
              elevation: 10,
            }}
          >
            <Scale size={48} color="#FFFFFF" />
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

// Rotating Ring Component
function RotatingRing({
  size,
  colors,
  duration,
  clockwise,
  opacity,
}: {
  size: number;
  colors: string[];
  duration: number;
  clockwise: boolean;
  opacity: number;
}) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(clockwise ? 360 : -360, {
        duration: duration * 1000,
        easing: Easing.linear,
      }),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
        },
        animatedStyle,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id={`grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {colors.map((color, i) => (
              <Stop
                key={i}
                offset={`${(i / (colors.length - 1)) * 100}%`}
                stopColor={color}
                stopOpacity={opacity}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={`url(#grad-${size})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="70, 30"
        />
      </Svg>
    </Animated.View>
  );
}

// Pulsing Particle Component
function PulsingParticle({
  index,
  color,
  total,
}: {
  index: number;
  color: string;
  total: number;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const angle = (index * Math.PI * 2) / total;
    const distance = 110;

    translateX.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(Math.cos(angle) * distance, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1
    );

    translateY.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(Math.sin(angle) * distance, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1
    );
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}