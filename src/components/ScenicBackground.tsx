import React, { useEffect, useRef, useState } from 'react';
import { SceneLocation, Language, CozyModeIntensity } from '../types';
import { audioSynth } from '../utils/audioSynthesizer';

interface ScenicBackgroundProps {
  location: SceneLocation;
  language: Language;
  cozyMode?: CozyModeIntensity;
}

interface FoodReaction {
  id: number;
  x: number;
  y: number;
  text: string;
  emoji: string;
}

export const ScenicBackground: React.FC<ScenicBackgroundProps> = ({
  location,
  language,
  cozyMode = 'balanced',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [foodReactions, setFoodReactions] = useState<FoodReaction[]>([]);
  const [activeBounceFood, setActiveBounceFood] = useState<string | null>(null);
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });

  // Mouse Parallax movement loop and dynamic coordinate-based ambient sound trigger zones
  useEffect(() => {
    let reqId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetX = ((e.clientX - cx) / cx) * 14;
      targetY = ((e.clientY - cy) / cy) * 9;

      // Coordinate zone detection for ambient spatial sound effects
      const relX = e.clientX / window.innerWidth;
      const relY = e.clientY / window.innerHeight;

      if (location === 'whispering_forest') {
        if (relY > 0.45 && (relX < 0.35 || relX > 0.65)) {
          // Pine tree clusters & forest undergrowth
          audioSynth.playHoverAmbience('leaves');
        } else if (relY < 0.3) {
          // Starlit night breeze
          audioSynth.playHoverAmbience('wind');
        }
      } else if (location === 'sea_shore_sunrise' || location === 'sea_shore_dusk') {
        if (relY > 0.55) {
          // Ocean shoreline waves
          audioSynth.playHoverAmbience('waves');
        } else if (relY < 0.35) {
          // Luminous dawn sparkles
          audioSynth.playHoverAmbience('chime');
        }
      } else if (location === 'bottle_path') {
        if (relY > 0.58) {
          audioSynth.playHoverAmbience('waves');
        } else if (relX < 0.35 && relY > 0.4) {
          audioSynth.playHoverAmbience('wind');
        }
      } else if (location === 'crossroads_kiln') {
        if (relX > 0.55 && relY > 0.45) {
          // Glass kiln fireplace & forge
          audioSynth.playHoverAmbience('hearth');
        } else if (relX < 0.35 && relY > 0.45) {
          audioSynth.playHoverAmbience('leaves');
        }
      } else if (location === 'velvet_abyss') {
        if (relY < 0.65) {
          // Eerie cosmic abyss void winds
          audioSynth.playHoverAmbience('wind');
        }
      } else if (location === 'windy_road') {
        if (relY < 0.7) {
          audioSynth.playHoverAmbience('snow');
        }
      } else if (location === 'birthday_feast') {
        if (relX > 0.25 && relX < 0.75 && relY > 0.45) {
          audioSynth.playHoverAmbience('chime');
        }
      }
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      setMouseParallax({ x: currentX, y: currentY });
      reqId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    reqId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(reqId);
    };
  }, [location]);

  const handleFoodClick = (e: React.MouseEvent, foodKey: string, textEn: string, textFr: string, emoji: string) => {
    e.stopPropagation();
    audioSynth.playSoundEffect('magic_sparkle');
    setActiveBounceFood(foodKey);
    setTimeout(() => setActiveBounceFood(null), 500);

    const rect = e.currentTarget.getBoundingClientRect();
    const newReaction: FoodReaction = {
      id: Date.now() + Math.random(),
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      text: language === 'fr' ? textFr : textEn,
      emoji,
    };
    setFoodReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setFoodReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 1800);
  };

  const handleWorldTouch = (
    e: React.MouseEvent,
    sfx: any,
    textEn: string,
    textFr: string,
    emoji: string
  ) => {
    e.stopPropagation();
    try {
      audioSynth.playSoundEffect(sfx);
    } catch {}

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX || rect.left + rect.width / 2;
    const clickY = e.clientY || rect.top + rect.height / 2;

    const newReaction: FoodReaction = {
      id: Date.now() + Math.random(),
      x: clickX,
      y: clickY - 24,
      text: language === 'fr' ? textFr : textEn,
      emoji,
    };
    setFoodReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setFoodReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2200);
  };

  useEffect(() => {
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

    // Particle system customized by location and cozyMode intensity
    interface Particle {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      maxAlpha: number;
      color: string;
      pulse: number;
    }

    const baseCount = location === 'sea_shore_sunrise' || location === 'birthday_feast' || location === 'windy_road' ? 65 : 40;
    const particleMultiplier = cozyMode === 'minimal' ? 0.45 : cozyMode === 'lush' ? 1.6 : 1.0;
    const particleCount = Math.round(baseCount * particleMultiplier);
    const particles: Particle[] = [];

    const getParticleColor = (loc: SceneLocation) => {
      switch (loc) {
        case 'whispering_forest':
          return ['#34d399', '#6ee7b7', '#a7f3d0', '#fbbf24'][Math.floor(Math.random() * 4)];
        case 'windy_road':
          return ['#ffffff', '#e0f2fe', '#bae6fd', '#93c5fd'][Math.floor(Math.random() * 4)]; // Falling snow & ice crystals
        case 'bottle_path':
          return ['#38bdf8', '#818cf8', '#fbbf24', '#fef08a'][Math.floor(Math.random() * 4)];
        case 'velvet_abyss':
          return ['#c084fc', '#e879f9', '#fbbf24', '#818cf8'][Math.floor(Math.random() * 4)];
        case 'crossroads_kiln':
          return ['#f59e0b', '#fbbf24', '#f97316', '#fdba74'][Math.floor(Math.random() * 4)];
        case 'sea_shore_sunrise':
          return ['#fde047', '#fb923c', '#f472b6', '#fed7aa'][Math.floor(Math.random() * 4)];
        case 'sea_shore_dusk':
          return ['#38bdf8', '#7dd3fc', '#bae6fd', '#fef08a'][Math.floor(Math.random() * 4)];
        case 'magic_mirror':
          return ['#fef08a', '#e0e7ff', '#fbbf24', '#a78bfa'][Math.floor(Math.random() * 4)];
        case 'birthday_feast':
          return ['#fbbf24', '#f43f5e', '#38bdf8', '#fb923c'][Math.floor(Math.random() * 4)];
        default:
          return ['#fbbf24', '#fde68a', '#e0e7ff', '#fcd34d'][Math.floor(Math.random() * 4)];
      }
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: location === 'windy_road' ? Math.random() * 2.2 + 0.6 : Math.random() * 2.5 + 0.8,
        vx: location === 'windy_road' ? (Math.random() - 0.7) * 1.2 : (Math.random() - 0.5) * 0.4,
        vy: location === 'windy_road' ? Math.random() * 1.4 + 0.6 : location === 'sea_shore_sunrise' || location === 'birthday_feast' ? -Math.random() * 0.8 - 0.2 : -Math.random() * 0.5 - 0.1,
        alpha: Math.random() * 0.8 + 0.2,
        maxAlpha: Math.random() * 0.7 + 0.3,
        color: getParticleColor(location),
        pulse: Math.random() * Math.PI,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.03;
        p.alpha = Math.sin(p.pulse) * (p.maxAlpha / 2) + p.maxAlpha / 2;

        if (location === 'windy_road') {
          if (p.y > height) {
            p.y = 0;
            p.x = Math.random() * width;
          }
        } else {
          if (p.y < 0) {
            p.y = height;
            p.x = Math.random() * width;
          }
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = location === 'windy_road' ? 4 : 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [location]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden transition-all duration-1000">
      {/* Parallax Depth Layer & Ken-Burns Living Camera Drift */}
      <div
        className="absolute -inset-6 w-[calc(100%+48px)] h-[calc(100%+48px)] pointer-events-auto will-change-transform animate-ken-burns"
        style={{
          transform: `translate3d(${-mouseParallax.x}px, ${-mouseParallax.y}px, 0)`,
        }}
      >
        {/* Dynamic Background SVG Art */}
        {location === 'cottage_twilight' && (
        <svg className="w-full h-full object-cover" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="twilightSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0b132b" />
              <stop offset="45%" stopColor="#1c2541" />
              <stop offset="85%" stopColor="#2e3b55" />
              <stop offset="100%" stopColor="#3a506b" />
            </linearGradient>
            <radialGradient id="cottageWindowGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="smokeGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.65" />
              <stop offset="60%" stopColor="#cbd5e1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="castleWallGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#27272a" />
              <stop offset="50%" stopColor="#3f3f46" />
              <stop offset="100%" stopColor="#18181b" />
            </linearGradient>
            <linearGradient id="turretRoofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4c1d95" />
              <stop offset="50%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#twilightSky)" />

          {/* Twinkling Starlight in Twilight Sky - Touch to trigger shooting star */}
          <g
            opacity="0.85"
            className="cursor-pointer pointer-events-auto"
            onClick={(e) => handleWorldTouch(e, 'star_fall', 'A shooting star glides across the twilight sky!', 'Une étoile filante glisse dans le ciel crépusculaire !', '⭐')}
          >
            <circle cx="140" cy="110" r="2" fill="#fef08a" className="animate-pulse" />
            <circle cx="280" cy="75" r="1.5" fill="#ffffff" />
            <circle cx="460" cy="130" r="2.2" fill="#fef08a" className="animate-pulse" />
            <circle cx="680" cy="65" r="1.8" fill="#ffffff" />
            <circle cx="880" cy="95" r="2.5" fill="#fde047" className="animate-pulse" />
            <circle cx="1060" cy="140" r="1.6" fill="#ffffff" />
            <circle cx="1140" cy="80" r="2" fill="#fef08a" />
          </g>

          {/* Soft Clouds Floating Above Mountains - Touch to summon starlight breeze */}
          <g
            className="animate-cloud-drift opacity-60 cursor-pointer pointer-events-auto"
            onClick={(e) => handleWorldTouch(e, 'star_fall', 'Soft starlit clouds drift gently over the peaks...', 'De doux nuages étoilés flottent sur les cimes...', '☁️')}
          >
            <ellipse cx="220" cy="180" rx="95" ry="24" fill="#475569" opacity="0.4" />
            <ellipse cx="260" cy="165" rx="65" ry="28" fill="#64748b" opacity="0.35" />
            <ellipse cx="780" cy="150" rx="120" ry="32" fill="#475569" opacity="0.4" />
            <ellipse cx="830" cy="135" rx="80" ry="34" fill="#64748b" opacity="0.35" />
          </g>

          {/* Distant mountains */}
          <polygon points="0,520 280,320 540,540" fill="#1c2541" opacity="0.8" />
          <polygon points="400,560 720,280 1020,560" fill="#151e33" opacity="0.9" />
          <polygon points="850,540 1100,340 1200,480 1200,800 0,800" fill="#0b132b" />

          {/* Second Layer of Drifting Mist/Clouds */}
          <g className="animate-cloud-drift-reverse opacity-45">
            <ellipse cx="520" cy="340" rx="130" ry="26" fill="#334155" opacity="0.5" />
            <ellipse cx="1000" cy="380" rx="150" ry="30" fill="#334155" opacity="0.4" />
          </g>

          {/* Distant Cozy Whispering Trees on Ridge */}
          <g
            opacity="0.75"
            className="cursor-pointer pointer-events-auto"
            onClick={(e) => handleWorldTouch(e, 'tree_rustle', 'The whispering pines hum in the mountain breeze...', 'Les pins chuchotent doucement dans la brise...', '🌲')}
          >
            {/* Tree cluster left with gentle breeze sway */}
            <g className="animate-tree-sway-slow">
              <path d="M120 620 L150 480 L180 620 Z" fill="#064e3b" />
              <path d="M150 630 L185 450 L220 630 Z" fill="#022c22" />
              <path d="M190 640 L220 500 L250 640 Z" fill="#065f46" />
              <circle cx="150" cy="480" r="28" fill="#047857" opacity="0.8" />
              <circle cx="185" cy="450" r="34" fill="#065f46" opacity="0.9" />
            </g>

            {/* Tree cluster right behind cottage with gentle reverse sway */}
            <g className="animate-tree-sway-reverse">
              <path d="M960 620 L995 460 L1030 620 Z" fill="#022c22" />
              <path d="M1010 630 L1050 430 L1090 630 Z" fill="#064e3b" />
              <path d="M1060 640 L1100 470 L1140 640 Z" fill="#011e17" />
              <circle cx="1050" cy="430" r="38" fill="#065f46" opacity="0.85" />
              <circle cx="1090" cy="470" r="30" fill="#047857" opacity="0.8" />
            </g>
          </g>

          {/* Cozy Twilight Wind Breeze Gusts */}
          {cozyMode !== 'minimal' && (
            <g id="twilight-wind-breezes" className="pointer-events-none">
              <g className="animate-wind-gust-1 opacity-70">
                <path d="M120 380 Q190 365 260 378" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.45" />
                <path d="M230 388 Q280 378 330 385" stroke="#bae6fd" strokeWidth="0.75" strokeLinecap="round" fill="none" opacity="0.35" />
              </g>
              <g className="animate-wind-gust-2 opacity-60">
                <path d="M480 460 Q560 445 640 458" stroke="#fef08a" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.4" />
                <path d="M580 470 Q640 460 700 467" stroke="#fde68a" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.3" />
              </g>
            </g>
          )}

          {/* Drifting Flower Petals in the Breeze */}
          {cozyMode !== 'minimal' && (
            <g id="drifting-petals" className="pointer-events-none">
              <g className="animate-petal-drift-1">
                <ellipse cx="60" cy="460" rx="5.5" ry="3" fill="#f472b6" opacity="0.8" transform="rotate(25 60 460)" />
                <circle cx="60" cy="460" r="1" fill="#fff" />
              </g>
              <g className="animate-petal-drift-2">
                <ellipse cx="140" cy="510" rx="4.5" ry="2.8" fill="#fef08a" opacity="0.85" transform="rotate(-30 140 510)" />
              </g>
              <g className="animate-petal-drift-3">
                <ellipse cx="320" cy="480" rx="5" ry="2.8" fill="#c084fc" opacity="0.75" transform="rotate(45 320 480)" />
              </g>
              {cozyMode === 'lush' && (
                <>
                  <g className="animate-petal-drift-1 [animation-delay:4s]">
                    <ellipse cx="200" cy="420" rx="5" ry="3" fill="#fbcfe8" opacity="0.75" transform="rotate(15 200 420)" />
                  </g>
                  <g className="animate-petal-drift-2 [animation-delay:6s]">
                    <ellipse cx="440" cy="470" rx="4" ry="2.5" fill="#fef08a" opacity="0.8" transform="rotate(-20 440 470)" />
                  </g>
                </>
              )}
            </g>
          )}

          {/* Chimney Smoke & Chimney - Touch to stir the hearth */}
          <g
            className="cursor-pointer pointer-events-auto group"
            onClick={(e) => handleWorldTouch(e, 'candle_flicker', 'Warm smoke billows from the cozy hearth...', 'Une douce fumée s’élève de l’âtre chaleureux...', '🏠')}
          >
            {/* Chimney Smoke Rising */}
            <g className="animate-smoke group-hover:scale-110 transition-transform origin-bottom">
              <ellipse cx="732" cy="275" rx="14" ry="16" fill="url(#smokeGrad)" />
              <ellipse cx="738" cy="230" rx="20" ry="22" fill="url(#smokeGrad)" />
              <ellipse cx="726" cy="180" rx="28" ry="30" fill="url(#smokeGrad)" />
              <ellipse cx="742" cy="130" rx="38" ry="40" fill="url(#smokeGrad)" />
            </g>
            {/* Stone Chimney */}
            <rect x="720" y="300" width="28" height="70" fill="#18181b" rx="2" className="group-hover:stroke-amber-400 group-hover:stroke-2" />
            <rect x="716" y="295" width="36" height="8" fill="#3f3f46" rx="2" />
          </g>

          {/* CASTLE-LIKE WITCH'S HUT */}
          {/* Main stone building */}
          <rect x="640" y="420" width="220" height="200" rx="6" fill="url(#castleWallGrad)" stroke="#18181b" strokeWidth="2" />
          {/* Stone brick texture details */}
          <rect x="660" y="450" width="28" height="12" rx="2" fill="#52525b" opacity="0.4" />
          <rect x="760" y="460" width="34" height="12" rx="2" fill="#52525b" opacity="0.4" />
          <rect x="710" y="550" width="30" height="12" rx="2" fill="#52525b" opacity="0.4" />
          <rect x="810" y="540" width="26" height="12" rx="2" fill="#52525b" opacity="0.4" />

          {/* Castle Turret on Left */}
          <rect x="610" y="380" width="60" height="240" rx="4" fill="#27272a" stroke="#18181b" strokeWidth="2" />
          {/* Turret conical magical pointed roof with star */}
          <polygon points="595,380 640,260 685,380" fill="url(#turretRoofGrad)" stroke="#4338ca" strokeWidth="1.5" />
          <circle cx="640" cy="256" r="5" fill="#fef08a" className="animate-pulse" />

          {/* Main Roof: Cozy thatched arched gable with violet tiles */}
          <polygon points="620,420 750,310 880,420" fill="#312e81" stroke="#1e1b4b" strokeWidth="2" />
          <polygon points="640,420 750,330 860,420" fill="#3730a3" opacity="0.8" />

          {/* Turret Tiny Starlight Window - Touch to flicker */}
          <g
            className="animate-window-flicker cursor-pointer pointer-events-auto"
            onClick={(e) => handleWorldTouch(e, 'candle_flicker', 'A secret observatory lantern twinkles high up in the tower.', 'Une veilleuse secrète scintille en haut de la tour.', '✨')}
          >
            <rect x="630" y="410" width="20" height="30" rx="10" fill="url(#cottageWindowGlow)" stroke="#78350f" strokeWidth="1.5" />
          </g>

          {/* Main Warm Cottage Window with Wooden Frame & Light Flicker */}
          <g
            className="animate-window-flicker cursor-pointer pointer-events-auto group"
            onClick={(e) => handleWorldTouch(e, 'candle_flicker', 'Warm golden candlelight illuminates the tea table inside...', 'Une chaude lueur dorée éclaire la table à thé...', '☕')}
          >
            <rect x="670" y="460" width="70" height="70" rx="8" fill="url(#cottageWindowGlow)" stroke="#78350f" strokeWidth="3" className="group-hover:stroke-amber-300" />
            <line x1="705" y1="460" x2="705" y2="530" stroke="#78350f" strokeWidth="3" />
            <line x1="670" y1="495" x2="740" y2="495" stroke="#78350f" strokeWidth="3" />
            <circle cx="705" cy="495" r="50" fill="#fbbf24" opacity="0.2" className="group-hover:opacity-40 transition-opacity" />
          </g>

          {/* Castle Arched Wooden Door - Touch to knock */}
          <g
            className="cursor-pointer pointer-events-auto group"
            onClick={(e) => handleWorldTouch(e, 'door_knock', '*Knock knock*—A comforting voice welcomes you from inside!', '*Toc toc*—Une voix bienveillante vous accueille !', '🚪')}
          >
            <path d="M780 620 L780 530 Q805 500 830 530 L830 620 Z" fill="#451a03" stroke="#1c0a00" strokeWidth="2.5" className="group-hover:stroke-amber-400" />
            {/* Iron Door Hinges */}
            <line x1="782" y1="540" x2="800" y2="540" stroke="#78716c" strokeWidth="2" />
            <line x1="782" y1="590" x2="800" y2="590" stroke="#78716c" strokeWidth="2" />
            {/* Golden Door Handle */}
            <circle cx="820" cy="570" r="4" fill="#f59e0b" className="group-hover:scale-125 transition-transform origin-center" />
            {/* Hanging Lantern Beside Door */}
            <line x1="765" y1="520" x2="765" y2="535" stroke="#78716c" strokeWidth="1.5" />
            <polygon points="760,535 770,535 768,548 762,548" fill="#fef08a" className="animate-pulse" />
          </g>

          {/* Rolling grassy hills */}
          <path d="M0 620 Q450 560 850 630 T1200 600 L1200 800 L0 800 Z" fill="#064e3b" opacity="0.85" />
          <path d="M0 680 Q300 630 650 690 T1200 670 L1200 800 L0 800 Z" fill="#022c22" />

          {/* Foreground Magical Trees on Hill - Touch to rustle */}
          <g
            className="cursor-pointer pointer-events-auto"
            onClick={(e) => handleWorldTouch(e, 'tree_rustle', 'The great oak sways gracefully in the mountain air.', 'Le grand chêne ondule avec grâce dans l’air des cimes.', '🌳')}
          >
            {/* Oak Tree left */}
            <g className="animate-tree-sway-slow origin-bottom">
              <path d="M80 720 Q95 640 90 560 L110 560 Q105 640 120 720 Z" fill="#291807" />
              <circle cx="100" cy="540" r="48" fill="#065f46" opacity="0.95" />
              <circle cx="80" cy="520" r="36" fill="#047857" opacity="0.9" />
              <circle cx="120" cy="525" r="38" fill="#059669" opacity="0.85" />
            </g>

            {/* Blossom Tree near path */}
            <g className="animate-tree-sway-reverse origin-bottom">
              <path d="M380 740 Q390 670 385 600 L400 600 Q395 670 410 740 Z" fill="#291807" />
              <circle cx="392" cy="590" r="35" fill="#047857" opacity="0.95" />
              <circle cx="380" cy="575" r="26" fill="#059669" opacity="0.9" />
              <circle cx="410" cy="580" r="28" fill="#10b981" opacity="0.8" />
              <circle cx="375" cy="570" r="3" fill="#f472b6" />
              <circle cx="405" cy="575" r="3" fill="#f472b6" />
              <circle cx="390" cy="595" r="2.5" fill="#fbcfe8" />
            </g>
          </g>

          {/* Swaying Flowers & Cute Meadow Details on Grass - Touch to bloom */}
          <g
            className="animate-flower-sway cursor-pointer pointer-events-auto"
            onClick={(e) => handleWorldTouch(e, 'flower_bloom', 'Tender meadow flowers release a sweet floral perfume! 🌸✨', 'Les fleurs sauvages libèrent un doux parfum printanier ! 🌸✨', '🌸')}
          >
            {/* Buttercup */}
            <line x1="200" y1="720" x2="200" y2="690" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
            <circle cx="200" cy="690" r="5.5" fill="#fde047" />
            <circle cx="200" cy="690" r="2" fill="#ea580c" />

            {/* Lavender */}
            <line x1="230" y1="735" x2="230" y2="700" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="230" cy="700" rx="4" ry="8" fill="#c084fc" />

            {/* Pink Blossom */}
            <line x1="470" y1="750" x2="470" y2="715" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
            <circle cx="470" cy="715" r="6.5" fill="#f472b6" />
            <circle cx="470" cy="715" r="2.5" fill="#ffffff" />

            {/* White Daisy */}
            <line x1="510" y1="760" x2="510" y2="728" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
            <circle cx="510" cy="728" r="6" fill="#f8fafc" />
            <circle cx="510" cy="728" r="2" fill="#facc15" />

            {/* Golden Glow near Cottage */}
            <line x1="910" y1="730" x2="910" y2="695" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
            <circle cx="910" cy="695" r="6" fill="#fbbf24" />
            <circle cx="910" cy="695" r="2" fill="#b45309" />

            {/* Sweet Violet */}
            <line x1="945" y1="745" x2="945" y2="710" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="945" cy="710" rx="4.5" ry="7" fill="#e879f9" />

            {/* Bluebell */}
            <line x1="980" y1="755" x2="980" y2="725" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="980" cy="725" rx="5" ry="6" fill="#60a5fa" />
          </g>
        </svg>
      )}

      {location === 'whispering_forest' && (
        <svg className="w-full h-full object-cover" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="forestSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#022c22" />
              <stop offset="40%" stopColor="#064e3b" />
              <stop offset="100%" stopColor="#065f46" />
            </linearGradient>
            <radialGradient id="frostGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#forestSky)" />
          {/* Deep Forest Tree Silhouettes & Breathing Living Shadows */}
          <g className="animate-forest-shadow-breathe origin-bottom">
            <path d="M0 800 L140 320 L280 800 Z" fill="#022c22" />
            <path d="M220 800 L360 260 L500 800 Z" fill="#011e17" />
            <path d="M700 800 L860 290 L1020 800 Z" fill="#022c22" />
            <path d="M920 800 L1080 340 L1200 800 Z" fill="#011e17" />
          </g>
          {/* Hollow birch trunk */}
          <g className="animate-forest-shadow-breathe [animation-delay:2s] origin-bottom">
            <path d="M500 480 Q470 650 440 800 L620 800 Q600 650 580 480 Z" fill="#0f172a" />
            <ellipse cx="530" cy="680" rx="35" ry="55" fill="#022c22" />
            <circle cx="530" cy="680" r="50" fill="url(#frostGlow)" />
          </g>
        </svg>
      )}

      {location === 'crossroads_kiln' && (
        <svg className="w-full h-full object-cover" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="kilnSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#18181b" />
              <stop offset="60%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <radialGradient id="fireGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#ea580c" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#kilnSky)" />
          {/* Rocky canyon arches */}
          <path d="M0 300 Q250 200 400 450 T150 800 L0 800 Z" fill="#1c1917" />
          <path d="M1200 280 Q950 180 800 460 T1050 800 L1200 800 Z" fill="#1c1917" />
          {/* Stone kiln center */}
          <path d="M480 750 Q600 420 720 750 Z" fill="#292524" />
          <ellipse cx="600" cy="650" rx="70" ry="85" fill="url(#fireGlow)" />
          <ellipse cx="600" cy="655" rx="35" ry="45" fill="#fef08a" opacity="0.95" />
          <path d="M0 690 Q600 660 1200 700 L1200 800 L0 800 Z" fill="#0c0a09" />
        </svg>
      )}

      {location === 'windy_road' && (
        <svg className="w-full h-full object-cover" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="roadSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#080f20" />
              <stop offset="40%" stopColor="#0f172a" />
              <stop offset="75%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="mountainMistGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0" />
              <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="snowPeakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#roadSky)" />

          {/* Distant Cold Mountain Peaks */}
          <polygon points="150,280 340,580 0,580" fill="#1e293b" opacity="0.9" />
          <polygon points="150,280 180,340 120,340" fill="url(#snowPeakGrad)" opacity="0.85" />

          <polygon points="600,220 890,620 310,620" fill="#0f172a" />
          <polygon points="600,220 650,300 550,300" fill="url(#snowPeakGrad)" opacity="0.9" />

          <polygon points="1050,260 1280,640 820,640" fill="#1e293b" opacity="0.9" />
          <polygon points="1050,260 1090,330 1010,330" fill="url(#snowPeakGrad)" opacity="0.85" />

          {/* Rolling Cold Misty Clouds on Mountain Slopes */}
          <g className="animate-pulse opacity-85">
            <ellipse cx="280" cy="380" rx="260" ry="45" fill="url(#mountainMistGrad)" />
            <ellipse cx="780" cy="350" rx="320" ry="55" fill="url(#mountainMistGrad)" />
            <ellipse cx="500" cy="450" rx="380" ry="60" fill="url(#mountainMistGrad)" />
          </g>

          {/* Breezy Wind Lines */}
          <g opacity="0.4" stroke="#e0f2fe" strokeWidth="1.5" strokeLinecap="round" fill="none">
            <path d="M100 320 Q200 300 300 325 T500 315" strokeDasharray="15 8" />
            <path d="M650 280 Q780 260 900 285 T1150 270" strokeDasharray="20 10" />
            <path d="M250 460 Q400 430 600 465 T950 440" strokeDasharray="18 12" />
          </g>

          {/* Subtle Falling Snow Particles in SVG Overlay */}
          <g fill="#ffffff" opacity="0.8">
            <circle cx="120" cy="180" r="2.5" className="animate-snow-fall" />
            <circle cx="280" cy="120" r="3" className="animate-snow-fall-delayed" />
            <circle cx="450" cy="200" r="2" className="animate-snow-fall" />
            <circle cx="620" cy="150" r="3.2" className="animate-snow-fall-delayed" />
            <circle cx="780" cy="220" r="2.2" className="animate-snow-fall" />
            <circle cx="940" cy="130" r="2.8" className="animate-snow-fall-delayed" />
            <circle cx="1100" cy="190" r="2" className="animate-snow-fall" />
          </g>

          {/* Winding Mountain Road Covered in Light Frost */}
          <path d="M0 680 Q350 560 650 640 T1200 600 L1200 800 L0 800 Z" fill="#1e293b" />
          <path d="M0 678 Q350 558 650 638 T1200 598" stroke="#cbd5e1" strokeWidth="2" fill="none" opacity="0.5" strokeDasharray="12 8" />
          <path d="M1200 720 C900 710 700 630 550 670 S250 780 0 790 L0 800 L1200 800 Z" fill="#0f172a" />
        </svg>
      )}

      {location === 'bottle_path' && (
        <svg className="w-full h-full object-cover" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="bottleSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#050814" />
              <stop offset="40%" stopColor="#0b1329" />
              <stop offset="80%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#2e1065" />
            </linearGradient>
            <radialGradient id="bottleGlowEffect" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#7dd3fc" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#c084fc" stopOpacity="0.6" />
              <stop offset="80%" stopColor="#818cf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bottleGlassCore" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#a5f3fc" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
            </radialGradient>
            <linearGradient id="celestialRay" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#fde047" stopOpacity="0.45" />
            </linearGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#bottleSky)" />

          {/* Magical Celestial Light Beam from Forest Canopy onto the Bottle */}
          <polygon points="600,0 520,530 680,530" fill="url(#celestialRay)" opacity="0.6" />
          <polygon points="570,0 560,540 640,540" fill="#ffffff" opacity="0.15" />

          {/* Distant mystical twilight trees */}
          <path d="M60 800 L160 380 L260 800 Z" fill="#0b132b" />
          <path d="M180 800 L280 430 L380 800 Z" fill="#070c1e" />
          <path d="M840 800 L940 390 L1040 800 Z" fill="#070c1e" />
          <path d="M960 800 L1060 350 L1160 800 Z" fill="#0b132b" />

          {/* Winding Cobblestone Forest Path */}
          <path d="M0 720 Q600 640 1200 730 L1200 800 L0 800 Z" fill="#0f172a" />
          <path d="M200 730 Q600 660 1000 730" stroke="#334155" strokeWidth="2" strokeDasharray="16 10" fill="none" opacity="0.6" />

          {/* Ancient Mossy Stone Pedestal / Milestone */}
          <path d="M520 700 Q600 500 680 700 Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          {/* Mossy Green Patches on Stone */}
          <ellipse cx="585" cy="565" rx="14" ry="8" fill="#15803d" opacity="0.75" />
          <ellipse cx="618" cy="580" rx="12" ry="6" fill="#166534" opacity="0.8" />
          <ellipse cx="560" cy="620" rx="18" ry="10" fill="#15803d" opacity="0.7" />

          {/* Pulsing Outer Aurora Nebula around the Bottle */}
          <circle cx="600" cy="520" r="110" fill="url(#bottleGlowEffect)" className="animate-pulse" />
          <circle cx="600" cy="520" r="65" fill="url(#bottleGlowEffect)" className="animate-ping" opacity="0.4" />

          {/* Floating Starlight Motes rising around the Bottle */}
          <g id="bottle-sparkles">
            <circle cx="560" cy="480" r="2.5" fill="#fde047" className="animate-bounce" />
            <circle cx="640" cy="460" r="3" fill="#38bdf8" className="animate-pulse" />
            <circle cx="580" cy="430" r="2" fill="#e879f9" className="animate-ping" />
            <circle cx="625" cy="410" r="2.2" fill="#fef08a" className="animate-pulse" />
            <circle cx="545" cy="530" r="1.8" fill="#a78bfa" className="animate-pulse" />
            <circle cx="655" cy="520" r="2" fill="#67e8f9" className="animate-bounce" />
            {/* Sparkle Glints */}
            <polygon points="600,430 602,434 606,435 602,437 600,441 598,437 594,435 598,434" fill="#ffffff" className="animate-glint-flash" />
            <polygon points="570,490 571.5,493 574.5,494 571.5,495 570,498 568.5,495 565.5,494 568.5,493" fill="#fde047" className="animate-glint-flash" />
          </g>

          {/* THE PRISTINE HAND-BLOWN GLASS BOTTLE */}
          <g id="magical-glass-bottle">
            {/* Bottle Body */}
            <ellipse cx="600" cy="540" rx="20" ry="26" fill="url(#bottleGlassCore)" stroke="#bae6fd" strokeWidth="1.5" />
            {/* Bottle Neck */}
            <rect x="592" y="500" width="16" height="20" rx="2" fill="url(#bottleGlassCore)" stroke="#bae6fd" strokeWidth="1.2" />
            {/* Glass Lip */}
            <ellipse cx="600" cy="499" rx="10" ry="3.5" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" />
            
            {/* Cork with Violet Wax Seal */}
            <ellipse cx="600" cy="496" rx="8" ry="4" fill="#b45309" stroke="#78350f" strokeWidth="1" />
            <circle cx="600" cy="495" r="3.5" fill="#db2777" />
            <circle cx="600" cy="495" r="1" fill="#fbcfe8" />

            {/* Glowing Golden Birthday Starlight Core & Secret Letter Scroll inside */}
            <g id="bottle-inner-secret">
              {/* Golden Core Glow */}
              <circle cx="600" cy="540" r="12" fill="#fbbf24" className="animate-pulse" opacity="0.9" />
              {/* Miniature Rolled Parchment Scroll with Red Ribbon */}
              <rect x="595" y="528" width="10" height="18" rx="2" fill="#fef08a" stroke="#d97706" strokeWidth="0.8" transform="rotate(-6 600 537)" />
              <rect x="594" y="535" width="12" height="3" fill="#ef4444" transform="rotate(-6 600 537)" />
              {/* Glowing Heart/Star Sigil on the scroll */}
              <circle cx="600" cy="537" r="2.2" fill="#ffffff" className="animate-ping" />
            </g>

            {/* Curving Glass Reflection Highlight Arc */}
            <path d="M587 525 Q585 540 592 555" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
            <circle cx="590" cy="510" r="1.5" fill="#ffffff" opacity="0.9" />
          </g>
        </svg>
      )}

      {location === 'velvet_abyss' && (
        <svg className="w-full h-full object-cover" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="chasmSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#030206" />
              <stop offset="50%" stopColor="#090510" />
              <stop offset="85%" stopColor="#120822" />
              <stop offset="100%" stopColor="#06020c" />
            </linearGradient>
            <radialGradient id="chasmFaintGlow" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#2e1065" stopOpacity="0.25" />
              <stop offset="40%" stopColor="#1e0538" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#030206" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="obsidianSpires" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f0918" />
              <stop offset="60%" stopColor="#07040c" />
              <stop offset="100%" stopColor="#020104" />
            </linearGradient>
            <linearGradient id="mistFog" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#1a0a2e" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#0e041a" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Deep Obsidian Abyss Pitch Sky */}
          <rect width="1200" height="800" fill="url(#chasmSky)" />
          
          {/* Central Cosmic Depth */}
          <rect width="1200" height="800" fill="url(#chasmFaintGlow)" />

          {/* Distant Jagged Obsidian Spire Monoliths & Breathing Abyss Shadows */}
          <g className="animate-abyss-shadow-breathe origin-bottom">
            <polygon points="120,800 180,280 240,800" fill="url(#obsidianSpires)" opacity="0.7" />
            <polygon points="260,800 310,340 370,800" fill="#090412" opacity="0.6" />
            <polygon points="820,800 890,260 960,800" fill="url(#obsidianSpires)" opacity="0.7" />
            <polygon points="980,800 1040,320 1100,800" fill="#090412" opacity="0.6" />
            <polygon points="40,800 80,400 130,800" fill="#06020a" opacity="0.8" />
            <polygon points="1070,800 1120,380 1180,800" fill="#06020a" opacity="0.8" />
          </g>

          {/* Looming Chasm Spires in Foreground */}
          <g className="animate-abyss-shadow-breathe [animation-delay:3s] origin-bottom">
            <path d="M0 800 L0 480 Q180 430 280 620 L350 800 Z" fill="#07030e" />
            <path d="M1200 800 L1200 460 Q1020 420 920 620 L850 800 Z" fill="#07030e" />
          </g>

          {/* Suspended Ancient Obsidian Platform where the entity stands */}
          <g className="animate-abyss-shadow-breathe [animation-delay:1.5s] origin-bottom">
            <path d="M380 720 Q600 680 820 720 L760 800 L440 800 Z" fill="#090411" />
            <ellipse cx="600" cy="715" rx="220" ry="32" fill="#050209" stroke="#1c0a33" strokeWidth="1" />
          </g>

          {/* Inverted umbrella silhouette in far mist */}
          <path d="M260 380 Q285 415 310 380 Z" fill="#130624" opacity="0.5" />
          <line x1="285" y1="380" x2="285" y2="350" stroke="#1e0a36" strokeWidth="1.5" opacity="0.5" />
          {/* Distant slow ticking clock silhouette */}
          <circle cx="920" cy="360" r="24" fill="#0b0317" stroke="#1f0938" strokeWidth="1" opacity="0.4" />
          <line x1="920" y1="360" x2="920" y2="344" stroke="#2e1065" strokeWidth="1.2" opacity="0.5" />
          <line x1="920" y1="360" x2="932" y2="360" stroke="#2e1065" strokeWidth="1.2" opacity="0.5" />

          {/* Creeping Void Mist Layer */}
          <rect x="0" y="520" width="1200" height="280" fill="url(#mistFog)" />
          <ellipse cx="600" cy="690" rx="550" ry="60" fill="#1a0833" opacity="0.2" />

          {/* Floating Stardust / Void Motes */}
          <circle cx="210" cy="320" r="1" fill="#c084fc" opacity="0.4" />
          <circle cx="340" cy="240" r="1.2" fill="#fbbf24" opacity="0.3" />
          <circle cx="520" cy="380" r="0.8" fill="#e879f9" opacity="0.4" />
          <circle cx="780" cy="260" r="1.2" fill="#a855f7" opacity="0.3" />
          <circle cx="880" cy="420" r="0.9" fill="#fde047" opacity="0.3" />
          <circle cx="1020" cy="300" r="1.1" fill="#c084fc" opacity="0.3" />
        </svg>
      )}

      {/* SEA SHORE DUSK (Witch Ponders with Dark Clouds, Falling Rain, and Waves) */}
      {location === 'sea_shore_dusk' && (
        <svg className="w-full h-full object-cover" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="seaDuskDarkSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#030712" />
              <stop offset="35%" stopColor="#0f172a" />
              <stop offset="70%" stopColor="#082f49" />
              <stop offset="100%" stopColor="#0c4a6e" />
            </linearGradient>
            <linearGradient id="darkStormCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#0f172a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#seaDuskDarkSky)" />

          {/* Distant subtle lightning glow flash */}
          <rect width="1200" height="800" fill="#bae6fd" opacity="0.08" className="animate-pulse" />

          {/* Dark Storm Clouds Looming Overhead */}
          <g className="animate-cloud-drift opacity-85">
            <ellipse cx="200" cy="120" rx="180" ry="60" fill="url(#darkStormCloudGrad)" />
            <ellipse cx="380" cy="100" rx="140" ry="50" fill="url(#darkStormCloudGrad)" />
            <ellipse cx="600" cy="130" rx="200" ry="70" fill="url(#darkStormCloudGrad)" />
            <ellipse cx="850" cy="110" rx="160" ry="55" fill="url(#darkStormCloudGrad)" />
            <ellipse cx="1050" cy="140" rx="180" ry="65" fill="url(#darkStormCloudGrad)" />
          </g>

          {/* Falling Rain Streaks */}
          <g className="animate-rain-fall opacity-70" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round">
            <line x1="120" y1="180" x2="110" y2="220" />
            <line x1="220" y1="150" x2="210" y2="190" />
            <line x1="340" y1="200" x2="330" y2="240" />
            <line x1="450" y1="160" x2="440" y2="200" />
            <line x1="560" y1="210" x2="550" y2="250" />
            <line x1="680" y1="170" x2="670" y2="210" />
            <line x1="790" y1="220" x2="780" y2="260" />
            <line x1="910" y1="160" x2="900" y2="200" />
            <line x1="1020" y1="190" x2="1010" y2="230" />
            <line x1="1130" y1="150" x2="1120" y2="190" />
            <line x1="180" y1="280" x2="170" y2="320" />
            <line x1="390" y1="290" x2="380" y2="330" />
            <line x1="620" y1="300" x2="610" y2="340" />
            <line x1="840" y1="270" x2="830" y2="310" />
            <line x1="1060" y1="290" x2="1050" y2="330" />
          </g>

          {/* Horizon Sea Water */}
          <rect x="0" y="470" width="1200" height="330" fill="#042f2e" />

          {/* Animated Rolling Ocean Waves */}
          <g className="animate-wave-roll">
            {/* Distant Wave */}
            <path d="M0 485 Q150 475 300 485 T600 485 T900 485 T1200 485 L1200 800 L0 800 Z" fill="#083344" opacity="0.9" />
            {/* Mid Wave with foam crest */}
            <path d="M0 520 Q200 500 400 520 T800 520 T1200 520 L1200 800 L0 800 Z" fill="#0e4456" />
            <path d="M0 518 Q200 498 400 518 T800 518 T1200 518" stroke="#bae6fd" strokeWidth="2" fill="none" opacity="0.6" />
            {/* Foreground Surging Wave */}
            <path d="M0 575 Q250 545 500 575 T1000 575 T1200 570 L1200 800 L0 800 Z" fill="#0f172a" />
            <path d="M0 573 Q250 543 500 573 T1000 573 T1200 568" stroke="#e0f2fe" strokeWidth="2.5" fill="none" opacity="0.7" />
          </g>

          {/* Pebbled Dark Shore with Tide Foam */}
          <path d="M0 650 Q600 590 1200 640 L1200 800 L0 800 Z" fill="#1e293b" />
          <path d="M0 648 Q600 588 1200 638" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="8 6" fill="none" opacity="0.4" />
        </svg>
      )}

      {/* SEA SHORE SUNRISE (Sun Returns: Dark clouds gone, rain stops, glorious sunrise over water) */}
      {location === 'sea_shore_sunrise' && (
        <svg className="w-full h-full object-cover" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="sunriseSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#431407" />
              <stop offset="30%" stopColor="#9a3412" />
              <stop offset="65%" stopColor="#ea580c" />
              <stop offset="85%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>
            <radialGradient id="sunOrb" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#sunriseSky)" />
          {/* Rising Sun */}
          <circle cx="600" cy="450" r="150" fill="url(#sunOrb)" className="animate-pulse" />
          {/* Radiant Sunbeams */}
          <g opacity="0.35">
            <polygon points="600,450 0,0 80,0" fill="#fef08a" />
            <polygon points="600,450 300,0 420,0" fill="#fef08a" />
            <polygon points="600,450 780,0 900,0" fill="#fef08a" />
            <polygon points="600,450 1120,0 1200,0" fill="#fef08a" />
          </g>

          {/* Golden Ocean Water */}
          <rect x="0" y="470" width="1200" height="330" fill="#78350f" opacity="0.9" />

          {/* Rolling Golden Waves */}
          <g className="animate-wave-roll">
            <path d="M0 500 Q300 480 600 500 T1200 495 L1200 800 L0 800 Z" fill="#92400e" />
            <path d="M0 498 Q300 478 600 498 T1200 493" stroke="#fef08a" strokeWidth="2" fill="none" opacity="0.7" />
            <path d="M0 545 Q400 520 800 545 T1200 535 L1200 800 L0 800 Z" fill="#b45309" />
            <path d="M0 542 Q400 517 800 542 T1200 532" stroke="#fde047" strokeWidth="2.5" fill="none" opacity="0.8" />
          </g>

          {/* Sunbeam trail sparkling on water */}
          <polygon points="570,470 630,470 820,800 380,800" fill="#fef08a" opacity="0.45" />
          {/* Warm Sand Shore */}
          <path d="M0 640 Q600 580 1200 630 L1200 800 L0 800 Z" fill="#451a03" />
        </svg>
      )}

      {/* ENCHANTED MAGICAL MIRROR */}
      {location === 'magic_mirror' && (
        <svg className="w-full h-full object-cover" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="mirrorBg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="40%" stopColor="#1e1b4b" />
              <stop offset="80%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#4c1d95" />
            </linearGradient>
            <radialGradient id="mirrorGlassGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="25%" stopColor="#fef08a" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#a7f3d0" stopOpacity="0.6" />
              <stop offset="80%" stopColor="#c084fc" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#312e81" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="celestialHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde047" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#ec4899" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#mirrorBg)" />

          {/* Ethereal Floating Starfield & Constellation Lines in the background */}
          <g opacity="0.65" stroke="#fde047" strokeWidth="1" strokeDasharray="3 3">
            <line x1="200" y1="180" x2="320" y2="140" />
            <line x1="320" y1="140" x2="410" y2="230" />
            <line x1="790" y1="210" x2="880" y2="150" />
            <line x1="880" y1="150" x2="1010" y2="190" />
            <circle cx="200" cy="180" r="3" fill="#fef08a" />
            <circle cx="320" cy="140" r="4" fill="#ffffff" />
            <circle cx="410" cy="230" r="3" fill="#fde047" />
            <circle cx="790" cy="210" r="3.5" fill="#fef08a" />
            <circle cx="880" cy="150" r="4.5" fill="#ffffff" />
            <circle cx="1010" cy="190" r="3" fill="#fde047" />
          </g>

          {/* Giant Outer Starlight Aura */}
          <circle cx="600" cy="390" r="360" fill="url(#celestialHalo)" className="animate-pulse" />

          {/* Antique Gilded Mirror Arch Frame with Vine Filigree */}
          <ellipse cx="600" cy="390" rx="245" ry="345" fill="#78350f" opacity="0.6" />
          <ellipse cx="600" cy="390" rx="230" ry="330" fill="#b45309" />
          <ellipse cx="600" cy="390" rx="215" ry="315" fill="#fbbf24" />
          <ellipse cx="600" cy="390" rx="195" ry="295" fill="url(#mirrorGlassGlow)" />

          {/* Golden Runes & Star Jewels around the mirror border */}
          <g fill="#fef08a">
            <circle cx="600" cy="80" r="6" />
            <polygon points="600,68 604,78 614,80 604,82 600,92 596,82 586,80 596,78" fill="#ffffff" />
            <circle cx="400" cy="240" r="4" />
            <circle cx="800" cy="240" r="4" />
            <circle cx="385" cy="400" r="4.5" />
            <circle cx="815" cy="400" r="4.5" />
            <circle cx="420" cy="560" r="4" />
            <circle cx="780" cy="560" r="4" />
          </g>

          {/* Prismatic Shimmer Waves across the glass */}
          <g className="animate-pulse opacity-75">
            <path d="M460 300 Q600 240 740 300 Q600 360 460 300 Z" fill="#ffffff" opacity="0.25" />
            <path d="M440 450 Q600 380 760 450 Q600 520 440 450 Z" fill="#67e8f9" opacity="0.18" />
          </g>

          {/* Magical Glinting Starlight Flares inside the mirror */}
          <polygon points="600,240 606,260 626,266 606,272 600,292 594,272 574,266 594,260" fill="#ffffff" className="animate-ping" opacity="0.8" />
          <polygon points="510,360 514,374 528,378 514,382 510,396 506,382 492,378 506,374" fill="#fef08a" opacity="0.9" />
          <polygon points="690,430 694,444 708,448 694,452 690,466 686,452 672,448 686,444" fill="#a7f3d0" opacity="0.9" />

          {/* Carved Walnut Wood Stand Base */}
          <polygon points="540,710 660,710 700,800 500,800" fill="#451a03" stroke="#291807" strokeWidth="3" />
          <ellipse cx="600" cy="710" rx="90" ry="18" fill="#78350f" />
        </svg>
      )}

      {/* BIRTHDAY FEAST (Interactive French Bakery, Chocolate Fountain, Watercolor Painting, Floating Music Notes & Castle Banquet Table) */}
      {location === 'birthday_feast' && (
        <svg className="w-full h-full object-cover" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="partyRoom" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2a140e" />
              <stop offset="35%" stopColor="#451a03" />
              <stop offset="70%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <pattern id="castleStoneBrick" width="80" height="40" patternUnits="userSpaceOnUse">
              <rect width="80" height="40" fill="none" stroke="#1c1917" strokeWidth="1.2" opacity="0.35" />
              <line x1="40" y1="0" x2="40" y2="40" stroke="#1c1917" strokeWidth="1.2" opacity="0.35" />
            </pattern>
            <radialGradient id="musicGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#c084fc" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="foodHaloGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="chocGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="50%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#291807" />
            </linearGradient>
            <linearGradient id="paintingSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="60%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#partyRoom)" />
          
          {/* Castle Stone Wall Pattern */}
          <rect width="1200" height="600" fill="url(#castleStoneBrick)" />

          {/* Castle Archways in Background */}
          <path d="M80 600 L80 260 Q200 140 320 260 L320 600 Z" fill="#1c1917" opacity="0.4" stroke="#451a03" strokeWidth="4" />
          <path d="M480 600 L480 260 Q600 140 720 260 L720 600 Z" fill="#1c1917" opacity="0.4" stroke="#451a03" strokeWidth="4" />

          {/* Framed Watercolor Art Painting of the Meadow & Cottage on the Castle Wall */}
          <g transform="translate(180, 200)">
            {/* Gilded Antique Frame */}
            <rect x="0" y="0" width="170" height="120" rx="8" fill="#78350f" stroke="#fbbf24" strokeWidth="4" />
            <rect x="8" y="8" width="154" height="104" rx="4" fill="#fef3c7" />
            
            {/* Watercolor Canvas Artwork */}
            <g>
              <rect x="12" y="12" width="146" height="96" fill="url(#paintingSky)" rx="2" />
              {/* Distant mountains */}
              <polygon points="12,75 50,45 90,75" fill="#a7f3d0" opacity="0.7" />
              <polygon points="70,75 115,40 158,75" fill="#6ee7b7" opacity="0.6" />
              {/* Rolling green hills */}
              <path d="M12 85 Q70 65 158 80 L158 108 L12 108 Z" fill="#10b981" opacity="0.8" />
              <path d="M12 92 Q90 80 158 95 L158 108 L12 108 Z" fill="#047857" opacity="0.9" />
              {/* Cozy Cottage in the painting */}
              <polygon points="100,68 120,52 140,68" fill="#b45309" />
              <rect x="105" y="68" width="30" height="22" fill="#fed7aa" />
              <rect x="115" y="76" width="10" height="14" fill="#78350f" />
              <circle cx="110" cy="74" r="3" fill="#fef08a" />
              {/* Radiating mini sun */}
              <circle cx="35" cy="30" r="10" fill="#fde047" opacity="0.9" />
            </g>
            {/* Label below painting */}
            <rect x="60" y="112" width="50" height="7" rx="2" fill="#fbbf24" opacity="0.8" />
          </g>

          {/* Castle Wall Sconces - Now radiating Dancing Musical Notes instead of Fire! 🎵🎶✨ */}
          <g transform="translate(60, 320)">
            <circle cx="20" cy="0" r="50" fill="url(#musicGlow)" className="animate-pulse" />
            <polygon points="12,30 28,30 24,65 16,65" fill="#78350f" stroke="#451a03" strokeWidth="1" />
            {/* Musical Notes Floating Upward */}
            <g className="animate-bounce font-serif font-bold text-amber-200">
              <text x="12" y="10" fontSize="18" fill="#fde047">🎵</text>
              <text x="24" y="-8" fontSize="15" fill="#e879f9">🎶</text>
              <text x="6" y="-18" fontSize="12" fill="#67e8f9">✨</text>
            </g>
          </g>
          <g transform="translate(1100, 320)">
            <circle cx="20" cy="0" r="50" fill="url(#musicGlow)" className="animate-pulse" />
            <polygon points="12,30 28,30 24,65 16,65" fill="#78350f" stroke="#451a03" strokeWidth="1" />
            {/* Musical Notes Floating Upward */}
            <g className="animate-bounce font-serif font-bold text-amber-200">
              <text x="12" y="10" fontSize="18" fill="#fde047">🎶</text>
              <text x="22" y="-8" fontSize="15" fill="#f472b6">🎵</text>
              <text x="8" y="-18" fontSize="12" fill="#fef08a">✨</text>
            </g>
          </g>

          {/* Castle Arched Window with Sunlight and Glint Flash */}
          <g transform="translate(860, 140)">
            <path d="M10 240 L10 100 Q90 10 170 100 L170 240 Z" fill="#fef08a" stroke="#78350f" strokeWidth="6" />
            <line x1="90" y1="20" x2="90" y2="240" stroke="#78350f" strokeWidth="4" />
            <line x1="10" y1="140" x2="170" y2="140" stroke="#78350f" strokeWidth="4" />
            {/* Window Glass Sparkle Glint */}
            <circle cx="90" cy="90" r="30" fill="#ffffff" opacity="0.4" className="animate-window-glint" />
            <polygon points="90,65 94,85 114,90 94,95 90,115 86,95 66,90 86,85" fill="#ffffff" className="animate-window-glint" />
          </g>

          {/* Swaying Celebration Bunting & Streamers */}
          <g className="animate-banner-sway">
            <path d="M0 60 Q300 160 600 60 T1200 60" stroke="#fef08a" strokeWidth="2.5" fill="none" />
            <path d="M0 120 Q300 220 600 120 T1200 120" stroke="#f43f5e" strokeWidth="2" fill="none" />
            
            {/* Triangular Flags on Bunting */}
            <polygon points="100,90 120,130 140,85" fill="#2563eb" />
            <polygon points="160,100 180,140 200,95" fill="#ffffff" />
            <polygon points="220,105 240,145 260,100" fill="#dc2626" />
            <polygon points="280,108 300,148 320,104" fill="#fbbf24" />
            <polygon points="340,105 360,145 380,100" fill="#a855f7" />
            <polygon points="400,100 420,140 440,95" fill="#2563eb" />
            <polygon points="460,90 480,130 500,85" fill="#ffffff" />
            <polygon points="520,78 540,118 560,73" fill="#dc2626" />
            <polygon points="580,68 600,108 620,65" fill="#fbbf24" />
            <polygon points="680,78 700,118 720,73" fill="#2563eb" />
            <polygon points="740,90 760,130 780,85" fill="#ffffff" />
            <polygon points="800,100 820,140 840,95" fill="#dc2626" />
            <polygon points="860,105 880,145 900,100" fill="#fbbf24" />
            <polygon points="940,100 960,140 980,95" fill="#2563eb" />
            <polygon points="1000,90 1020,130 1040,85" fill="#ffffff" />
            <polygon points="1060,78 1080,118 1100,73" fill="#dc2626" />
          </g>

          {/* Twinkling Fairytale Canopy String Lights */}
          <g id="fairy-lights-canopy">
            <path d="M0 160 Q300 240 600 170 T1200 160" stroke="#fef08a" strokeWidth="1.2" strokeDasharray="3 3" fill="none" opacity="0.6" />
            {[80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880, 960, 1040, 1120].map((lx, i) => {
              const ly = 160 + Math.sin((lx / 1200) * Math.PI) * 45;
              return (
                <g key={`fairylight-${i}`} transform={`translate(${lx}, ${ly})`}>
                  <circle cx="0" cy="0" r="5" fill="#fef08a" className="animate-pulse" />
                  <circle cx="0" cy="0" r="1.8" fill="#ffffff" />
                  <circle cx="0" cy="0" r="12" fill="#fbbf24" opacity="0.25" />
                </g>
              );
            })}
          </g>

          {/* Grand Wooden Banquet Table */}
          <path d="M0 640 L1200 640 L1200 800 L0 800 Z" fill="#451a03" />
          <rect x="0" y="600" width="1200" height="50" fill="#92400e" stroke="#78350f" strokeWidth="2" />
          <rect x="0" y="610" width="1200" height="15" fill="#fed7aa" opacity="0.6" />

          {/* SPRITE GUEST 1: LUMI THE STAR-ELF (Sitting cheerfully at left end of table) */}
          <g id="guest-lumi-elf" transform="translate(45, 500)">
            {/* Wooden stool */}
            <rect x="15" y="80" width="30" height="40" rx="3" fill="#78350f" />
            {/* Elf Body & Leaf Tunic */}
            <path d="M20 70 L40 70 L46 95 L14 95 Z" fill="#15803d" />
            <rect x="17" y="80" width="26" height="4" fill="#fbbf24" />
            {/* Elf Head */}
            <circle cx="30" cy="55" r="14" fill="#fed7aa" />
            {/* Pointed Elf Ears */}
            <polygon points="16,55 6,50 17,60" fill="#fed7aa" />
            <polygon points="44,55 54,50 43,60" fill="#fed7aa" />
            {/* Leaf Cap with tiny golden bell */}
            <path d="M16 48 Q30 30 52 28 Q44 48 30 50 Z" fill="#16a34a" />
            <circle cx="52" cy="28" r="3" fill="#fef08a" className="animate-pulse" />
            {/* Smiling Face */}
            <circle cx="26" cy="54" r="1.8" fill="#1c1917" />
            <circle cx="34" cy="54" r="1.8" fill="#1c1917" />
            <ellipse cx="23" cy="58" rx="2.5" ry="1.5" fill="#f43f5e" opacity="0.4" />
            <ellipse cx="37" cy="58" rx="2.5" ry="1.5" fill="#f43f5e" opacity="0.4" />
            <path d="M27 60 Q30 64 33 60" stroke="#b91c1c" strokeWidth="1.2" fill="none" />
            {/* Acorn cup in hands */}
            <circle cx="30" cy="74" r="5" fill="#b45309" />
          </g>

          {/* SPRITE GUEST 2: FLEUR THE PETAL FAIRY (Fluttering above the right table) */}
          <g id="guest-fleur-fairy" transform="translate(830, 470)" className="animate-fairy-flutter">
            {/* Fairy Wings (Left & Right) */}
            <ellipse cx="-12" cy="-6" rx="14" ry="7" fill="#bae6fd" opacity="0.75" className="animate-fairy-wing" transform="rotate(-30 -12 -6)" />
            <ellipse cx="12" cy="-6" rx="14" ry="7" fill="#bae6fd" opacity="0.75" className="animate-fairy-wing" transform="rotate(30 12 -6)" />
            {/* Fairy Body & Blossom Petal Dress */}
            <path d="M-6 8 L6 8 L10 24 L-10 24 Z" fill="#f472b6" />
            {/* Fairy Head */}
            <circle cx="0" cy="0" r="9" fill="#fed7aa" />
            {/* Dandelion Flower Crown */}
            <ellipse cx="0" cy="-6" rx="9" ry="4" fill="#fef08a" />
            <circle cx="0" cy="-8" r="2.5" fill="#f59e0b" />
            {/* Cute Face */}
            <circle cx="-3" cy="-1" r="1.2" fill="#1c1917" />
            <circle cx="3" cy="-1" r="1.2" fill="#1c1917" />
            <ellipse cx="-4.5" cy="2" rx="1.8" ry="1" fill="#f43f5e" opacity="0.5" />
            <ellipse cx="4.5" cy="2" rx="1.8" ry="1" fill="#f43f5e" opacity="0.5" />
            <path d="M-2 3 Q0 5 2 3" stroke="#e11d48" strokeWidth="1" fill="none" />
            {/* Clover Wand */}
            <line x1="6" y1="8" x2="16" y2="2" stroke="#4ade80" strokeWidth="1.5" />
            <circle cx="16" cy="2" r="2.5" fill="#86efac" />
            <circle cx="16" cy="2" r="1" fill="#ffffff" className="animate-ping" />
          </g>

          {/* SPRITE GUEST 3: PIPPIN THE FOREST MOSS SPROUT (Sitting beside the cheese tray) */}
          <g id="guest-pippin-sprout" transform="translate(380, 545)">
            {/* Little Round Body */}
            <ellipse cx="0" cy="18" rx="12" ry="10" fill="#4ade80" />
            {/* Little Acorn Cap */}
            <ellipse cx="0" cy="8" rx="13" ry="6" fill="#78350f" />
            <rect x="-1.5" y="0" width="3" height="6" rx="1" fill="#451a03" />
            {/* Curious Big Eyes */}
            <circle cx="-4" cy="15" r="2.2" fill="#1c1917" />
            <circle cx="4" cy="15" r="2.2" fill="#1c1917" />
            <circle cx="-3" cy="14" r="0.8" fill="#ffffff" />
            <circle cx="5" cy="14" r="0.8" fill="#ffffff" />
            <path d="M-2 19 Q0 22 2 19" stroke="#15803d" strokeWidth="1.2" fill="none" />
          </g>

          {/* FEAST ITEMS ALONG TABLE (Interactive onClick with subtle light glow & scale animation) */}
          
          {/* 1. French Baguettes in basket */}
          <g
            id="feast-baguettes"
            className={`cursor-pointer transition-transform duration-300 ${activeBounceFood === 'baguettes' ? 'scale-125 origin-center' : 'hover:scale-105'}`}
            onClick={(e) => handleFoodClick(e, 'baguettes', 'Golden Crusty French Baguette!', 'Baguette tradition bien croustillante !', '🥖')}
          >
            {/* Subtle Light Glow */}
            <circle cx="140" cy="570" r="45" fill="url(#foodHaloGlow)" opacity="0.7" className="animate-pulse" />
            <ellipse cx="140" cy="580" rx="36" ry="20" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
            <ellipse cx="130" cy="565" rx="8" ry="28" fill="#d97706" transform="rotate(25 130 565)" />
            <ellipse cx="150" cy="565" rx="8" ry="28" fill="#d97706" transform="rotate(-15 150 565)" />
            <circle cx="140" cy="550" r="1.5" fill="#fef08a" className="animate-ping" />
          </g>
          
          {/* 2. Plate of Golden Croissants */}
          <g
            id="feast-croissants"
            className={`cursor-pointer transition-transform duration-300 ${activeBounceFood === 'croissants' ? 'scale-125 origin-center' : 'hover:scale-105'}`}
            onClick={(e) => handleFoodClick(e, 'croissants', 'Warm Flaky Butter Croissant!', 'Croissant pur beurre tout chaud !', '🥐')}
          >
            {/* Subtle Light Glow */}
            <circle cx="280" cy="580" r="45" fill="url(#foodHaloGlow)" opacity="0.7" className="animate-pulse" />
            <ellipse cx="280" cy="590" rx="40" ry="14" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M255 585 Q280 565 305 585 Q280 575 255 585 Z" fill="#d97706" stroke="#b45309" strokeWidth="1" />
            <path d="M265 588 Q290 568 315 588 Q290 578 265 588 Z" fill="#b45309" />
          </g>

          {/* 3. Cheese Wheel & Sweet Berries */}
          <g
            id="feast-cheese-berries"
            className={`cursor-pointer transition-transform duration-300 ${activeBounceFood === 'cheese' ? 'scale-125 origin-center' : 'hover:scale-105'}`}
            onClick={(e) => handleFoodClick(e, 'cheese', 'Artisan Cheese & Sweet Woodland Berries!', 'Fromage fermier et baies des bois sucrées !', '🧀')}
          >
            {/* Subtle Light Glow */}
            <circle cx="450" cy="580" r="45" fill="url(#foodHaloGlow)" opacity="0.7" className="animate-pulse" />
            <polygon points="410,590 460,570 470,595 420,600" fill="#fef08a" stroke="#f59e0b" strokeWidth="1" />
            <circle cx="485" cy="590" r="7.5" fill="#ef4444" />
            <circle cx="500" cy="592" r="6.5" fill="#ef4444" />
            <circle cx="493" cy="585" r="5.5" fill="#ef4444" />
          </g>

          {/* 4. GRAND CASCADING CHOCOLATE FOUNTAIN (Centerpiece of the banquet table) */}
          <g
            id="feast-chocolate-fountain"
            className={`cursor-pointer transition-transform duration-300 ${activeBounceFood === 'fountain' ? 'scale-125 origin-center' : 'hover:scale-105'}`}
            onClick={(e) => handleFoodClick(e, 'fountain', 'Flowing Rich Dark Chocolate Fountain with Fresh Berries!', 'Fontaine de chocolat chaud coulant à flots avec fraises fraîches !', '🍫')}
          >
            {/* Radiant magical warm golden glow underneath */}
            <circle cx="600" cy="540" r="75" fill="url(#foodHaloGlow)" opacity="0.85" className="animate-pulse" />
            
            {/* Stainless / Gilded Basin Base */}
            <ellipse cx="600" cy="600" rx="65" ry="16" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
            <ellipse cx="600" cy="598" rx="60" ry="13" fill="#3b1d11" />
            
            {/* Tier 1 (Lowest broad tier) */}
            <ellipse cx="600" cy="578" rx="46" ry="10" fill="#291807" stroke="#78350f" strokeWidth="1.5" />
            <path d="M555 578 Q600 592 645 578" fill="#451a03" />
            
            {/* Tier 2 (Middle tier) */}
            <ellipse cx="600" cy="554" rx="34" ry="8" fill="#291807" stroke="#78350f" strokeWidth="1.5" />
            
            {/* Tier 3 (Top tier) */}
            <ellipse cx="600" cy="532" rx="22" ry="6" fill="#291807" stroke="#78350f" strokeWidth="1.5" />
            
            {/* Fountain Crown & Flowing Chocolate Dome */}
            <ellipse cx="600" cy="515" rx="12" ry="5" fill="#522516" />
            <path d="M592 515 Q600 500 608 515 Z" fill="url(#chocGradient)" />
            
            {/* Flowing Chocolate Cascades */}
            <g className="animate-pulse opacity-90">
              {/* Cascade from top to tier 3 */}
              <path d="M592 516 Q588 524 582 532 Q600 534 618 532 Q612 524 608 516 Z" fill="url(#chocGradient)" opacity="0.85" />
              {/* Cascade from tier 3 to tier 2 */}
              <path d="M578 532 Q572 543 566 554 Q600 558 634 554 Q628 543 622 532 Z" fill="url(#chocGradient)" opacity="0.85" />
              {/* Cascade from tier 2 to tier 1 */}
              <path d="M566 554 Q558 566 554 578 Q600 584 646 578 Q642 566 634 554 Z" fill="url(#chocGradient)" opacity="0.85" />
            </g>

            {/* Dipping skewers beside fountain: Strawberries on wooden skewer */}
            <line x1="535" y1="600" x2="520" y2="550" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
            <circle cx="523" cy="560" r="5" fill="#ef4444" />
            <circle cx="528" cy="575" r="5.5" fill="#ef4444" />
            
            <line x1="665" y1="600" x2="680" y2="550" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
            <circle cx="677" cy="560" r="5" fill="#ef4444" />
            <circle cx="672" cy="575" r="5.5" fill="#ef4444" />

            {/* Sparkles around fountain */}
            <circle cx="600" cy="505" r="2" fill="#fef08a" className="animate-ping" />
            <circle cx="550" cy="545" r="1.5" fill="#ffffff" className="animate-pulse" />
            <circle cx="650" cy="545" r="1.5" fill="#ffffff" className="animate-pulse" />
          </g>

          {/* 5. Rainbow Macarons Plate */}
          <g
            id="feast-macarons"
            className={`cursor-pointer transition-transform duration-300 ${activeBounceFood === 'macarons' ? 'scale-125 origin-center' : 'hover:scale-105'}`}
            onClick={(e) => handleFoodClick(e, 'macarons', 'Sweet Parisian Rainbow Macarons!', 'Macarons parisiens aux mille couleurs !', '🍬')}
          >
            {/* Subtle Light Glow */}
            <circle cx="760" cy="580" r="45" fill="url(#foodHaloGlow)" opacity="0.7" className="animate-pulse" />
            <ellipse cx="760" cy="595" rx="38" ry="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            <ellipse cx="760" cy="585" rx="15" ry="5.5" fill="#f43f5e" />
            <ellipse cx="760" cy="576" rx="15" ry="5.5" fill="#84cc16" />
            <ellipse cx="760" cy="567" rx="15" ry="5.5" fill="#a855f7" />
            <ellipse cx="760" cy="558" rx="15" ry="5.5" fill="#38bdf8" />
            <ellipse cx="760" cy="549" rx="15" ry="5.5" fill="#f59e0b" />
          </g>

          {/* 6. Steaming Hot Chocolate Teapot & Cups */}
          <g
            id="feast-hot-chocolate"
            className={`cursor-pointer transition-transform duration-300 ${activeBounceFood === 'hot_chocolate' ? 'scale-125 origin-center' : 'hover:scale-105'}`}
            onClick={(e) => handleFoodClick(e, 'hot_chocolate', 'Steaming Rich Hot Cocoa!', 'Chocolat chaud onctueux et fumant !', '☕')}
          >
            {/* Subtle Light Glow */}
            <circle cx="910" cy="580" r="45" fill="url(#foodHaloGlow)" opacity="0.7" className="animate-pulse" />
            <ellipse cx="890" cy="590" rx="18" ry="20" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="885" y="565" width="10" height="9" rx="2" fill="#cbd5e1" />
            <ellipse cx="930" cy="595" rx="12" ry="7" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            {/* Hot chocolate steam */}
            <path d="M890 560 Q895 545 890 535" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.75" className="animate-pulse" />
            <path d="M930 585 Q935 570 930 560" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.75" className="animate-pulse" />
          </g>
          
          {/* 7. French Crêpes Stack with sweet berry jam */}
          <g
            id="feast-crepes"
            className={`cursor-pointer transition-transform duration-300 ${activeBounceFood === 'crepes' ? 'scale-125 origin-center' : 'hover:scale-105'}`}
            onClick={(e) => handleFoodClick(e, 'crepes', 'Golden Crêpes with Sweet Berry Jam!', 'Crêpes dorées à la confiture de fruits rouges !', '🥞')}
          >
            {/* Subtle Light Glow */}
            <circle cx="1060" cy="580" r="45" fill="url(#foodHaloGlow)" opacity="0.7" className="animate-pulse" />
            <ellipse cx="1060" cy="595" rx="38" ry="14" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            <ellipse cx="1060" cy="588" rx="30" ry="8" fill="#fde68a" />
            <ellipse cx="1060" cy="583" rx="30" ry="8" fill="#fde68a" />
            <ellipse cx="1060" cy="578" rx="30" ry="8" fill="#fde68a" />
            <ellipse cx="1060" cy="574" rx="16" ry="5" fill="#991b1b" />
          </g>
        </svg>
      )}
      </div>

      {/* Floating Canvas Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Food Click Popups Overlay */}
      {foodReactions.map((r) => (
        <div
          key={r.id}
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full animate-bounce px-3 py-1.5 rounded-full bg-slate-900/90 text-amber-200 border border-amber-400 text-xs font-serif shadow-xl flex items-center gap-1.5"
          style={{ left: `${r.x}px`, top: `${r.y}px` }}
        >
          <span className="text-base">{r.emoji}</span>
          <span className="font-semibold">{r.text}</span>
        </div>
      ))}
    </div>
  );
};

