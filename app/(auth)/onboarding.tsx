// app/(auth)/onboarding.tsx
import { useState, useEffect } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Dimensions, View, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/context/AuthContext';
import { useTheme } from '../../lib/providers/ThemeProvider';
import { usersApi } from '../../lib/api/user';
import { ArrowRight, Sparkles, Globe, Briefcase, Check, Target } from 'lucide-react-native';
import { LoadingTransition } from '../../components/auth/LoadingTransition';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Text } from 'react-native';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  const [step, setStep] = useState(0);
  const [showLoadingTransition, setShowLoadingTransition] = useState(false);
  const [userData, setUserData] = useState({
    age: '',
    country: '',
    profession: '',
    customProfession: '',
    purpose: '',
  });

  const professions = [
    'Lawyer',
    'Legal Assistant',
    'Paralegal',
    'Law Student',
    'Corporate Counsel',
    'Judge',
    'Legal Researcher',
    'Other',
  ];

  const purposes = [
    {
      value: 'RESEARCH',
      label: 'Research',
      icon: '🔬',
      description: 'Academic or professional legal research',
    },
    {
      value: 'SCHOOL',
      label: 'School/Education',
      icon: '🎓',
      description: 'Learning and educational purposes',
    },
    {
      value: 'OTHER',
      label: 'Other',
      icon: '💼',
      description: 'General legal work and practice',
    },
  ];

  const handleContinue = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      try {
        const updateData: any = {
          age: parseInt(userData.age),
          country: userData.country,
          profession:
            userData.profession === 'Other' ? userData.customProfession : userData.profession,
          purpose: userData.purpose,
        };

        await usersApi.updateCurrentUser(updateData);
        await refreshProfile();

        setShowLoadingTransition(true);
      } catch (error) {
        console.error('Failed to update profile:', error);
        setShowLoadingTransition(true);
      }
    }
  };

  const handleLoadingComplete = () => {
    router.replace('/(tabs)');
  };

  const toggleProfession = (profession: string) => {
    setUserData((prev) => ({
      ...prev,
      profession: profession,
      customProfession: profession !== 'Other' ? '' : prev.customProfession,
    }));
  };

  const canContinue = () => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return userData.age !== '' && parseInt(userData.age) >= 13;
      case 2:
        return userData.country !== '';
      case 3:
        return (
          userData.profession !== '' &&
          (userData.profession !== 'Other' || userData.customProfession !== '')
        );
      case 4:
        return userData.purpose !== '';
      default:
        return false;
    }
  };

  if (showLoadingTransition) {
    return <LoadingTransition onComplete={handleLoadingComplete} duration={3000} />;
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#141517]' : 'bg-[#F5F9EC]'}`}>
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
            <AnimatedBlob size={200} color="#6A9113" top={80} right={-60} duration={4000} />
            <AnimatedBlob size={240} color="#141517" bottom={100} left={-70} duration={5000} delay={1000} />

            {/* Progress Bar */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-2">
                <Text className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Step {step + 1} of 5
                </Text>
                <Text className="text-sm font-medium text-[#6A9113]">
                  {Math.round(((step + 1) / 5) * 100)}% Complete
                </Text>
              </View>
              <View className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <ProgressBar progress={((step + 1) / 5) * 100} />
              </View>
            </View>

            {/* Step Content */}
            <View className="flex-1">
              {step === 0 && <WelcomeStep user={user} />}
              {step === 1 && (
                <AgeStep userData={userData} setUserData={setUserData} isDark={isDark} />
              )}
              {step === 2 && (
                <CountryStep userData={userData} setUserData={setUserData} isDark={isDark} />
              )}
              {step === 3 && (
                <ProfessionStep
                  userData={userData}
                  setUserData={setUserData}
                  professions={professions}
                  toggleProfession={toggleProfession}
                  isDark={isDark}
                />
              )}
              {step === 4 && (
                <PurposeStep
                  userData={userData}
                  setUserData={setUserData}
                  purposes={purposes}
                  isDark={isDark}
                />
              )}
            </View>

            {/* Navigation Buttons */}
            <View className="flex-row gap-3 mt-6">
              {step > 0 && (
                <TouchableOpacity
                  className={`flex-1 py-4 px-6 rounded-2xl border-2 ${
                    isDark ? 'border-gray-700' : 'border-gray-300'
                  }`}
                  onPress={() => setStep(step - 1)}
                  activeOpacity={0.7}
                >
                  <Text className={`text-center font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Back
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className={`flex-1 py-4 px-6 rounded-2xl flex-row items-center justify-center ${
                  canContinue() ? 'bg-[#6A9113]' : 'bg-gray-400'
                }`}
                onPress={handleContinue}
                disabled={!canContinue()}
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold text-base mr-2">
                  {step === 4 ? 'Complete Setup' : 'Continue'}
                </Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Welcome Step
function WelcomeStep({ user }: { user: any }) {
  return (
    <View className="flex-1 justify-center items-center">
      <AnimatedSparkles />
      <Text className="text-4xl font-bold text-center mb-4">
        Welcome, {user?.firstName || 'there'}! 🎉
      </Text>
      <Text className="text-lg text-center text-gray-600 px-4">
        We're thrilled to have you here! Let's get to know you better so we can personalize your
        experience.
      </Text>
    </View>
  );
}

// Age Step
function AgeStep({ userData, setUserData, isDark }: any) {
  return (
    <View className="flex-1">
      <View className="mb-6">
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mb-4 ${
            isDark ? 'bg-[#6A9113]/20' : 'bg-[#6A9113]/10'
          }`}
        >
          <Text className="text-2xl">🎂</Text>
        </View>
        <Text className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          How old are you?
        </Text>
        <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          This helps us ensure you meet the age requirements for our platform.
        </Text>
      </View>

      <View>
        <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Age
        </Text>
        <TextInput
          className={`text-base py-3 px-4 rounded-lg border ${
            isDark
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          placeholder="Enter your age"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          value={userData.age}
          onChangeText={(text) => setUserData({ ...userData, age: text })}
          keyboardType="numeric"
        />
        {userData.age && parseInt(userData.age) < 13 && (
          <Text className="text-sm text-red-500 mt-2">
            You must be at least 13 years old to use this platform.
          </Text>
        )}
      </View>
    </View>
  );
}

// Country Step
function CountryStep({ userData, setUserData, isDark }: any) {
  return (
    <View className="flex-1">
      <View className="mb-6">
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mb-4 ${
            isDark ? 'bg-[#6A9113]/20' : 'bg-[#6A9113]/10'
          }`}
        >
          <Globe size={24} color="#6A9113" />
        </View>
        <Text className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Where are you from?
        </Text>
        <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          We'll tailor legal resources specific to your jurisdiction.
        </Text>
      </View>

      <View>
        <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Country
        </Text>
        <TextInput
          className={`text-base py-3 px-4 rounded-lg border ${
            isDark
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          placeholder="e.g., United States, United Kingdom, Nigeria"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          value={userData.country}
          onChangeText={(text) => setUserData({ ...userData, country: text })}
        />
      </View>
    </View>
  );
}

// Profession Step
function ProfessionStep({ userData, professions, toggleProfession, isDark, setUserData }: any) {
  return (
    <View className="flex-1">
      <View className="mb-6">
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mb-4 ${
            isDark ? 'bg-[#6A9113]/20' : 'bg-[#6A9113]/10'
          }`}
        >
          <Briefcase size={24} color="#6A9113" />
        </View>
        <Text className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          What's your profession?
        </Text>
        <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Select the option that best describes you.
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-3 mb-4">
          {professions.map((profession: string) => (
            <TouchableOpacity
              key={profession}
              onPress={() => toggleProfession(profession)}
              activeOpacity={0.7}
            >
              <View
                className={`p-4 rounded-2xl border-2 ${
                  userData.profession === profession
                    ? 'border-[#6A9113] bg-[#6A9113]/5'
                    : isDark
                    ? 'border-gray-700'
                    : 'border-gray-200'
                }`}
              >
                <View className="flex-row justify-between items-center">
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {profession}
                  </Text>
                  {userData.profession === profession && <Check size={20} color="#6A9113" />}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {userData.profession === 'Other' && (
          <View className="mt-4">
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Please specify your profession
            </Text>
            <TextInput
              className={`text-base py-3 px-4 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Enter your profession"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={userData.customProfession}
              onChangeText={(text) => setUserData({ ...userData, customProfession: text })}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Purpose Step
function PurposeStep({ userData, setUserData, purposes, isDark }: any) {
  return (
    <View className="flex-1">
      <View className="mb-6">
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mb-4 ${
            isDark ? 'bg-[#6A9113]/20' : 'bg-[#6A9113]/10'
          }`}
        >
          <Target size={24} color="#6A9113" />
        </View>
        <Text className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          What brings you here?
        </Text>
        <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Help us understand how you plan to use LegalMind Pro.
        </Text>
      </View>

      <View className="gap-3">
        {purposes.map((purpose: any) => (
          <TouchableOpacity
            key={purpose.value}
            onPress={() => setUserData({ ...userData, purpose: purpose.value })}
            activeOpacity={0.7}
          >
            <View
              className={`p-6 rounded-2xl border-2 ${
                userData.purpose === purpose.value
                  ? 'border-[#6A9113] bg-[#6A9113]/5'
                  : isDark
                  ? 'border-gray-700'
                  : 'border-gray-200'
              }`}
            >
              <View className="flex-row gap-3 items-start">
                <Text className="text-3xl">{purpose.icon}</Text>
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text
                      className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {purpose.label}
                    </Text>
                    {userData.purpose === purpose.value && <Check size={20} color="#6A9113" />}
                  </View>
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {purpose.description}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Animated Sparkles
function AnimatedSparkles() {
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotate.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 500 }),
        withTiming(-10, { duration: 1000 }),
        withTiming(10, { duration: 1000 }),
        withTiming(0, { duration: 500 })
      ),
      -1
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ marginBottom: 24 }, animatedStyle]}>
      <Sparkles size={64} color="#6A9113" />
    </Animated.View>
  );
}

// Progress Bar
function ProgressBar({ progress }: { progress: number }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <Animated.View
      style={[
        {
          height: '100%',
          borderRadius: 9999,
          backgroundColor: '#6A9113',
        },
        animatedStyle,
      ]}
    />
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