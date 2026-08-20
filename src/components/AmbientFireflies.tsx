import React, { useEffect, useRef } from 'react';
import { SceneLocation, WeatherType } from '../types';

interface AmbientFirefliesProps {
  location?: SceneLocation;
  weather?: WeatherType;
}

interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  currentRadius: number;
  pulsePhase: number;
  pulseSpeed: number;
  pulseMagnitude: number;
  baseAlpha: number;
  alpha: number;
  color: string;
  glowColor: string;
  wanderAngle: number;
  wanderSpeed: number;
}

export const AmbientFireflies: React.FC<AmbientFirefliesProps> = ({ location, weather }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check if current scene is a forest or evening scene
  const isForestOrEvening =
    location === 'whispering_forest' ||
    location === 'cottage_twilight' ||
    location === 'bottle_path' ||
    location === 'sea_shore_dusk' ||
    weather === 'starlight';

  useEffect(() => {
    if (!isForestOrEvening) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Number of fireflies based on scene
    const fireflyCount = location === 'whispering_forest' ? 24 : location === 'cottage_twilight' ? 18 : 14;
    const fireflies: Firefly[] = [];

    const colors = [
      { core: '#fef08a', glow: '#a3e635' }, // Chartreuse Gold
      { core: '#fde047', glow: '#84cc16' }, // Forest Lime
      { core: '#fef9c3', glow: '#fbbf24' }, // Soft Amber
      { core: '#d9f99d', glow: '#4ade80' }, // Spring Green Glow
    ];

    for (let i = 0; i < fireflyCount; i++) {
      const col = colors[Math.floor(Math.random() * colors.length)];
      const baseR = Math.random() * 1.6 + 1.4;
      fireflies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.35,
        baseRadius: baseR,
        currentRadius: baseR,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.028 + 0.018, // Breathing rhythm matching forest ambience
        pulseMagnitude: Math.random() * 1.8 + 1.2,
        baseAlpha: Math.random() * 0.4 + 0.5,
        alpha: 0.7,
        color: col.core,
        glowColor: col.glow,
        wanderAngle: Math.random() * Math.PI * 2,
        wanderSpeed: (Math.random() - 0.5) * 0.04,
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      for (let i = 0; i < fireflies.length; i++) {
        const f = fireflies[i];

        // Meandering gentle flight path
        f.wanderAngle += f.wanderSpeed;
        f.vx += Math.cos(f.wanderAngle) * 0.025;
        f.vy += Math.sin(f.wanderAngle) * 0.025;

        // Dampen velocity for slow, floaty drift
        f.vx *= 0.98;
        f.vy *= 0.98;

        f.x += f.vx;
        f.y += f.vy;

        // Boundary wrap
        if (f.x < -20) f.x = width + 20;
        if (f.x > width + 20) f.x = -20;
        if (f.y < -20) f.y = height + 20;
        if (f.y > height + 20) f.y = -20;

        // Periodic pulsing in size & luminosity matching ambient forest audio
        f.pulsePhase += f.pulseSpeed;
        const pulseFactor = Math.sin(f.pulsePhase);
        // Positive pulse makes firefly flare up in size & brightness
        const normalizedPulse = Math.max(0, pulseFactor);
        f.currentRadius = f.baseRadius * (1 + normalizedPulse * f.pulseMagnitude);
        f.alpha = Math.max(0.15, Math.min(1.0, f.baseAlpha + normalizedPulse * 0.5));

        ctx.save();
        ctx.globalAlpha = f.alpha;

        // Outer soft radiant halo
        const haloRadius = f.currentRadius * 5.5;
        const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, haloRadius);
        gradient.addColorStop(0, f.glowColor);
        gradient.addColorStop(0.35, f.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(f.x, f.y, haloRadius, 0, Math.PI * 2);
        ctx.fill();

        // Inner glowing firefly body
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.glowColor;
        ctx.shadowBlur = f.currentRadius * 4;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Bright hot-white central pinpoint
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.currentRadius * 0.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isForestOrEvening, location]);

  if (!isForestOrEvening) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-15 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
