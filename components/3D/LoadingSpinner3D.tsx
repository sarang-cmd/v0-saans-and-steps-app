'use client';

import React, { useEffect, useRef } from 'react';

export function LoadingSpinner3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create SVG-based 3D rotating spinner
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('width', '80');
    svg.setAttribute('height', '80');

    // Orange rotating ring (saffron)
    const ring1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring1.setAttribute('cx', '50');
    ring1.setAttribute('cy', '50');
    ring1.setAttribute('r', '40');
    ring1.setAttribute('fill', 'none');
    ring1.setAttribute('stroke', '#FF9933');
    ring1.setAttribute('stroke-width', '4');
    ring1.setAttribute('stroke-dasharray', '62.8 188.4');
    ring1.setAttribute('opacity', '0.8');
    ring1.style.animation = 'spin 2s linear infinite';

    // Green rotating ring (leaf)
    const ring2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring2.setAttribute('cx', '50');
    ring2.setAttribute('cy', '50');
    ring2.setAttribute('r', '30');
    ring2.setAttribute('fill', 'none');
    ring2.setAttribute('stroke', '#138808');
    ring2.setAttribute('stroke-width', '3');
    ring2.setAttribute('stroke-dasharray', '47.1 141.3');
    ring2.setAttribute('opacity', '0.7');
    ring2.style.animation = 'spin 3s linear infinite reverse';

    // Blue rotating ring (accent)
    const ring3 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring3.setAttribute('cx', '50');
    ring3.setAttribute('cy', '50');
    ring3.setAttribute('r', '50');
    ring3.setAttribute('fill', 'none');
    ring3.setAttribute('stroke', '#0B7DBA');
    ring3.setAttribute('stroke-width', '2');
    ring3.setAttribute('stroke-dasharray', '31.4 94.2');
    ring3.setAttribute('opacity', '0.5');
    ring3.style.animation = 'spin 4s linear infinite';

    svg.appendChild(ring1);
    svg.appendChild(ring2);
    svg.appendChild(ring3);

    containerRef.current.appendChild(svg);

    // Add animation styles
    if (!document.querySelector('style[data-3d-spinner]')) {
      const style = document.createElement('style');
      style.setAttribute('data-3d-spinner', 'true');
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      svg.remove();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div ref={containerRef} className="flex items-center justify-center" />
      <p className="text-sm text-foreground/60 animate-pulse">Loading Saans & Steps...</p>
    </div>
  );
}
