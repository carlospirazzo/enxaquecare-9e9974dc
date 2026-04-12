import { useState, useEffect, useCallback } from 'react';

export type SubscriptionStatus = 'trial' | 'active' | 'lifetime' | 'expired';

const TRIAL_KEY = 'enxaquecare_trial_start';
const SUBSCRIPTION_KEY = 'enxaquecare_subscription';
const TRIAL_DAYS = 7;

interface SubscriptionData {
  status: SubscriptionStatus;
  plan: string;
}

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>('trial');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing subscription
    const sub = localStorage.getItem(SUBSCRIPTION_KEY);
    if (sub) {
      const parsed: SubscriptionData = JSON.parse(sub);
      if (parsed.status === 'active' || parsed.status === 'lifetime') {
        setStatus(parsed.status);
        setLoading(false);
        return;
      }
    }

    // Initialize or check trial
    let trialStart = localStorage.getItem(TRIAL_KEY);
    if (!trialStart) {
      trialStart = new Date().toISOString();
      localStorage.setItem(TRIAL_KEY, trialStart);
    }

    const elapsed = Date.now() - new Date(trialStart).getTime();
    const trialMs = TRIAL_DAYS * 24 * 60 * 60 * 1000;

    if (elapsed >= trialMs) {
      setStatus('expired');
    } else {
      setStatus('trial');
    }

    setLoading(false);
  }, []);

  const trialDaysLeft = (() => {
    const trialStart = localStorage.getItem(TRIAL_KEY);
    if (!trialStart) return TRIAL_DAYS;
    const elapsed = Date.now() - new Date(trialStart).getTime();
    return Math.max(0, Math.ceil((TRIAL_DAYS * 24 * 60 * 60 * 1000 - elapsed) / (1000 * 60 * 60 * 24)));
  })();

  const isActive = status === 'trial' || status === 'active' || status === 'lifetime';

  const activateSubscription = useCallback((plan: 'monthly' | 'lifetime') => {
    const subStatus: SubscriptionStatus = plan === 'lifetime' ? 'lifetime' : 'active';
    const data: SubscriptionData = { status: subStatus, plan };
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(data));
    setStatus(subStatus);
  }, []);

  return { status, loading, isActive, trialDaysLeft, activateSubscription };
}
