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
  const cursorPosRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const isHoveringTargetRef = useRef<boolean>(false);
  const hoverIntensityRef = useRef<number>(0);

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

    const spawnSparks = (x: number, y: number, count = 2, isGoldenBurst = false) => {
      const colors = isGoldenBurst
        ? ['#fef08a', '#fde047', '#fbbf24', '#f59e0b', '#ffffff']
        : ['#fef08a', '#fde047', '#fbbf24', '#f472b6', '#ffffff'];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = isGoldenBurst ? Math.random() * 2.4 + 0.6 : Math.random() * 1.8 + 0.4;
        sparksRef.current.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - (isGoldenBurst ? 0.6 : 0.4), // float up gently
          size: Math.random() * (isGoldenBurst ? 3.4 : 2.8) + 1.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.95,
          decay: Math.random() * 0.025 + 0.018,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.12,
          isStar: Math.random() > 0.35,
        });
      }

      if (sparksRef.current.length > 110) {
        sparksRef.current.splice(0, sparksRef.current.length - 110);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      const x = e.clientX;
      const y = e.clientY;

      cursorPosRef.current = { x, y };

      // Detect if cursor is hovering over Super Witch or interactive objects like light lanterns
      try {
        const elem = document.elementFromPoint(x, y);
        if (elem) {
          const isInteractive = !!elem.closest(
            '[data-character="witch"], [data-character="human_witch"], [data-interactive="witch"], [data-interactive="sun-lantern"], [data-interactive="lantern"], [data-interactive="true"], #btn-light-meter-widget, #title-sun-lantern, .interactive-lantern, [id*="lantern"]'
          );
          isHoveringTargetRef.current = isInteractive;
        } else {
          isHoveringTargetRef.current = false;
        }
      } catch {
        isHoveringTargetRef.current = false;
      }

      trailPointsRef.current.push({ x, y, time: now });
      if (trailPointsRef.current.length > 25) {
        trailPointsRef.current.shift();
      }

      // Check distance moved to spawn sparks
      if (!lastPosRef.current) {
        lastPosRef.current = { x, y };
        spawnSparks(x, y, 2, isHoveringTargetRef.current);
      } else {
        const dx = x - lastPosRef.current.x;
        const dy = y - lastPosRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 6) {
          spawnSparks(x, y, Math.min(4, Math.floor(dist / 6)), isHoveringTargetRef.current);
          lastPosRef.current = { x, y };
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      spawnSparks(e.clientX, e.clientY, 10, isHoveringTargetRef.current);
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

      // Smoothly interpolate hover intensity for soft expansion and pulse transitions
      const targetHover = isHoveringTargetRef.current ? 1 : 0;
      hoverIntensityRef.current += (targetHover - hoverIntensityRef.current) * 0.12;
      const hIntensity = hoverIntensityRef.current;

      // Clean old trail points (> 450ms)
      trailPointsRef.current = trailPointsRef.current.filter((p) => now - p.time < 450);

      // Draw Glowing Wand Trail Ribbon with expanded width & warmth if hovering
      if (trailPointsRef.current.length > 2) {
        const points = trailPointsRef.current;
        for (let i = 1; i < points.length; i++) {
          const p1 = points[i - 1];
          const p2 = points[i];
          const age = (now - p2.time) / 450;
          const alpha = Math.max(0, 1 - age) * (0.7 + hIntensity * 0.25);
          const lineWidth = ((1 - age) * 5 + 1) * (1 + hIntensity * 0.4);

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`;
          ctx.lineWidth = lineWidth;
          ctx.lineCap = 'round';
          ctx.shadowBlur = 10 + hIntensity * 6;
          ctx.shadowColor = '#f59e0b';
          ctx.stroke();

          // Inner bright core
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
          ctx.lineWidth = lineWidth * 0.45;
          ctx.stroke();

          ctx.restore();
        }
      }

      // Render Soft Golden Expanding Pulse Wave when hovering over Super Witch or Lanterns
      if (hIntensity > 0.01 && cursorPosRef.current.x > 0) {
        const { x, y } = cursorPosRef.current;

        // Pulse Phase Calculations
        const pulseCycle = (now % 1600) / 1600; // 0 to 1 smooth repeating wave
        const waveRadius1 = 12 + pulseCycle * 32; // expands from 12px to 44px
        const waveAlpha1 = (1 - pulseCycle) * 0.75 * hIntensity;

        const pulseCycle2 = ((now + 800) % 1600) / 1600;
        const waveRadius2 = 12 + pulseCycle2 * 32;
        const waveAlpha2 = (1 - pulseCycle2) * 0.6 * hIntensity;

        const breathingHaloRadius = (16 + Math.sin(now * 0.006) * 4) * (1 + hIntensity * 0.35);

        ctx.save();

        // 1. Soft Radial Ambient Golden Glow Backdrop
        const radialGlow = ctx.createRadialGradient(x, y, 2, x, y, breathingHaloRadius * 1.8);
        radialGlow.addColorStop(0, `rgba(254, 240, 138, ${0.45 * hIntensity})`);
        radialGlow.addColorStop(0.5, `rgba(251, 191, 36, ${0.25 * hIntensity})`);
        radialGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');

        ctx.beginPath();
        ctx.arc(x, y, breathingHaloRadius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = radialGlow;
        ctx.fill();

        // 2. Expanding Golden Pulse Wave 1
        ctx.beginPath();
        ctx.arc(x, y, waveRadius1, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(253, 224, 71, ${waveAlpha1})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#fbbf24';
        ctx.stroke();

        // 3. Expanding Golden Pulse Wave 2 (interleaved harmonic)
        ctx.beginPath();
        ctx.arc(x, y, waveRadius2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 191, 36, ${waveAlpha2})`;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#f59e0b';
        ctx.stroke();

        // 4. Subtle Radiant Rotating Starburst Points on Wand Tip
        const rot = now * 0.0025;
        drawStar(x, y, 7 + hIntensity * 3, rot, '#ffffff', 0.9 * hIntensity);

        ctx.restore();

        // Periodically spawn miniature golden motes while hovering
        if (Math.random() < 0.18 * hIntensity) {
          spawnSparks(x, y, 1, true);
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
