import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

// Import Space Mono font from expo-google-fonts
import {
  SpaceMono_400Regular,
} from '@expo-google-fonts/space-mono';

// Import your auth service and user type
import { onAuthUserChanged } from '../src/services/authService';
import type { User as FirebaseUser } from 'firebase/auth';

import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/hooks/useTheme';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loadedFonts] = useFonts({
    SpaceMono: SpaceMono_400Regular,
  });

  const frameworkReady = useFrameworkReady();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loadedFonts && frameworkReady) {
      SplashScreen.hideAsync();
    }
  }, [loadedFonts, frameworkReady]);

  useEffect(() => {
    const unsubscribe = onAuthUserChanged((firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoaded(true);
      if (firebaseUser) {
        // If user is logged in, you might want to navigate them to the main part of the app
        // This depends on how your routes are structured.
        // For example, if your main authenticated content is in an "(app)" group:
        // router.replace('/(app)/');
      } else {
        // If user is logged out, ensure they are on the sign-in screen
        // router.replace('/signIn'); // We will render signIn screen conditionally
      }
    });
    return () => unsubscribe();
  }, []);

  if (!loadedFonts || !frameworkReady || !authLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <NavThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {user ? (
          // User is authenticated, show main app navigator
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        ) : (
          // User is not authenticated, show Login/Auth navigator
          <Stack>
            <Stack.Screen
              name="signIn"
              options={{ title: 'Sign In' }}
            />
          </Stack>
        )}
        <StatusBar style="auto" />
      </NavThemeProvider>
    </ThemeProvider>
  );
}