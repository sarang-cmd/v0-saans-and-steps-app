'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'subtle';
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  hover = true,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl backdrop-blur-xl transition-all duration-300',
        variant === 'default' && 'bg-white/10 border border-white/20 shadow-lg shadow-black/5',
        variant === 'strong' && 'bg-white/15 border border-white/25 shadow-xl shadow-black/10',
        variant === 'subtle' && 'bg-white/5 border border-white/10 shadow-md shadow-black/2',
        hover && 'hover:bg-white/15 hover:shadow-xl hover:border-white/30 hover:scale-105',
        className
      )}
    >
      {children}
    </div>
  );
}
