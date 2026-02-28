'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

export const BottomNavigation: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Today',
      href: '/',
      icon: '📊',
      description: 'Real-time AQI & workout windows',
      active: pathname === '/',
    },
    {
      name: 'Planner',
      href: '/planner',
      icon: '📅',
      description: '7-day forecast',
      active: pathname === '/planner',
    },
    {
      name: 'Watch',
      href: '/watch',
      icon: '👁️',
      description: 'Multi-city monitoring',
      active: pathname === '/watch',
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: '⚙️',
      description: 'Settings & preferences',
      active: pathname === '/profile',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 md:hidden">
      <div className="grid grid-cols-4 h-20">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 border-r border-border last:border-r-0 transition-colors',
              item.active
                ? 'bg-primary/5 text-primary'
                : 'text-foreground/70 hover:text-foreground'
            )}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export const TopNavigation: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Today', href: '/', icon: '📊' },
    { name: 'Planner', href: '/planner', icon: '📅' },
    { name: 'Watch', href: '/watch', icon: '👁️' },
    { name: 'Profile', href: '/profile', icon: '⚙️' },
  ];

  return (
    <nav className="hidden md:block fixed top-0 left-0 right-0 bg-card border-b border-border z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
          <span className="text-2xl">🌬️</span>
          Saans & Steps
        </Link>

        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-1 transition-colors px-3 py-2 rounded-lg',
                pathname === item.href
                  ? 'text-primary font-semibold bg-primary/10'
                  : 'text-foreground/70 hover:text-foreground'
              )}
            >
              <span>{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
          <div className="border-l border-border pl-8 flex items-center gap-4">
            <ThemeSwitcher />
            <div className="border-l border-border pl-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
