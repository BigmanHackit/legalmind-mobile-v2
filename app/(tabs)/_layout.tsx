import React from 'react';
import { View, TouchableOpacity, Platform, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '../../lib/providers/ThemeProvider';
import { Home, FileText, FolderOpen, User, Wallet } from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// Custom Tab Bar Component
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  const tabs = [
    { name: 'cases', icon: FolderOpen, label: 'Cases' },
    { name: 'contracts', icon: FileText, label: 'Contracts' },
    { name: 'index', icon: Home, label: 'Home', isCenter: true },
    { name: 'wallet', icon: Wallet, label: 'Wallet' },
    { name: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <View className="absolute bottom-0 left-0 right-0 px-5 pb-5 ios:pb-5 android:pb-4">
      <View
        className={`flex-row h-[70px] rounded-[35px] items-center justify-around px-2.5 ${
          isDark ? 'bg-[#171514]' : 'bg-white'
        }`}
        style={{
          shadowColor: isDark ? '#000' : '#000',
          ...Platform.select({
            ios: {
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
            },
            android: {
              elevation: 15,
            },
          }),
        }}
      >
        {tabs.map((tab) => {
          const route = state.routes.find((r) => r.name === tab.name);
          if (!route) return null;

          const routeIndex = state.routes.indexOf(route);
          const isFocused = state.index === routeIndex;
          const Icon = tab.icon;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (tab.isCenter) {
            return (
              <View key={tab.name} className="flex-1 items-center justify-center -mt-9">
                <TouchableOpacity
                  onPress={onPress}
                  className={`w-[70px] h-[70px] rounded-[35px] items-center justify-center border-6 border-white ${
                    isFocused ? 'bg-[#6A9113]' : 'bg-[#7FA01C]'
                  }`}
                  activeOpacity={0.8}
                  style={{
                    shadowColor: '#6A9113',
                    ...Platform.select({
                      ios: {
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.35,
                        shadowRadius: 15,
                      },
                      android: {
                        elevation: 20,
                      },
                    }),
                  }}
                >
                  <Icon size={32} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={onPress}
              className="flex-1 items-center justify-center h-full"
              activeOpacity={0.7}
            >
              <View
                className={`w-[50px] h-[50px] rounded-[25px] items-center justify-center ${
                  isFocused ? (isDark ? 'bg-[#2A2B2F]' : 'bg-gray-100') : ''
                }`}
              >
                <Icon
                  size={24}
                  color={isFocused ? '#6A9113' : isDark ? '#9CA3AF' : '#6B7280'}
                  strokeWidth={isFocused ? 2.5 : 2}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="cases" />
      <Tabs.Screen name="contracts" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="wallet" />
    </Tabs>
  );
}