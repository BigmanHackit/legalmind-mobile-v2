import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/providers/ThemeProvider';
import { FileText, Plus, AlertTriangle } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { contractsApi } from '../../lib/api/contract';

export default function ContractsScreen() {
  const router = useRouter();
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const response = await contractsApi.getAll({ limit: 50 });
      setContracts(response?.data || []);
    } catch (error) {
      console.error('Load contracts error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#141517]' : 'bg-gray-50'}`}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6A9113" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#141517]' : 'bg-gray-50'}`}>
      <ScrollView className="flex-1">
        <View className="px-6 py-8">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3">
              <View className="bg-[#6A9113]/20 p-2 rounded-lg">
                <FileText size={24} color="#6A9113" />
              </View>
              <View>
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Contracts
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {contracts.length} total
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/contracts/create')}
              className="bg-[#6A9113] p-3 rounded-xl"
            >
              <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Contracts List */}
          {contracts.length === 0 ? (
            <View className={`p-8 rounded-2xl items-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <FileText size={64} color={isDark ? '#4B5563' : '#9CA3AF'} />
              <Text className={`text-xl font-bold mt-4 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                No Contracts Yet
              </Text>
              <Text className={`text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Upload or draft your first contract with AI
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/contracts/create')}
                className="bg-[#6A9113] py-3 px-6 rounded-xl flex-row items-center gap-2"
              >
                <Plus size={20} color="#FFFFFF" />
                <Text className="text-white font-semibold">Create Contract</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="gap-3">
              {contracts.map((contract) => (
                <TouchableOpacity
                  key={contract.id}
                  onPress={() => router.push(`/contracts/${contract.id}`)}
                  className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <View className="flex-row items-start gap-3">
                    <View className="bg-[#141517]/10 dark:bg-gray-700 p-2 rounded-lg">
                      <FileText size={20} color={isDark ? '#9CA3AF' : '#4B5563'} />
                    </View>
                    <View className="flex-1">
                      <Text className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`} numberOfLines={2}>
                        {contract.title}
                      </Text>
                      <Text className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {contract.contractType?.replace(/_/g, ' ')} • {new Date(contract.createdAt).toLocaleDateString()}
                      </Text>
                      <View className="flex-row items-center gap-2 flex-wrap">
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
                        {contract.analysis && (
                          <View className="px-2 py-1 rounded-full bg-[#6A9113]/20">
                            <Text className="text-xs text-[#6A9113]">
                              Analyzed
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}