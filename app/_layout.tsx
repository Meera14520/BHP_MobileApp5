// fileName: app/_layout.tsx (FINAL ROOT LAYOUT FOR BUSINESS HUB PRO)

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme'; // Assumed to be in '@/hooks/'
import { AuthProvider, useAuth } from './AuthProvider'; // Assumed AuthProvider is in app/

// --- GUEST SCREENS ---
// These screens are accessible when the user is NOT logged in.
const GUEST_SCREENS = [
  'index', // Splash/Loading screen
  'auth', // Main Choose Login/Signup Screen
  'LoginScreen', // Manual email/password login
  'SignupScreen', // Manual email/password signup
  'register' // Google Sign Up (or other OAuth screens)
];

function InitialLayout() {
  const { session, isLoading } = useAuth(); // Auth status from context
  const segments = useSegments(); // Current path segments
  const isLoggedIn = !!session; // Simple boolean check (logged in = session exists)

  useEffect(() => {
    if (isLoading) return; // Wait for initial session load

    const currentSegment = segments[0]; 
    
    // Check if the current route is one of the guest screens
    const isGuestScreen = GUEST_SCREENS.includes(currentSegment);

    if (isLoggedIn) {
      // 1. USER IS LOGGED IN
      if (isGuestScreen) {
        // Redirect to the tabs group (Dashboard)
        console.log("REDIRECT: Logged in. Going to (tabs) Dashboard.");
        router.replace('/(tabs)' as any); 
      }
    } else {
      // 2. USER IS NOT LOGGED IN
      const isProtectedScreen = !isGuestScreen && currentSegment !== '(tabs)';
      if (isProtectedScreen) {
        // If not logged in and on a protected screen, redirect to the Auth Screen
        console.log("REDIRECT: Not logged in. Going to Auth screen.");
        router.replace('/auth' as any); 
      }
    }
  }, [isLoggedIn, segments, isLoading]); 

  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="light" /> 
      <Stack>
        {/* --- UNPROTECTED SCREENS --- */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
        <Stack.Screen name="SignupScreen" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />

        {/* --- PROTECTED SCREENS --- */}
        
        {/* TABS (Main protected group - Contains Dashboard, QueueDiscovery, QRCheckin, Profile) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
         
         {/* Other Protected Screens (AI features are outside the main tabs) */}
         <Stack.Screen name="AIGeneratorScreen" options={{ headerShown: false }} />
         <Stack.Screen name="GeneratedNotesScreen" options={{ headerShown: false }} />
         <Stack.Screen name="editor" options={{ headerShown: false }} />
         <Stack.Screen name="notes" options={{ headerShown: false }} />
         <Stack.Screen name="print" options={{ headerShown: false }} />

        {/* Modal and other misc screens */}
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

// Wrap the entire layout in AuthProvider to give context access everywhere
export default function RootLayout() {
  return (
    <AuthProvider>
        <InitialLayout />
    </AuthProvider>
  );
}