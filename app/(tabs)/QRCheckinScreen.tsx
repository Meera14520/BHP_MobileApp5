// fileName: app/(tabs)/QRCheckinScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../AuthProvider';
import { supabase } from '../supabase';

// --- Theme Colors ---
const NEON_GREEN = '#34D399';
const BACKGROUND_DARK = '#000000';
const OVERLAY_COLOR = 'rgba(0, 0, 0, 0.6)';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.6;

const QRCheckinScreen = () => {
  const { user } = useAuth();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ useCameraPermissions hook replaces manual request logic
  const [permission, requestPermission] = useCameraPermissions();

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned || loading || !user) return;

    setScanned(true);
    setLoading(true);
    console.log(`QR Scanned: Type=${type}, Data=${data}`);

    const businessName = data.trim();

    if (!businessName) {
      Alert.alert('Invalid QR', 'The QR code did not contain valid business information.');
      setLoading(false);
      setTimeout(() => setScanned(false), 2000);
      return;
    }

    joinQueueViaQR(businessName);
  };

  const joinQueueViaQR = async (businessName: string) => {
    if (!user) {
      setLoading(false);
      setScanned(false);
      return;
    }

    try {
      const { count } = await supabase
        .from('queues')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['waiting']);

      if (count && count > 0) {
        Alert.alert(
          'Already Queued',
          'You are already waiting in another queue. Please leave it first before joining via QR.',
          [{ text: 'OK', onPress: () => router.push('/(tabs)/index' as any) }]
        );
        return;
      }

      const { error: insertError } = await supabase.from('queues').insert([
        {
          user_id: user.id,
          business_name: businessName,
          status: 'waiting',
        },
      ]);

      if (insertError) {
        console.error('QR Join Insert Error:', insertError);
        throw new Error(`DB Insert Failed: ${insertError.message}`);
      }

      Alert.alert(
        'Queue Joined!',
        `Successfully joined the queue for ${businessName}. Your position will be updated on the Dashboard.`,
        [{ text: 'Go to Dashboard', onPress: () => router.push('/(tabs)/index' as any) }]
      );
    } catch (error) {
      console.error('QR Join Error:', error);
      Alert.alert('Join Failed', 'Could not join the queue via QR. Please try searching manually.');
    } finally {
      setLoading(false);
      setTimeout(() => setScanned(false), 3000);
    }
  };

  // ✅ Permission handling
  if (!permission) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={NEON_GREEN} />
        <Text style={{ color: NEON_GREEN, marginTop: 10 }}>Checking camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={{ color: '#EF4444', textAlign: 'center', paddingHorizontal: 30 }}>
          No access to camera. Please enable permissions in settings to use QR Check-in.
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <LinearGradient colors={[BACKGROUND_DARK, BACKGROUND_DARK]} style={styles.container}>
      <Text style={styles.headerTitle}>QR Code Check-in</Text>

      <View style={styles.cameraFrame}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />

        {/* Visual Scanner Area / Focus Box */}
        <View style={styles.scannerArea} />

        {/* Visual Overlays */}
        <View style={styles.overlayTop} />
        <View style={styles.overlayBottom} />
        <View style={styles.overlayLeft} />
        <View style={styles.overlayRight} />

        <View style={styles.infoBox}>
          <Ionicons name="scan-outline" size={30} color={NEON_GREEN} />
          <Text style={styles.infoText}>
            {loading
              ? 'Processing join request...'
              : scanned
              ? 'Scan detected! Please wait for process to finish.'
              : 'Center the business QR code to join the queue.'}
          </Text>
          {loading && <ActivityIndicator size="small" color="#FFF" style={{ marginTop: 5 }} />}
        </View>
      </View>

      <TouchableOpacity
        style={styles.manualButton}
        onPress={() => {
          setScanned(false);
          setLoading(false);
        }}
        disabled={loading}
      >
        <Ionicons name="refresh-circle-outline" size={20} color={BACKGROUND_DARK} />
        <Text style={styles.manualButtonText}>
          {scanned ? 'Try Scanning Again' : 'Manual Check-in (TBD)'}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: BACKGROUND_DARK,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: NEON_GREEN,
    marginBottom: 30,
  },
  cameraFrame: {
    width: '90%',
    aspectRatio: 1 / 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
  },
  scannerArea: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    borderWidth: 5,
    borderColor: NEON_GREEN,
    borderRadius: 15,
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  overlayTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '20%', backgroundColor: OVERLAY_COLOR },
  overlayBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '20%', backgroundColor: OVERLAY_COLOR },
  overlayLeft: { position: 'absolute', top: '20%', left: 0, bottom: '20%', width: '15%', backgroundColor: OVERLAY_COLOR },
  overlayRight: { position: 'absolute', top: '20%', right: 0, bottom: '20%', width: '15%', backgroundColor: OVERLAY_COLOR },

  infoBox: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEON_GREEN,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 30,
  },
  manualButtonText: {
    color: BACKGROUND_DARK,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default QRCheckinScreen;