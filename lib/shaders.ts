// GLSL Shader system for visual effects
// Used for loading screens, transitions, and background animations

export const VERTEX_SHADER = `
  precision mediump float;
  
  uniform mat4 uMatrix;
  uniform float uTime;
  
  attribute vec3 aPosition;
  attribute vec2 aUv;
  
  varying vec2 vUv;
  varying float vWave;
  
  void main() {
    vUv = aUv;
    
    // Wave distortion
    float wave = sin(aPosition.x * 3.0 + uTime) * 0.1;
    float wave2 = cos(aPosition.y * 2.0 + uTime * 0.5) * 0.05;
    
    vec3 pos = aPosition + vec3(0.0, wave + wave2, 0.0);
    vWave = wave + wave2;
    
    gl_Position = uMatrix * vec4(pos, 1.0);
  }
`;

export const FRAGMENT_SHADER = `
  precision mediump float;
  
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform sampler2D uTexture;
  
  varying vec2 vUv;
  varying float vWave;
  
  void main() {
    // Gradient color mixing
    vec3 color = mix(uColor1, uColor2, vUv.x + sin(uTime) * 0.5);
    
    // Add shimmer effect
    float shimmer = sin(vUv.x * 5.0 + uTime) * 0.5 + 0.5;
    float shimmer2 = cos(vUv.y * 3.0 + uTime * 0.7) * 0.5 + 0.5;
    
    color += (shimmer * shimmer2) * 0.2;
    
    // Blend with wave distortion
    color = mix(color, color * 0.8, abs(vWave) * 0.5);
    
    gl_FragColor = vec4(color, 0.95);
  }
`;

// Noise-based shader for organic transitions
export const NOISE_FRAGMENT_SHADER = `
  precision highp float;
  
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uNoiseScale;
  
  varying vec2 vUv;
  
  // Perlin noise simulation
  float noise(vec2 p) {
    return sin(p.x * 12.9898 + p.y * 78.233) * 43758.5453 * sin(uTime * 0.5);
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Multi-octave noise
    float n = noise(uv * uNoiseScale);
    n += 0.5 * noise(uv * uNoiseScale * 2.0);
    n += 0.25 * noise(uv * uNoiseScale * 4.0);
    
    // Create flowing pattern
    float pattern = sin(uv.y * 3.0 + uTime + n) * 0.5 + 0.5;
    
    gl_FragColor = vec4(uColor * pattern, 0.9);
  }
`;

// Shader for glassmorphism effect
export const GLASS_FRAGMENT_SHADER = `
  precision mediump float;
  
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform sampler2D uBackgroundTexture;
  
  varying vec2 vUv;
  
  void main() {
    // Create frosted glass effect with light refraction
    vec2 distortedUv = vUv;
    
    // Subtle wave distortion
    distortedUv.x += sin(vUv.y * 10.0 + uTime) * 0.02;
    distortedUv.y += cos(vUv.x * 8.0 + uTime * 0.7) * 0.02;
    
    // Sample background with distortion
    vec4 background = texture2D(uBackgroundTexture, distortedUv);
    
    // Create frosted look with gradient overlay
    float fresnel = pow(1.0 - abs(vUv.y - 0.5) * 2.0, 3.0);
    
    // Mix colors for glass effect
    vec4 glassColor = vec4(mix(uBaseColor * 0.9, vec3(1.0), fresnel * 0.3), 0.8);
    
    gl_FragColor = mix(background, glassColor, 0.4);
  }
`;

export class ShaderRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private startTime: number = Date.now();

  constructor(canvas: HTMLCanvasElement, type: 'default' | 'noise' | 'glass' = 'default') {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;

    // Create shader program
    this.program = this.createProgram(
      type === 'noise' ? NOISE_FRAGMENT_SHADER : type === 'glass' ? GLASS_FRAGMENT_SHADER : FRAGMENT_SHADER
    );
  }

  private createProgram(fragmentShader: string): WebGLProgram {
    const vs = this.compileShader(VERTEX_SHADER, this.gl.VERTEX_SHADER);
    const fs = this.compileShader(fragmentShader, this.gl.FRAGMENT_SHADER);

    const program = this.gl.createProgram()!;
    this.gl.attachShader(program, vs);
    this.gl.attachShader(program, fs);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program link error');
    }

    return program;
  }

  private compileShader(source: string, type: number): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
    }

    return shader;
  }

  render(color1: [number, number, number] = [1.0, 0.6, 0.2], color2: [number, number, number] = [0.08, 0.53, 0.04]): void {
    const time = (Date.now() - this.startTime) / 1000;

    this.gl.useProgram(this.program);

    // Set uniforms
    const timeLocation = this.gl.getUniformLocation(this.program, 'uTime');
    const color1Location = this.gl.getUniformLocation(this.program, 'uColor1');
    const color2Location = this.gl.getUniformLocation(this.program, 'uColor2');

    this.gl.uniform1f(timeLocation, time);
    this.gl.uniform3f(color1Location, ...color1);
    this.gl.uniform3f(color2Location, ...color2);

    // Draw full screen quad
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  destroy(): void {
    this.gl.deleteProgram(this.program);
  }
}
