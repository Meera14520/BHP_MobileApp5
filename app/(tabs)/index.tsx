// fileName: app/(tabs)/index.tsx (COMPLETE FILE - With Refresh Button and Leave Queue Fallback)

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQueueStatus } from '../../hooks/useQueueStatus';
import { useAuth } from '../AuthProvider';
import { supabase } from '../supabase';

// --- Theme Colors ---
const NEON_GREEN = '#34D399';
const BRIGHT_NEON = '#A7F3D0';
const BACKGROUND_DARK = '#000000';
const CARD_BG = '#111111'; 

// --- Interface for Dashboard Cards ---
interface DashboardCardProps {
    title: string;
    subtitle: string;
    iconName: keyof typeof Ionicons.glyphMap;
    color: string;
    route: any;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, subtitle, iconName, color, route }) => (
    <TouchableOpacity 
        style={styles.gridCard}
        onPress={() => router.push(route as any)} 
    >
        <View style={[styles.iconBg, { backgroundColor: color }]}>
            <Ionicons name={iconName} size={28} color={BACKGROUND_DARK} />
        </View>
        <Text style={styles.gridTitle}>{title}</Text>
        <Text style={styles.gridSub}>{subtitle}</Text>
    </TouchableOpacity>
);


const Dashboard = () => {
  const { user, signOut } = useAuth();
  // Extracting refreshStatus from the hook
  const { 
    inQueue, businessName, position, 
    loading: queueLoading, error: queueError, 
    refreshStatus // <-- NEW: Manual Refresh Function
  } = useQueueStatus(); 
  
  const [fullName, setFullName] = useState('Customer'); 
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user) {
        fetchUserFullName(user.id);
    } else {
        router.replace('/auth' as any); 
    }
  }, [user]);

  const fetchUserFullName = async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles") 
        .select("full_name")
        .eq("id", userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
        
      if (data) {
        setFullName(data.full_name || 'Customer');
      } else {
         setFullName('Customer'); 
      }

    } catch (error) {
        if (error instanceof Error) {
            console.error("Dashboard Fetch Error:", error.message);
        }
        setFullName('Customer');
    } finally {
      setProfileLoading(false);
    }
  };
  
  // --- New Component: Status Card ---
  const LiveQueueStatusCard = () => {
    const estimatedWait = position && position > 0 ? `${position * 5} - ${position * 8} min` : 'Unknown';

    /**
     * Handles the user leaving the queue by updating the status to 'cancelled'.
     */
    const handleLeaveQueue = async () => {
        Alert.alert(
            "Leave Queue",
            `Are you sure you want to leave the queue for ${businessName}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Leave", style: "destructive", onPress: async () => {
                    if (!user) return;
                    try {
                        // Update the user's queue entry status to 'cancelled'
                        const { error } = await supabase
                            .from('queues')
                            .update({ status: 'cancelled' })
                            .eq('user_id', user.id)
                            .eq('status', 'waiting');
                        
                        if (error) throw error;
                        
                        Alert.alert("Success!", "You have successfully left the queue. Dashboard should refresh now.");
                        
                        // Manual refresh call as a fallback for instant UI update
                        setTimeout(() => {
                            refreshStatus(); 
                        }, 100); 
                        
                    } catch (e) {
                         Alert.alert("Error", "Could not leave the queue. Please check your internet or Supabase RLS.");
                    }
                }}
            ]
        );
    };

    if (queueLoading) {
        return (
            <View style={[styles.gridCard, styles.statusCard]}>
                <ActivityIndicator size="small" color={NEON_GREEN} style={{ marginRight: 15 }} />
                <Text style={styles.statusTitle}>Checking queue status...</Text>
            </View>
        );
    }

    if (queueError) {
        return (
             <View style={[styles.gridCard, styles.statusCard, { borderColor: '#EF4444' }]}>
                <Ionicons name="alert-circle-outline" size={30} color="#EF4444" style={{ marginRight: 15 }} />
                <Text style={[styles.statusTitle, { color: '#EF4444' }]}>Error: {queueError}</Text>
            </View>
        );
    }

    return (
      <View style={[styles.gridCard, styles.statusCard]}>
          <Text style={styles.sectionTitle}>Your Current Queue</Text>
          
          <View style={styles.queueDetailRow}>
              <Ionicons name="business-outline" size={24} color={NEON_GREEN} />
              <Text style={styles.queueDetailLabel}>Business:</Text>
              <Text style={styles.queueDetailValue}>{businessName || 'N/A'}</Text>
          </View>

          <View style={styles.queueDetailRow}>
              <Ionicons name="list-circle-outline" size={24} color={NEON_GREEN} />
              <Text style={styles.queueDetailLabel}>Your Position:</Text>
              <Text style={[styles.queueDetailValue, styles.positionText]}>
                {position === 1 ? 'Next!' : position}
              </Text>
          </View>

          <View style={styles.queueDetailRow}>
              <Ionicons name="time-outline" size={24} color={NEON_GREEN} />
              <Text style={styles.queueDetailLabel}>Est. Wait Time:</Text>
              <Text style={styles.queueDetailValue}>{estimatedWait}</Text>
          </View>

          <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveQueue}>
              <Ionicons name="exit-outline" size={20} color={BACKGROUND_DARK} />
              <Text style={styles.leaveButtonText}>Leave Queue</Text>
          </TouchableOpacity>
      </View>
    );
  };
  
  // --- Standard Dashboard Cards ---
  const featureCards: DashboardCardProps[] = [
    {
      title: 'Find New Queue',
      subtitle: 'Search & join a waiting line',
      iconName: 'search',
      color: '#4B5563',
      route: '/(tabs)/QueueDiscoveryScreen',
    },
    {
      title: 'Check-in (QR)',
      subtitle: 'Scan a code to join instantly',
      iconName: 'qr-code',
      color: '#EF4444',
      route: '/(tabs)/QRCheckinScreen',
    },
    {
      title: 'View Profile',
      subtitle: 'Manage account settings',
      iconName: 'person',
      color: '#10B981',
      route: '/(tabs)/ProfileScreen',
    },
    {
      title: 'AI Generator',
      subtitle: 'Generate notes and content',
      iconName: 'sparkles',
      color: '#6366F1',
      route: '/AIGeneratorScreen', 
    },
  ];

  return (
    <LinearGradient colors={[BACKGROUND_DARK, BACKGROUND_DARK]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Welcome Back,</Text>
                {profileLoading ? (
                    <ActivityIndicator size="small" color={NEON_GREEN} style={{ marginTop: 5 }} />
                ) : (
                    <Text style={styles.name}>{fullName}</Text>
                )}
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* --- MANUAL REFRESH BUTTON --- */}
                <TouchableOpacity 
                    onPress={refreshStatus} // Call the manual refresh function
                    disabled={queueLoading} // Disable while loading
                    style={{ marginRight: 15 }}
                >
                    {queueLoading && inQueue ? (
                        <ActivityIndicator size="small" color={NEON_GREEN} />
                    ) : (
                        <Ionicons 
                            name="refresh-circle-outline" 
                            size={32} 
                            color={NEON_GREEN} 
                        />
                    )}
                </TouchableOpacity>
                {/* --- SETTINGS BUTTON --- */}
                <TouchableOpacity onPress={() => router.push('/(tabs)/ProfileScreen' as any)}>
                    <Ionicons name="settings-outline" size={32} color={NEON_GREEN} />
                </TouchableOpacity>
            </View>
        </View>
        
        {/* --- DYNAMIC CONTENT AREA --- */}
        {inQueue ? (
            <LiveQueueStatusCard />
        ) : (
            <>
                <Text style={styles.sectionTitle}>Quick Access</Text>
                <View style={styles.gridContainer}>
                    {featureCards.map((card, index) => (
                        <DashboardCard key={index} {...card} />
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Status</Text>
                 <View style={[styles.gridCard, styles.statusCard, { borderColor: '#222' }]}>
                    <Ionicons name="checkmark-circle-outline" size={35} color={BRIGHT_NEON} style={{ marginRight: 15 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.statusTitle}>You are free!</Text>
                        <Text style={styles.statusSub}>Search a business to join a queue now.</Text>
                    </View>
                </View>
            </>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
    // ... (rest of the styles object remains the same)
  container: { flex: 1, backgroundColor: BACKGROUND_DARK },
  scrollContent: { padding: 20, paddingBottom: 50 },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  greeting: {
    fontSize: 16,
    color: BRIGHT_NEON,
  },
  name: {
    fontSize: 30,
    fontWeight: '900',
    color: NEON_GREEN,
    letterSpacing: 0.5,
  },
  
  // Sections
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    marginTop: 15,
    marginLeft: 5,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  gridCard: {
    width: '48%',
    backgroundColor: CARD_BG,
    padding: 20,
    borderRadius: 22,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#222',
  },
  iconBg: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  gridSub: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  
  // Status Card (Used for both placeholder and live status)
  statusCard: {
    width: '100%',
    backgroundColor: '#0F172A', 
    borderColor: NEON_GREEN,
    borderWidth: 1,
    padding: 20,
    borderRadius: 22,
    marginTop: 10,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: NEON_GREEN,
    marginBottom: 10,
  },
  statusSub: {
    fontSize: 14,
    color: BRIGHT_NEON,
    marginTop: 5,
  },
  
  // Live Queue Details
  queueDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  queueDetailLabel: {
    fontSize: 16,
    color: BRIGHT_NEON,
    marginLeft: 10,
    flex: 1,
  },
  queueDetailValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  positionText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFD700', // Gold color for emphasis
  },
  leaveButton: {
    backgroundColor: '#EF4444', 
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  leaveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BACKGROUND_DARK,
    marginLeft: 10,
  }
});

export default Dashboard;