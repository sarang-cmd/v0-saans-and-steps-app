import { adminManager } from './admin';
import { paymentManager } from './payments';
import { notificationManager } from './notifications';

/**
 * Initialize demo data for testing
 */
export async function initializeDemoData() {
  console.log('[v0] Initializing demo data...');

  try {
    // 1. Set up admin user with credits
    const admin = adminManager.getMockAdmin();
    console.log('[v0] Admin user:', admin.email, 'Credits:', admin.credits);

    // 2. Create some demo reminders
    notificationManager.createReminder(
      'Morning Workout Check',
      'Check if it\'s a good time for morning exercise',
      '06:00',
      'daily'
    );

    notificationManager.createReminder(
      'Evening Fitness Alert',
      'Evening is great for outdoor activities. Check the air quality!',
      '18:00',
      'daily'
    );

    console.log('[v0] Demo reminders created');

    // 3. Create demo payment history
    const mockPayment = await paymentManager.processMockPayment('pro', 'demo-user', 'mock');
    console.log('[v0] Demo payment processed:', mockPayment.id);

    // 4. Grant admin user all plans
    adminManager.grantEntitlement('demo-user', 'max', 365); // 1 year
    console.log('[v0] Admin entitlements granted');

    // 5. Enable all features by default
    const criticalFeatures = [
      'real-api',
      'notifications-enabled',
      'offline-mode',
      'pwa-install',
      'dark-mode',
      'family-features',
      'export-csv',
      'themes',
      'multilingual',
    ] as const;

    criticalFeatures.forEach((flag) => {
      adminManager.setFeature(flag, true);
    });

    console.log('[v0] Demo data initialized successfully');

    // Return setup summary
    return {
      adminEmail: admin.email,
      adminCredits: admin.credits,
      mockPaymentId: mockPayment.id,
      remindersCreated: 2,
      status: 'ready',
    };
  } catch (error) {
    console.error('[v0] Error initializing demo data:', error);
    return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Check if demo data is initialized
 */
export function isDemoDataInitialized(): boolean {
  const admin = adminManager.getAdminUser();
  return admin !== null;
}
