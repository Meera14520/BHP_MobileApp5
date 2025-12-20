// fileName: register.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

// --- Theme Colors ---
const NEON_GREEN = '#34D399';
const BRIGHT_NEON = '#A7F3D0';
const BACKGROUND_DARK = '#000000';

export default function RegisterScreen() {
  
  const handleGoogleSignUp = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // NOTE: The redirectTo path must match what is configured in your Supabase Auth settings 
          // and should probably redirect to your main protected route (e.g., QueueDiscoveryScreen or (tabs)).
          redirectTo: "exp://localhost:8081/(tabs)", 
        }
      });

      if (error) {
        console.log("GOOGLE ERROR:", error.message);
        Alert.alert("Error", "Google Signup failed");
        return;
      }

      // If the Supabase SDK opened the browser, the rest of the flow happens 
      // in the AuthProvider's listener, which will handle navigation.
      // We rely on the AuthProvider to handle successful login/signup.

    } catch (e) {
      console.log("GOOGLE EXCEPTION:", e);
      Alert.alert("Error", "Google process failed");
    }
  };

  return (
    <LinearGradient colors={[BACKGROUND_DARK, BACKGROUND_DARK]} style={styles.container}>
      <Ionicons name="logo-google" size={70} color={NEON_GREEN} style={{marginBottom: 20}} />
      <Text style={styles.title}>Google Signup</Text>
      <Text style={styles.sub}>Quickly register for BussinessHub Pro</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleGoogleSignUp}
      >
        <Ionicons name="logo-google" size={24} color="#FFFFFF" style={{marginRight: 10}} />
        <Text style={styles.buttonText}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/auth')} style={{ marginTop: 40 }}>
        <Text style={styles.backText}>Go back to Login/Register options</Text>
      </TouchableOpacity>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" , padding: 20},
  title: { fontSize: 32, fontWeight: "900", marginBottom: 10, color: '#FFFFFF' },
  sub: { fontSize: 16, color: BRIGHT_NEON, marginBottom: 40 },
  button: { 
    width: '90%', 
    backgroundColor: '#4285F4', 
    borderRadius: 12, 
    paddingVertical: 18, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#4285F4',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  backText: { color: NEON_GREEN, fontSize: 16, fontWeight: '600' }
});