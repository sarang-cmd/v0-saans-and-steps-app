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

export function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  currentPlan,
}: PaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pro');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'stripe' | 'mock'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      if (paymentMethod === 'upi') {
        const transaction = paymentManager.createUPIIntent(selectedPlan);
        setShowQR(true);
        // In real app, poll for payment confirmation
        setTimeout(() => {
          onSuccess(selectedPlan);
          onClose();
        }, 3000);
      } else if (paymentMethod === 'stripe') {
        const session = await paymentManager.createStripeSession(
          selectedPlan,
          'user@example.com'
        );
        // In real app, redirect to Stripe checkout
        alert(`Mock Stripe Session: ${session.id}`);
        onSuccess(selectedPlan);
        onClose();
      } else {
        // Mock payment
        const payment = await paymentManager.processMockPayment(selectedPlan, 'user');
        onSuccess(selectedPlan);
        onClose();
      }
    } catch (error) {
      alert(`Payment error: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Upgrade Plan</CardTitle>
              <CardDescription>Choose a plan that fits your needs</CardDescription>
            </div>
            <button
              onClick={onClose}
              className="text-foreground/60 hover:text-foreground"
            >
              ✕
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Plan Selection */}
          <div className="grid grid-cols-2 gap-3">
            {(['no-ads', 'pro', 'max'] as const).map((plan) => (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={`p-3 rounded-lg border-2 transition ${
                  selectedPlan === plan
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <p className="font-bold text-sm">{PLANS[plan].name}</p>
                <p className="text-foreground/60 text-xs">
                  ₹{PLANS[plan].price}
                  {PLANS[plan].duration && `/${PLANS[plan].duration}`}
                </p>
              </button>
            ))}
          </div>

          {/* Features */}
          <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-xs font-medium text-foreground/60 mb-2">INCLUDES:</p>
            <ul className="space-y-1">
              {PLANS[selectedPlan].features.map((feature, i) => (
                <li key={i} className="text-xs text-foreground/80">
                  ✓ {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Method */}
          {!showQR && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-foreground/60">PAYMENT METHOD</p>
              <div className="grid grid-cols-3 gap-2">
                {(['upi', 'stripe', 'mock'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-2 rounded-lg border-2 transition text-xs font-medium ${
                      paymentMethod === method
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                  >
                    {method.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QR Code Display */}
          {showQR && (
            <div className="text-center space-y-3">
              <p className="text-sm font-medium">Scan to pay ₹{PLANS[selectedPlan].price}</p>
              <div className="bg-white p-4 rounded-lg inline-block">
                <div className="w-40 h-40 bg-muted flex items-center justify-center rounded">
                  <p className="text-xs text-center text-foreground/60">
                    UPI QR Code
                    <br />
                    saans@upi
                  </p>
                </div>
              </div>
              <p className="text-xs text-foreground/60">Confirming payment...</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            {!showQR && (
              <Button
                onClick={handlePayment}
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay ₹${PLANS[selectedPlan].price}`}
              </Button>
            )}
          </div>

          {/* Info */}
          <p className="text-xs text-foreground/60 text-center">
            All transactions are secure and encrypted
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
