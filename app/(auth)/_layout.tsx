import { Stack } from "expo-router";
import { useTheme } from "../../lib/providers/ThemeProvider";

export default function AuthLayout() {
  const { activeTheme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: activeTheme === "dark" ? "#0a0a0a" : "#ffffff",
        },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}