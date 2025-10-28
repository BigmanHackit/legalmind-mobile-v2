import { useEffect, useState } from 'react';
import { View, Dimensions, Text } from 'react-native';
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

const { width, height } = Dimensions.get('window');

interface LoadingTransitionProps {
  onComplete?: () => void;
  duration?: number;
}

export function LoadingTransition({ 
  onComplete, 
  duration = 3000 
}: LoadingTransitionProps) {
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
      style={[containerAnimatedStyle]}
      className="absolute top-0 left-0 right-0 bottom-0 z-50 bg-white justify-center items-center"
    >
      {/* Background Gradient */}
      <View className="absolute top-0 left-0 right-0 bottom-0 bg-[#F5F9EC]" />

      {/* Main Content Container */}
      <View className="w-[300px] h-[300px] justify-center items-center">
        {/* Animated Rings */}
        {stage !== 'zoom-in' && (
          <Animated.View
            style={[ringAnimatedStyle]}
            className="absolute w-[300px] h-[300px] justify-center items-center"
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
              <PulsingParticle
                key={i}
                index={i}
                color={colors[i % colors.length]}
                total={8}
              />
            ))}
          </Animated.View>
        )}

        {/* Logo */}
        <Animated.View style={[logoAnimatedStyle, { zIndex: 10 }]}>
          <AnimatedShadowBox stage={stage}>
            <View className="w-20 h-20 rounded-2xl bg-[#6A9113] justify-center items-center">
              <Scale size={48} color="#FFFFFF" />
            </View>
          </AnimatedShadowBox>
        </Animated.View>

        {/* Loading Text */}
        <View className="absolute -bottom-16 items-center">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-medium text-[#141517]">
              {stage === 'zoom-in' && 'Initializing...'}
              {stage === 'ring' && 'Loading your workspace'}
              {stage === 'zoom-out' && 'Almost ready!'}
            </Text>
            <View className="flex-row gap-1">
              {[0, 1, 2].map((i) => (
                <LoadingDot key={i} index={i} />
              ))}
            </View>
          </View>
        </View>
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
        withTiming(Math.cos(angle) * distance, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );

    translateY.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(Math.sin(angle) * distance, { duration: 2000, easing: Easing.inOut(Easing.ease) })
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
      className="absolute w-3 h-3 rounded-full"
      style={[
        animatedStyle,
        { backgroundColor: color }
      ]}
    />
  );
}

// Animated Shadow Box Component
function AnimatedShadowBox({
  children,
  stage,
}: {
  children: React.ReactNode;
  stage: string;
}) {
  const shadowOpacity = useSharedValue(0.25);
  const shadowRadius = useSharedValue(25);

  useEffect(() => {
    if (stage === 'ring') {
      shadowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 1000 }),
          withTiming(0.2, { duration: 1000 })
        ),
        -1
      );
      shadowRadius.value = withRepeat(
        withSequence(
          withTiming(40, { duration: 1000 }),
          withTiming(20, { duration: 1000 })
        ),
        -1
      );
    }
  }, [stage]);

  const animatedShadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: shadowOpacity.value,
    shadowRadius: shadowRadius.value,
  }));

  return (
    <Animated.View
      style={[
        {
          shadowColor: '#6A9113',
          shadowOffset: { width: 0, height: 10 },
          elevation: 10,
        },
        animatedShadowStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Loading Dot Component
function LoadingDot({ index }: { index: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    const delay = index * 150;
    
    setTimeout(() => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );

      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.5, { duration: 500 })
        ),
        -1,
        false
      );
    }, delay);
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[animatedStyle]}
      className="w-2 h-2 rounded-full bg-[#6A9113]"
    />
  );
}