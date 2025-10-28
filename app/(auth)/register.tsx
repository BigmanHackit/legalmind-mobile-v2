import { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, View, Text, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/context/AuthContext';
import { useTheme } from '../../lib/providers/ThemeProvider';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Scale, CheckCircle, AlertCircle } from 'lucide-react-native';
import { LoadingTransition } from '../../components/auth/LoadingTransition';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, login } = useAuth();
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showLoadingTransition, setShowLoadingTransition] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isLongEnough = password.length >= 8;
    return hasUpperCase && hasNumber && isLongEnough;
  };

  const handleSubmit = async () => {
    setError('');

    if (!validatePassword(formData.password)) {
      setError('Password must be at least 8 characters with 1 uppercase letter and 1 number');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      await login({
        email: formData.email,
        password: formData.password,
      });

      setSuccess(true);
      setTimeout(() => {
        setShowLoadingTransition(true);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleLoadingComplete = () => {
    router.replace('/(auth)/onboarding');
  };

  const isFormValid =
    formData.firstName && formData.lastName && formData.email && formData.password;

  if (showLoadingTransition) {
    return <LoadingTransition onComplete={handleLoadingComplete} duration={3000} />;
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

            {/* Back Button */}
            <TouchableOpacity onPress={() => router.back()} className="mb-8">
              <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>

            {/* Logo */}
            <Link href="/" asChild>
              <TouchableOpacity>
                <View className="flex-row gap-2 items-center mb-8">
                  <View className="bg-[#6A9113] p-2 rounded-lg">
                    <Scale size={24} color="#FFFFFF" />
                  </View>
                  <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    LegalMind Pro
                  </Text>
                </View>
              </TouchableOpacity>
            </Link>

            {/* Header */}
            <View className="mb-8">
              <Text className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Create your account
              </Text>
              <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Start your journey with AI-powered legal work
              </Text>
            </View>

            {/* Success Alert */}
            {success && (
              <View className="bg-green-500 p-4 rounded-lg mb-6 flex-row items-center gap-3">
                <CheckCircle size={20} color="#FFFFFF" />
                <Text className="text-white flex-1">Account created successfully! Taking you to onboarding...</Text>
              </View>
            )}

            {/* Error Alert */}
            {error && (
              <View className="bg-red-500 p-4 rounded-lg mb-6 flex-row items-center gap-3">
                <AlertCircle size={20} color="#FFFFFF" />
                <Text className="text-white flex-1">{error}</Text>
              </View>
            )}

            {/* Form */}
            <View className="gap-4 mb-6">
              {/* Name Fields */}
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className={`mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>First Name</Text>
                  <TextInput
                    placeholder="John"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    value={formData.firstName}
                    onChangeText={(text) => updateField('firstName', text)}
                    autoCapitalize="words"
                    className={`border-2 rounded-lg px-4 py-4 text-base ${
                      isDark ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </View>
                <View className="flex-1">
                  <Text className={`mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Last Name</Text>
                  <TextInput
                    placeholder="Doe"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    value={formData.lastName}
                    onChangeText={(text) => updateField('lastName', text)}
                    autoCapitalize="words"
                    className={`border-2 rounded-lg px-4 py-4 text-base ${
                      isDark ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View>
                <Text className={`mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Email</Text>
                <View className={`flex-row items-center border-2 rounded-lg px-3 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}>
                  <Mail size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <TextInput
                    placeholder="you@example.com"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    value={formData.email}
                    onChangeText={(text) => updateField('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    className={`flex-1 py-4 px-3 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View>
                <Text className={`mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Password</Text>
                <View className={`flex-row items-center border-2 rounded-lg px-3 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}>
                  <Lock size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    value={formData.password}
                    onChangeText={(text) => updateField('password', text)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    className={`flex-1 py-4 px-3 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
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
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading || !isFormValid || success}
              className={`bg-[#6A9113] py-4 px-6 rounded-2xl mb-4 flex-row items-center justify-center gap-2 ${
                (isLoading || !isFormValid || success) ? 'opacity-50' : 'active:bg-[#5a7a10]'
              }`}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text className="text-white font-semibold">Creating account...</Text>
                </>
              ) : success ? (
                <Text className="text-white font-semibold">Account Created!</Text>
              ) : (
                <>
                  <Text className="text-white font-semibold">Create Account</Text>
                  <ArrowRight size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            {/* Terms */}
            <View className="items-center mb-6">
              <Text className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                By signing up, you agree to our{' '}
                <Text className="text-[#6A9113]">Terms of Service</Text> and{' '}
                <Text className="text-[#6A9113]">Privacy Policy</Text>
              </Text>
            </View>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
              <Text className={`px-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                Or sign up with
              </Text>
              <View className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
            </View>

            {/* Google Sign Up */}
            <TouchableOpacity
              disabled={isLoading || success}
              className={`py-4 px-6 rounded-2xl mb-6 border-2 flex-row items-center justify-center gap-2 ${
                isDark ? 'border-gray-700' : 'border-gray-300'
              } ${(isLoading || success) ? 'opacity-50' : ''}`}
            >
              <GoogleIcon />
              <Text className={isDark ? 'text-white' : 'text-gray-900'}>Sign up with Google</Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View className="items-center">
              <View className="flex-row items-center gap-1">
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Already have an account?
                </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text className="text-sm font-medium text-[#6A9113]">Sign in</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Google Icon Component
function GoogleIcon() {
    return (
      <Svg width="20" height="20" viewBox="0 0 24 24">
        <Path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <Path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <Path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <Path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </Svg>
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