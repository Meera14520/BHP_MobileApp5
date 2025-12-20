// fileName: app/(tabs)/_layout.tsx (TAB LAYOUT)

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

// --- Theme Colors ---
const NEON_GREEN = '#34D399';
const BACKGROUND_DARK = '#000000';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: NEON_GREEN,
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: BACKGROUND_DARK,
          borderTopColor: NEON_GREEN,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
            backgroundColor: BACKGROUND_DARK,
            borderBottomColor: NEON_GREEN,
            borderBottomWidth: 1,
        },
        headerTitleStyle: {
            color: NEON_GREEN,
            fontWeight: 'bold',
        }
      }}
    >
      {/* 1. Dashboard Tab - Main landing page after login */}
      <Tabs.Screen
        name="index" // This links to app/(tabs)/index.tsx
        options={{
          title: 'Dashboard',
          headerTitle: 'BusinessHub Pro',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={26} color={color} />,
        }}
      />
      
      {/* 2. Queue Discovery Tab - The core queue finding screen */}
      <Tabs.Screen
        name="QueueDiscoveryScreen" // This links to app/(tabs)/QueueDiscoveryScreen.tsx
        options={{
          title: 'Find Queue',
          headerTitle: 'Queue Discovery',
          tabBarIcon: ({ color }) => <Ionicons name="search" size={26} color={color} />,
        }}
      />

      {/* 3. QR Check-in Tab - Camera scanner functionality */}
      <Tabs.Screen
        name="QRCheckinScreen" // This links to app/(tabs)/QRCheckinScreen.tsx
        options={{
          title: 'QR Check-in',
          headerTitle: 'Scan to Join',
          tabBarIcon: ({ color }) => <Ionicons name="qr-code" size={26} color={color} />,
        }}
      />

      {/* 4. Profile Tab - User account details and sign-out */}
      <Tabs.Screen
        name="ProfileScreen" // This links to app/(tabs)/ProfileScreen.tsx
        options={{
          title: 'Profile',
          headerShown: false, // We'll handle the header inside the screen
          tabBarIcon: ({ color }) => <Ionicons name="person" size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}