
// fileName: supabase.ts (TypeScript Error 2353 Fixed)

import { AuthChangeEvent, createClient, Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

// =========================================================================
// !!! CRITICAL STEP: REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS !!!
// =========================================================================

// 1. Project URL: Found in Settings -> API
const SUPABASE_URL = "https://pkutqqiojceepzweaugz.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrdXRxcWlvamNlZXB6d2VhdWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODk1OTYsImV4cCI6MjA4MTU2NTU5Nn0.NuYXdKezP6Oe14H9869nDxnOVwk3T2rS2Ayzv4zo1Ys";

// Expo deep link (required for Google / OAuth)
// =========================================================================

// Expo deep link (used ONLY when calling signInWithOAuth)
const redirectUrl = Linking.createURL('/');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // --- REDIRECTTO REMOVED HERE TO FIX ERROR 2353 ---
    // The redirectTo property is now passed directly in signInWithOAuth.
    
    // REQUIRED for Expo (no PKCE issues)
    detectSessionInUrl: true,
    autoRefreshToken: true,
    persistSession: true,
  },
});

console.log("Supabase Redirect URL (for OAuth):", redirectUrl);

// --- EXPORT THE NECESSARY TYPES HERE ---
export type { AuthChangeEvent, Session };
