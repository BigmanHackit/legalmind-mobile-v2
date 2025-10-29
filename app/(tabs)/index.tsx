import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/providers/ThemeProvider';
import { useAuth } from '../../lib/context/AuthContext';
import { Sparkles, FileText, Wallet, Clock, FolderOpen, ArrowRight, Scale, BookOpen, Globe } from 'lucide-react-native';
import { paymentsApi } from '../../lib/api/payment';
import { contractsApi } from '../../lib/api/contract';
import { casesApi } from '../../lib/api/cases';
import { jurisdictionsApi } from '../../lib/api/jurisdictions';
import { usersApi } from '../../lib/api/user';
import { Loading } from '../../components/auth/Loading';

export default function DashboardScreen() {
  const router = useRouter();
  const { activeTheme } = useTheme();
  const { user } = useAuth();
  const isDark = activeTheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [walletBalance, setWalletBalance] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [contractsList, setContractsList] = useState<any[]>([]);
  const [jurisdictions, setJurisdictions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'cases' | 'contracts' | 'jurisdictions'>('cases');
  const [stats, setStats] = useState({
    casesAnalyzed: 0,
    contractsReviewed: 0,
    creditsRemaining: 0,
    timeSaved: 0,
  });

  useEffect(() => {
    loadDashboardData();
    checkFirstVisit();
  }, []);

  const checkFirstVisit = async () => {
    // Implement with AsyncStorage if needed
    setIsFirstVisit(false);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [
        walletData,
        subData,
        casesData,
        contractsData,
        jurisdictionsData,
        userStats,
      ] = await Promise.all([
        paymentsApi.getWalletBalance().catch(() => null),
        paymentsApi.getCurrentSubscription().catch(() => null),
        casesApi.getCases({ limit: 6 }).catch(() => ({ data: [], meta: { total: 0 } })),
        contractsApi.getAll({ limit: 6 }).catch(() => ({ data: [] })),
        jurisdictionsApi.getJurisdictions({ limit: 6 }).catch(() => ({ data: [], meta: { total: 0 } })),
        usersApi.getCurrentUserStatistics().catch(() => null),
      ]);

      setWalletBalance(walletData);
      setSubscription(subData);
      setCases(casesData?.data || []);
      setContractsList(contractsData?.data || []);
      setJurisdictions(jurisdictionsData?.data || []);

      if (userStats) {
        const estimatedTimeSaved = (userStats.cases.total * 2) + (userStats.contract.total * 1.5);
        setStats({
          casesAnalyzed: userStats.cases.total,
          contractsReviewed: userStats.contract.total,
          creditsRemaining: userStats.user.wallet?.balance || 0,
          timeSaved: Math.round(estimatedTimeSaved),
        });
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const statsDisplay = [
    { label: 'Cases Analyzed', value: stats.casesAnalyzed.toString(), icon: Sparkles, color: '#6A9113' },
    { label: 'Contracts', value: stats.contractsReviewed.toString(), icon: FileText, color: '#6A9113' },
    { label: 'AI Credits', value: subscription?.hasActiveSubscription ? 'Unlimited' : stats.creditsRemaining.toLocaleString(), icon: Wallet, color: '#F59E0B' },
    { label: 'Time Saved', value: `${stats.timeSaved}hrs`, icon: Clock, color: '#3B82F6' },
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#141517]' : 'bg-gray-50'}`}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6A9113']} />
        }
      >
        <View className="px-6 py-8">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3">
              <View className="bg-[#6A9113]/20 p-2 rounded-lg">
                <Scale size={20} color="#6A9113" />
              </View>
              <View>
                <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Dashboard
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row flex-wrap gap-3 mb-6">
            {statsDisplay.map((stat, index) => (
              <View
                key={index}
                className={`flex-1 min-w-[160px] p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                style={{ minWidth: 160 }}
              >
                <View
                  className="w-12 h-12 rounded-xl mb-3 items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon size={24} color={stat.color} />
                </View>
                <Text className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View className={`p-6 rounded-2xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Quick Actions
            </Text>
            <View className="gap-3">
              <TouchableOpacity
                onPress={() => router.push('/cases/create')}
                className={`p-4 rounded-xl border-2 flex-row items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="bg-[#6A9113]/20 p-3 rounded-xl">
                    <Sparkles size={24} color="#6A9113" />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Generate IRAC Analysis
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Organize case facts with AI
                    </Text>
                  </View>
                </View>
                <ArrowRight size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/contracts/create')}
                className={`p-4 rounded-xl border-2 flex-row items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="bg-[#6A9113]/20 p-3 rounded-xl">
                    <FileText size={24} color="#6A9113" />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Review Contract
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Vet or draft legal documents
                    </Text>
                  </View>
                </View>
                <ArrowRight size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* History Section with Tabs */}
          <View className={`p-6 rounded-2xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              History
            </Text>
            <Text className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Your recent legal work across all categories
            </Text>

            {/* Tabs */}
            <View className={`flex-row rounded-xl p-1 mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <TouchableOpacity
                onPress={() => setActiveTab('cases')}
                className={`flex-1 py-2 px-3 rounded-lg ${
                  activeTab === 'cases'
                    ? isDark ? 'bg-gray-600' : 'bg-white'
                    : ''
                }`}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    activeTab === 'cases'
                      ? isDark ? 'text-white' : 'text-gray-900'
                      : isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Cases
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('contracts')}
                className={`flex-1 py-2 px-3 rounded-lg ${
                  activeTab === 'contracts'
                    ? isDark ? 'bg-gray-600' : 'bg-white'
                    : ''
                }`}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    activeTab === 'contracts'
                      ? isDark ? 'text-white' : 'text-gray-900'
                      : isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Contracts
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('jurisdictions')}
                className={`flex-1 py-2 px-3 rounded-lg ${
                  activeTab === 'jurisdictions'
                    ? isDark ? 'bg-gray-600' : 'bg-white'
                    : ''
                }`}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    activeTab === 'jurisdictions'
                      ? isDark ? 'text-white' : 'text-gray-900'
                      : isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Jurisdictions
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content - Cases */}
            {activeTab === 'cases' && (
              <View>
                {cases.length === 0 ? (
                  <View className="py-8 items-center">
                    <FolderOpen size={48} color={isDark ? '#4B5563' : '#9CA3AF'} />
                    <Text className={`mt-3 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      No cases found. Create your first case to get started.
                    </Text>
                  </View>
                ) : (
                  <View className="gap-3">
                    {cases.map((caseItem) => (
                      <TouchableOpacity
                        key={caseItem.id}
                        onPress={() => router.push(`/cases/${caseItem.id}`)}
                        className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <View className="flex-row items-start gap-3">
                          <View className="bg-[#6A9113]/20 p-2 rounded-lg">
                            <Sparkles size={20} color="#6A9113" />
                          </View>
                          <View className="flex-1">
                            <Text className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>
                              {caseItem.title}
                            </Text>
                            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {caseItem.caseType?.replace(/_/g, ' ')} • {new Date(caseItem.createdAt).toLocaleDateString()}
                            </Text>
                          </View>
                          <View
                            className={`px-2 py-1 rounded-full ${
                              caseItem.status === 'COMPLETED'
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : caseItem.status === 'ANALYZING'
                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}
                          >
                            <Text
                              className={`text-xs ${
                                caseItem.status === 'COMPLETED'
                                  ? 'text-green-700 dark:text-green-400'
                                  : caseItem.status === 'ANALYZING'
                                  ? 'text-blue-700 dark:text-blue-400'
                                  : 'text-gray-700 dark:text-gray-400'
                              }`}
                            >
                              {caseItem.status}
                            </Text>
                          </View>
                          <ArrowRight size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        </View>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      onPress={() => router.push('/cases')}
                      className="mt-2 py-3 items-center"
                    >
                      <View className="flex-row items-center">
                        <Text className="text-[#6A9113] font-semibold mr-2">View All Cases</Text>
                        <ArrowRight size={16} color="#6A9113" />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Tab Content - Contracts */}
            {activeTab === 'contracts' && (
              <View>
                {contractsList.length === 0 ? (
                  <View className="py-8 items-center">
                    <FileText size={48} color={isDark ? '#4B5563' : '#9CA3AF'} />
                    <Text className={`mt-3 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      No contracts found. Upload or draft your first contract.
                    </Text>
                  </View>
                ) : (
                  <View className="gap-3">
                    {contractsList.map((contract) => (
                      <TouchableOpacity
                        key={contract.id}
                        onPress={() => router.push(`/contracts/${contract.id}`)}
                        className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <View className="flex-row items-start gap-3">
                          <View className={`p-2 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <FileText size={20} color={isDark ? '#9CA3AF' : '#4B5563'} />
                          </View>
                          <View className="flex-1">
                            <Text className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>
                              {contract.title}
                            </Text>
                            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {contract.contractType?.replace(/_/g, ' ')} • {new Date(contract.createdAt).toLocaleDateString()}
                            </Text>
                          </View>
                          <View
                            className={`px-2 py-1 rounded-full ${
                              contract.status === 'COMPLETED'
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : contract.status === 'ANALYZING'
                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}
                          >
                            <Text
                              className={`text-xs ${
                                contract.status === 'COMPLETED'
                                  ? 'text-green-700 dark:text-green-400'
                                  : contract.status === 'ANALYZING'
                                  ? 'text-blue-700 dark:text-blue-400'
                                  : 'text-gray-700 dark:text-gray-400'
                              }`}
                            >
                              {contract.status}
                            </Text>
                          </View>
                          <ArrowRight size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        </View>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      onPress={() => router.push('/contracts')}
                      className="mt-2 py-3 items-center"
                    >
                      <View className="flex-row items-center">
                        <Text className="text-[#6A9113] font-semibold mr-2">View All Contracts</Text>
                        <ArrowRight size={16} color="#6A9113" />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Tab Content - Jurisdictions */}
            {activeTab === 'jurisdictions' && (
              <View>
                {jurisdictions.length === 0 ? (
                  <View className="py-8 items-center">
                    <Scale size={48} color={isDark ? '#4B5563' : '#9CA3AF'} />
                    <Text className={`mt-3 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      No jurisdictions found.
                    </Text>
                  </View>
                ) : (
                  <View className="gap-3">
                    {jurisdictions.map((jurisdiction) => (
                      <TouchableOpacity
                        key={jurisdiction.id}
                        onPress={() => router.push(`/jurisdictions`)}
                        className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <View className="flex-row items-start gap-3">
                          <View className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                            <Scale size={20} color="#A855F7" />
                          </View>
                          <View className="flex-1">
                            <Text className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>
                              {jurisdiction.name}
                            </Text>
                            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {jurisdiction.country} • {jurisdiction.type?.replace(/_/g, ' ')}
                              {jurisdiction._count && ` • ${jurisdiction._count.cases} cases`}
                            </Text>
                          </View>
                          <ArrowRight size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        </View>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      onPress={() => router.push('/jurisdictions')}
                      className="mt-2 py-3 items-center"
                    >
                      <View className="flex-row items-center">
                        <Text className="text-[#6A9113] font-semibold mr-2">View All Jurisdictions</Text>
                        <ArrowRight size={16} color="#6A9113" />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Subscription/Wallet Card */}
          <View className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {subscription?.hasActiveSubscription ? 'Subscription Status' : 'Wallet Balance'}
            </Text>

            {subscription?.hasActiveSubscription ? (
              <View>
                <View className="items-center py-4">
                  <Text className="text-3xl font-bold text-[#6A9113] mb-2">
                    {subscription.subscription.plan}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Expires: {new Date(subscription.subscription.expiresAt).toLocaleDateString()}
                  </Text>
                  <Text className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {subscription.subscription.daysRemaining} days remaining
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/wallet')}
                  className={`mt-4 py-3 px-4 rounded-xl border-2 items-center ${isDark ? 'border-gray-700' : 'border-gray-300'}`}
                >
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Manage Subscription
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View className="items-center py-4">
                  <Text className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {walletBalance?.balanceInNGN || '₦0.00'}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Available Balance
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/wallet')}
                  className="mt-4 py-3 px-4 rounded-xl bg-[#6A9113] items-center"
                >
                  <Text className="text-white font-semibold">Top Up Credits</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}