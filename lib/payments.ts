export type PaymentMethod = 'upi' | 'stripe' | 'mock';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';
export type PlanType = 'free' | 'no-ads' | 'pro' | 'max';

export interface PaymentIntent {
  id: string;
  plan: PlanType;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  expiresAt: string;
  metadata?: Record<string, any>;
}

export interface UPITransaction {
  id: string;
  upiId: string;
  amount: number;
  plan: PlanType;
  qrCode: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface StripeSession {
  id: string;
  clientSecret: string;
  amount: number;
  plan: PlanType;
  status: PaymentStatus;
  createdAt: string;
}

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    currency: 'INR',
    features: ['Basic AQI tracking', '1 city watch', 'Demo data access'],
  },
  'no-ads': {
    name: 'No Ads',
    price: 50,
    currency: 'INR',
    features: ['Ad-free experience', 'All free features'],
  },
  pro: {
    name: 'Pro',
    price: 100,
    currency: 'INR',
    duration: 'month',
    features: [
      'All No-Ads features',
      '5 city watch limit',
      'Custom themes',
      'Export data',
      'Family check-ins',
      'Priority support',
    ],
  },
  max: {
    name: 'Max',
    price: 200,
    currency: 'INR',
    duration: 'month',
    features: [
      'All Pro features',
      '15 city watch limit',
      'Automation rules',
      'Advanced notifications',
      'Camera grid view',
      'Backend kit generator',
      'Premium analytics',
    ],
  },
};

export class PaymentManager {
  private stripeApiKey: string = '';
  private mockPaymentDelay = 2000; // ms
  private transactions: Map<string, PaymentIntent> = new Map();

  constructor(stripeApiKey?: string) {
    if (stripeApiKey) {
      this.stripeApiKey = stripeApiKey;
    }
    // Defer storage loading to client-side only
    if (typeof window !== 'undefined') {
      this.loadTransactionsFromStorage();
    }
  }

  setStripeApiKey(key: string): void {
    this.stripeApiKey = key;
  }

  /**
   * Create a UPI payment intent
   */
  createUPIIntent(plan: PlanType): UPITransaction {
    const planData = PLANS[plan];
    if (!planData) {
      throw new Error(`Invalid plan: ${plan}`);
    }

    const transaction: UPITransaction = {
      id: this.generateId(),
      upiId: '', // User will fill this
      amount: planData.price,
      plan,
      qrCode: this.generateUPIQRCode(
        `upi://pay?pa=saans@upi&pn=Saans&am=${planData.price}&tr=${plan}`
      ),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage for demo purposes (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`upi_${transaction.id}`, JSON.stringify(transaction));
    }

    return transaction;
  }

  /**
   * Create a mock Stripe payment session
   */
  async createStripeSession(
    plan: PlanType,
    email: string
  ): Promise<StripeSession> {
    const planData = PLANS[plan];
    if (!planData) {
      throw new Error(`Invalid plan: ${plan}`);
    }

    // In real app, this would call Stripe API
    // For demo, we create a mock session
    const session: StripeSession = {
      id: `cs_test_${this.generateId()}`,
      clientSecret: `pi_test_${this.generateId()}_secret_${this.generateId()}`,
      amount: planData.price,
      plan,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Store session (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`stripe_${session.id}`, JSON.stringify(session));
    }

    return session;
  }

  /**
   * Process mock payment (for testing)
   */
  async processMockPayment(
    plan: PlanType,
    userId: string,
    method: PaymentMethod = 'mock'
  ): Promise<PaymentIntent> {
    const planData = PLANS[plan];
    if (!planData) {
      throw new Error(`Invalid plan: ${plan}`);
    }

    const intent: PaymentIntent = {
      id: this.generateId(),
      plan,
      amount: planData.price,
      currency: planData.currency,
      method,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min expiry
      metadata: {
        userId,
        planName: PLANS[plan].name,
      },
    };

    this.transactions.set(intent.id, intent);
    this.saveTransactionsToStorage();

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, this.mockPaymentDelay));

    // Auto-succeed in demo
    intent.status = 'success';
    intent.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 day validity
    this.transactions.set(intent.id, intent);
    this.saveTransactionsToStorage();

    return intent;
  }

  /**
   * Confirm a payment intent
   */
  async confirmPayment(intentId: string): Promise<PaymentIntent | null> {
    const intent = this.transactions.get(intentId);
    if (!intent) {
      return null;
    }

    if (intent.status === 'pending') {
      intent.status = 'success';
      intent.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      this.transactions.set(intentId, intent);
      this.saveTransactionsToStorage();
    }

    return intent;
  }

  /**
   * Get transaction history
   */
  getTransactionHistory(): PaymentIntent[] {
    return Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Check if a plan is active/valid
   */
  isPlanActive(plan: PlanType, userId: string): boolean {
    if (plan === 'free') return true; // Free is always active

    const transactions = this.getTransactionHistory();
    const validTransaction = transactions.find(
      (t) => t.metadata?.userId === userId && t.plan === plan && t.status === 'success'
    );

    if (!validTransaction) return false;

    // Check if still valid
    return new Date(validTransaction.expiresAt) > new Date();
  }

  /**
   * Generate UPI QR code (simplified)
   */
  private generateUPIQRCode(upiString: string): string {
    // In production, use a QR code library
    // For demo, return the UPI string
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='white'/%3E%3Ctext x='50' y='50' text-anchor='middle' dominant-baseline='middle' font-size='8' font-family='monospace'%3E${encodeURIComponent(upiString.substring(0, 30))}.%3C/text%3E%3C/svg%3E`;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  /**
   * Persist transactions to localStorage
   */
  private saveTransactionsToStorage(): void {
    if (typeof window === 'undefined') return; // Skip on server-side
    try {
      const data = Array.from(this.transactions.entries());
      localStorage.setItem('saans_payments_history', JSON.stringify(data));
    } catch (error) {
      console.error('[v0] Error saving payment history:', error);
    }
  }

  /**
   * Load transactions from localStorage
   */
  private loadTransactionsFromStorage(): void {
    if (typeof window === 'undefined') return; // Skip on server-side
    try {
      const data = localStorage.getItem('saans_payments_history');
      if (data) {
        const entries = JSON.parse(data);
        this.transactions = new Map(entries);
      }
    } catch (error) {
      console.error('[v0] Error loading payment history:', error);
    }
  }
}

// Lazy singleton instance (only instantiated on client-side)
let instance: PaymentManager | null = null;

export function getPaymentManager(): PaymentManager {
  if (typeof window === 'undefined') {
    // On server-side, return a mock instance without localStorage access
    return new PaymentManager();
  }
  if (!instance) {
    instance = new PaymentManager();
  }
  return instance;
}

// For backward compatibility, also export the getter as paymentManager
export const paymentManager = {
  createUPIIntent: (plan: any) => getPaymentManager().createUPIIntent(plan),
  createStripeSession: (plan: any, email: string) => getPaymentManager().createStripeSession(plan, email),
  processMockPayment: (plan: any, userId: string, method?: any) => getPaymentManager().processMockPayment(plan, userId, method),
  confirmMockPayment: (intentId: string) => getPaymentManager().confirmPayment(intentId),
  confirmPayment: (intentId: string) => getPaymentManager().confirmPayment(intentId),
  getTransactions: () => getPaymentManager().getTransactionHistory(),
  getTransactionHistory: () => getPaymentManager().getTransactionHistory(),
  getTransaction: (id: string) => getPaymentManager().getTransactionHistory().find((t) => t.id === id) ?? null,
  isPlanActive: (plan: any, userId: string) => getPaymentManager().isPlanActive(plan, userId),
  setStripeApiKey: (key: string) => getPaymentManager().setStripeApiKey(key),
};
