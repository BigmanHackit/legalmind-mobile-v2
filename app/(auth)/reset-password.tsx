// app/(auth)/reset-password.tsx
import { useState, useEffect } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, View, TextInput, ActivityIndicator, Text } from 'react-native';
import { useRouter, useLocalSearchParams, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/context/AuthContext';
import { useTheme } from '../../lib/providers/ThemeProvider';
import { Lock, Eye, EyeOff, ArrowRight, Scale, CheckCircle, AlertCircle } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { resetPassword } = useAuth();
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const token = params.token as string;

  useEffect(() => {
    if (!token) {
      setMessage('Invalid reset link. No token provided.');
    }
  }, [token]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!token) {
      setMessage('Invalid reset link.');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setMessage(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await resetPassword({ token, password });
      setMessage(response.message);
      setIsSuccess(true);

      setTimeout(() => {
        router.push('/(auth)/login');
      }, 3000);
    } catch (error: any) {
      setMessage(
        error.message || 'Password reset failed. The link may be expired or invalid.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
            <RotatingSuccessIcon />
          </View>

          {/* Content */}
          <Text
            className={`text-2xl font-bold text-center mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Password Reset Successful! 🎉
          </Text>

          <Text className={`text-base text-center mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Your password has been updated successfully.
          </Text>

          <Text className={`text-sm text-center mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Redirecting to sign in page in a few seconds...
          </Text>

          {/* Button */}
          <TouchableOpacity
            className="bg-[#6A9113] py-4 px-6 rounded-2xl flex-row items-center justify-center"
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.7}
          >
            <Text className="text-white font-semibold text-base mr-2">
              Go to Sign In
            </Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#141517]' : 'bg-white'}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
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
              <RotatingLockIcon isDark={isDark} />
            </View>

            {/* Header */}
            <Text
              className={`text-3xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              Reset Your Password
            </Text>
            <Text className={`text-base text-center mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Enter your new password below
            </Text>

            {/* Error Alert */}
            {message && !isSuccess && (
              <View className="bg-red-500 p-4 rounded-lg flex-row items-center gap-3 mb-6">
                <AlertCircle size={20} color="#FFFFFF" />
                <Text className="text-white flex-1">{message}</Text>
              </View>
            )}

            {/* Form */}
            <View className="gap-6 mb-6">
              {/* New Password */}
              <View>
                <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  New Password
                </Text>
                <View className="relative">
                  <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
                    <Lock size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  </View>
                  <TextInput
                    className={`text-base py-3 pl-12 pr-12 rounded-lg border ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter new password"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    className="absolute right-3 top-0 bottom-0 justify-center"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    ) : (
                      <Eye size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    )}
                  </TouchableOpacity>
                </View>
                <Text className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  Must be at least 8 characters with 1 uppercase and 1 number
                </Text>
              </View>

              {/* Confirm Password */}
              <View>
                <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Confirm New Password
                </Text>
                <View className="relative">
                  <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
                    <Lock size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  </View>
                  <TextInput
                    className={`text-base py-3 pl-12 pr-12 rounded-lg border ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Confirm new password"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    onSubmitEditing={handleSubmit}
                  />
                  <TouchableOpacity
                    className="absolute right-3 top-0 bottom-0 justify-center"
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    ) : (
                      <Eye size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className={`py-4 px-6 rounded-2xl flex-row items-center justify-center mb-6 ${
                isLoading || !token || !password || !confirmPassword
                  ? 'bg-gray-400'
                  : 'bg-[#6A9113]'
              }`}
              onPress={handleSubmit}
              disabled={isLoading || !token || !password || !confirmPassword}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator color="#FFFFFF" />
                  <Text className="text-white font-semibold text-base">Resetting...</Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-2">
                  <Text className="text-white font-semibold text-base">Reset Password</Text>
                  <ArrowRight size={20} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* Back Link */}
            <View className="items-center">
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-sm font-medium text-[#6A9113]">
                    Back to Sign In
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Rotating Lock Icon
function RotatingLockIcon({ isDark }: { isDark: boolean }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(-10, { duration: 250, easing: Easing.ease }),
        withTiming(10, { duration: 500, easing: Easing.ease }),
        withTiming(-10, { duration: 500, easing: Easing.ease }),
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
          isDark ? 'bg-[#6A9113]/20' : 'bg-[#6A9113]/10'
        }`}
      >
        <Lock size={24} color="#6A9113" />
      </View>
    </Animated.View>
  );
}

// Rotating Success Icon
function RotatingSuccessIcon() {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(-180);

  useEffect(() => {
    scale.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.back(2)),
    });
    rotation.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.back(1.5)),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View className="w-16 h-16 rounded-full bg-[#6A9113]/10 items-center justify-center">
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

  useEffect(() => {
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