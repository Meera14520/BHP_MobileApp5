// fileName: QueueStatusScreen.tsx (New Feature Implementation)

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './AuthProvider'; // For user context

// --- Theme Colors ---
const NEON_GREEN = '#34D399';
const BRIGHT_NEON = '#A7F3D0';
const BACKGROUND_DARK = '#000000';
const CARD_BG = '#111111';
const ACCENT_RED = '#EF4444'; // For Cancellation

// --- Mock Queue Data (Will be replaced by Realtime) ---
const mockQueueEntry = {
    businessName: 'QuickPrint Station',
    serviceType: 'Large Format Printing',
    queuePosition: 2,
    estimatedWaitTime: '8 - 12 min',
    ticketNumber: 'QP-345',
    status: 'Waiting', // Joining, Waiting, Called, InProgress, Completed, Cancelled
};


const QueueStatusScreen = () => {
    const { user } = useAuth();
    const [queueData, setQueueData] = useState(mockQueueEntry);
    const [loading, setLoading] = useState(false);

    // Placeholder for cancelling the queue entry
    const handleCancelQueue = () => {
        Alert.alert(
            "Confirm Cancellation",
            "Are you sure you want to leave the queue? You will lose your spot.",
            [
                { text: "No", style: "cancel" },
                { 
                    text: "Yes, Cancel", 
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        // In a real app: call supabase function to update the queue status to 'Cancelled'
                        // For mock: 
                        setQueueData(prev => ({ ...prev, status: 'Cancelled' }));
                        Alert.alert("Success", "Your queue entry has been cancelled.");
                        setLoading(false);
                    }
                }
            ]
        );
    };

    return (
        <LinearGradient colors={[BACKGROUND_DARK, BACKGROUND_DARK]} style={styles.container}>
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back-outline" size={28} color={NEON_GREEN} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Queue Status</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                <Text style={styles.sectionTitle}>Business Details</Text>
                <View style={styles.detailCard}>
                    <Text style={styles.businessName}>{queueData.businessName}</Text>
                    <Text style={styles.serviceType}>Service: {queueData.serviceType}</Text>
                    <Text style={styles.ticketNumber}>Ticket No: {queueData.ticketNumber}</Text>
                </View>

                <Text style={styles.sectionTitle}>Real-Time Status</Text>
                <View style={[styles.detailCard, styles.statusCard]}>
                    <Text style={styles.statusLabel}>Your Position</Text>
                    <Text style={styles.positionText}>#{queueData.queuePosition}</Text>
                    
                    <View style={styles.separator} />
                    
                    <Text style={styles.statusLabel}>Estimated Wait</Text>
                    <Text style={styles.waitTimeText}>{queueData.estimatedWaitTime}</Text>

                    <Text style={styles.currentStatusText}>Current Status: <Text style={styles.statusValue}>{queueData.status}</Text></Text>
                </View>

                {/* Status Indicator */}
                <View style={styles.indicatorContainer}>
                    <Ionicons name="time-outline" size={30} color={NEON_GREEN} />
                    <Text style={styles.indicatorText}>
                        {queueData.status === 'Waiting' 
                            ? "We will notify you when it's your turn." 
                            : queueData.status === 'Called' 
                            ? "IT'S YOUR TURN! Please proceed to the service desk now." 
                            : queueData.status === 'Cancelled' 
                            ? "This queue entry is cancelled."
                            : "Status: " + queueData.status
                        }
                    </Text>
                </View>


                {/* Action Buttons */}
                {queueData.status === 'Waiting' && (
                    <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={handleCancelQueue}
                        disabled={loading}
                    >
                        <Ionicons name="close-circle-outline" size={24} color="#FFF" />
                        <Text style={styles.cancelButtonText}>{loading ? "Processing..." : "Cancel Queue Entry"}</Text>
                    </TouchableOpacity>
                )}
                
                {queueData.status !== 'Waiting' && (
                    <TouchableOpacity 
                        style={styles.newQueueButton}
                        onPress={() => router.replace('/QueueDiscoveryScreen')}
                    >
                        <Ionicons name="business-outline" size={24} color={BACKGROUND_DARK} />
                        <Text style={styles.newQueueButtonText}>Find Another Queue</Text>
                    </TouchableOpacity>
                )}

            </ScrollView>

        </LinearGradient>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backButton: { marginRight: 15 },
    headerTitle: { fontSize: 30, fontWeight: 'bold', color: '#FFFFFF' },
    scrollContent: { paddingBottom: 40 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: BRIGHT_NEON, marginTop: 25, marginBottom: 10 },
    detailCard: { 
        backgroundColor: CARD_BG, 
        padding: 20, 
        borderRadius: 18, 
        borderLeftWidth: 5, 
        borderLeftColor: NEON_GREEN,
    },
    businessName: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 5 },
    serviceType: { fontSize: 16, color: BRIGHT_NEON, marginBottom: 5 },
    ticketNumber: { fontSize: 14, color: '#A0A0A0' },
    statusCard: { 
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#061F14', // Slightly different background
        borderLeftColor: NEON_GREEN,
    },
    statusLabel: { fontSize: 16, color: BRIGHT_NEON, opacity: 0.7 },
    positionText: { fontSize: 60, fontWeight: '900', color: NEON_GREEN, marginTop: 5 },
    waitTimeText: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginTop: 5 },
    separator: { width: '80%', height: 1, backgroundColor: '#333', marginVertical: 20 },
    currentStatusText: { fontSize: 16, color: '#A0A0A0', marginTop: 20 },
    statusValue: { fontWeight: 'bold', color: NEON_GREEN },
    indicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: CARD_BG,
        padding: 15,
        borderRadius: 12,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#222',
    },
    indicatorText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#FFFFFF',
    },
    cancelButton: { 
        backgroundColor: ACCENT_RED, 
        paddingVertical: 15, 
        borderRadius: 12, 
        marginTop: 30, 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    cancelButtonText: { 
        color: '#FFFFFF', 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginLeft: 10 
    },
    newQueueButton: { 
        backgroundColor: NEON_GREEN, 
        paddingVertical: 15, 
        borderRadius: 12, 
        marginTop: 30, 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    newQueueButtonText: { 
        color: BACKGROUND_DARK, 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginLeft: 10 
    }
});

export default QueueStatusScreen;