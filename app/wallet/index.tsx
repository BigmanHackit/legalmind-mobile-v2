import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/providers/ThemeProvider';
import { 
  CreditCard, 
  Plus, 
  History, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  TrendingDown,
  X
} from 'lucide-react-native';
import { paymentsApi } from '../../lib/api/payment';
import { TransactionType } from '../../lib/types';
import { Loading } from '../../components/auth/Loading';

export default function WalletScreen() {
  const router = useRouter();
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walletBalance, setWalletBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [topupAmount, setTopupAmount] = useState('');
  const [isTopingUp, setIsTopingUp] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);

      const [walletData, transactionsData, subData] = await Promise.all([
        paymentsApi.getWalletBalance(),
        paymentsApi.getTransactionHistory({ page: 1, limit: 20 }),
        paymentsApi.getCurrentSubscription().catch(() => null),
      ]);

      setWalletBalance(walletData);
      setTransactions(transactionsData.transactions);
      setSubscription(subData);
    } catch (error) {
      console.error('Wallet error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount);

    if (!amount || amount < 100) {
      alert('Minimum top-up amount is ₦100');
      return;
    }

    try {
      setIsTopingUp(true);
      const result = await paymentsApi.initializeTopup(amount);

      // Open Paystack URL in browser
      await Linking.openURL(result.authorizationUrl);
      setShowTopupModal(false);
      setTopupAmount('');
    } catch (error: any) {
      alert(error.message || 'Failed to initialize top-up');
    } finally {
      setIsTopingUp(false);
    }
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.CREDIT:
      case TransactionType.BONUS:
        return ArrowDownRight;
      case TransactionType.DEBIT:
        return ArrowUpRight;
      default:
        return DollarSign;
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.CREDIT:
      case TransactionType.BONUS:
        return 'text-green-600 dark:text-green-400';
      case TransactionType.DEBIT:
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getTransactionBg = (type: TransactionType) => {
    switch (type) {
      case TransactionType.CREDIT:
      case TransactionType.BONUS:
        return 'bg-green-100 dark:bg-green-900/20';
      case TransactionType.DEBIT:
        return 'bg-red-100 dark:bg-red-900/20';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20';
    }
  };

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
          <View className="flex-row items-center gap-3 mb-6">
            <View className="bg-[#6A9113]/20 p-2 rounded-lg">
              <CreditCard size={24} color="#6A9113" />
            </View>
            <View>
              <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Wallet & Credits
              </Text>
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage your AI credits
              </Text>
            </View>
          </View>

          {/* Balance Card */}
          <View className="bg-gradient-to-br from-[#6A9113] to-[#5a7a0f] rounded-2xl p-6 mb-6">
            <View className="flex-row items-start justify-between mb-6">
              <View>
                <Text className="text-white/80 mb-2">
                  {subscription?.hasActiveSubscription ? 'Subscription Credits' : 'Available Balance'}
                </Text>
                <View className="flex-row items-baseline gap-2">
                  {subscription?.hasActiveSubscription ? (
                    <>
                      <Text className="text-5xl text-white font-bold">Unlimited</Text>
                      <Text className="text-xl text-white/80">Credits</Text>
                    </>
                  ) : (
                    <Text className={`text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {walletBalance?.balanceInNGN || '₦0.00'}
                    </Text>
                  )}
                </View>
              </View>
              <Zap size={48} color="rgba(255,255,255,0.5)" />
            </View>

            {subscription?.hasActiveSubscription ? (
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-white/80 text-sm">Subscription Status</Text>
                  <Text className="text-white text-sm">Active - {subscription.subscription.plan}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-white/80 text-sm">Expires</Text>
                  <Text className="text-white text-sm">
                    {new Date(subscription.subscription.expiresAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="mb-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-white/80 text-sm">Pay as you go</Text>
                  <Text className="text-white text-sm">{walletBalance?.balanceInNGN || '₦0.00'}</Text>
                </View>
              </View>
            )}

            <View className="flex-row gap-3">
              {!subscription?.hasActiveSubscription && (
                <TouchableOpacity
                  onPress={() => setShowTopupModal(true)}
                  className="flex-1 bg-white py-3 rounded-xl flex-row items-center justify-center gap-2"
                >
                  <Plus size={20} color="#141517" />
                  <Text className="text-[#141517] font-semibold">Top Up</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => router.push('/pricing')}
                className={`${subscription?.hasActiveSubscription ? 'flex-1' : 'flex-1'} border-2 border-white py-3 rounded-xl items-center justify-center`}
              >
                <Text className="text-white font-semibold">
                  {subscription?.hasActiveSubscription ? 'Manage Plan' : 'View Plans'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Transaction History */}
          <View className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <View className="flex-row items-center gap-2 mb-4">
              <History size={20} color="#6A9113" />
              <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Recent Transactions
              </Text>
            </View>

            {transactions.length === 0 ? (
              <View className="py-8 items-center">
                <History size={48} color={isDark ? '#4B5563' : '#9CA3AF'} />
                <Text className={`mt-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No transactions yet
                </Text>
              </View>
            ) : (
              <View className="gap-1">
                {transactions.map((transaction, index) => {
                  const Icon = getTransactionIcon(transaction.type);
                  const color = getTransactionColor(transaction.type);
                  const bg = getTransactionBg(transaction.type);

                  return (
                    <View key={transaction.id}>
                      <View className="flex-row items-center justify-between py-3">
                        <View className="flex-row items-center gap-3 flex-1">
                          <View className={`p-2 rounded-lg ${bg}`}>
                            <Icon size={16} color={color.includes('green') ? '#16A34A' : color.includes('red') ? '#DC2626' : '#2563EB'} />
                          </View>
                          <View className="flex-1">
                            <Text className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>
                              {transaction.description || transaction.type}
                            </Text>
                            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                        <Text className={`font-semibold ${color}`}>
                          {transaction.type === TransactionType.DEBIT ? '-' : '+'}
                          {paymentsApi.formatAmount(transaction.amount)}
                        </Text>
                      </View>
                      {index < transactions.length - 1 && (
                        <View className={`h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Credit Info */}
          <View className={`mt-6 p-6 rounded-2xl ${isDark ? 'bg-blue-900/20 border-blue-900/40' : 'bg-blue-50 border-blue-200'} border`}>
            <Text className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              How Credits Work
            </Text>
            <View className="gap-2">
              <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                • IRAC Analysis: ~₦100
              </Text>
              <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                • Contract Vetting: ~₦100
              </Text>
              <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                • Contract Drafting: ~₦100
              </Text>
              <Text className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Pay-as-you-go credits never expire
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Top-up Modal */}
      <Modal
        visible={showTopupModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTopupModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-[#141517]' : 'bg-white'}`}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Top Up Wallet
              </Text>
              <TouchableOpacity onPress={() => setShowTopupModal(false)}>
                <X size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Amount (NGN)
              </Text>
              <TextInput
                placeholder="Enter amount (min. ₦100)"
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                value={topupAmount}
                onChangeText={setTopupAmount}
                keyboardType="numeric"
                className={`border-2 rounded-xl px-4 py-4 text-base ${
                  isDark ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </View>

            <TouchableOpacity
              onPress={handleTopup}
              disabled={isTopingUp || !topupAmount}
              className={`bg-[#6A9113] py-4 rounded-xl items-center ${
                (isTopingUp || !topupAmount) ? 'opacity-50' : ''
              }`}
            >
              {isTopingUp ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold">Proceed to Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}