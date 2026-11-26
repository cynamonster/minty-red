import React, { useState } from 'react';
import { useArcadePass } from '../context/ArcadePassContext';
import {
  Trophy,
  Check,
  X,
  ShieldCheck,
  Infinity as InfinityIcon,
  Calendar,
  WifiOff,
  Flame,
  ArrowRight,
  Mail,
  RotateCcw,
  ExternalLink,
  AlertTriangle,
  Crown,
  Sparkles,
  Clock,
} from 'lucide-react';

export function ArcadePassModal() {
  const {
    isModalOpen,
    closePassModal,
    closeModal,
    modalInitialTab,
    triggerReason,
    isPassHolder,
    passInfo,
    restorePurchase,
    cancelSubscription,
  } = useArcadePass();

  const handleClose = closePassModal || closeModal;

  const [activeTab, setActiveTab] = useState(modalInitialTab || 'plans');
  const [memberSubView, setMemberSubView] = useState('overview'); // 'overview' | 'confirm_cancel' | 'cancel_success'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [restoreEmail, setRestoreEmail] = useState('');
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  // Sync tab/view whenever modal opens
  React.useEffect(() => {
    setActiveTab(modalInitialTab || (isPassHolder ? 'member' : 'plans'));
    setMemberSubView('overview');
    setErrorMsg('');
    setRestoreSuccess(false);
  }, [modalInitialTab, isModalOpen, isPassHolder]);

  // Handle escape key to close modal
  React.useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (handleClose) handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, handleClose]);

  if (!isModalOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/pass/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'annual',
          returnUrl: window.location.href,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Unable to initiate checkout session.');
      }

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Payment initiation failed. Please try again.');
      setLoading(false);
    }
  };

  const handleRestoreSubmit = async (e) => {
    e.preventDefault();
    if (!restoreEmail || !restoreEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await restorePurchase(restoreEmail.trim());
      setRestoreSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to restore. Please verify your purchase email.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await cancelSubscription();
      setMemberSubView('cancel_success');
    } catch (err) {
      setErrorMsg(err.message || 'Cancellation request failed. Please email pass@minty.red for assistance.');
    } finally {
      setLoading(false);
    }
  };

  const formattedExpires = passInfo?.expiresAt
    ? new Date(passInfo.expiresAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const isAutoRenewalOff = Boolean(passInfo?.cancelAtPeriodEnd);

  // Dynamic Tenure & Renewal Pricing (Year 1: $9.99/yr -> Year 2: $8.49/yr -> Year 3+: $6.99/yr)
  const tenureYear = passInfo?.tenureYear || (passInfo?.activatedAt
    ? Math.max(1, Math.floor((Date.now() - passInfo.activatedAt) / (365 * 86400 * 1000)) + 1)
    : 1);

  const currentPrice = passInfo?.currentPrice || (tenureYear === 1 ? '$9.99/yr' : tenureYear === 2 ? '$8.49/yr' : '$6.99/yr');

  // Only present future price if there is a cheaper price to renew at and auto-renewal is active
  const futureCheaperPrice = passInfo?.renewalPrice || (
    !isAutoRenewalOff && (tenureYear === 1 ? '$8.49/yr' : tenureYear === 2 ? '$6.99/yr' : null)
  );

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 active:scale-95 transition-all"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* =========================================================================
            PASSHOLDER ACTIVE MEMBER VIEW (Shown when user has already purchased)
           ========================================================================= */}
        {isPassHolder && activeTab !== 'restore' ? (
          <div>
            {/* --- SUBVIEW: MEMBER OVERVIEW --- */}
            {memberSubView === 'overview' && (
              <div className="flex flex-col space-y-4">
                {/* Member Header */}
                <div className="text-center pt-1 pb-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-400 shadow-inner mb-2.5">
                    <Crown className="w-6 h-6 text-amber-400" />
                  </div>
                  <h2 className="text-lg font-black tracking-tight text-white flex items-center justify-center gap-1.5">
                    <span>Minty Arcade Pass</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 uppercase font-mono tracking-wider">
                      Active
                    </span>
                  </h2>
                  <p className="text-xs text-amber-300 font-medium mt-1 flex items-center justify-center gap-1.5 flex-wrap">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      Currently {currentPrice}
                      {futureCheaperPrice ? `, renewing at ${futureCheaperPrice}` : ''}
                    </span>
                  </p>
                </div>

                {/* Status Notice if Auto-Renewal is Off */}
                {isAutoRenewalOff && (
                  <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-amber-300">Auto-Renewal Canceled</div>
                      <p className="text-[11px] text-amber-200/90 mt-0.5">
                        Your pass remains active with all benefits until {formattedExpires || 'the end of your billing cycle'}.
                      </p>
                    </div>
                  </div>
                )}

                {/* Benefits Active Card */}
                <div className="bg-slate-900/70 rounded-2xl p-3.5 border border-slate-800 space-y-2.5 text-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Active Member Perks
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200 font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span><strong>100% Ad-Free</strong>: Zero banners or interruptions</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200 font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <InfinityIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span><strong>Unlimited Infinite Play</strong>: Endless practice runs</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200 font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span><strong>Full Daily Archive</strong>: Replay past daily puzzles</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200 font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <WifiOff className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span><strong>Full Offline Access</strong>: Saved to device cache</span>
                  </div>
                </div>

                {/* Grandfather Lock Summary */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span>Pass Price</span>
                      </div>
                      {/* <div className="text-[11px] text-slate-300 mt-1">
                        Renews at <strong className="text-white">$8.49/yr</strong> Year 2, then <strong className="text-white">$6.99/yr</strong> Year 3+.
                      </div> */}
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-amber-400">{currentPrice}</div>
                      {formattedExpires && (
                        <div className="text-[10px] text-slate-400 font-mono">Until {formattedExpires}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Support Contact Card */}
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-200">Passholder Support</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Have feedback, game requests, or questions about your pass?
                      </p>
                      <a
                        href="mailto:pass@minty.red?subject=Minty%20Arcade%20Pass%20Inquiry"
                        className="inline-flex items-center gap-1.5 mt-2 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 hover:underline"
                      >
                        <span>pass@minty.red</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Management & Cancellation Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <a
                    href="/api/pass/portal"
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <span>Stripe Billing Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {!isAutoRenewalOff && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('');
                        setMemberSubView('confirm_cancel');
                      }}
                      className="text-slate-500 hover:text-rose-400 text-[11px] font-medium transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* --- SUBVIEW: CONFIRM CANCELLATION --- */}
            {memberSubView === 'confirm_cancel' && (
              <div className="flex flex-col space-y-4 pt-1">
                {/* Warning Header */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-400 mb-2.5">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-black tracking-tight text-white">
                    Cancel Your Arcade Pass?
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Please review what happens before confirming
                  </p>
                </div>

                {/* Bold Warning Box: Grandfather Pricing Loss */}
                <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 space-y-2">
                  <div className="font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Permanent Loss of Locked-in Founder Rate</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-200/90">
                    If you cancel, you will permanently forfeit your <strong>$9.99/year</strong> Founder pricing and your future tenure discounts (<strong>$8.49/yr</strong> Year 2, then <strong>$6.99/yr</strong> Year 3+). Any future re-subscription will be at higher standard rates.
                  </p>
                </div>

                {/* Benefits You Will Lose */}
                <div className="bg-slate-900/70 rounded-2xl p-3.5 border border-slate-800 text-xs space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Benefits Lost at Period End
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                    <X className="w-3.5 h-3.5 text-rose-400 shrink-0 stroke-[3]" />
                    <span>Ad banners will return to all games</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                    <X className="w-3.5 h-3.5 text-rose-400 shrink-0 stroke-[3]" />
                    <span>Infinite modes will be limited to 1 run per day</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                    <X className="w-3.5 h-3.5 text-rose-400 shrink-0 stroke-[3]" />
                    <span>Daily puzzle archive access will be locked</span>
                  </div>
                </div>

                {/* Retention Reassurance */}
                <div className="text-[11px] text-slate-400 text-center px-2">
                  Your pass will remain <strong>100% active</strong> until {formattedExpires || 'the end of your current billing cycle'}. You will not be charged again.
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs text-center">
                    {errorMsg}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setMemberSubView('overview')}
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-[0.98] transition-all"
                  >
                    Keep My Pass & Lock In Rate
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmCancel}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {loading ? 'Processing cancellation...' : 'Confirm Cancellation'}
                  </button>
                </div>

                <div className="text-center">
                  <a
                    href="mailto:pass@minty.red?subject=Need%20Help%20Before%20Canceling"
                    className="text-[11px] text-slate-500 hover:text-slate-300"
                  >
                    Need assistance? Email pass@minty.red
                  </a>
                </div>
              </div>
            )}

            {/* --- SUBVIEW: CANCELLATION SUCCESS --- */}
            {memberSubView === 'cancel_success' && (
              <div className="flex flex-col space-y-4 pt-2 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto mb-1">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h2 className="text-lg font-black text-white">Auto-Renewal Canceled</h2>
                <p className="text-xs text-slate-300 leading-relaxed px-2">
                  Your cancellation has been processed. You retain <strong>full passholder access</strong> through {formattedExpires || 'the end of your billing cycle'}. You will not be billed again.
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                  If you ever change your mind or have any questions, reach out to us at{' '}
                  <a href="mailto:pass@minty.red" className="text-amber-400 font-mono underline">
                    pass@minty.red
                  </a>
                  .
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* =========================================================================
            NON-PASSHOLDER VIEW (Purchasing & Restoring)
           ========================================================================= */}
        {!isPassHolder && (
          <div>
            {/* Modal Header */}
            <div className="text-center pt-2 pb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-400 shadow-inner mb-3">
                <Trophy className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                Minty Arcade Pass
              </h2>
              <p className="text-xs text-amber-300/90 font-medium mt-1">
                {triggerReason || 'Ad-free gaming & unlimited access across the arcade'}
              </p>
            </div>

            {/* --- TAB: PLANS --- */}
            {activeTab === 'plans' && (
              <div className="flex flex-col space-y-4">
                {/* Perks List */}
                <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-200 font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span><strong>100% Ad-Free</strong>: Zero banners or interruptions</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200 font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <InfinityIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span><strong>Unlimited Infinite Modes</strong>: Endless practice runs</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200 font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span><strong>Daily Archive</strong>: Replay past daily puzzles from launch</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200 font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <WifiOff className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span><strong>Offline Access</strong>: Play on flights & subways</span>
                  </div>
                </div>

                {/* Annual Pass Showcase Card */}
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-900/90 to-slate-900 border border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30">
                  <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow">
                    Full Year Access • $0.83/mo
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-base text-white flex items-center gap-2">
                        <span>Annual Arcade Pass</span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        <span className="text-xl font-black text-amber-400 font-mono">$9.99</span>
                        <span className="text-slate-400 font-medium"> / year</span>
                      </div>
                      <div className="text-[11px] text-amber-300/90 mt-1.5 flex items-center gap-1.5 font-medium">
                        <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span>Renews at $8.49/yr, then $6.99/yr</span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full border border-amber-400 bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>
                </div>

                {/* Founder Grandfathering Pitch */}
                <div className="text-center px-1 text-[10px] text-slate-400 font-medium">
                  Pass prices may rise as more games are added. Subscribing today locks in your rate for life. Renews cheaper each year.
                </div>

                {/* Error Message */}
                {errorMsg && (
                  <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs text-center">
                    {errorMsg}
                  </div>
                )}

                {/* CTA Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Connecting to checkout...</span>
                  ) : (
                    <>
                      <span>Unlock Annual Pass ($9.99/year)</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </>
                  )}
                </button>

                {/* Payment Method Badges */}
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Apple Pay • Google Pay • Secure Stripe Checkout</span>
                </div>

                {/* Restore / Manage Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <button
                    type="button"
                    onClick={() => setActiveTab('restore')}
                    className="hover:text-amber-400 transition-colors"
                  >
                    Already subscribed? <span className="underline">Restore</span>
                  </button>
                  <a
                    href="mailto:pass@minty.red?subject=Arcade%20Pass%20Question"
                    className="hover:text-slate-300 transition-colors flex items-center gap-1"
                  >
                    <span>Support (pass@minty.red)</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: RESTORE PURCHASE (Available to all) --- */}
        {activeTab === 'restore' && (
          <div className="flex flex-col space-y-4">
            <div className="text-center pt-2 pb-2">
              <h2 className="text-lg font-black text-white">Restore Arcade Pass</h2>
              <p className="text-xs text-slate-300 mt-1">
                Enter the email address you used during checkout. We'll send you an instant 1-click restore link.
              </p>
            </div>

            {restoreSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-sm text-white">Restore Link Sent!</h3>
                <p className="text-xs text-slate-300">
                  We've sent a magic restore link to <strong>{restoreEmail}</strong>. Tap it on this device to activate your pass immediately.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-2 px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleRestoreSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={restoreEmail}
                    onChange={(e) => setRestoreEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {errorMsg && (
                  <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs text-center">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Send 1-Click Restore Link</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => setActiveTab(isPassHolder ? 'member' : 'plans')}
              className="text-xs text-slate-400 hover:text-white text-center pt-2"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ArcadePassModal;
