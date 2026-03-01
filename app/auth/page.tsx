'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { firebaseManager } from '@/lib/firebase';
import { getAdminManager } from '@/lib/admin';

type AuthMode = 'login' | 'signup' | 'forgot-password';

interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  credits: number;
  plan: 'free' | 'no-ads' | 'pro' | 'max';
  createdAt: string;
}

// Mock user store (localStorage-backed)
function getMockUsers(): Record<string, MockUser> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('mock_users') || '{}');
  } catch {
    return {};
  }
}

function saveMockUser(user: MockUser) {
  const users = getMockUsers();
  users[user.email] = user;
  localStorage.setItem('mock_users', JSON.stringify(users));
}

function getMockSession(): MockUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('mock_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setMockSession(user: MockUser | null) {
  if (user) {
    localStorage.setItem('mock_session', JSON.stringify(user));
  } else {
    localStorage.removeItem('mock_session');
  }
}

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const isFirebaseReady = firebaseManager.isInitialized();

  useEffect(() => {
    setCurrentUser(getMockSession());
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      if (isFirebaseReady) {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const auth = firebaseManager.getAuth();
        if (auth) {
          await signInWithEmailAndPassword(auth, email, password);
          setSuccess('Signed in with Firebase successfully!');
        }
      } else {
        // Mock authentication
        await new Promise((r) => setTimeout(r, 800));
        const users = getMockUsers();
        const user = users[email];

        if (!user) {
          setError('No account found with this email. Please sign up first.');
          setIsLoading(false);
          return;
        }

        // Simple mock password check (stored as plain for demo)
        if (user.email === 'admin@saans.local' && password === 'admin123') {
          const adminUser = { ...user };
          setMockSession(adminUser);
          setCurrentUser(adminUser);
          // Also unlock admin mode
          getAdminManager().setAdminUser({ id: adminUser.uid, email: adminUser.email, role: 'admin', createdAt: adminUser.createdAt, credits: adminUser.credits, permissions: ['*'] });
          localStorage.setItem('admin_mode', 'true');
          setSuccess('Welcome back, Admin!');
        } else if (user) {
          setMockSession(user);
          setCurrentUser(user);
          setSuccess(`Welcome back, ${user.displayName}!`);
        } else {
          setError('Invalid password.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !displayName) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      if (isFirebaseReady) {
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
        const auth = firebaseManager.getAuth();
        if (auth) {
          const credential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(credential.user, { displayName });
          setSuccess('Account created successfully with Firebase!');
        }
      } else {
        // Mock signup
        await new Promise((r) => setTimeout(r, 800));
        const users = getMockUsers();

        if (users[email]) {
          setError('An account with this email already exists.');
          setIsLoading(false);
          return;
        }

        const newUser: MockUser = {
          uid: 'mock_' + Math.random().toString(36).substring(2, 9),
          email,
          displayName,
          role: 'user',
          credits: 100,
          plan: 'free',
          createdAt: new Date().toISOString(),
        };

        saveMockUser(newUser);
        setMockSession(newUser);
        setCurrentUser(newUser);
        setSuccess(`Account created! Welcome, ${displayName}!`);
      }
    } catch (err: any) {
      setError(err?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      if (isFirebaseReady) {
        const { sendPasswordResetEmail } = await import('firebase/auth');
        const auth = firebaseManager.getAuth();
        if (auth) {
          await sendPasswordResetEmail(auth, email);
          setSuccess('Password reset email sent! Check your inbox.');
        }
      } else {
        await new Promise((r) => setTimeout(r, 600));
        setSuccess('(Mock) Password reset link would be sent to ' + email);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    setMockSession(null);
    setCurrentUser(null);
    setSuccess('Signed out successfully.');
    setEmail(''); setPassword(''); setDisplayName(''); setConfirmPassword('');
  };

  const seedAdminAccount = () => {
    const adminUser: MockUser = {
      uid: 'admin_001',
      email: 'admin@saans.local',
      displayName: 'Admin User',
      role: 'admin',
      credits: 10000,
      plan: 'max',
      createdAt: new Date().toISOString(),
    };
    saveMockUser(adminUser);
    setEmail('admin@saans.local');
    setPassword('admin123');
    setSuccess('Admin credentials pre-filled. Click Sign In to continue.');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Account</h1>
            <p className="text-foreground/70 text-sm">Sign in or create an account</p>
          </div>
          <Button variant="outline" asChild size="sm">
            <a href="/profile">Back to Profile</a>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-4">

          {/* Firebase status badge */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${isFirebaseReady ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isFirebaseReady ? 'bg-green-500' : 'bg-amber-400'}`} />
            {isFirebaseReady ? 'Firebase connected — real authentication active' : 'Mock mode — Firebase not configured (data stored locally)'}
            {!isFirebaseReady && (
              <a href="/firebase-setup" className="ml-auto underline font-semibold">Configure Firebase</a>
            )}
          </div>

          {/* Signed in state */}
          {currentUser ? (
            <Card>
              <CardHeader>
                <CardTitle>Signed In</CardTitle>
                <CardDescription>You are currently signed in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{currentUser.displayName}</p>
                    <p className="text-sm text-foreground/60">{currentUser.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${currentUser.role === 'admin' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'}`}>
                        {currentUser.role}
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium capitalize">
                        {currentUser.plan} plan
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-foreground/60 mb-1">Credits</p>
                    <p className="text-xl font-bold text-foreground">{currentUser.credits.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-foreground/60 mb-1">Member Since</p>
                    <p className="text-sm font-semibold text-foreground">{new Date(currentUser.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>

                {currentUser.role === 'admin' && (
                  <div className="bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">Admin Privileges Active</p>
                    <p className="text-xs text-foreground/60">Admin panel is unlocked. Press Ctrl+Shift+A anywhere in the app to open it.</p>
                    <Button size="sm" variant="outline" asChild className="w-full text-xs">
                      <a href="/profile">Open Admin Panel</a>
                    </Button>
                  </div>
                )}

                {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}

                <Button variant="outline" onClick={handleSignOut} className="w-full">
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                {/* Mode switcher */}
                <div className="flex gap-1 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'login' ? 'bg-card shadow text-foreground' : 'text-foreground/60'}`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'signup' ? 'bg-card shadow text-foreground' : 'text-foreground/60'}`}
                  >
                    Create Account
                  </button>
                </div>
                <CardTitle className="mt-3 text-lg">
                  {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Join Saans & Steps' : 'Reset Password'}
                </CardTitle>
                <CardDescription>
                  {mode === 'login' ? 'Sign in to sync your data and access all features' : mode === 'signup' ? 'Create your account to get started' : 'We\'ll send you a reset link'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="text-xs font-medium text-foreground/70 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Rahul Sharma"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-foreground/70 block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    onKeyDown={(e) => e.key === 'Enter' && (mode === 'login' ? handleLogin() : mode === 'signup' ? handleSignup() : handleForgotPassword())}
                  />
                </div>

                {mode !== 'forgot-password' && (
                  <div>
                    <label className="text-xs font-medium text-foreground/70 block mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring pr-10"
                        onKeyDown={(e) => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div>
                    <label className="text-xs font-medium text-foreground/70 block mb-1">Confirm Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => { setMode('forgot-password'); setError(''); setSuccess(''); }}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm rounded-lg px-3 py-2">
                    {success}
                  </div>
                )}

                <Button
                  onClick={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleForgotPassword}
                  className="w-full"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      {mode === 'login' ? 'Signing in...' : mode === 'signup' ? 'Creating account...' : 'Sending...'}
                    </span>
                  ) : (
                    mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'
                  )}
                </Button>

                {mode === 'forgot-password' && (
                  <button
                    onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    className="w-full text-sm text-foreground/60 hover:text-foreground"
                  >
                    Back to Sign In
                  </button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Admin seed helper */}
          {!currentUser && (
            <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-foreground/70">Demo Admin Account</p>
              <p className="text-xs text-foreground/60">
                Click below to pre-fill admin credentials. The admin account has 10,000 mock credits and Max plan.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs bg-card rounded-lg p-2 font-mono">
                <span className="text-foreground/50">Email:</span>
                <span className="text-foreground">admin@saans.local</span>
                <span className="text-foreground/50">Password:</span>
                <span className="text-foreground">admin123</span>
              </div>
              <Button variant="outline" size="sm" onClick={seedAdminAccount} className="w-full text-xs">
                Use Admin Credentials
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
