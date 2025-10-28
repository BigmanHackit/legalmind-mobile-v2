import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../lib/context/AuthContext";
import { useTheme } from "../lib/providers/ThemeProvider";

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { activeTheme } = useTheme();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/welcome");
      }
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View className={`flex-1 items-center justify-center ${
      activeTheme === "dark" ? "bg-background" : "bg-white"
    }`}>
      <ActivityIndicator 
        size="large" 
        color={activeTheme === "dark" ? "#fff" : "#000"} 
      />
    </View>
  );
}