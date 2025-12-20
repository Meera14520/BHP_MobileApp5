// fileName: QRCheckinScreen.tsx (New Feature Implementation)

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- Theme Colors ---
const NEON_GREEN = '#34D399';
const BRIGHT_NEON = '#A7F3D0';
const BACKGROUND_DARK = '#000000';
const CARD_BG = '#111111';

const { width } = Dimensions.get('window');

const QRCheckinScreen = () => {
    const [isScanning, setIsScanning] = useState(true);

    // Mock function to simulate a QR scan result
    const handleScanComplete = (data: string) => {
        setIsScanning(false);
        Alert.alert(
            "Scan Successful",
            `QR Code Data: ${data}\n\nInitiating queue join process...`,
            [
                { text: "OK", onPress: () => router.back() }
            ]
        );
        // In a real app: call a Supabase function (e.g., 'join_queue_by_qr')
    };

    const mockScan = () => {
        // Simulate scanning a business-specific code
        const mockBusinessId = 'BHP-Q-PRT-001'; 
        handleScanComplete(mockBusinessId);
    };

    return (
        <LinearGradient colors={[BACKGROUND_DARK, BACKGROUND_DARK]} style={styles.container}>
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back-outline" size={28} color={NEON_GREEN} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Express Check-in</Text>
            </View>

            <Text style={styles.subtitle}>Scan the BusinessHub Pro QR Code at the location to join the queue instantly.</Text>

            {/* Mock Camera View / Scanner Area */}
            <View style={styles.scannerWindow}>
                {isScanning ? (
                    <>
                        {/* Mock Animated Scanner Line (Placeholder) */}
                        <View style={styles.scannerLine} />
                        <Ionicons name="scan-outline" size={80} color={BRIGHT_NEON} />
                        <Text style={styles.scanningText}>Align QR Code within the frame</Text>
                    </>
                ) : (
                    <Text style={styles.scanningText}>Processing...</Text>
                )}
            </View>

            {/* Manual Check-in / Mock Scan Button */}
            <TouchableOpacity style={styles.mockButton} onPress={mockScan} disabled={!isScanning}>
                <Ionicons name="cube-outline" size={24} color={BACKGROUND_DARK} />
                <Text style={styles.mockButtonText}>Simulate QR Scan / Manual Check-in</Text>
            </TouchableOpacity>

        </LinearGradient>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backButton: { marginRight: 15 },
    headerTitle: { fontSize: 30, fontWeight: 'bold', color: '#FFFFFF' },
    subtitle: { fontSize: 16, color: BRIGHT_NEON, opacity: 0.8, marginBottom: 40, textAlign: 'center' },
    scannerWindow: {
        width: width * 0.8,
        height: width * 0.8,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CARD_BG,
        borderRadius: 20,
        borderWidth: 5,
        borderColor: NEON_GREEN,
        overflow: 'hidden',
        marginBottom: 40,
    },
    scannerLine: {
        position: 'absolute',
        top: '50%',
        width: '100%',
        height: 3,
        backgroundColor: NEON_GREEN,
        opacity: 0.8,
        // Add animated styles here for a real scanner effect
    },
    scanningText: {
        color: '#FFFFFF',
        marginTop: 20,
        fontSize: 14,
        fontWeight: '500',
    },
    mockButton: {
        width: '100%',
        backgroundColor: NEON_GREEN,
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: NEON_GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    mockButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: BACKGROUND_DARK,
        marginLeft: 10,
    }
});

export default QRCheckinScreen;