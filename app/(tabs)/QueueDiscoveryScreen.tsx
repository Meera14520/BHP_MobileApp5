// fileName: app/(tabs)/QueueDiscoveryScreen.tsx (UPDATED: Added Supabase Join Logic)

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../AuthProvider'; // To get the user_id
import { supabase } from '../supabase';

// --- Theme Colors ---
const NEON_GREEN = '#34D399';
const BRIGHT_NEON = '#A7F3D0';
const BACKGROUND_DARK = '#000000';
const CARD_BG = '#111111'; 

// --- Business Interface ---
interface Business {
    id: number;
    name: string;
    waitTime: string;
    queueSize: number;
    category: string;
}

const QueueDiscoveryScreen = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    
    // --- Placeholder Data ---
    // In a real app, this would be fetched from a 'businesses' table
    const nearbyBusinesses: Business[] = [
        { id: 1, name: 'UOG Print Shop', waitTime: '5-10 min', queueSize: 3, category: 'Education' },
        { id: 2, name: 'Doctor Ali Clinic', waitTime: '20-30 min', queueSize: 8, category: 'Health' },
        { id: 3, name: 'City Coffee Corner', waitTime: '2 min', queueSize: 1, category: 'Food & Drink' },
        { id: 4, name: 'Mobile Repair Hub', waitTime: '45 min', queueSize: 12, category: 'Service' },
    ];

    const handleSearch = () => {
        setLoading(true);
        // Implement actual Supabase search later
        console.log("Searching for:", searchQuery);
        setTimeout(() => setLoading(false), 1000); 
    };

    /**
     * Handles joining the queue by inserting an entry into the 'queues' table.
     */
    const handleJoinQueue = async (business: Business) => {
        if (!user) {
            Alert.alert("Error", "You must be logged in to join a queue.");
            return;
        }

        setLoading(true);
        try {
            // Check if the user is already in a queue
            const { count, error: countError } = await supabase
                .from('queues')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .in('status', ['waiting']);

            if (countError) throw countError;

            if (count && count > 0) {
                Alert.alert("Already Queued", "You are already waiting in another queue. Please leave it first.");
                return;
            }


            // 1. Insert the new queue entry
            const { error } = await supabase
                .from('queues')
                .insert([
                    {
                        user_id: user.id,
                        business_name: business.name, // Using the business name as a unique identifier for now
                        status: 'waiting', 
                    },
                ]);

            if (error) {
                throw error;
            }

            // 2. Success Feedback
            Alert.alert(
                "Queue Joined!", 
                `You have successfully joined the queue for ${business.name}. Your current position is estimated around ${business.queueSize + 1}.`,
                [{ text: "OK" }]
            );

        } catch (error) {
            console.error('Error joining queue:', error);
            if (error instanceof Error) {
                 Alert.alert("Join Failed", error.message);
            } else {
                 Alert.alert("Join Failed", "Could not join the queue. Please try again.");
            }
        } finally {
            setLoading(false);
            // Optional: You might want to navigate the user to a "My Queue" screen here.
        }
    };

    const BusinessCard: React.FC<Business> = (business) => (
        <View style={styles.businessCard}>
            <View style={styles.cardHeader}>
                <Ionicons name="business" size={30} color={NEON_GREEN} />
                <View style={{ marginLeft: 15, flex: 1 }}>
                    <Text style={styles.cardTitle}>{business.name}</Text>
                    <Text style={styles.cardSubTitle}>{business.category}</Text>
                </View>
            </View>
            
            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Ionicons name="time-outline" size={18} color={BRIGHT_NEON} />
                    <Text style={styles.infoText}>Wait: {business.waitTime}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Ionicons name="people-outline" size={18} color={BRIGHT_NEON} />
                    <Text style={styles.infoText}>Size: {business.queueSize}</Text>
                </View>
            </View>

            <TouchableOpacity 
                style={[styles.joinButton, loading && styles.joinButtonDisabled]}
                onPress={() => handleJoinQueue(business)} // Pass the whole business object
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={BACKGROUND_DARK} />
                ) : (
                    <Text style={styles.joinButtonText}>Join Queue</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <LinearGradient colors={[BACKGROUND_DARK, BACKGROUND_DARK]} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                <Text style={styles.headerTitle}>Find a Business Queue</Text>
                <Text style={styles.headerSub}>Search by name or category to join instantly.</Text>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={24} color="#9CA3AF" style={{ marginRight: 10 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Business or Service..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                    />
                    <TouchableOpacity onPress={handleSearch} disabled={loading}>
                        <Ionicons 
                            name={loading ? "refresh" : "arrow-forward"} 
                            size={24} 
                            color={NEON_GREEN} 
                            style={{ marginLeft: 10 }}
                        />
                    </TouchableOpacity>
                </View>

                {/* Results/Nearby Businesses */}
                <Text style={styles.sectionTitle}>Nearby & Popular</Text>
                {nearbyBusinesses.map(business => (
                    <BusinessCard key={business.id} {...business} />
                ))}

            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BACKGROUND_DARK },
    scrollContent: { padding: 20, paddingBottom: 50 },

    headerTitle: {
        fontSize: 30,
        fontWeight: '900',
        color: NEON_GREEN,
        marginBottom: 5,
    },
    headerSub: {
        fontSize: 16,
        color: BRIGHT_NEON,
        marginBottom: 20,
        opacity: 0.8
    },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 15,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: NEON_GREEN,
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 18,
    },

    // Cards
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 15,
    },
    businessCard: {
        backgroundColor: CARD_BG,
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#222',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#1F2937'
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    cardSubTitle: {
        fontSize: 14,
        color: BRIGHT_NEON,
        opacity: 0.8
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F2937',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    infoText: {
        color: BRIGHT_NEON,
        marginLeft: 5,
        fontSize: 14,
        fontWeight: '600'
    },
    joinButton: {
        backgroundColor: NEON_GREEN,
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
    },
    joinButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: BACKGROUND_DARK,
    },
    joinButtonDisabled: {
        opacity: 0.6,
    }
});

export default QueueDiscoveryScreen;