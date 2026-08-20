import React, { useEffect, useRef } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

interface MagicSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  rotationSpeed: number;
  isStar: boolean;
}

interface MagicTrailProps {
  enabled?: boolean;
}

export const MagicTrail: React.FC<MagicTrailProps> = ({ enabled = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trailPointsRef = useRef<TrailPoint[]>([]);
  const sparksRef = useRef<MagicSpark[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const spawnSparks = (x: number, y: number, count = 2) => {
      const colors = ['#fef08a', '#fde047', '#fbbf24', '#f472b6', '#ffffff'];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 1.8 + 0.4;
        sparksRef.current.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 0.4, // float up slightly
          size: Math.random() * 2.8 + 1.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.95,
          decay: Math.random() * 0.025 + 0.02,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
          isStar: Math.random() > 0.4,
        });
      }

      if (sparksRef.current.length > 90) {
        sparksRef.current.splice(0, sparksRef.current.length - 90);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      const x = e.clientX;
      const y = e.clientY;

      trailPointsRef.current.push({ x, y, time: now });
      if (trailPointsRef.current.length > 25) {
        trailPointsRef.current.shift();
      }

      // Check distance moved to spawn sparks
      if (!lastPosRef.current) {
        lastPosRef.current = { x, y };
        spawnSparks(x, y, 2);
      } else {
        const dx = x - lastPosRef.current.x;
        const dy = y - lastPosRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 6) {
          spawnSparks(x, y, Math.min(4, Math.floor(dist / 6)));
          lastPosRef.current = { x, y };
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      spawnSparks(e.clientX, e.clientY, 8);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    const drawStar = (cx: number, cy: number, size: number, rot: number, color: string, alpha: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#fbbf24';

      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(0, 0, size, 0);
      ctx.quadraticCurveTo(0, 0, 0, size);
      ctx.quadraticCurveTo(0, 0, -size, 0);
      ctx.quadraticCurveTo(0, 0, 0, -size);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const now = performance.now();

      // Clean old trail points (> 450ms)
      trailPointsRef.current = trailPointsRef.current.filter((p) => now - p.time < 450);

      // Draw Glowing Wand Trail Ribbon
      if (trailPointsRef.current.length > 2) {
        const points = trailPointsRef.current;
        for (let i = 1; i < points.length; i++) {
          const p1 = points[i - 1];
          const p2 = points[i];
          const age = (now - p2.time) / 450;
          const alpha = Math.max(0, 1 - age) * 0.7;
          const lineWidth = (1 - age) * 5 + 1;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`;
          ctx.lineWidth = lineWidth;
          ctx.lineCap = 'round';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#f59e0b';
          ctx.stroke();

          // Inner bright core
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
          ctx.lineWidth = lineWidth * 0.45;
          ctx.stroke();

          ctx.restore();
        }
      }

      // Update & Render Sparks
      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const s = sparksRef.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;
        s.rotation += s.rotationSpeed;

        if (s.alpha <= 0) {
          sparksRef.current.splice(i, 1);
          continue;
        }

        if (s.isStar) {
          drawStar(s.x, s.y, s.size, s.rotation, s.color, s.alpha);
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = s.alpha;
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#fbbf24';
          ctx.fill();
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animId);
    };
  }, [enabled]);

  return (
    <canvas
      ref={canvasRef}
      id="magic-wand-trail-canvas"
      className="fixed inset-0 z-40 pointer-events-none w-full h-full block select-none"
    />
  );
};
