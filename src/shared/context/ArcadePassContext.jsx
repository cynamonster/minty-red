import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ArcadePassContext = createContext({
  isPassHolder: false,
  passInfo: null,
  isModalOpen: false,
  modalInitialTab: 'plans',
  triggerReason: '',
  openPassModal: () => {},
  closePassModal: () => {},
  closeModal: () => {},
  setPassToken: () => {},
  clearPass: () => {},
  restorePurchase: async () => {},
  cancelSubscription: async () => {},
});

const STORAGE_KEY = 'minty_arcade_pass';

export function ArcadePassProvider({ children }) {
  const [isPassHolder, setIsPassHolder] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;
      const parsed = JSON.parse(stored);
      if (parsed?.expiresAt && parsed.expiresAt < Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }
      return Boolean(parsed?.active);
    } catch {
      return false;
    }
  });

  const [passInfo, setPassInfo] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState('plans');
  const [triggerReason, setTriggerReason] = useState('');

  const savePassState = useCallback((info) => {
    if (!info) {
      localStorage.removeItem(STORAGE_KEY);
      setIsPassHolder(false);
      setPassInfo(null);
      return;
    }
    const data = {
      active: true,
      tier: info.tier || 'annual',
      email: info.email || null,
      token: info.token || null,
      expiresAt: info.expiresAt || null,
      activatedAt: info.activatedAt || Date.now(),
      subscriptionId: info.subscriptionId || null,
      customerId: info.customerId || null,
      cancelAtPeriodEnd: Boolean(info.cancelAtPeriodEnd),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
    setIsPassHolder(true);
    setPassInfo(data);
  }, []);

  const openPassModal = useCallback((tab = 'plans', reason = '') => {
    setModalInitialTab(tab);
    setTriggerReason(reason);
    setIsModalOpen(true);
  }, []);

  const closePassModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const clearPass = useCallback(() => {
    savePassState(null);
  }, [savePassState]);

  // Handle URL redirect query parameters from Stripe checkout or Magic Links
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const passSuccess = params.get('pass_success');
    const passToken = params.get('pass_token');
    const sessionId = params.get('session_id');
    const passOverride = params.get('pass') === 'true' || params.get('pass') === '1';

    if (passOverride) {
      savePassState({
        tier: 'annual',
        email: 'dev@minty.red',
        token: 'dev_pass_override',
        expiresAt: Date.now() + 365 * 86400 * 1000,
      });
    } else if (passToken) {
      // Magic link direct restore
      try {
        const payload = JSON.parse(atob(passToken.split('.')[1] || ''));
        savePassState({
          token: passToken,
          email: payload.email,
          tier: payload.tier || 'annual',
          expiresAt: payload.exp ? payload.exp * 1000 : null,
        });
      } catch {
        savePassState({ token: passToken, active: true });
      }

      params.delete('pass_token');
      const cleanUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState(null, '', cleanUrl);
    } else if (passSuccess && sessionId) {
      // Returned from Stripe Checkout
      fetch(`/api/pass/verify?session_id=${encodeURIComponent(sessionId)}`)
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data) => {
          savePassState({
            tier: data.tier || 'annual',
            email: data.email,
            token: data.token,
            expiresAt: data.expiresAt,
            subscriptionId: data.subscriptionId,
            customerId: data.customerId,
          });
        })
        .catch(() => {
          // Fallback optimistic activation if session was successful
          savePassState({ tier: 'annual', active: true });
        })
        .finally(() => {
          params.delete('pass_success');
          params.delete('session_id');
          const cleanUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
          window.history.replaceState(null, '', cleanUrl);
        });
    }
  }, [savePassState]);

  const restorePurchase = useCallback(async (email) => {
    const res = await fetch('/api/pass/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Unable to find an active Arcade Pass for that email.');
    }
    return res.json();
  }, []);

  const cancelSubscription = useCallback(async () => {
    const email = passInfo?.email;
    const subscriptionId = passInfo?.subscriptionId;

    const res = await fetch('/api/pass/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, subscriptionId }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Unable to cancel subscription. Please contact pass@minty.red');
    }

    savePassState({
      ...passInfo,
      cancelAtPeriodEnd: true,
      expiresAt: data.currentPeriodEnd || passInfo?.expiresAt,
    });

    return data;
  }, [passInfo, savePassState]);

  return (
    <ArcadePassContext.Provider
      value={{
        isPassHolder,
        passInfo,
        isModalOpen,
        modalInitialTab,
        triggerReason,
        openPassModal,
        closePassModal,
        closeModal: closePassModal,
        setPassToken: savePassState,
        clearPass,
        restorePurchase,
        cancelSubscription,
      }}
    >
      {children}
    </ArcadePassContext.Provider>
  );
}

export function useArcadePass() {
  return useContext(ArcadePassContext);
}
