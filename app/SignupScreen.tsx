// fileName: SignupScreen.tsx (FINAL AND CORRECTED)

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from './supabase';

const NEON_GREEN = '#34D399';
const BRIGHT_NEON = '#A7F3D0';
const BACKGROUND_DARK = '#000000';

const SignupScreen = () => {
    const [fullName, setFullName] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        const cleanEmail = email.trim();
        const cleanPassword = password.trim();
        const cleanUsername = username.trim();
        const cleanFullName = fullName.trim();
        const cleanPhoneNo = phoneNo.trim();

        if (!cleanFullName || !cleanPhoneNo || !cleanUsername || !cleanEmail || !cleanPassword || !rePassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        if (cleanPassword !== rePassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        if (cleanPassword.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);

        try {
            // --- 1. Supabase AUTH Account Creation (with metadata) ---
            // Supabase auth.signUp handles both auth creation AND passing the data 
            // to the database trigger for the 'profiles' table.
            const { data, error: authError } = await supabase.auth.signUp({
                email: cleanEmail,
                password: cleanPassword,
                options: {
                    // This data is saved in raw_user_meta_data and picked up by the trigger
                    data: {
                        full_name: cleanFullName,
                        username: cleanUsername,
                        phone_no: cleanPhoneNo,
                    },
                },
            });

            if (authError) {
                console.error("Signup Error:", authError);
                // RLS error is often caught here if the trigger fails
                Alert.alert("Signup Failed", authError.message);
                setLoading(false);
                return;
            }

            // --- 2. SUCCESS HANDLING ---
            // The record insertion into 'profiles' is now handled automatically by the RLS-safe trigger.
            
            // Log out the user to force them to log in after registration (if email confirmation is off)
            await supabase.auth.signOut();
            
            // Message based on whether email confirmation is required
            if (data.user && data.user.aud === 'authenticated') {
                 Alert.alert("Success", "Account created! Please login to continue.");
            } else {
                 Alert.alert("Success", "Account created! Please check your email to confirm your account, then login.");
            }
            
            router.replace('/LoginScreen');
            

        } catch (err) {
            console.error("Final Catch Error:", err);
            Alert.alert("Error", "An unexpected error occurred during registration.");
        } finally {
            setLoading(false);
        }
    };
    
    // Yahan ScrollView use kar rahe hain taaki chote screens par content cut na ho
    return (
        <LinearGradient colors={[BACKGROUND_DARK, BACKGROUND_DARK]} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.sub}>Start your BusinessHub Pro journey</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#9CA3AF"
                    value={fullName}
                    onChangeText={setFullName}
                />
                
                <TextInput
                    style={styles.input}
                    placeholder="Phone Number (e.g., 03xx-xxxxxxx)"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={phoneNo}
                    onChangeText={setPhoneNo}
                />
                
                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="#9CA3AF"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password (min 6 characters)"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={rePassword}
                    onChangeText={setRePassword}
                />

                <TouchableOpacity 
                    style={styles.registerButton} 
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.registerText}>
                        {loading ? "Creating..." : "Register"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/LoginScreen')} style={{ marginTop: 20 }}>
                    <Text style={styles.backText}>Already have an account? Login</Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
	container: { flex: 1, padding: 20, backgroundColor: BACKGROUND_DARK },
    scrollContent: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
        // Ensure inputs take full width of container
        alignSelf: 'stretch',
        paddingHorizontal: 20,
    },
	title: { fontSize: 38, fontWeight: '900', color: NEON_GREEN, marginBottom: 8 },
	sub: { fontSize: 16, color: BRIGHT_NEON, marginBottom: 30, opacity: 0.8 },
    // Input width correction for ScrollView
	input: { 
		width: '100%', // Changed from '90%' to '100%' for better layout inside padding
		backgroundColor: '#1F2937', 
		color: '#FFFFFF', 
		padding: 15, 
		borderRadius: 12, 
		fontSize: 18, 
		marginBottom: 15, 
		borderWidth: 1, 
		borderColor: NEON_GREEN 
	},
	registerButton: { 
		width: '100%', // Changed from '90%' to '100%'
		backgroundColor: NEON_GREEN, 
		borderRadius: 12, 
		paddingVertical: 18, 
		alignItems: 'center', 
		marginTop: 10,
	},
	registerText: { 
		fontSize: 20, 
		fontWeight: 'bold', 
		color: BACKGROUND_DARK, 
		letterSpacing: 1 
	},
	backText: { fontSize: 16, color: BRIGHT_NEON, opacity: 0.8, fontWeight: '600' },
});

export default SignupScreen;