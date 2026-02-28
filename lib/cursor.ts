// Cursor system with multiple theme options
// Matches the app's design aesthetic

export type CursorTheme = 'default' | 'glow' | 'gradient' | 'minimal' | 'dot';

interface CursorConfig {
  theme: CursorTheme;
  size: number;
  color: string;
  trailLength: number;
}

const CURSOR_CONFIGS: Record<CursorTheme, Partial<CursorConfig>> = {
  default: {
    size: 24,
    color: '#FF9933',
    trailLength: 5,
  },
  glow: {
    size: 20,
    color: '#FF9933',
    trailLength: 8,
  },
  gradient: {
    size: 22,
    color: '#138808',
    trailLength: 6,
  },
  minimal: {
    size: 16,
    color: '#0B7DBA',
    trailLength: 0,
  },
  dot: {
    size: 12,
    color: '#FF9933',
    trailLength: 4,
  },
};

export class CursorManager {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private x = 0;
  private y = 0;
  private trail: Array<{ x: number; y: number }> = [];
  private config: CursorConfig;
  private animationId: number | null = null;

  constructor(theme: CursorTheme = 'default') {
    this.config = {
      theme,
      ...CURSOR_CONFIGS[theme],
    } as CursorConfig;
  }

  setTheme(theme: CursorTheme): void {
    this.config.theme = theme;
    Object.assign(this.config, CURSOR_CONFIGS[theme]);
  }

  initialize(): void {
    // Create canvas for cursor
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
    `;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');

    // Hide default cursor
    document.body.style.cursor = 'none';

    // Track mouse
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('mousedown', (e) => this.onMouseDown(e));
    document.addEventListener('mouseup', (e) => this.onMouseUp(e));
    window.addEventListener('resize', () => this.onResize());

    // Start animation loop
    this.animate();
  }

  private onMouseMove(e: MouseEvent): void {
    this.x = e.clientX;
    this.y = e.clientY;

    // Add trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.config.trailLength) {
      this.trail.shift();
    }
  }

  private onMouseDown(e: MouseEvent): void {
    if (this.ctx) {
      // Draw click ripple
      this.ctx.fillStyle = `${this.config.color}44`;
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, this.config.size * 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private onMouseUp(_e: MouseEvent): void {
    // Clear on mouseup
  }

  private onResize(): void {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  private animate(): void {
    if (!this.ctx || !this.canvas) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw trail
    for (let i = 0; i < this.trail.length; i++) {
      const point = this.trail[i];
      const opacity = (i / this.trail.length) * 0.6;
      const size = (this.config.size * (i / this.trail.length)) * 0.7;

      if (this.config.theme === 'glow') {
        // Glow effect
        this.ctx.fillStyle = `${this.config.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        this.ctx.fill();

        // Glow blur
        this.ctx.shadowColor = this.config.color;
        this.ctx.shadowBlur = 15;
      } else if (this.config.theme === 'gradient') {
        // Gradient trail
        const gradient = this.ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, size * 2);
        gradient.addColorStop(0, `${this.config.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${this.config.color}00`);
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, size * 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // Draw main cursor
    this.ctx.shadowColor = 'transparent';
    this.ctx.fillStyle = this.config.color;

    if (this.config.theme === 'minimal' || this.config.theme === 'dot') {
      // Simple circle
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, this.config.size / 2, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // Default cursor with border
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, this.config.size / 2, 0, Math.PI * 2);
      this.ctx.fill();

      // Outer ring
      this.ctx.strokeStyle = `${this.config.color}66`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, this.config.size / 1.5, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas) {
      this.canvas.remove();
    }
    document.body.style.cursor = 'auto';
  }
}
