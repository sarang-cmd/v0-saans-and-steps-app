'use client';

import React, { useEffect, useRef } from 'react';

export function TorusBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    containerRef.current.appendChild(canvas);

    canvas.width = containerRef.current.clientWidth;
    canvas.height = containerRef.current.clientHeight;

    let animationId: number;
    let rotation = 0;

    const animate = () => {
      rotation += 0.005;

      // Clear canvas
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw rotating torus
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Multiple rotating rings
      for (let ring = 0; ring < 3; ring++) {
        ctx.save();
        ctx.rotate(rotation + ring * Math.PI / 3);

        // Ring color
        const colors = ['#FF9933', '#138808', '#0B7DBA'];
        ctx.strokeStyle = colors[ring];
        ctx.globalAlpha = 0.6 - ring * 0.15;
        ctx.lineWidth = 2 - ring * 0.5;

        // Draw circle
        ctx.beginPath();
        ctx.arc(0, 0, 150 - ring * 50, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // Inner pulsing circle
      const pulse = Math.sin(rotation * 2) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(255, 153, 51, ${pulse * 0.4})`;
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      canvas.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
}
