import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type SubscriptionStatus = 'trial' | 'active' | 'lifetime' | 'expired' | 'loading';

interface Subscription {
  id: string;
  status: SubscriptionStatus;
  plan: string;
  trial_start: string;
  trial_end: string;
  current_period_start: string | null;
  current_period_end: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setLoading(false);
        return;
      }

      if (data) {
        // Check if trial has expired
        const now = new Date();
        const trialEnd = new Date(data.trial_end);
        
        if (data.status === 'trial' && now > trialEnd) {
          // Trial expired - update status
          await supabase
            .from('subscriptions')
            .update({ status: 'expired' })
            .eq('id', data.id);
          
          setSubscription({ ...data, status: 'expired' } as Subscription);
        } else {
          setSubscription(data as Subscription);
        }
      }

      setLoading(false);
    };

    fetchSubscription();
  }, [user]);

  const isActive = subscription?.status === 'trial' || 
                   subscription?.status === 'active' || 
                   subscription?.status === 'lifetime';

  const trialDaysLeft = subscription?.trial_end
    ? Math.max(0, Math.ceil((new Date(subscription.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const updateSubscription = async (status: string, plan: string) => {
    if (!user || !subscription) return;
    
    const { error } = await supabase
      .from('subscriptions')
      .update({ status, plan })
      .eq('id', subscription.id);

    if (!error) {
      setSubscription(prev => prev ? { ...prev, status: status as SubscriptionStatus, plan } : null);
    }
  };

  return { subscription, loading, isActive, trialDaysLeft, updateSubscription };
}
