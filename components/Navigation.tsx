'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

export const BottomNavigation: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    {
      name: t('nav.today', 'Today'),
      href: '/',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 3h18v18H3z" /><path d="M3 9h18M9 21V9" />
        </svg>
      ),
      active: pathname === '/',
    },
    {
      name: t('nav.planner', 'Planner'),
      href: '/planner',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
      active: pathname === '/planner',
    },
    {
      name: t('nav.watch', 'Watch'),
      href: '/watch',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
        </svg>
      ),
      active: pathname === '/watch',
    },
    {
      name: t('nav.profile', 'Profile'),
      href: '/profile',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      ),
      active: pathname === '/profile',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 md:hidden" aria-label="Bottom navigation">
      <div className="grid grid-cols-4 h-20">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 border-r border-border last:border-r-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              item.active
                ? 'bg-primary/5 text-primary'
                : 'text-foreground/70 hover:text-foreground'
            )}
            aria-current={item.active ? 'page' : undefined}
            aria-label={item.name}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export const TopNavigation: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { name: t('nav.today', 'Today'), href: '/', icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 3h18v18H3z" /><path d="M3 9h18M9 21V9" />
      </svg>
    ) },
    { name: t('nav.planner', 'Planner'), href: '/planner', icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ) },
    { name: t('nav.watch', 'Watch'), href: '/watch', icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ) },
    { name: t('nav.profile', 'Profile'), href: '/profile', icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ) },
  ];

  return (
    <nav className="hidden md:block fixed top-0 left-0 right-0 bg-card border-b border-border z-40" aria-label="Main navigation">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2a10 10 0 0 1 10 10" /><path d="M2 12a10 10 0 0 0 10 10" />
            <path d="M9 3.5C5 5 2.5 9 2.5 12" /><path d="M15 20.5C19 19 21.5 15 21.5 12" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          <span>Saans &amp; Steps</span>
        </Link>

        <div className="flex items-center justify-between flex-1 ml-12">
          {/* Main Navigation */}
          <div className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 transition-colors px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  pathname === item.href
                    ? 'text-primary font-semibold bg-primary/10'
                    : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
                )}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Right-side Controls */}
          <div className="flex items-center gap-3 border-l border-border/30 pl-6">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};
