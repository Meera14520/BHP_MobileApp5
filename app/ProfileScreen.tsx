// fileName: app/(tabs)/ProfileScreen.tsx (PROFILE SCREEN)

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './AuthProvider';
import { supabase } from './supabase';

// --- Theme Colors ---
const NEON_GREEN = '#34D399';
const BRIGHT_NEON = '#A7F3D0';
const BACKGROUND_DARK = '#000000';
const CARD_BG = '#111111'; 

// --- Interface for Profile Data ---
interface ProfileData {
  full_name: string;
  username: string;
  phone_no: string;
  email: string;
}

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetching email from the auth user object directly for convenience
  const userEmail = user?.email || 'N/A'; 

  useEffect(() => {
    if (user) {
        fetchProfile(user.id);
    } else {
        // If no user, redirect to login (should be handled by _layout.tsx, but good to have a fallback)
        router.replace('/LoginScreen');
    }
  }, [user]);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    try {
      // Fetch data from the RLS-enabled 'profiles' table
      const { data, error } = await supabase
        .from("profiles") 
        .select("full_name, username, phone_no")
        .eq("id", userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // Handle zero rows case
        
      if (data) {
        setProfile({
            ...data,
            email: userEmail // Add email from auth user
        });
      } else {
         setProfile({ full_name: 'N/A', username: 'N/A', phone_no: 'N/A', email: userEmail });
      }

    } catch (error) {
        if (error instanceof Error) {
            console.error("Profile Fetch Error:", error.message);
        }
        Alert.alert("Data Error", "Could not load user profile details.");
        setProfile({ full_name: 'Error', username: 'Error', phone_no: 'Error', email: userEmail });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
        "Sign Out",
        "Are you sure you want to log out?",
        [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", style: "destructive", onPress: async () => {
                setLoading(true);
                await signOut();
                setLoading(false);
            }}
        ]
    );
  };
  
  // Helper function for profile item rendering
  const ProfileItem: React.FC<{ icon: keyof typeof Ionicons.glyphMap, title: string, value: string }> = ({ icon, title, value }) => (
    <View style={styles.itemContainer}>
        <Ionicons name={icon} size={24} color={NEON_GREEN} style={styles.itemIcon} />
        <View style={styles.itemTextContainer}>
            <Text style={styles.itemTitle}>{title}</Text>
            <Text style={styles.itemValue}>{value}</Text>
        </View>
    </View>
  );

  return (
    <LinearGradient colors={[BACKGROUND_DARK, BACKGROUND_DARK]} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
            
            <Text style={styles.headerTitle}>My Profile</Text>

            <View style={styles.avatarContainer}>
                <Ionicons name="person-circle" size={100} color={NEON_GREEN} />
                <Text style={styles.profileName}>{profile?.full_name || 'Loading...'}</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={NEON_GREEN} style={{ marginTop: 40 }} />
            ) : (
                <View style={styles.detailsContainer}>
                    <ProfileItem 
                        icon="mail-outline" 
                        title="Email Address" 
                        value={profile?.email || 'N/A'} 
                    />
                    <ProfileItem 
                        icon="person-outline" 
                        title="Username" 
                        value={profile?.username || 'N/A'} 
                    />
                    <ProfileItem 
                        icon="call-outline" 
                        title="Phone Number" 
                        value={profile?.phone_no || 'N/A'} 
                    />
                    <ProfileItem 
                        icon="time-outline" 
                        title="Member Since" 
                        value={new Date(user?.created_at || '').toLocaleDateString() || 'N/A'}
                    />
                </View>
            )}

            <TouchableOpacity 
                style={styles.signOutButton} 
                onPress={handleSignOut} 
                disabled={loading}
            >
                <Ionicons name="log-out-outline" size={24} color={BACKGROUND_DARK} />
                <Text style={styles.signOutText}>
                    {loading ? "Signing Out..." : "Sign Out"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND_DARK },
  scrollContent: { padding: 20, alignItems: 'center', paddingBottom: 50 },
  
  headerTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: NEON_GREEN,
    marginTop: 20,
    marginBottom: 30,
    alignSelf: 'flex-start'
  },
  
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
  },
  
  detailsContainer: {
    width: '100%',
    backgroundColor: CARD_BG,
    borderRadius: 15,
    padding: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#222',
  },
  
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  itemIcon: {
    marginRight: 15,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    color: BRIGHT_NEON,
    opacity: 0.7,
  },
  itemValue: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
    marginTop: 2,
  },
  
  signOutButton: {
    width: '100%',
    backgroundColor: '#EF4444', // Red for Sign Out
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signOutText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BACKGROUND_DARK,
    marginLeft: 10,
  },
});

export default ProfileScreen;