import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  ArrowLeft,
  Search,
  Scale,
  Globe,
  FileText,
  BookOpen,
  Building,
  Plus,
} from 'lucide-react-native';
import { jurisdictionsApi, JurisdictionFilters } from '../../lib/api/jurisdictions';
import { Jurisdiction } from '../../lib/types';
import { useTheme } from '../../lib/providers/ThemeProvider';

interface Props {
  navigation: any;
}

export default function JurisdictionsScreen({ navigation }: Props) {
    const { activeTheme } = useTheme();
    const isDark = activeTheme === 'dark';
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<JurisdictionFilters>({
    search: '',
    country: '',
    type: undefined,
  });

  const loadJurisdictions = async () => {
    try {
      setIsLoading(true);
      const response = await jurisdictionsApi.getJurisdictions(filters);
      setJurisdictions(response.data);
    } catch (error) {
      console.error('Failed to load jurisdictions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJurisdictions();
  }, [filters]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJurisdictions();
    setRefreshing(false);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      FEDERAL: 'bg-purple-100 dark:bg-purple-900/30',
      STATE: 'bg-blue-100 dark:bg-blue-900/30',
      LOCAL: 'bg-green-100 dark:bg-green-900/30',
    };
    return colors[type] || 'bg-gray-100';
  };

  return (
    <View className={`flex-1 py-8 ${isDark ? 'bg-[#141517]' : 'bg-gray-50'}`}>
      {/* Header */}
      <View className={`${isDark ? 'bg-[#141517]' : 'bg-gray-50'} px-4 py-3`}>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <ArrowLeft size={24} color="#6A9113" />
          </TouchableOpacity>
          <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Jurisdictions
          </Text>
        </View>
      </View>

      {/* Search */}
      <View className={`${isDark ? 'bg-[#141517] border-slate-800' : 'bg-white border-gray-200' } border-b border-t p-4`}>
        <View className={`flex-row items-center ${isDark ? 'dark:bg-slate-800' : 'bg-gray-50' } rounded-lg`}>
          <Search size={20} color="#6B7280" />
          <TextInput
            placeholder="Search jurisdictions..."
            placeholderTextColor="#6B7280"
            value={filters.search}
            onChangeText={(text) => setFilters({ ...filters, search: text })}
            className={`flex-1 ml-2 ${isDark ? 'text-white' : 'text-gray-900' }`}
          />
        </View>
      </View>

      {isLoading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6A9113" />
        </View>
      ) : jurisdictions.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Building size={48} color="#9CA3AF" />
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">
            No jurisdictions found
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Try adjusting your search criteria.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 p-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {jurisdictions.map((jurisdiction) => (
            <View
              key={jurisdiction.id}
              className={`${isDark ? 'bg-[#141517] border-slate-800' : 'bg-gray-50'} rounded-lg border border-gray-200 p-4 mb-3`}
            >
              <View className="flex-row items-start mb-3">
                <View className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg items-center justify-center mr-3">
                  <Scale size={20} color="#A855F7" />
                </View>
                <View className="flex-1">
                  <Text className={`mb-1 text-base ${isDark ? 'text-white' : 'text-gray-900' }`}>
                    {jurisdiction.name}
                  </Text>
                  <View className="flex-row items-center">
                    <Globe size={12} color="#6B7280" />
                    <Text className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                      {jurisdiction.country}
                    </Text>
                    <View
                      className={`ml-2 px-2 py-1 rounded ${getTypeColor(jurisdiction.type)}`}
                    >
                      <Text className="text-xs font-medium">
                        {jurisdiction.type}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {jurisdiction._count && (
                <View className="space-y-2">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <FileText size={16} color="#6B7280" />
                      <Text className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        Cases
                      </Text>
                    </View>
                    <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900' }`}>
                      {jurisdiction._count.cases}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Scale size={16} color="#6B7280" />
                      <Text className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        Statutes
                      </Text>
                    </View>
                    <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900' }`}>
                      {jurisdiction._count.statutes}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <BookOpen size={16} color="#6B7280" />
                      <Text className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        Precedents
                      </Text>
                    </View>
                    <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900' }`}>
                      {jurisdiction._count.precedents}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};