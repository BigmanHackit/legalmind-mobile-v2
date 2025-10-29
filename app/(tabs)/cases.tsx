import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/providers/ThemeProvider';
import { Sparkles, Plus, FolderOpen } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { casesApi } from '../../lib/api/cases';

export default function CasesScreen() {
  const router = useRouter();
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const response = await casesApi.getCases({ limit: 50 });
      setCases(response?.data || []);
    } catch (error) {
      console.error('Load cases error:', error);
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
                <Sparkles size={20} color="#6A9113" />
              </View>
              <View>
                <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Cases
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {cases.length} total
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/cases/create')}
              className="bg-[#6A9113] p-3 rounded-xl"
            >
              <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Cases List */}
          {cases.length === 0 ? (
            <View className={`p-8 rounded-2xl items-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <FolderOpen size={64} color={isDark ? '#4B5563' : '#9CA3AF'} />
              <Text className={`text-xl font-bold mt-4 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                No Cases Yet
              </Text>
              <Text className={`text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Create your first case to start analyzing with AI
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/cases/create')}
                className="bg-[#6A9113] py-3 px-6 rounded-xl flex-row items-center gap-2"
              >
                <Plus size={20} color="#FFFFFF" />
                <Text className="text-white font-semibold">Create Case</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="gap-3">
              {cases.map((caseItem) => (
                <TouchableOpacity
                  key={caseItem.id}
                  onPress={() => router.push(`/cases/${caseItem.id}`)}
                  className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <View className="flex-row items-start gap-3">
                    <View className="bg-[#6A9113]/20 p-2 rounded-lg">
                      <Sparkles size={20} color="#6A9113" />
                    </View>
                    <View className="flex-1">
                      <Text className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`} numberOfLines={2}>
                        {caseItem.title}
                      </Text>
                      <Text className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {caseItem.caseType?.replace(/_/g, ' ')} • {new Date(caseItem.createdAt).toLocaleDateString()}
                      </Text>
                      <View className="flex-row items-center gap-2 flex-wrap">
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
                        <View
                          className={`px-2 py-1 rounded-full ${
                            caseItem.priority === 'URGENT'
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : caseItem.priority === 'HIGH'
                              ? 'bg-orange-100 dark:bg-orange-900/30'
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}
                        >
                          <Text
                            className={`text-xs ${
                              caseItem.priority === 'URGENT'
                                ? 'text-red-700 dark:text-red-400'
                                : caseItem.priority === 'HIGH'
                                ? 'text-orange-700 dark:text-orange-400'
                                : 'text-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {caseItem.priority}
                          </Text>
                        </View>
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