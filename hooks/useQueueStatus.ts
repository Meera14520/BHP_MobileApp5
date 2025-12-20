// fileName: app/hooks/useQueueStatus.ts (COMPLETE FILE - TypeScript Errors Fixed and Refresh Added)

import { useEffect, useState } from 'react';
// Imports are relative to the 'hooks' folder
import { useAuth } from '../app/AuthProvider';
import { supabase } from '../app/supabase';

// Interface for the data returned by the hook
interface QueueStatus {
  businessName: string | null;
  position: number | null;
  status: 'waiting' | 'served' | 'cancelled' | null;
  inQueue: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch and subscribe to the user's current queue status and position.
 * Returns QueueStatus AND a manual refresh function.
 */
export const useQueueStatus = (): QueueStatus & { refreshStatus: () => void } => {
  const { user } = useAuth();
  const [status, setStatus] = useState<QueueStatus>({
    businessName: null,
    position: null,
    status: null,
    inQueue: false,
    loading: true,
    error: null,
  });

 const fetchStatus = async () => {
    setStatus(prev => ({ ...prev, loading: true }));
    
    if (!user) {
      console.log("[QueueStatus] User not logged in, setting inQueue: false.");
      setStatus(prev => ({ ...prev, loading: false, inQueue: false }));
      return;
    }

    try {
      // 1. Fetch the user's active queue entry (Only status: 'waiting')
      const { data: userQueueEntry, error: entryError } = await supabase
        .from('queues')
        .select('business_name, joined_at, status')
        .eq('user_id', user.id)
        .eq('status', 'waiting') 
        .order('joined_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (entryError) throw entryError;

      if (!userQueueEntry) {
        // No active 'waiting' entry found (User has left the queue)
        console.log("[QueueStatus] No active 'waiting' queue found. Setting inQueue: false.");
        setStatus({
          businessName: null,
          position: null,
          status: null,
          inQueue: false,
          loading: false,
          error: null,
        });
        return;
      }

      console.log(`[QueueStatus] Active queue found: ${userQueueEntry.business_name}`);
      
      // 2. Calculate the user's position
      const { count: positionCount, error: countError } = await supabase
        .from('queues')
        .select('id', { count: 'exact' })
        .eq('business_name', userQueueEntry.business_name)
        .eq('status', 'waiting')
        .lt('joined_at', userQueueEntry.joined_at); // Count people who joined BEFORE us

      if (countError) throw countError;
      
      const currentPosition = (positionCount ?? 0) + 1;

      console.log(`[QueueStatus] Final Status: In Queue: true, Position: ${currentPosition}`);

      setStatus({
        businessName: userQueueEntry.business_name,
        position: currentPosition,
        status: userQueueEntry.status as 'waiting',
        inQueue: true,
        loading: false,
        error: null,
      });

    } catch (e) {
        console.error("Queue Status Error:", e);
        setStatus(prev => ({ 
          ...prev, 
          loading: false, 
          error: "Failed to fetch queue status." 
        }));
    }
  };
  
  // Expose fetchStatus via a wrapper for manual triggering
  const refreshStatus = () => {
      console.log("MANUAL REFRESH TRIGGERED");
      fetchStatus();
  }

  useEffect(() => {
    fetchStatus();

    if (!user) return;
    
    const subscription = supabase
      .channel(`public:queues:user_id=eq.${user.id}`)
      .on(
        'postgres_changes',
        { 
            event: '*', 
            schema: 'public', 
            table: 'queues',
            filter: `user_id=eq.${user.id}`
        },
        // FIX: Added explicit 'any' type to avoid TypeScript error 7006
        (payload: any) => { 
            console.log('--- Realtime change detected! Event:', payload.eventType);
            fetchStatus();
        }
      )
      // FIX: Added explicit types to avoid TypeScript error 7006
      .subscribe((status: string, err: Error | undefined) => {
          if (status === 'SUBSCRIBED') {
              console.log('Realtime subscribed successfully.');
          }
          if (err) {
              console.error('Realtime subscription error:', err);
          }
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return { ...status, refreshStatus };
};