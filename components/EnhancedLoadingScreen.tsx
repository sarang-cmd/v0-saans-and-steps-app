'use client';

import React, { useEffect, useRef } from 'react';
import { LoadingSpinner3D } from '@/components/3D/LoadingSpinner3D';
import { GlassCard } from '@/components/GlassCard';

export function EnhancedLoadingScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.01;

      // Clear with gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(255, 153, 51, 0.02)');
      gradient.addColorStop(0.5, 'rgba(11, 125, 186, 0.02)');
      gradient.addColorStop(1, 'rgba(19, 136, 8, 0.02)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw animated particles
      const particleCount = 30;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + time;
        const radius = 100 + Math.sin(time + i) * 50;
        const x = canvas.width / 2 + Math.cos(angle) * radius;
        const y = canvas.height / 2 + Math.sin(angle) * radius;

        const size = 2 + Math.sin(time + i) * 1;
        const opacity = 0.3 + Math.sin(time + i * 0.5) * 0.3;

        // Alternate colors based on particle index
        const colors = ['#FF9933', '#138808', '#0B7DBA'];
        ctx.fillStyle = colors[i % 3] + Math.floor(opacity * 255).toString(16).padStart(2, '0');

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw connecting lines
      ctx.strokeStyle = 'rgba(255, 153, 51, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < particleCount; i++) {
        const angle1 = (i / particleCount) * Math.PI * 2 + time;
        const angle2 = ((i + 1) / particleCount) * Math.PI * 2 + time;
        const radius1 = 100 + Math.sin(time + i) * 50;
        const radius2 = 100 + Math.sin(time + i + 1) * 50;

        const x1 = canvas.width / 2 + Math.cos(angle1) * radius1;
        const y1 = canvas.height / 2 + Math.sin(angle1) * radius1;
        const x2 = canvas.width / 2 + Math.cos(angle2) * radius2;
        const y2 = canvas.height / 2 + Math.sin(angle2) * radius2;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden">
      {/* Animated background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-40"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-4">
        {/* Glassmorphic container */}
        <GlassCard variant="strong" className="px-12 py-8">
          <div className="flex flex-col items-center gap-6">
            {/* Logo with animation */}
            <div className="animate-float">
              <svg
                width="100"
                height="100"
                viewBox="0 0 1000 1000"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
              >
                <defs>
                  <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#FF9933" />
                  </linearGradient>
                  <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#138808" />
                    <stop offset="100%" stopColor="#228B22" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <circle cx="500" cy="380" r="120" fill="url(#sunGradient)" filter="url(#glow)" />

                <g stroke="url(#sunGradient)" strokeWidth="30" strokeLinecap="round" strokeOpacity="0.9">
                  <line x1="500" y1="180" x2="500" y2="80" />
                  <line x1="500" y1="680" x2="500" y2="780" />
                  <line x1="300" y1="380" x2="160" y2="380" />
                  <line x1="700" y1="380" x2="840" y2="380" />
                  <line x1="320" y1="210" x2="220" y2="110" />
                  <line x1="680" y1="550" x2="780" y2="650" />
                  <line x1="680" y1="210" x2="780" y2="110" />
                  <line x1="320" y1="550" x2="220" y2="650" />
                </g>

                <path
                  d="M 350 480 Q 350 420 400 420 Q 410 380 460 380 Q 510 380 510 440 Q 560 440 600 480 Q 600 540 540 560 L 360 560 Q 350 540 350 480 Z"
                  fill="white"
                  opacity="0.95"
                />

                <g transform="translate(520, 510)">
                  <path
                    d="M 0 0 Q 40 -20 60 40 Q 50 60 20 70 Q -10 60 0 0 Z"
                    fill="url(#leafGradient)"
                    stroke="url(#leafGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M 10 15 Q 25 10 35 30" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
                </g>
              </svg>
            </div>

            {/* 3D Spinner */}
            <LoadingSpinner3D />

            {/* Loading text */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Saans & Steps</h2>
              <p className="text-sm text-foreground/60 animate-pulse">
                Initializing your air quality experience...
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-48 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary via-accent to-secondary loading-bar" />
            </div>
          </div>
        </GlassCard>

        {/* Footer text */}
        <p className="text-xs text-foreground/50 max-w-sm text-center">
          Powered by real OpenAQ and MET Norway data
        </p>
      </div>
    </div>
  );
}
