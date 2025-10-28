import React, { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, View, Text, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/context/AuthContext';
import { useTheme } from '../../lib/providers/ThemeProvider';
import { Mail, ArrowRight, ArrowLeft, Scale, CheckCircle } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await forgotPassword({
        email: email.trim().toLowerCase(),
      });
      setMessage(response.message);
      setIsSubmitted(true);
    } catch (error: any) {
      setMessage(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#141517]' : 'bg-white'}`}>
        <View className="flex-1 px-6 justify-center">
          {/* Animated Background */}
          <AnimatedBlob size={200} color="#6A9113" top={100} right={-50} duration={4000} />
          <AnimatedBlob size={240} color="#141517" bottom={120} left={-70} duration={5000} delay={1000} />

          {/* Logo */}
          <Link href="/" asChild>
            <TouchableOpacity>
              <View className="items-center mb-8">
                <View className="bg-[#6A9113] p-2 rounded-lg mb-3">
                  <Scale size={24} color="#FFFFFF" />
                </View>
                <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  LegalMind Pro
                </Text>
              </View>
            </TouchableOpacity>
          </Link>

          {/* Success Icon */}
          <View className="items-center mb-6">
            <PulsingSuccessIcon />
          </View>

          {/* Content */}
          <Text className={`text-2xl font-bold text-center mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Check Your Email
          </Text>

          <Text className={`text-base text-center mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {message}
          </Text>

          <Text className={`text-sm text-center mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            If you don't receive an email within a few minutes, please check your spam folder or try again.
          </Text>

          {/* Buttons */}
          <View className="gap-4">
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              className="bg-[#6A9113] py-4 px-6 rounded-2xl flex-row items-center justify-center active:bg-[#5a7a10]"
            >
              <ArrowLeft size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text className="text-white font-semibold">Back to Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIsSubmitted(false);
                setEmail('');
                setMessage('');
              }}
              className={`py-4 px-6 rounded-2xl border-2 ${isDark ? 'border-gray-700' : 'border-gray-300'}`}
            >
              <Text className={`text-center font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Try Different Email
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#141517]' : 'bg-white'}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 py-8">
            {/* Animated Background */}
            <AnimatedBlob size={160} color="#6A9113" top={80} right={-40} duration={4000} />
            <AnimatedBlob size={200} color="#141517" bottom={100} left={-60} duration={5000} delay={1000} />

            {/* Logo */}
            <Link href="/" asChild>
              <TouchableOpacity>
                <View className="items-center mb-8">
                  <View className="bg-[#6A9113] p-2 rounded-lg mb-3">
                    <Scale size={24} color="#FFFFFF" />
                  </View>
                  <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    LegalMind Pro
                  </Text>
                </View>
              </TouchableOpacity>
            </Link>

            {/* Icon */}
            <View className="items-center mb-6">
              <RotatingMailIcon isDark={isDark} />
            </View>

            {/* Header */}
            <Text className={`text-3xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Forgot Password?
            </Text>
            <Text className={`text-base text-center mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              No worries! Enter your email and we'll send you reset instructions.
            </Text>

            {/* Form */}
            <View className="gap-6 mb-6">
              <View>
                <Text className={`mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Email Address</Text>
                <View className={`flex-row items-center border-2 rounded-lg px-3 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}>
                  <Mail size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <TextInput
                    placeholder="you@example.com"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onSubmitEditing={handleSubmit}
                    className={`flex-1 py-4 px-3 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
                  />
                </View>
              </View>

              {message && !isSubmitted && (
                <View className="bg-red-50 p-3 rounded-lg">
                  <Text className="text-sm text-center text-red-600">{message}</Text>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading || !email}
              className={`bg-[#6A9113] py-4 px-6 rounded-2xl mb-6 flex-row items-center justify-center gap-2 ${
                (isLoading || !email) ? 'opacity-50' : 'active:bg-[#5a7a10]'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text className="text-white font-semibold">Send Reset Link</Text>
                  <ArrowRight size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            {/* Back Link */}
            <View className="items-center">
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <View className="flex-row items-center">
                    <ArrowLeft size={16} color="#6A9113" style={{ marginRight: 8 }} />
                    <Text className="text-sm font-medium text-[#6A9113]">Back to Sign In</Text>
                  </View>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Sign Up Link */}
            <View className="items-center mt-6">
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Don't have an account?{' '}
                <Link href="/(auth)/register" asChild>
                  <Text className="text-sm font-medium text-[#6A9113]">Sign up</Text>
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Rotating Mail Icon
function RotatingMailIcon({ isDark }: { isDark: boolean }) {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
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
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View
        className={`w-12 h-12 rounded-full items-center justify-center ${
          isDark ? 'bg-[rgba(106,145,19,0.2)]' : 'bg-[rgba(106,145,19,0.1)]'
        }`}
      >
        <Mail size={24} color="#6A9113" />
      </View>
    </Animated.View>
  );
}

// Pulsing Success Icon
function PulsingSuccessIcon() {
  const scale = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.back(2)),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${scale.value * -180}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View className="w-16 h-16 rounded-full bg-[rgba(106,145,19,0.1)] items-center justify-center">
        <CheckCircle size={32} color="#6A9113" />
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
  const opacity = useSharedValue(0.1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.1, { duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, []);

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
        },
        positionStyle,
        animatedStyle,
      ]}
    />
  );
}