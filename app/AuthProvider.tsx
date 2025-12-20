// fileName: AuthProvider.tsx (FINAL CLEANED - Type Imports Fixed)

import { router } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
// --- Importing types from the local supabase file ---
import { AuthChangeEvent, Session, supabase } from './supabase';

type AuthContextType = {
	user: any | null;
	session: Session | null;
	isLoading: boolean;
	signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
	user: null,
	session: null,
	isLoading: true,
	signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<any | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// --- 1. Load initial session ---
		supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
			setSession(data.session ?? null);
			setUser(data.session?.user ?? null);
			setIsLoading(false);
		});

		// --- 2. Listen to all auth changes ---
		const { data: listener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, updatedSession: Session | null) => {
			console.log("Auth Change Event:", event);
      
			// If a session object is provided (happens on SIGNED_IN, TOKEN_REFRESHED, etc.)
			if (updatedSession) {
				setSession(updatedSession);
				setUser(updatedSession.user);
			} else if (event === "SIGNED_OUT") {
				// If the event is SIGNED_OUT, ensure states are cleared
				setSession(null);
				setUser(null);
			}
      
			// Note: No explicit check needed for SIGNED_IN anymore, 
			// as it's covered by the updatedSession check above.
		});

		// --- 3. Cleanup ---
		return () => {
			listener.subscription.unsubscribe();
		};
	}, []);

	// Function to handle sign out
	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error("Sign Out Error:", error);
		} else {
			// Manually clear state and navigate on successful sign out
			setSession(null);
			setUser(null);
			router.replace('/auth'); // Redirect to login/auth screen
		}
	};

	const value: AuthContextType = {
		user,
		session,
		isLoading,
		signOut,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use the auth context easily
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};