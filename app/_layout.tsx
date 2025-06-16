import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router'; // Using Stack for auth and main layout
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native'; // Removed View, Text, Button
import 'react-native-reanimated';

// Import your auth service and user type
import { onAuthUserChanged } from '../src/services/authService'; // Adjust path, removed signInWithEmail, signUpWithEmail
import type { User as FirebaseUser } from 'firebase/auth'; // Or your custom AuthUser

import { useFrameworkReady } from '@/hooks/useFrameworkReady'; // CRITICAL: Keep this hook
import { ThemeProvider } from '@/hooks/useTheme'; // Custom ThemeProvider
import { StatusBar } from 'expo-status-bar';

// LoginScreenPlaceholder component is now in app/signIn.tsx

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loadedFonts] = useFonts({ // Renamed to loadedFonts to avoid conflict
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'), // Assuming this path is correct
  });

  const frameworkReady = useFrameworkReady(); // CRITICAL: Keep this hook
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loadedFonts && frameworkReady) { // Ensure fonts and framework are ready
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
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  if (!loadedFonts || !frameworkReady || !authLoaded) { // Wait for fonts, framework, and auth state
    return null; // Or a loading indicator
  }

  return (
    <ThemeProvider> {/* Your custom ThemeProvider */}
      <NavThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {user ? (
          // User is authenticated, show main app navigator
          // The existing Stack setup will handle routes inside (app) or other defined routes
          <Stack screenOptions={{ headerShown: false }}>
            {/* Example: if your main content is in an (app) group */}
            {/* <Stack.Screen name="(app)" options={{ headerShown: false }} /> */}
            {/* Or if you have specific screens at the root for authenticated users */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        ) : (
          // User is not authenticated, show Login/Auth navigator
          <Stack>
            <Stack.Screen
              name="signIn" // This will now be handled by app/signIn.tsx
              options={{ title: 'Sign In' }}
            />
            {/* You would add a "signUp" screen component here as well, e.g. app/signUp.tsx
            <Stack.Screen name="signUp" options={{ title: 'Sign Up' }} />
            */}
          </Stack>
        )}
        <StatusBar style="auto" />
      </NavThemeProvider>
    </ThemeProvider>
  );
}

// The signIn screen is now handled by `app/signIn.tsx`.
// The (tabs) route implies a `(tabs)` directory for tab-based navigation.
// The `+not-found` screen should be correctly placed.