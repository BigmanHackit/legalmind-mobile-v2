// app/(auth)/verify-email.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { CheckCircle, XCircle, Mail, ArrowRight } from 'lucide-react-native';
import { useAuth } from '../../lib/context/AuthContext';
import { useTheme } from '../../lib/providers/ThemeProvider';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { verifyEmail, resendVerification } = useAuth();
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'resend'>('verifying');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  // Animation values
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  const token = params.token as string;
  const emailParam = params.email as string;

  useEffect(() => {
    if (token) {
      handleVerifyEmail();
    } else {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      animateIn();
    }
  }, [token]);

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVerifyEmail = async () => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      animateIn();
      return;
    }

    try {
      const response = await verifyEmail({ token });
      setStatus('success');
      setMessage(response.message);
      animateIn();

      // Redirect to login after successful verification
      setTimeout(() => {
        router.replace('/login?verified=true');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(
        error.message || 'Email verification failed. The link may be expired or invalid.'
      );
      animateIn();

      // If we have email param, show resend option
      if (emailParam) {
        setEmail(emailParam);
        setStatus('resend');
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email address.');
      return;
    }

    setIsResending(true);
    try {
      const response = await resendVerification({ email });
      setMessage(response.message);
      setStatus('success');
      animateIn();
    } catch (error: any) {
      setMessage(error.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const renderStatusIcon = () => {
    if (status === 'verifying') {
      return (
        <View className="items-center justify-center mb-6">
          <View
            className="w-24 h-24 rounded-full items-center justify-center"
            style={{
              backgroundColor: isDark ? '#6A911320' : '#6A911310',
            }}
          >
            <ActivityIndicator size="large" color="#6A9113" />
          </View>
        </View>
      );
    }

    if (status === 'success') {
      return (
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          }}
          className="items-center justify-center mb-6"
        >
          <LinearGradient
            colors={['#6A9113', '#7FA01C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-24 h-24 rounded-full items-center justify-center"
            style={{
              shadowColor: '#6A9113',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <CheckCircle size={48} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
        </Animated.View>
      );
    }

    if (status === 'error' || status === 'resend') {
      return (
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          }}
          className="items-center justify-center mb-6"
        >
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-24 h-24 rounded-full items-center justify-center"
            style={{
              shadowColor: '#EF4444',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <XCircle size={48} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
        </Animated.View>
      );
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      {/* Gradient Background */}
      <LinearGradient
        colors={
          isDark
            ? ['#0a0a0a', '#1a1a1a', '#0a0a0a']
            : ['#f9fafb', '#ffffff', '#f9fafb']
        }
        locations={[0, 0.5, 1]}
        className="absolute inset-0"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          <View className="py-8">
            {/* Logo/Branding */}
            <View className="items-center mb-8">
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
                style={{
                  backgroundColor: isDark ? '#6A911320' : '#6A911310',
                }}
              >
                <Mail size={32} color="#6A9113" strokeWidth={2} />
              </View>
              <Text
                className={`text-3xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Email Verification
              </Text>
            </View>

            {/* Glass Card */}
            <View
              className="overflow-hidden rounded-3xl"
              style={{
                shadowColor: isDark ? '#000' : '#000',
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: isDark ? 0.5 : 0.1,
                shadowRadius: 30,
                elevation: 15,
              }}
            >
              {/* Glassmorphism Effect */}
              <BlurView
                intensity={isDark ? 30 : 20}
                tint={isDark ? 'dark' : 'light'}
                className="p-8"
                style={{
                  backgroundColor: isDark ? '#1a1a1a90' : '#ffffffb0',
                }}
              >
                {/* Status Icon */}
                {renderStatusIcon()}

                {/* Verifying State */}
                {status === 'verifying' && (
                  <View>
                    <Text
                      className={`text-xl font-bold text-center mb-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Verifying Your Email
                    </Text>
                    <Text
                      className={`text-center ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Please wait while we verify your email address...
                    </Text>
                  </View>
                )}

                {/* Success State */}
                {status === 'success' && (
                  <Animated.View style={{ opacity: fadeAnim }}>
                    <Text
                      className={`text-xl font-bold text-center mb-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Email Verified Successfully!
                    </Text>
                    <Text
                      className={`text-center mb-4 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {message}
                    </Text>
                    <Text
                      className={`text-sm text-center mb-6 ${
                        isDark ? 'text-gray-500' : 'text-gray-500'
                      }`}
                    >
                      Redirecting to login page in a few seconds...
                    </Text>

                    <TouchableOpacity
                      onPress={() => router.replace('/login?verified=true')}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#6A9113', '#7FA01C']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="py-4 px-6 rounded-2xl flex-row items-center justify-center"
                        style={{
                          shadowColor: '#6A9113',
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.3,
                          shadowRadius: 12,
                          elevation: 8,
                        }}
                      >
                        <Text className="text-white font-semibold text-base mr-2">
                          Go to Login
                        </Text>
                        <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                )}

                {/* Error State */}
                {status === 'error' && !emailParam && (
                  <Animated.View style={{ opacity: fadeAnim }}>
                    <Text
                      className={`text-xl font-bold text-center mb-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Verification Failed
                    </Text>
                    <Text
                      className={`text-center mb-6 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {message}
                    </Text>

                    <View className="gap-3">
                      <TouchableOpacity
                        onPress={() => router.replace('/login')}
                        className={`py-4 px-6 rounded-2xl border-2 ${
                          isDark ? 'border-gray-700' : 'border-gray-300'
                        }`}
                        activeOpacity={0.8}
                      >
                        <Text
                          className={`text-center font-semibold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          Back to Login
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setStatus('resend')}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={['#6A9113', '#7FA01C']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          className="py-4 px-6 rounded-2xl"
                        >
                          <Text className="text-white font-semibold text-center">
                            Request New Verification Email
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                )}

                {/* Resend State */}
                {status === 'resend' && (
                  <Animated.View style={{ opacity: fadeAnim }}>
                    <Text
                      className={`text-xl font-bold text-center mb-6 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Resend Verification Email
                    </Text>

                    <View className="mb-4">
                      <Text
                        className={`text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Email address
                      </Text>
                      <View
                        className={`rounded-2xl overflow-hidden ${
                          isDark ? 'bg-gray-800/50' : 'bg-white/80'
                        }`}
                        style={{
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.1,
                          shadowRadius: 8,
                          elevation: 2,
                        }}
                      >
                        <TextInput
                          value={email}
                          onChangeText={setEmail}
                          placeholder="Enter your email address"
                          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          className={`px-4 py-4 ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}
                        />
                      </View>
                    </View>

                    {message && (
                      <Text
                        className={`text-sm text-center mb-4 ${
                          message.includes('sent')
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {message}
                      </Text>
                    )}

                    <View className="gap-3">
                      <TouchableOpacity
                        onPress={handleResendVerification}
                        disabled={isResending}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={
                            isResending
                              ? ['#9CA3AF', '#6B7280']
                              : ['#6A9113', '#7FA01C']
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          className="py-4 px-6 rounded-2xl flex-row items-center justify-center"
                        >
                          {isResending ? (
                            <>
                              <ActivityIndicator size="small" color="#FFFFFF" />
                              <Text className="text-white font-semibold ml-2">
                                Sending...
                              </Text>
                            </>
                          ) : (
                            <Text className="text-white font-semibold">
                              Resend Verification
                            </Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => router.replace('/login')}
                        className={`py-4 px-6 rounded-2xl border-2 ${
                          isDark ? 'border-gray-700' : 'border-gray-300'
                        }`}
                        activeOpacity={0.8}
                      >
                        <Text
                          className={`text-center font-semibold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          Back to Login
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                )}
              </BlurView>

              {/* Liquid Glass Shine Effect */}
              <LinearGradient
                colors={
                  isDark
                    ? ['rgba(255,255,255,0.03)', 'transparent']
                    : ['rgba(255,255,255,0.5)', 'transparent']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="absolute inset-0 pointer-events-none"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}