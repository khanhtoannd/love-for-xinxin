import React, { useEffect, useRef } from 'react';
import { translations } from '../translations';

class Particle {
  text: string;
  ring: number;
  angle: number;
  speed: number;
  radius: number;
  jitterSeed: number;
  offsetX: number;
  offsetY: number;
  posX: number;
  posY: number;
  isFeatured: boolean;
  fontSize: number;
  pulseSpeed: number;
  pulseOffset: number;

  constructor(width: number, height: number, text: string, ring: number, ringIndex: number, ringTextsLength: number) {
    this.text = text;
    this.ring = ring;
    
    const isPhone = width <= 760;
    const baseRadius = Math.min(width, height) * (isPhone ? 0.24 : 0.3);
    const ringGap = Math.min(width, height) * (isPhone ? 0.066 : 0.08);
    
    const spread = (ringIndex / ringTextsLength) * Math.PI * 2;
    this.angle = spread + ring * 0.24 + (ring % 2) * 0.08;
    this.speed = 0.00034 + ring * 0.00007;
    this.radius = baseRadius + ring * ringGap + Math.random() * 14;
    
    this.jitterSeed = Math.random() * Math.PI * 2;
    this.offsetX = 0;
    this.offsetY = 0;
    this.posX = width / 2;
    this.posY = height / 2;
    
    this.isFeatured = text.toLowerCase().includes("anh nhớ em") || text.toLowerCase().includes("anh yêu em") || text.toLowerCase().includes("i love you");
    
    const vw = width / 100;
    this.fontSize = isPhone ? 
      Math.max(9, Math.min(vw * 2.3, 13.4)) : 
      Math.max(10.5, Math.min(vw * 1.02, 16.8));
      
    if (this.isFeatured) {
      this.fontSize = isPhone ? 
        Math.max(11.5, Math.min(vw * 3.1, 16.3)) : 
        Math.max(13.7, Math.min(vw * 1.35, 21));
    }
    
    this.pulseSpeed = 0.0008 + Math.random() * 0.0012;
    this.pulseOffset = Math.random() * Math.PI * 2;
  }

  update(pointerX: number, pointerY: number, time: number, width: number, height: number, particles: Particle[]) {
    const cx = width / 2;
    const cy = height / 2;
    const isPhone = width <= 760;
    
    this.angle += this.speed;
    
    const wobble = Math.sin(time * 0.00095 + this.jitterSeed) * 9;
    const orbitRadius = this.radius + wobble;
    const targetX = cx + Math.cos(this.angle) * orbitRadius;
    const targetY = cy + Math.sin(this.angle) * orbitRadius * 0.72;
    
    const dx = targetX + this.offsetX - pointerX;
    const dy = targetY + this.offsetY - pointerY;
    const dist = Math.hypot(dx, dy);
    const forceRange = isPhone ? 130 : 160;
    
    if (dist < forceRange && dist > 0.0001) {
      const strength = Math.pow(1 - dist / forceRange, 1.8);
      const push = strength * (isPhone ? 7.2 : 9.5);
      this.offsetX += (dx / dist) * push;
      this.offsetY += (dy / dist) * push;
    }

    // Clustering logic (Cohesion & Separation)
    let cohesionX = 0;
    let cohesionY = 0;
    let separationX = 0;
    let separationY = 0;
    let neighborCount = 0;
    const neighborRadius = isPhone ? 70 : 100;
    const separationRadius = isPhone ? 30 : 45;

    for (let i = 0; i < particles.length; i++) {
      const other = particles[i];
      if (other === this) continue;

      const ndx = other.posX - this.posX;
      const ndy = other.posY - this.posY;
      const ndistSq = ndx * ndx + ndy * ndy;

      if (ndistSq < neighborRadius * neighborRadius) {
        const ndist = Math.sqrt(ndistSq);
        cohesionX += other.posX;
        cohesionY += other.posY;
        neighborCount++;

        if (ndist < separationRadius && ndist > 0.001) {
          const force = (separationRadius - ndist) / separationRadius;
          separationX -= (ndx / ndist) * force;
          separationY -= (ndy / ndist) * force;
        }
      }
    }

    if (neighborCount > 0) {
      cohesionX /= neighborCount;
      cohesionY /= neighborCount;

      // Pull towards neighbors (Cohesion)
      this.offsetX += (cohesionX - this.posX) * 0.012;
      this.offsetY += (cohesionY - this.posY) * 0.012;

      // Push away from too-close neighbors (Separation) to prevent overlaying
      this.offsetX += separationX * 1.5;
      this.offsetY += separationY * 1.5;
    }
    
    this.offsetX *= 0.93;
    this.offsetY *= 0.93;
    
    this.posX += (targetX + this.offsetX - this.posX) * 0.09;
    this.posY += (targetY + this.offsetY - this.posY) * 0.09;
  }

  draw(ctx: CanvasRenderingContext2D, time: number) {
    const pulse = Math.sin(time * this.pulseSpeed + this.pulseOffset);
    
    if (this.isFeatured) {
      ctx.font = `600 ${this.fontSize}px "Inter", sans-serif`;
      const sparkle = Math.sin(time * 0.0022);
      const brightness = 0.95 + (sparkle + 1) * 0.15;
      
      ctx.fillStyle = '#fff2fa';
      ctx.globalAlpha = 0.98;
      ctx.shadowColor = `rgba(255, 128, 188, ${0.8 * brightness})`;
      ctx.shadowBlur = 18;
      ctx.fillText(this.text, this.posX, this.posY);
      ctx.shadowBlur = 0;
    } else {
      ctx.font = `400 ${this.fontSize}px "Inter", sans-serif`;
      
      const opacity = 0.34 + (this.ring + 1) * 0.07;
      
      ctx.fillStyle = `rgba(255, 233, 244, 0.9)`;
      ctx.globalAlpha = Math.min(opacity, 0.84);
      ctx.shadowColor = 'rgba(255, 130, 195, 0.3)';
      ctx.shadowBlur = 10;
      ctx.fillText(this.text, this.posX, this.posY);
      ctx.shadowBlur = 0;
    }
  }
}

export default function LoveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let time = 0;

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let hasPointer = false;

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const isPhone = window.innerWidth <= 760;
      const ringCount = isPhone ? 6 : 8;
      const rings: string[][] = Array.from({ length: ringCount }, () => []);
      
      translations.forEach((text, index) => {
        rings[index % ringCount].push(text);
      });
      
      particles = [];
      rings.forEach((ringTexts, ring) => {
        ringTexts.forEach((text, ringIndex) => {
          particles.push(new Particle(window.innerWidth, window.innerHeight, text, ring, ringIndex, ringTexts.length));
        });
      });
    };

    const animate = (now: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      if (!hasPointer) {
        const idleRadius = Math.min(window.innerWidth, window.innerHeight) * 0.09;
        pointerX = (window.innerWidth / 2) + Math.cos(now * 0.00015) * idleRadius;
        pointerY = (window.innerHeight / 2) + Math.sin(now * 0.00012) * idleRadius;
      }

      particles.forEach(p => {
        p.update(pointerX, pointerY, now, window.innerWidth, window.innerHeight, particles);
        p.draw(ctx, now);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      hasPointer = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        pointerX = e.touches[0].clientX;
        pointerY = e.touches[0].clientY;
        hasPointer = true;
      }
    };

    const handleMouseLeave = () => {
      hasPointer = false;
    };

    window.addEventListener('resize', init);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchend', handleMouseLeave);

    init();
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchend', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-auto touch-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}
