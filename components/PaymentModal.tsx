'use client';

import React, { useState } from 'react';
import { paymentManager, PLANS, type PlanType } from '@/lib/payments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (plan: PlanType) => void;
  currentPlan: PlanType;
}

type PaymentStep = 'select-plan' | 'payment-form' | 'processing' | 'success';

const PLAN_ORDER: PlanType[] = ['no-ads', 'pro', 'max'];

const PLAN_HIGHLIGHTS: Record<string, { color: string; badge: string }> = {
  'no-ads': { color: 'border-sky-400 bg-sky-50/50 dark:bg-sky-900/10', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
  pro: { color: 'border-primary bg-primary/5', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  max: { color: 'border-violet-400 bg-violet-50/50 dark:bg-violet-900/10', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
};

export function PaymentModal({ isOpen, onClose, onSuccess, currentPlan }: PaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pro');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'mock'>('card');
  const [step, setStep] = useState<PaymentStep>('select-plan');

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState('');

  const planData = PLANS[selectedPlan];

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleProceedToPayment = () => {
    if (selectedPlan === currentPlan) {
      setError('You are already on this plan.');
      return;
    }
    setError('');
    setStep('payment-form');
  };

  const handlePay = async () => {
    setError('');

    // Basic validation
    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setError('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) {
        setError('Please enter a valid expiry (MM/YY).');
        return;
      }
      if (cardCvc.length < 3) {
        setError('Please enter a valid CVC.');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g. name@upi).');
        return;
      }
    }

    setStep('processing');

    try {
      await paymentManager.processMockPayment(selectedPlan, 'current-user', paymentMethod === 'card' ? 'stripe' : paymentMethod);
      setStep('success');
    } catch {
      setStep('payment-form');
      setError('Payment failed. Please try again.');
    }
  };

  const handleDone = () => {
    onSuccess(selectedPlan);
    onClose();
    setStep('select-plan');
    setCardNumber(''); setCardExpiry(''); setCardCvc(''); setCardName(''); setUpiId('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Upgrade Your Plan</CardTitle>
              <CardDescription>Unlock powerful features for your health journey</CardDescription>
            </div>
            <button
              onClick={onClose}
              className="text-foreground/50 hover:text-foreground transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-foreground/10"
              aria-label="Close"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress steps */}
          {step !== 'success' && (
            <div className="flex items-center gap-2 mt-3 text-xs">
              <span className={`flex items-center gap-1 font-medium ${step === 'select-plan' ? 'text-primary' : 'text-foreground/40'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === 'select-plan' ? 'bg-primary text-primary-foreground' : 'bg-foreground/20 text-foreground/50'}`}>1</span>
                Choose Plan
              </span>
              <span className="flex-1 h-px bg-border" />
              <span className={`flex items-center gap-1 font-medium ${step === 'payment-form' ? 'text-primary' : step === 'processing' ? 'text-primary' : 'text-foreground/40'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === 'payment-form' || step === 'processing' ? 'bg-primary text-primary-foreground' : 'bg-foreground/20 text-foreground/50'}`}>2</span>
                Payment
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-5">

          {/* Step 1: Plan Selection */}
          {step === 'select-plan' && (
            <>
              <div className="grid gap-3">
                {PLAN_ORDER.map((plan) => {
                  const p = PLANS[plan];
                  const h = PLAN_HIGHLIGHTS[plan];
                  const isCurrent = plan === currentPlan;
                  return (
                    <button
                      key={plan}
                      onClick={() => !isCurrent && setSelectedPlan(plan)}
                      disabled={isCurrent}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedPlan === plan && !isCurrent
                          ? h.color
                          : isCurrent
                            ? 'border-border bg-muted/30 opacity-60 cursor-not-allowed'
                            : 'border-border hover:border-foreground/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{p.name}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">Current</span>
                          )}
                          {plan === 'pro' && !isCurrent && (
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${h.badge}`}>Most Popular</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-foreground">
                            {p.price === 0 ? 'Free' : `₹${p.price}`}
                          </span>
                          {p.price > 0 && <span className="text-xs text-foreground/60">/mo</span>}
                        </div>
                      </div>
                      <ul className="space-y-0.5">
                        {p.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="text-xs text-foreground/70 flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-green-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button onClick={handleProceedToPayment} className="w-full" size="lg">
                Continue — ₹{PLANS[selectedPlan].price}/mo
              </Button>

              <p className="text-xs text-center text-foreground/50">
                Secure payment. Cancel anytime. 30-day access granted immediately.
              </p>
            </>
          )}

          {/* Step 2: Payment Form */}
          {step === 'payment-form' && (
            <>
              {/* Payment method tabs */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                {(['card', 'upi', 'mock'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                      paymentMethod === m
                        ? 'bg-card shadow text-foreground'
                        : 'text-foreground/60 hover:text-foreground'
                    }`}
                  >
                    {m === 'card' ? 'Credit/Debit Card' : m === 'upi' ? 'UPI' : 'Test (Mock)'}
                  </button>
                ))}
              </div>

              {/* Card form */}
              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-foreground/70 block mb-1">Card Number</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-foreground/70 block mb-1">Expiry</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground/70 block mb-1">CVC</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground/70 block mb-1">Name on Card</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Rahul Sharma"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground/50">
                    <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Secured with 256-bit SSL encryption (mock — no real charge)
                  </div>
                </div>
              )}

              {/* UPI form */}
              {paymentMethod === 'upi' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-foreground/70 block mb-1">UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="bg-muted/40 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-12 h-12 bg-card border border-border rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-foreground/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6v6H9z" />
                        <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Pay ₹{PLANS[selectedPlan].price}</p>
                      <p className="text-xs text-foreground/60">to saans@upi (mock)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mock payment */}
              {paymentMethod === 'mock' && (
                <div className="bg-muted/40 rounded-lg p-4 text-center space-y-2">
                  <p className="text-sm font-medium text-foreground">Test Payment Mode</p>
                  <p className="text-xs text-foreground/60">
                    This simulates a successful payment without any real transaction. Click Pay to instantly activate the {PLANS[selectedPlan].name} plan.
                  </p>
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-3 pt-1">
                <Button variant="outline" onClick={() => setStep('select-plan')} className="flex-1">
                  Back
                </Button>
                <Button onClick={handlePay} className="flex-1">
                  Pay ₹{PLANS[selectedPlan].price}
                </Button>
              </div>
            </>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <div className="py-10 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-foreground/70 font-medium">Processing your payment...</p>
              <p className="text-xs text-foreground/50">Please wait, do not close this window.</p>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="py-6 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">Payment Successful!</p>
                <p className="text-sm text-foreground/70 mt-1">
                  Welcome to <span className="font-semibold text-primary">{PLANS[selectedPlan].name}</span>. Your plan is now active.
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg px-6 py-3 w-full">
                <p className="text-xs text-foreground/60">30-day access granted</p>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  Valid until {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <Button onClick={handleDone} className="w-full" size="lg">
                Start Using {PLANS[selectedPlan].name}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
