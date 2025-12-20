// fileName: LoginScreen.tsx (FIXED FOR EMAIL LOGIN AND TABLE NAME)
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from './supabase';

const NEON_GREEN = '#34D399';
const BRIGHT_NEON = '#A7F3D0';
const BACKGROUND_DARK = '#000000';

const LoginScreen = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    if (cleanPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    // CRITICAL: We enforce email login here because multi-identifier requires a complex RPC/Function 
    // that is not yet set up due to RLS policies.
    if (!cleanIdentifier.includes('@')) {
        Alert.alert("Login Error", "For now, please use the Email Address you registered with.");
        setLoading(false);
        return;
    }


    setLoading(true);

    try {
      // --- Supabase Login ---
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanIdentifier, // Identifier is now assumed to be the email
        password: cleanPassword,
      });

      if (error) {
        Alert.alert("Login Failed", error.message);
      }
      // If successful, AuthProvider (in _layout.tsx) handles navigation to /(tabs)

    } catch (e) {
      console.error("Login Exception:", e);
      Alert.alert("Error", "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <LinearGradient colors={[BACKGROUND_DARK, BACKGROUND_DARK]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>BussinessHub Pro</Text>
          <Text style={styles.sub}>Find a queue instantly</Text>

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#9CA3AF"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            <Ionicons name="log-in-outline" size={28} color="#FFFFFF" />
            <Text style={styles.loginText}>{loading ? "Signing In..." : "Sign In"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/SignupScreen')} style={{ marginTop: 20 }}>
            <Text style={styles.backText}>Need an account? Register Here</Text>
          </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  scrollContent: {
      justifyContent: 'center', 
      alignItems: 'center', 
      flexGrow: 1
  },
  title: { fontSize: 38, fontWeight: '900', color: NEON_GREEN, marginBottom: 8 },
  sub: { fontSize: 16, color: BRIGHT_NEON, marginBottom: 30 },
  input: { width: '100%', backgroundColor: '#1F2937', color: '#FFFFFF', padding: 15, borderRadius: 12, fontSize: 18, marginBottom: 15, borderWidth: 1, borderColor: NEON_GREEN },
  loginButton: { width: '100%', backgroundColor: NEON_GREEN, borderRadius: 12, paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: NEON_GREEN, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  loginText: { color: BACKGROUND_DARK, fontSize: 22, fontWeight: 'bold', marginLeft: 10 },
  backText: { color: NEON_GREEN, fontSize: 16, fontWeight: '600' }
});

export default LoginScreen;