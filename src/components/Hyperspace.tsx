import React, { useEffect, useRef } from 'react';

export default function Hyperspace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    // Increased particle count specifically to define the heart shape better
    const numParticles = window.innerWidth <= 760 ? 350 : 750;
    const speed = 4;

    // Helper function that places particles exactly along a 3D heart curve!
    const getHeartPoint = () => {
      const t = Math.random() * Math.PI * 2;
      const isPhone = window.innerWidth <= 760;
      
      // Scaling for the mathematical heart formula
      const scale = isPhone ? 22 : 45; 
      const spreadScale = scale + (Math.random() * (isPhone ? 5 : 10)); // Much tighter spread
      
      // Standard parametric equations for a heart curve
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      
      // Ultra tight noise to define a clear, sharp cylinder/tube wall
      const noiseX = (Math.random() - 0.5) * (isPhone ? 15 : 25);
      const noiseY = (Math.random() - 0.5) * (isPhone ? 15 : 25);
      
      return {
        x: hx * spreadScale + noiseX,
        y: hy * spreadScale + noiseY - (isPhone ? 30 : 60)
      };
    };

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        const pt = getHeartPoint();
        particles.push({
          x: pt.x,
          y: pt.y,
          z: Math.random() * 2000 + 50,
          lengthCoef: Math.random() * 1.5 + 0.5,
          color: Math.random() > 0.15 ? '#ffffff' : '#ffd1e8'
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      
      ctx.lineCap = 'round';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        p.z -= speed;
        // Reset particle when it flies past the camera to create infinite loop
        if (p.z <= 10) {
          const pt = getHeartPoint();
          p.x = pt.x;
          p.y = pt.y;
          p.z = 2000;
          p.lengthCoef = Math.random() * 1.5 + 0.5;
        }

        const fov = 350;
        
        // Project 3D placement onto 2D canvas
        const px = (p.x / p.z) * fov + cx;
        const py = (p.y / p.z) * fov + cy;
        
        // Find tail coordinates for the trail line
        const pzPrev = p.z + speed * 12 * p.lengthCoef;
        const prevPx = (p.x / pzPrev) * fov + cx;
        const prevPy = (p.y / pzPrev) * fov + cy;

        ctx.beginPath();
        ctx.moveTo(prevPx, prevPy);
        ctx.lineTo(px, py);
        
        // They grow visually thicker as they travel closer
        const thick = Math.max(0.2, (1 - p.z / 2000) * 1.8);
        ctx.lineWidth = thick;
        
        ctx.strokeStyle = p.color;
        // Fade in based gracefully on distance instead of screen position 
        // to avoid putting a dark hole in the middle of our heart design
        const alpha = Math.min(1, Math.max(0, 1.8 - (p.z / 1000))); 
        ctx.globalAlpha = alpha;
        
        ctx.shadowBlur = 4 + thick * 2;
        ctx.shadowColor = '#ff1a8c'; 
        
        ctx.stroke();

        // Draw a tiny flying heart at the head of the streak
        const heartSize = Math.max(1.2, (1 - p.z / 2000) * 7);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(px, py - heartSize * 0.2);
        ctx.bezierCurveTo(px + heartSize * 0.6, py - heartSize * 0.8, px + heartSize * 1.2, py + heartSize * 0.2, px, py + heartSize);
        ctx.bezierCurveTo(px - heartSize * 1.2, py + heartSize * 0.2, px - heartSize * 0.6, py - heartSize * 0.8, px, py - heartSize * 0.2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', init);
    init();
    animate();

    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ mixBlendMode: 'screen' }} />;
}
