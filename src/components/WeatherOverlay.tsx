import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { WeatherType, SceneLocation, Language } from '../types';
import { audioSynth } from '../utils/audioSynthesizer';

interface WeatherOverlayProps {
  weather?: WeatherType;
  location?: SceneLocation;
  language?: Language;
  collectedLightsCount?: number;
  isHeartwarming?: boolean;
}

interface InteractiveBurst {
  x: number;
  y: number;
  type: 'raindrop' | 'sun_mote' | 'wind_leaf' | 'stardust';
  life: number;
  maxLife: number;
  radius: number;
  color: string;
  particles?: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    size: number;
    color: string;
  }>;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({
  weather,
  location,
  language = 'en',
  collectedLightsCount = 0,
  isHeartwarming = false,
}) => {
  const [isInteractiveMode, setIsInteractiveMode] = useState(true);
  const [interactionToast, setInteractionToast] = useState<string | null>(null);

  // Infer fallback weather based on location if not explicitly provided in scene
  const activeWeather: WeatherType = useMemo(() => {
    if (weather) return weather;
    switch (location) {
      case 'whispering_forest':
        return 'dust_motes';
      case 'crossroads_kiln':
        return 'dust_motes';
      case 'windy_road':
        return 'wind_leaves';
      case 'sea_shore_dusk':
        return 'rain_ripples';
      case 'sea_shore_sunrise':
      case 'birthday_feast':
        return 'sunlight_glints';
      case 'magic_mirror':
      case 'velvet_abyss':
      case 'bottle_path':
        return 'stardust_twilight';
      default:
        return 'dust_motes';
    }
  }, [weather, location]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const interactiveBurstsRef = useRef<InteractiveBurst[]>([]);

  // Particle systems refs
  const dustParticlesRef = useRef<any[]>([]);
  const rainDropsRef = useRef<any[]>([]);
  const rainRipplesRef = useRef<any[]>([]);
  const windLeavesRef = useRef<any[]>([]);
  const sunGlintsRef = useRef<any[]>([]);
  const floatingLightMotesRef = useRef<any[]>([]);
  const floatingHeartsRef = useRef<any[]>([]);

  // Handle Interactive Clicks on open background / scenery
  const handleCanvasInteraction = (clientX: number, clientY: number) => {
    if (!isInteractiveMode) return;

    if (activeWeather === 'rain_ripples') {
      audioSynth.playWeatherPing('raindrop');

      const splashParticles = Array.from({ length: 8 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 3 + 1.5;
        return {
          x: clientX,
          y: clientY,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 1.2,
          alpha: 0.9,
          size: Math.random() * 2.2 + 1,
          color: 'rgba(186, 230, 253, ',
        };
      });

      interactiveBurstsRef.current.push({
        x: clientX,
        y: clientY,
        type: 'raindrop',
        life: 0,
        maxLife: 0.8,
        radius: 12,
        color: '#38bdf8',
        particles: splashParticles,
      });

      rainDropsRef.current.forEach((d) => {
        const dx = d.x - clientX;
        const dy = d.y - clientY;
        if (dx * dx + dy * dy < 70 * 70) {
          d.y = -20;
          d.x = Math.random() * window.innerWidth;
        }
      });

      setInteractionToast(language === 'en' ? '💧 Raindrop Ping!' : '💧 Goutte de Pluie !');
    } else if (activeWeather === 'dust_motes' || activeWeather === 'sunlight_glints') {
      audioSynth.playWeatherPing('sun_mote');

      dustParticlesRef.current.forEach((p) => {
        const dx = p.x - clientX;
        const dy = p.y - clientY;
        const distSq = dx * dx + dy * dy;
        if (distSq < 160 * 160) {
          p.swirlSpeed = 0.45;
          p.swirlAngle = Math.atan2(dy, dx) + Math.PI / 2;
        }
      });

      const starParticles = Array.from({ length: 10 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 4 + 2;
        return {
          x: clientX,
          y: clientY,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          alpha: 0.95,
          size: Math.random() * 2.5 + 1.2,
          color: 'rgba(254, 240, 138, ',
        };
      });

      interactiveBurstsRef.current.push({
        x: clientX,
        y: clientY,
        type: 'sun_mote',
        life: 0,
        maxLife: 0.7,
        radius: 14,
        color: '#fef08a',
        particles: starParticles,
      });

      setInteractionToast(language === 'en' ? '✨ Golden Sun Mote!' : '✨ Tourbillon Solaire !');
    } else if (activeWeather === 'stardust_twilight') {
      audioSynth.playWeatherPing('stardust');

      dustParticlesRef.current.forEach((p) => {
        const dx = p.x - clientX;
        const dy = p.y - clientY;
        if (dx * dx + dy * dy < 160 * 160) {
          p.swirlSpeed = 0.5;
          p.swirlAngle = Math.atan2(dy, dx) + Math.PI / 2;
        }
      });

      const cosmicParticles = Array.from({ length: 12 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 3.5 + 1.8;
        return {
          x: clientX,
          y: clientY,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          alpha: 0.95,
          size: Math.random() * 2.8 + 1,
          color: 'rgba(232, 121, 249, ',
        };
      });

      interactiveBurstsRef.current.push({
        x: clientX,
        y: clientY,
        type: 'stardust',
        life: 0,
        maxLife: 0.75,
        radius: 15,
        color: '#c084fc',
        particles: cosmicParticles,
      });

      setInteractionToast(language === 'en' ? '🌟 Celestial Stardust!' : '🌟 Carillon d’Étoiles !');
    } else if (activeWeather === 'wind_leaves') {
      audioSynth.playWeatherPing('wind_leaf');

      windLeavesRef.current.forEach((leaf) => {
        const dx = leaf.x - clientX;
        const dy = leaf.y - clientY;
        if (dx * dx + dy * dy < 180 * 180) {
          leaf.vx += 4.5;
          leaf.vy += (Math.random() - 0.5) * 3;
          leaf.angleSpeed += 0.08;
        }
      });

      const petalParticles = Array.from({ length: 8 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 3 + 2;
        return {
          x: clientX,
          y: clientY,
          vx: Math.cos(angle) * spd + 1.5,
          vy: Math.sin(angle) * spd,
          alpha: 0.9,
          size: Math.random() * 3 + 2,
          color: 'rgba(244, 114, 182, ',
        };
      });

      interactiveBurstsRef.current.push({
        x: clientX,
        y: clientY,
        type: 'wind_leaf',
        life: 0,
        maxLife: 0.7,
        radius: 12,
        color: '#f472b6',
        particles: petalParticles,
      });

      setInteractionToast(language === 'en' ? '🍃 Breeze & Petal Whirl!' : '🍃 Tourbillon de Pétales !');
    }

    setTimeout(() => {
      setInteractionToast(null);
    }, 1000);
  };

  // Passive Global Pointer Down listener that NEVER blocks or intercepts UI
  useEffect(() => {
    const handleGlobalPointerDown = (e: PointerEvent) => {
      if (!isInteractiveMode) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // If clicked inside ANY interactive element (button, dialogue box, choices, character portraits, modals, controls)
      if (
        target.closest(
          'button, a, input, textarea, select, [role="button"], #dialogue-box-container, .choice-button, .cursor-pointer, [data-interactive="true"], .interactive-ui'
        )
      ) {
        // Let normal UI proceed completely without interference!
        return;
      }

      // If clicked on open scenery/background
      handleCanvasInteraction(e.clientX, e.clientY);
    };

    window.addEventListener('pointerdown', handleGlobalPointerDown, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleGlobalPointerDown);
    };
  }, [isInteractiveMode, activeWeather, location]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // 1. Initialize Dust Motes
    const dustCount = activeWeather === 'dust_motes' ? 36 : 20;
    const dustParticles = Array.from({ length: dustCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.4 + 0.8,
      vx: (Math.random() - 0.5) * 0.4 + 0.1,
      vy: -Math.random() * 0.35 - 0.05,
      alpha: Math.random() * 0.5 + 0.2,
      baseAlpha: Math.random() * 0.4 + 0.2,
      alphaSpeed: (Math.random() * 0.02 + 0.008) * (Math.random() > 0.5 ? 1 : -1),
      swirlAngle: Math.random() * Math.PI * 2,
      swirlSpeed: 0,
      color:
        location === 'whispering_forest'
          ? 'rgba(167, 243, 208, '
          : location === 'crossroads_kiln'
          ? 'rgba(253, 230, 138, '
          : 'rgba(254, 240, 138, ',
    }));
    dustParticlesRef.current = dustParticles;

    // 2. Initialize Rain Ripples & Drops
    const rainRipples: any[] = [];
    rainRipplesRef.current = rainRipples;

    const rainDrops = Array.from({ length: 48 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 18 + 12,
      vy: Math.random() * 10 + 16,
      vx: Math.random() * 1.5 + 2,
      alpha: Math.random() * 0.35 + 0.2,
    }));
    rainDropsRef.current = rainDrops;

    const createRipple = (x: number, y: number, isBig: boolean = false) => {
      if (rainRipples.length < 24) {
        rainRipples.push({
          x,
          y,
          radius: 1,
          maxRadius: isBig ? Math.random() * 32 + 22 : Math.random() * 22 + 14,
          alpha: isBig ? 0.85 : Math.random() * 0.5 + 0.35,
          lineWidth: isBig ? 1.6 : Math.random() * 0.8 + 0.8,
          color: 'rgba(186, 230, 253, ',
        });
      }
    };

    // 3. Initialize Sunlight Glints
    const sunGlints = Array.from({ length: 16 }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.75),
      size: Math.random() * 6 + 2,
      maxSize: Math.random() * 14 + 10,
      growing: Math.random() > 0.5,
      speed: Math.random() * 0.08 + 0.04,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      color: Math.random() > 0.4 ? '#fef08a' : '#fde047',
    }));
    sunGlintsRef.current = sunGlints;

    // 4. Initialize Wind Leaves
    const windLeaves = Array.from({ length: 22 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.random() * 2.5 + 1.8,
      vy: Math.random() * 0.9 + 0.3,
      size: Math.random() * 6 + 4,
      angle: Math.random() * Math.PI * 2,
      angleSpeed: Math.random() * 0.04 - 0.02,
      color:
        Math.random() > 0.5
          ? '#f472b6' // pink petal
          : Math.random() > 0.5
          ? '#fef08a' // yellow petal
          : '#a7f3d0', // green leaf
    }));
    windLeavesRef.current = windLeaves;

    // 5. Initialize Floating Golden Light Motes (drifting gently upwards)
    // When collectedLightsCount > 3 (> half of 6 total lights), count & radiance intensify
    const hasMoreThanHalfLights = collectedLightsCount >= 3;
    const motesCount = hasMoreThanHalfLights ? 28 : 12;
    const floatingLightMotes = Array.from({ length: motesCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vy: -(Math.random() * 0.7 + 0.35 + (hasMoreThanHalfLights ? 0.3 : 0)), // upward drift
      vx: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * (hasMoreThanHalfLights ? 2.8 : 1.8) + 1.0,
      alpha: Math.random() * 0.5 + 0.3,
      alphaSpeed: (Math.random() * 0.015 + 0.008) * (Math.random() > 0.5 ? 1 : -1),
      maxAlpha: hasMoreThanHalfLights ? 0.95 : 0.75,
      minAlpha: 0.15,
      pulsePhase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.4 ? '#fef08a' : Math.random() > 0.5 ? '#fde047' : '#fbbf24',
      isStar: Math.random() > 0.6,
    }));
    floatingLightMotesRef.current = floatingLightMotes;

    // 6. Initialize Floating Golden Heart Particles specifically for Heartwarming Scenes
    const heartColors = ['#fde047', '#fbbf24', '#f59e0b', '#f472b6', '#fbcfe8', '#fef08a'];
    const floatingHearts = isHeartwarming
      ? Array.from({ length: 22 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          vy: -(Math.random() * 0.55 + 0.3), // gentle slow upward drift
          size: Math.random() * 6 + 5.5,
          alpha: Math.random() * 0.4 + 0.4,
          alphaSpeed: (Math.random() * 0.012 + 0.006) * (Math.random() > 0.5 ? 1 : -1),
          maxAlpha: 0.85,
          minAlpha: 0.2,
          rotation: (Math.random() - 0.5) * 0.4,
          rotSpeed: (Math.random() - 0.5) * 0.008,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.03 + 0.015,
          color: heartColors[Math.floor(Math.random() * heartColors.length)],
        }))
      : [];
    floatingHeartsRef.current = floatingHearts;

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.016;

      // ====================================================
      // 0. FLOATING GOLDEN LIGHT MOTES (Gently drifting UP)
      // ====================================================
      for (let i = 0; i < floatingLightMotes.length; i++) {
        const m = floatingLightMotes[i];
        m.y += m.vy;
        m.x += m.vx + Math.sin(time * 1.5 + m.pulsePhase) * 0.4;
        m.alpha += m.alphaSpeed;

        if (m.alpha >= m.maxAlpha) {
          m.alpha = m.maxAlpha;
          m.alphaSpeed = -Math.abs(m.alphaSpeed);
        } else if (m.alpha <= m.minAlpha) {
          m.alpha = m.minAlpha;
          m.alphaSpeed = Math.abs(m.alphaSpeed);
        }

        // Loop back from bottom when motes reach the top
        if (m.y < -20) {
          m.y = height + 20;
          m.x = Math.random() * width;
        }
        if (m.x < -10) m.x = width + 10;
        if (m.x > width + 10) m.x = -10;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, m.alpha));
        ctx.fillStyle = m.color;
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = hasMoreThanHalfLights ? 12 : 6;

        if (m.isStar) {
          // 4-pointed golden sparkle
          const s = m.radius * 1.8;
          ctx.translate(m.x, m.y);
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        } else {
          // Circular glowing mote
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
          ctx.fill();

          // Soft white center
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.radius * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }

        ctx.restore();
      }

      // ====================================================================
      // 0B. FLOATING HEART PARTICLES (For Heartwarming Scenes - Golden Glow)
      // ====================================================================
      if (isHeartwarming && floatingHearts.length > 0) {
        for (let i = 0; i < floatingHearts.length; i++) {
          const h = floatingHearts[i];
          h.y += h.vy;
          h.x += Math.sin(time * 1.8 + h.swayPhase) * 0.45;
          h.rotation += h.rotSpeed;
          h.alpha += h.alphaSpeed;

          if (h.alpha >= h.maxAlpha) {
            h.alpha = h.maxAlpha;
            h.alphaSpeed = -Math.abs(h.alphaSpeed);
          } else if (h.alpha <= h.minAlpha) {
            h.alpha = h.minAlpha;
            h.alphaSpeed = Math.abs(h.alphaSpeed);
          }

          // Loop back from bottom
          if (h.y < -30) {
            h.y = height + 20;
            h.x = Math.random() * width;
          }
          if (h.x < -20) h.x = width + 20;
          if (h.x > width + 20) h.x = -20;

          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, h.alpha));
          ctx.translate(h.x, h.y);
          ctx.rotate(h.rotation);

          const scale = h.size / 10;
          ctx.scale(scale, scale);

          // Draw bezier heart
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-5, -6, -10, -2, -10, 3);
          ctx.bezierCurveTo(-10, 8, -4, 12, 0, 15);
          ctx.bezierCurveTo(4, 12, 10, 8, 10, 3);
          ctx.bezierCurveTo(10, -2, 5, -6, 0, 0);
          ctx.closePath();

          ctx.fillStyle = h.color;
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 12;
          ctx.fill();

          // Golden inner shine
          ctx.beginPath();
          ctx.arc(-2.5, 2, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fill();

          ctx.restore();
        }
      }

      // =====================================
      // A. DUST MOTES & CELESTIAL STARDUST
      // =====================================
      if (activeWeather === 'dust_motes' || activeWeather === 'stardust_twilight') {
        for (let i = 0; i < dustParticles.length; i++) {
          const p = dustParticles[i];

          if (p.swirlSpeed > 0.05) {
            p.swirlAngle += p.swirlSpeed;
            p.x += Math.cos(p.swirlAngle) * (p.swirlSpeed * 6) + p.vx;
            p.y += Math.sin(p.swirlAngle) * (p.swirlSpeed * 6) + p.vy;
            p.swirlSpeed *= 0.96;
          } else {
            p.x += p.vx + Math.sin(time + i) * 0.25;
            p.y += p.vy;
          }

          p.alpha += p.alphaSpeed;

          if (p.alpha > p.baseAlpha + 0.25 || p.alpha < p.baseAlpha - 0.2) {
            p.alphaSpeed = -p.alphaSpeed;
          }

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x > width + 10) p.x = -10;
          if (p.x < -10) p.x = width + 10;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          const col =
            activeWeather === 'stardust_twilight'
              ? i % 2 === 0
                ? 'rgba(232, 121, 249, '
                : 'rgba(192, 132, 252, '
              : p.color;
          ctx.fillStyle = `${col}${Math.max(0, Math.min(1, p.alpha))})`;
          ctx.shadowBlur = p.swirlSpeed > 0.1 ? 12 : 6;
          ctx.shadowColor =
            activeWeather === 'stardust_twilight' ? '#c084fc' : '#fbbf24';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // =====================================
      // B. RAIN RIPPLES & RAIN DROPS
      // =====================================
      if (activeWeather === 'rain_ripples') {
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i < rainDrops.length; i++) {
          const d = rainDrops[i];
          d.x += d.vx;
          d.y += d.vy;

          if (d.y > height - 40 && Math.random() < 0.15) {
            createRipple(d.x, d.y + Math.random() * 20);
          }

          if (d.y > height) {
            d.y = -20;
            d.x = Math.random() * width;
          }
          if (d.x > width) d.x = 0;

          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.vx * 1.5, d.y + d.length);
        }
        ctx.stroke();

        if (Math.random() < 0.22) {
          createRipple(Math.random() * width, Math.random() * height * 0.85 + height * 0.15);
        }

        for (let i = rainRipples.length - 1; i >= 0; i--) {
          const r = rainRipples[i];
          r.radius += 0.7;
          r.alpha -= 0.012;

          if (r.alpha <= 0 || r.radius >= r.maxRadius) {
            rainRipples.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.radius * 1.4, r.radius * 0.6, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `${r.color}${Math.max(0, r.alpha)})`;
          ctx.lineWidth = r.lineWidth;
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#38bdf8';
          ctx.stroke();

          if (r.radius > 6) {
            ctx.beginPath();
            ctx.ellipse(r.x, r.y, (r.radius - 4) * 1.4, (r.radius - 4) * 0.6, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `${r.color}${Math.max(0, r.alpha * 0.55)})`;
            ctx.lineWidth = r.lineWidth * 0.6;
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
        }
      }

      // =====================================
      // C. SUNLIGHT GLINTS & CELESTIAL RAYS
      // =====================================
      if (activeWeather === 'sunlight_glints') {
        const rayGrad = ctx.createLinearGradient(width, 0, 0, height);
        rayGrad.addColorStop(0, `rgba(254, 240, 138, ${0.12 + Math.sin(time * 0.8) * 0.04})`);
        rayGrad.addColorStop(0.5, `rgba(251, 191, 36, ${0.06 + Math.cos(time * 0.6) * 0.02})`);
        rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(width * 0.5, 0);
        ctx.lineTo(width, 0);
        ctx.lineTo(width, height * 0.4);
        ctx.lineTo(width * 0.2, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        for (let i = 0; i < sunGlints.length; i++) {
          const g = sunGlints[i];
          if (g.growing) {
            g.size += g.speed;
            if (g.size >= g.maxSize) g.growing = false;
          } else {
            g.size -= g.speed;
            if (g.size <= 1.5) {
              g.growing = true;
              g.x = Math.random() * width;
              g.y = Math.random() * (height * 0.8);
              g.maxSize = Math.random() * 12 + 8;
            }
          }
          g.rotation += g.rotSpeed;

          ctx.save();
          ctx.translate(g.x, g.y);
          ctx.rotate(g.rotation);
          ctx.fillStyle = g.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#fef08a';

          const s = g.size;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          ctx.restore();
        }
      }

      // =====================================
      // D. WIND LEAVES
      // =====================================
      if (activeWeather === 'wind_leaves') {
        for (let i = 0; i < windLeaves.length; i++) {
          const leaf = windLeaves[i];
          leaf.x += leaf.vx;
          leaf.y += leaf.vy + Math.sin(time * 2 + i) * 0.8;
          leaf.angle += leaf.angleSpeed;

          if (leaf.x > width + 20) {
            leaf.x = -20;
            leaf.y = Math.random() * height;
          }
          if (leaf.y > height + 20) leaf.y = -20;

          ctx.save();
          ctx.translate(leaf.x, leaf.y);
          ctx.rotate(leaf.angle);
          ctx.fillStyle = leaf.color;
          ctx.shadowBlur = 4;
          ctx.shadowColor = leaf.color;

          ctx.beginPath();
          ctx.ellipse(0, 0, leaf.size, leaf.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      // =====================================
      // E. INTERACTIVE BURSTS & SPARKLES
      // =====================================
      const bursts = interactiveBurstsRef.current;
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.life += 0.02;
        const progress = b.life / b.maxLife;

        if (progress >= 1) {
          bursts.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, 1 - progress);

        if (b.type === 'raindrop') {
          ctx.beginPath();
          ctx.ellipse(b.x, b.y, (b.radius + progress * 40) * 1.4, (b.radius + progress * 40) * 0.6, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(186, 230, 253, ${alpha * 0.9})`;
          ctx.lineWidth = 2.2 * (1 - progress * 0.7);
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#38bdf8';
          ctx.stroke();

          ctx.beginPath();
          ctx.ellipse(b.x, b.y, (b.radius + progress * 60) * 1.4, (b.radius + progress * 60) * 0.6, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.5})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (b.type === 'sun_mote' || b.type === 'stardust') {
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(progress * Math.PI);
          const s = (b.radius + progress * 35);
          ctx.fillStyle = b.type === 'stardust' ? `rgba(232, 121, 249, ${alpha})` : `rgba(254, 240, 138, ${alpha})`;
          ctx.shadowBlur = 15;
          ctx.shadowColor = b.type === 'stardust' ? '#c084fc' : '#fbbf24';

          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();
          ctx.restore();
        }

        if (b.particles) {
          for (let pIdx = 0; pIdx < b.particles.length; pIdx++) {
            const p = b.particles[pIdx];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha = Math.max(0, p.alpha - 0.025);

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `${p.color}${p.alpha})`;
            ctx.shadowBlur = 6;
            ctx.shadowColor = p.color.includes('232') ? '#c084fc' : '#fbbf24';
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeWeather, location, collectedLightsCount, isHeartwarming]);

  return (
    <div
      id="weather-screen-overlay"
      className="fixed inset-0 z-15 overflow-hidden select-none pointer-events-none"
    >
      {/* Weather Canvas with absolute pointer-events-none guarantee */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
      />

      {/* Floating Interaction Feedback Toast */}
      {interactionToast && isInteractiveMode && (
        <div className="absolute top-16 left-6 z-20 animate-fade-in px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-400/40 text-amber-200 text-xs font-serif shadow-lg flex items-center gap-1.5 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>{interactionToast}</span>
        </div>
      )}

      {/* Atmospheric Color Tone Cast based on weather */}
      {activeWeather === 'rain_ripples' && (
        <div className="absolute inset-0 bg-sky-950/15 backdrop-blur-[0.5px] pointer-events-none" />
      )}
      {activeWeather === 'sunlight_glints' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-yellow-200/5 to-transparent pointer-events-none" />
      )}
      {activeWeather === 'stardust_twilight' && (
        <div className="absolute inset-0 bg-purple-950/15 pointer-events-none" />
      )}
    </div>
  );
};
