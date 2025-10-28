import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/providers/ThemeProvider';
import { useAuth } from '../../lib/context/AuthContext';
import { Check, Zap, Crown, Rocket } from 'lucide-react-native';
import { Loading } from '../../components/auth/Loading';
import { paymentsApi } from '../../lib/api/payment';

export default function PricingScreen() {
  const router = useRouter();
  const { activeTheme } = useTheme();
  const { user } = useAuth();
  const isDark = activeTheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    loadPlansAndSubscription();
  }, []);

  const loadPlansAndSubscription = async () => {
    try {
      setLoading(true);

      const plansData = await paymentsApi.getSubscriptionPlans();
      setPlans(plansData.plans);

      if (user) {
        try {
          const subData = await paymentsApi.getCurrentSubscription();
          setCurrentSubscription(subData);
        } catch (error) {
          setCurrentSubscription(null);
        }
      }
    } catch (error) {
      console.error('Pricing error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }

    if (currentSubscription?.subscription?.plan === planId) {
      alert('You already have this plan');
      return;
    }

    try {
      setSubscribing(planId);
      const result = await paymentsApi.initializeSubscription(planId as any);

      // Open Paystack URL in browser
      await Linking.openURL(result.authorizationUrl);
    } catch (error: any) {
      alert(error.message || 'Failed to initialize subscription');
    } finally {
      setSubscribing(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    if (planId === 'MONTHLY') return Zap;
    if (planId === 'YEARLY') return Crown;
    return Rocket;
  };

  if (loading) {
    return <Loading />;
  }

  const subscriptionPlans = plans.filter(p => p.id !== 'PAY_PER_USE');
  const payPerUsePlan = plans.find(p => p.id === 'PAY_PER_USE');

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#141517]' : 'bg-gray-50'}`}>
      <ScrollView className="flex-1">
        <View className="px-6 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text className={`text-3xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Simple, Transparent Pricing
            </Text>
            <Text className={`text-base text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Choose the plan that fits your needs
            </Text>
            {currentSubscription?.hasActiveSubscription && (
              <View className="mt-4 items-center">
                <View className="bg-[#6A9113] px-4 py-2 rounded-full">
                  <Text className="text-white text-xs font-semibold">
                    Current: {currentSubscription.subscription.plan}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Subscription Plans */}
          <View className="gap-6 mb-8">
            {subscriptionPlans.map((plan) => {
              const Icon = getPlanIcon(plan.id);
              const isCurrentPlan = currentSubscription?.subscription?.plan === plan.id;
              const isPopular = plan.id === 'YEARLY';

              return (
                <View
                  key={plan.id}
                  className={`rounded-2xl overflow-hidden ${
                    isPopular 
                      ? 'border-2 border-[#6A9113]' 
                      : isDark 
                      ? 'bg-gray-800' 
                      : 'bg-white'
                  }`}
                >
                  {isPopular && (
                    <View className="bg-[#6A9113] py-2">
                      <Text className="text-white text-center font-semibold text-xs">
                        BEST VALUE
                      </Text>
                    </View>
                  )}
                  
                  <View className={`p-6 ${!isPopular && (isDark ? 'bg-gray-800' : 'bg-white')}`}>
                    <View className="items-center mb-6">
                      <View className={`p-3 rounded-xl mb-3 ${
                        isPopular ? 'bg-[#6A9113]/20' : isDark ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <Icon size={32} color={isPopular ? '#6A9113' : isDark ? '#9CA3AF' : '#6B7280'} />
                      </View>
                      <Text className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {plan.name}
                      </Text>
                      <Text className={`text-sm text-center mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {plan.description}
                      </Text>
                      <View className="flex-row items-baseline gap-1">
                        <Text className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ₦{plan.price.toLocaleString()}
                        </Text>
                        <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          /{plan.billingCycle}
                        </Text>
                      </View>
                      {plan.id === 'YEARLY' && (
                        <Text className="text-sm text-[#6A9113] font-medium mt-2">
                          Save 20% vs monthly
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      onPress={() => handleSubscribe(plan.id)}
                      disabled={subscribing === plan.id || isCurrentPlan}
                      className={`py-4 rounded-xl mb-6 items-center ${
                        isCurrentPlan
                          ? 'bg-gray-300 dark:bg-gray-700'
                          : isPopular
                          ? 'bg-[#6A9113]'
                          : 'bg-[#141517] dark:bg-gray-700'
                      } ${subscribing === plan.id ? 'opacity-50' : ''}`}
                    >
                      {subscribing === plan.id ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text className="text-white font-semibold">
                          {isCurrentPlan ? 'Current Plan' : 'Get Started'}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <View className="gap-3">
                      {plan.features.map((feature: string, index: number) => (
                        <View key={index} className="flex-row items-start gap-3">
                          <Check size={20} color="#6A9113" className="mt-0.5 flex-shrink-0" />
                          <Text className={`text-sm flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {feature}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Pay As You Go */}
          {payPerUsePlan && (
            <View className="bg-[#141517] dark:bg-gray-800 rounded-2xl p-8 mb-8">
              <View className="items-center mb-6">
                <View className="bg-[#6A9113]/20 p-3 rounded-xl mb-3">
                  <Rocket size={32} color="#6A9113" />
                </View>
                <Text className="text-2xl font-bold text-white mb-2">
                  {payPerUsePlan.name}
                </Text>
                <Text className="text-gray-300 text-center mb-2">
                  {payPerUsePlan.description}
                </Text>
                <Text className="text-lg text-gray-400">
                  ₦{payPerUsePlan.price} per service
                </Text>
              </View>

              <View className="gap-3 mb-6">
                {payPerUsePlan.features.map((feature: string, index: number) => (
                  <View key={index} className="flex-row items-center gap-3">
                    <Check size={20} color="#6A9113" />
                    <Text className="text-sm text-white">{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => user ? router.push('/wallet') : router.push('/(auth)/login')}
                className="bg-[#6A9113] py-4 rounded-xl items-center"
              >
                <Text className="text-white font-semibold">Get Started</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* FAQs */}
          <View className="mb-8">
            <Text className={`text-2xl font-bold text-center mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Frequently Asked Questions
            </Text>
            <View className="gap-4">
              {[
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major payment methods through Paystack including cards, bank transfers, and USSD.'
                },
                {
                  q: 'Can I upgrade or downgrade my plan?',
                  a: 'Yes. You can change your plan at any time. Upgrades take effect immediately.'
                },
                {
                  q: 'What happens if I cancel?',
                  a: "You'll continue to have access until the end of your current billing period."
                },
                {
                  q: 'Do you offer refunds?',
                  a: 'We offer a 7-day money-back guarantee if you\'re not satisfied.'
                }
              ].map((faq, index) => (
                <View key={index} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {faq.q}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {faq.a}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Trust Badges */}
          <View className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <Text className={`text-center mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Trusted by legal professionals in Nigeria
            </Text>
            <View className="gap-3">
              {[
                'Secure payment via Paystack',
                'Cancel anytime',
                '7-day money back',
                'Nigerian legal standards'
              ].map((item, index) => (
                <View key={index} className="flex-row items-center justify-center gap-2">
                  <Check size={16} color="#6A9113" />
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}