import React, { useEffect, useRef } from 'react';

interface MagicTrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  decay: number;
  color: string;
  glowColor: string;
  char?: string;
  rotation: number;
  vRot: number;
}

interface MagicWandTrailProps {
  isActive?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const MagicWandTrail: React.FC<MagicWandTrailProps> = ({ isActive = true, containerRef }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<MagicTrailParticle[]>([]);
  const lastPosRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const wandTipPosRef = useRef<{ x: number; y: number; visible: boolean }>({ x: -100, y: -100, visible: false });

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const colors = [
      { core: '#fffbeb', glow: '#fbbf24' }, // Warm golden light
      { core: '#fef08a', glow: '#f59e0b' }, // Bright amber
      { core: '#fde047', glow: '#d97706' }, // Deep sunbeam
      { core: '#ffffff', glow: '#fde68a' }, // Pure white spark
      { core: '#fce7f3', glow: '#ec4899' }, // Soft rose stardust
    ];

    const chars = ['✦', '✧', '⋆', '•', '✨'];

    const spawnParticles = (x: number, y: number, count: number, speedMultiplier = 1) => {
      for (let i = 0; i < count; i++) {
        const col = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 1.8 + 0.5) * speedMultiplier;
        const isSparkleChar = Math.random() > 0.65;

        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.4,
          vy: Math.sin(angle) * speed - Math.random() * 0.8, // subtle upward magical drift
          size: Math.random() * 3 + 2,
          alpha: Math.random() * 0.3 + 0.7,
          maxAlpha: 1,
          decay: Math.random() * 0.025 + 0.018,
          color: col.core,
          glowColor: col.glow,
          char: isSparkleChar ? chars[Math.floor(Math.random() * chars.length)] : undefined,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.1,
        });
      }
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const target = containerRef?.current || canvas.parentElement || canvas;
      const rect = target.getBoundingClientRect();

      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      wandTipPosRef.current = { x, y, visible: true };

      const now = performance.now();
      if (lastPosRef.current) {
        const dx = x - lastPosRef.current.x;
        const dy = y - lastPosRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Interpolate along movement vector for silky smooth ribbons of stardust
        if (dist > 4) {
          const steps = Math.min(Math.floor(dist / 6), 8);
          for (let s = 0; s < steps; s++) {
            const ratio = s / steps;
            const ix = lastPosRef.current.x + dx * ratio;
            const iy = lastPosRef.current.y + dy * ratio;
            spawnParticles(ix, iy, 1, 0.8);
          }
          spawnParticles(x, y, 2, 1);
        }
      } else {
        spawnParticles(x, y, 3, 1);
      }

      lastPosRef.current = { x, y, time: now };
    };

    const handlePointerLeave = () => {
      wandTipPosRef.current.visible = false;
      lastPosRef.current = null;
    };

    const targetEl = containerRef?.current || window;
    targetEl.addEventListener('mousemove', handlePointerMove as any, { passive: true });
    targetEl.addEventListener('touchmove', handlePointerMove as any, { passive: true });
    targetEl.addEventListener('mouseleave', handlePointerLeave as any);
    targetEl.addEventListener('touchend', handlePointerLeave as any);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.rotation += p.vRot;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);

        if (p.char) {
          // Render glowing magical star rune
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.font = `${Math.floor(p.size * 3.5)}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.glowColor;
          ctx.shadowBlur = 10;
          ctx.fillText(p.char, 0, 0);
        } else {
          // Render glowing stardust mote
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.glowColor;
          ctx.shadowBlur = p.size * 3;
          ctx.fill();

          // Hot-white center
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }

        ctx.restore();
      }

      // Render glowing wand tip aura when active
      const tip = wandTipPosRef.current;
      if (tip.visible && tip.x >= 0 && tip.y >= 0) {
        ctx.save();
        const time = performance.now() * 0.003;
        const pulse = Math.sin(time) * 0.2 + 0.8;

        // Radiant halo
        const haloGrad = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 22 * pulse);
        haloGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        haloGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.2)');
        haloGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 22 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // 4-pointed golden sparkle at wand tip
        ctx.translate(tip.x, tip.y);
        ctx.rotate(time * 0.6);
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 12;

        const starR = 5 * pulse;
        ctx.beginPath();
        ctx.moveTo(0, -starR * 1.6);
        ctx.quadraticCurveTo(0, 0, starR * 1.6, 0);
        ctx.quadraticCurveTo(0, 0, 0, starR * 1.6);
        ctx.quadraticCurveTo(0, 0, -starR * 1.6, 0);
        ctx.quadraticCurveTo(0, 0, 0, -starR * 1.6);
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      targetEl.removeEventListener('mousemove', handlePointerMove as any);
      targetEl.removeEventListener('touchmove', handlePointerMove as any);
      targetEl.removeEventListener('mouseleave', handlePointerLeave as any);
      targetEl.removeEventListener('touchend', handlePointerLeave as any);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isActive, containerRef]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block pointer-events-none" />
    </div>
  );
};
