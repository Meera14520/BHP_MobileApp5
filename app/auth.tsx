// fileName: auth.tsx (Updated for BussinessHub Pro)

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NEON_GREEN = '#34D399';
const BRIGHT_NEON = '#A7F3D0';
const BACKGROUND_DARK = '#000000';
const BACKGROUND_MID = '#061F14';

const AuthScreen = () => {
  return (
    <LinearGradient colors={[BACKGROUND_MID, BACKGROUND_DARK]} style={styles.container}>
      
      {/* Icon/Logo area - Changed from 'school-outline' to 'business-outline' */}
      <View style={styles.iconContainer}>
        <Ionicons name="business-outline" size={80} color={NEON_GREEN} />
      </View>

      <Text style={styles.title}>BussinessHub Pro</Text>
      <Text style={styles.subtitle}>Manage your time, instantly.</Text>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push('/LoginScreen')}
      >
        <Text style={styles.loginButtonText}>Customer Login</Text>
        <Ionicons name="log-in-outline" size={24} color={BACKGROUND_DARK} style={{marginLeft: 10}} />
      </TouchableOpacity>

      {/* Register Button */}
      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => router.push('/SignupScreen')}
      >
        <Text style={styles.registerButtonText}>Register New Account</Text>
        <Ionicons name="person-add-outline" size={24} color={NEON_GREEN} style={{marginLeft: 10}} />
      </TouchableOpacity>

       {/* Google Register Button */}
       <TouchableOpacity
        style={styles.googleButton}
        onPress={() => router.push('/register')} // This points to your Google OAuth file
      >
        <Ionicons name="logo-google" size={24} color="#FFFFFF" style={{marginRight: 10}} />
        <Text style={styles.googleButtonText}>Sign Up with Google</Text>
      </TouchableOpacity>

    </LinearGradient>
  );
}

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30, // Increased margin
    shadowColor: NEON_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18, // Slightly increased size
    color: BRIGHT_NEON,
    marginBottom: 60,
    textAlign: 'center',
    opacity: 0.9, // Increased opacity
    fontWeight: '500',
  },
  loginButton: {
    width: '85%',
    backgroundColor: NEON_GREEN,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    shadowColor: NEON_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  loginButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BACKGROUND_DARK,
    letterSpacing: 1,
  },
  registerButton: {
    width: '85%',
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    borderWidth: 2, // Added border
    borderColor: NEON_GREEN, // Border color
  },
  registerButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: NEON_GREEN,
    letterSpacing: 1,
  },
  googleButton: {
    width: '85%',
    backgroundColor: '#4285F4', // Google's blue color
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  googleButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  }
});