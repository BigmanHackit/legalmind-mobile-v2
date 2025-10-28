import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/providers/ThemeProvider';
import { useAuth } from '../../lib/context/AuthContext';
import { 
  User, 
  Settings, 
  CreditCard, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronRight,
  Mail,
  Shield,
  HelpCircle,
  FileText,
  Bell,
  Monitor,
  Check,
  X
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, activeTheme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const isDark = activeTheme === 'dark';
  const [showThemeModal, setShowThemeModal] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const MenuItem = ({ 
    icon: Icon, 
    label, 
    onPress, 
    showChevron = true,
    rightElement,
    destructive = false
  }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center justify-between p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl mb-2`}
    >
      <View className="flex-row items-center gap-3">
        <View className={`p-2 rounded-lg ${destructive ? 'bg-red-100 dark:bg-red-900/30' : 'bg-[#6A9113]/20'}`}>
          <Icon size={20} color={destructive ? '#EF4444' : '#6A9113'} />
        </View>
        <Text className={`font-semibold ${destructive ? 'text-red-600 dark:text-red-400' : isDark ? 'text-white' : 'text-gray-900'}`}>
          {label}
        </Text>
      </View>
      {rightElement || (showChevron && (
        <ChevronRight size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
      ))}
    </TouchableOpacity>
  );

  const ThemeOption = ({ 
    value, 
    icon: Icon, 
    label, 
    description 
  }: { 
    value: 'light' | 'dark' | 'system';
    icon: any;
    label: string;
    description: string;
  }) => {
    const isSelected = theme === value;
    
    return (
      <TouchableOpacity
        onPress={() => {
          setTheme(value);
          setShowThemeModal(false);
        }}
        className={`p-4 rounded-xl border-2 mb-3 ${
          isSelected 
            ? 'border-[#6A9113] bg-[#6A9113]/10' 
            : isDark 
            ? 'border-gray-700 bg-gray-800' 
            : 'border-gray-200 bg-white'
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            <View className={`p-2 rounded-lg ${isSelected ? 'bg-[#6A9113]/20' : isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Icon size={20} color={isSelected ? '#6A9113' : isDark ? '#9CA3AF' : '#6B7280'} />
            </View>
            <View className="flex-1">
              <Text className={`font-semibold mb-1 ${isSelected ? 'text-[#6A9113]' : isDark ? 'text-white' : 'text-gray-900'}`}>
                {label}
              </Text>
              <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {description}
              </Text>
            </View>
          </View>
          {isSelected && <Check size={20} color="#6A9113" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#141517]' : 'bg-gray-50'}`}>
      <ScrollView className="flex-1">
        <View className="px-6 py-8">
          {/* Profile Header */}
          <View className={`p-6 rounded-2xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <View className="items-center">
              <View className="w-24 h-24 rounded-full bg-[#6A9113] items-center justify-center mb-4">
                <Text className="text-white text-3xl font-bold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </Text>
              </View>
              <Text className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {user?.email}
              </Text>
              {user?.role && (
                <View className="mt-3 px-3 py-1 rounded-full bg-[#6A9113]/20">
                  <Text className="text-xs font-semibold text-[#6A9113]">
                    {user.role}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Account Section */}
          <View className="mb-6">
            <Text className={`text-sm font-bold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              ACCOUNT
            </Text>
            <MenuItem 
              icon={User}
              label="Edit Profile"
              onPress={() => router.push('/profile/edit')}
            />
            <MenuItem 
              icon={Mail}
              label="Email Settings"
              onPress={() => router.push('/profile/email')}
            />
            <MenuItem 
              icon={Shield}
              label="Privacy & Security"
              onPress={() => router.push('/profile/security')}
            />
            <MenuItem 
              icon={Bell}
              label="Notifications"
              onPress={() => router.push('/profile/notifications')}
            />
          </View>

          {/* Billing Section */}
          <View className="mb-6">
            <Text className={`text-sm font-bold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              BILLING
            </Text>
            <MenuItem 
              icon={CreditCard}
              label="Wallet & Payments"
              onPress={() => router.push('/wallet')}
            />
            <MenuItem 
              icon={FileText}
              label="Subscription"
              onPress={() => router.push('/pricing')}
            />
          </View>

          {/* Preferences Section */}
          <View className="mb-6">
            <Text className={`text-sm font-bold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              PREFERENCES
            </Text>
            <MenuItem 
              icon={theme === 'system' ? Monitor : theme === 'dark' ? Moon : Sun}
              label="Appearance"
              onPress={() => setShowThemeModal(true)}
              showChevron={false}
              rightElement={
                <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <Text className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}
                  </Text>
                </View>
              }
            />
            <MenuItem 
              icon={Settings}
              label="App Settings"
              onPress={() => router.push('/settings')}
            />
          </View>

          {/* Support Section */}
          <View className="mb-6">
            <Text className={`text-sm font-bold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              SUPPORT
            </Text>
            <MenuItem 
              icon={HelpCircle}
              label="Help Center"
              onPress={() => router.push('/help')}
            />
            <MenuItem 
              icon={FileText}
              label="Terms & Privacy"
              onPress={() => router.push('/legal')}
            />
          </View>

          {/* Logout */}
          <MenuItem 
            icon={LogOut}
            label="Logout"
            onPress={handleLogout}
            showChevron={false}
            destructive
          />

          {/* App Version */}
          <View className="items-center mt-8 mb-4">
            <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              LegalMind Pro v1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-[#141517]' : 'bg-white'}`}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Choose Theme
              </Text>
              <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                <X size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <ThemeOption
              value="system"
              icon={Monitor}
              label="System"
              description="Automatically switch between light and dark mode"
            />
            <ThemeOption
              value="light"
              icon={Sun}
              label="Light"
              description="Always use light mode"
            />
            <ThemeOption
              value="dark"
              icon={Moon}
              label="Dark"
              description="Always use dark mode"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}