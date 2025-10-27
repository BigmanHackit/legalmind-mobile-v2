import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  activeTheme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>("system");

  // Load theme from storage on mount
  useEffect(() => {
    loadTheme();
  }, []);

  // Save theme to storage whenever it changes
  useEffect(() => {
    saveTheme(theme);
  }, [theme]);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem("theme");
      if (stored && (stored === "light" || stored === "dark" || stored === "system")) {
        setThemeState(stored as Theme);
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  };

  const saveTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem("theme", newTheme);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Determine active theme based on selection and system preference
  const activeTheme: "light" | "dark" = 
    theme === "system" 
      ? (systemColorScheme || "light")
      : theme;

  return (
    <ThemeContext.Provider value={{ theme, activeTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}