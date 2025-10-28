import { ScrollView, Dimensions, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/providers/ThemeProvider';
import { Scale, FileText, Brain, ArrowRight } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import React from 'react';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#141517]' : 'bg-white'}`}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-12">
          {/* Animated Background Elements */}
          <AnimatedBlob
            size={160}
            color="#6A9113"
            top={80}
            right={-40}
            duration={4000}
          />
          <AnimatedBlob
            size={200}
            color="#141517"
            bottom={100}
            left={-60}
            duration={5000}
            delay={1000}
          />

          {/* Logo/Icon */}
          <View className="items-center mb-8">
            <PulsingIconContainer isDark={isDark}>
              <Scale size={40} color={isDark ? '#FFFFFF' : '#000000'} />
            </PulsingIconContainer>
          </View>

          {/* Title */}
          <Text
            className={`text-4xl font-bold text-center mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Legal AI Assistant
          </Text>

          {/* Subtitle */}
          <Text
            className={`text-base text-center mb-12 px-4 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Analyze legal cases, review contracts, and get AI-powered legal insights
          </Text>

          {/* Features */}
          <View className="gap-6 mb-12">
            <FeatureItem
              icon={<Brain size={24} color={isDark ? '#FFFFFF' : '#000000'} />}
              title="AI-Powered Analysis"
              description="Get intelligent legal case analysis in seconds"
              isDark={isDark}
            />
            <FeatureItem
              icon={<FileText size={24} color={isDark ? '#FFFFFF' : '#000000'} />}
              title="Contract Review"
              description="Identify risks and favorable terms automatically"
              isDark={isDark}
            />
            <FeatureItem
              icon={<Scale size={24} color={isDark ? '#FFFFFF' : '#000000'} />}
              title="Legal Research"
              description="Access relevant statutes and precedents"
              isDark={isDark}
            />
          </View>

          {/* CTA Buttons */}
          <View className="gap-4">
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              className="bg-[#6A9113] py-4 px-6 rounded-2xl active:bg-[#5a7a10]"
            >
              <Text className="text-white text-center font-semibold text-base">
                Get Started
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              className={`py-4 px-6 rounded-2xl border-2 ${
                isDark ? 'border-gray-700' : 'border-gray-300'
              }`}
            >
              <Text
                className={`text-center font-semibold text-base ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Feature Item Component
function FeatureItem({
  icon,
  title,
  description,
  isDark,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  isDark: boolean;
}) {
  return (
    <View className="flex-row gap-4 items-start">
      <View
        className={`w-12 h-12 rounded-lg items-center justify-center ${
          isDark ? 'bg-[rgba(106,145,19,0.2)]' : 'bg-[rgba(106,145,19,0.1)]'
        }`}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text
          className={`text-lg font-semibold mb-1 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          {title}
        </Text>
        <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {description}
        </Text>
      </View>
    </View>
  );
}

// Pulsing Icon Container
function PulsingIconContainer({
  children,
  isDark,
}: {
  children: React.ReactNode;
  isDark: boolean;
}) {
  const scale = useSharedValue(1);
  const rotateValue = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.ease }),
        withTiming(1, { duration: 1000, easing: Easing.ease })
      ),
      -1,
      false
    );

    rotateValue.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(10, { duration: 250, easing: Easing.ease }),
        withTiming(-10, { duration: 500, easing: Easing.ease }),
        withTiming(10, { duration: 500, easing: Easing.ease }),
        withTiming(0, { duration: 250, easing: Easing.ease }),
        withTiming(0, { duration: 3000 })
      ),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotateValue.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View
        className={`w-20 h-20 rounded-full items-center justify-center ${
          isDark ? 'bg-[rgba(106,145,19,0.2)]' : 'bg-[rgba(106,145,19,0.1)]'
        }`}
      >
        {children}
      </View>
    </Animated.View>
  );
}

// Animated Blob Background
function AnimatedBlob({
  size,
  color,
  top,
  right,
  bottom,
  left,
  duration,
  delay = 0,
}: {
  size: number;
  color: string;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  duration: number;
  delay?: number;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const positionStyle: any = { position: 'absolute' };
  if (top !== undefined) positionStyle.top = top;
  if (right !== undefined) positionStyle.right = right;
  if (bottom !== undefined) positionStyle.bottom = bottom;
  if (left !== undefined) positionStyle.left = left;

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.2,
        },
        positionStyle,
        animatedStyle,
      ]}
    />
  );
}