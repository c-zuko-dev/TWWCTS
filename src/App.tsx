import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScenicBackground } from './components/ScenicBackground';
import { CharacterPortrait } from './components/CharacterPortrait';
import { DialogueBox } from './components/DialogueBox';
import { ChoiceOverlay } from './components/ChoiceOverlay';
import { LogModal } from './components/LogModal';
import { EndingGalleryModal } from './components/EndingGalleryModal';
import { MemoriesGalleryModal } from './components/MemoriesGalleryModal';
import { TitleScreen } from './components/TitleScreen';
import { EnvironmentalFX } from './components/EnvironmentalFX';
import { StorybookExperience } from './components/StorybookExperience';
import { AchievementBanner } from './components/AchievementBanner';
import { CreditsRoll } from './components/CreditsRoll';
import { LightMeter } from './components/LightMeter';
import { WeatherOverlay } from './components/WeatherOverlay';
import { MagicTrail } from './components/MagicTrail';
import { AmbientFireflies } from './components/AmbientFireflies';
import { AutoSaveToast } from './components/AutoSaveToast';
import { BirthdayLockScreen } from './components/BirthdayLockScreen';
import { setupSecurityGuard } from './utils/securityGuard';
import { STORY_DATA, ALL_COLLECTIBLE_LIGHTS } from './data/storyData';
import { audioSynth } from './utils/audioSynthesizer';
import { ChoiceOption, GameState, Language, LightItem, ViewMode, CozyModeIntensity, SavedGamePreview, DialogueLine, CharacterId, SceneLocation } from './types';

const STORAGE_KEY = 'witch_sun_save_v1';
const COZY_MODE_KEY = 'witch_sun_cozy_mode';
const CLEARED_KEY = 'witch_sun_cleared';
const PLAY_COUNT_KEY = 'witch_sun_play_count';
const BDAY_AUTH_KEY = 'witch_sun_bday_auth_v1';

export default function App() {
  const [isBdayUnlocked, setIsBdayUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BDAY_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);
  const [inTitleScreen, setInTitleScreen] = useState(true);
  const [isShowingStorybookOpening, setIsShowingStorybookOpening] = useState(false);
  const [isShowingStorybookEnding, setIsShowingStorybookEnding] = useState(false);
  const [isShowingCredits, setIsShowingCredits] = useState(false);
  const [isMemoriesOpen, setIsMemoriesOpen] = useState(false);
  const [showAutoSaveToast, setShowAutoSaveToast] = useState(false);
  const [prologuePhase, setProloguePhase] = useState<'none' | 'opening_dissolve' | 'prologue_card' | 'environment_reveal'>('none');
  const [playCount, setPlayCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(PLAY_COUNT_KEY);
      return saved ? Math.max(1, parseInt(saved, 10)) : 1;
    } catch {
      return 1;
    }
  });
  const [currentSceneId, setCurrentSceneId] = useState<string>('prologue_1');
  const [language, setLanguage] = useState<Language>('en');
  const [viewMode, setViewMode] = useState<ViewMode>('pc');
  const [dialogueHistory, setDialogueHistory] = useState<{ speaker: string; text: string; id: string }[]>([]);
  const [collectedLights, setCollectedLights] = useState<LightItem[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [showChapterCard, setShowChapterCard] = useState(false);
  const [hasSaveData, setHasSaveData] = useState(false);
  const [savePreview, setSavePreview] = useState<SavedGamePreview | null>(null);
  const [cozyMode, setCozyMode] = useState<CozyModeIntensity>('balanced');
  const [isCozyModeUnlocked, setIsCozyModeUnlocked] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPrologueOpeningTransition, setIsPrologueOpeningTransition] = useState(false);
  const [isEpilogueEndingTransition, setIsEpilogueEndingTransition] = useState(false);
  const [activeLightReward, setActiveLightReward] = useState<LightItem | null>(null);
  const [sceneHistory, setSceneHistory] = useState<string[]>([]);

  const currentScene = STORY_DATA[currentSceneId] || STORY_DATA.prologue_1;
  const isEnding = currentSceneId === 'epilogue_screen';

  // Check if Wendy has received the SWW pin from Mélo Clown at the birthday feast
  const hasSwwPin =
    collectedLights.some((item) => item.id === 'sww_pin') ||
    [
      'epilogue_16',
      'epilogue_17',
      'epilogue_18',
      'epilogue_19',
      'epilogue_20',
      'epilogue_21',
      'epilogue_screen',
    ].includes(currentSceneId);

  const autoPlayTimerRef = useRef<number | null>(null);
  const autoSaveTimerRef = useRef<number | null>(null);

  // Determine transition mood tint for smooth, immersive scene bridging
  const getSceneMoodTint = (scene: DialogueLine) => {
    const loc = scene.location || 'cottage_twilight';
    const music = scene.music;
    const expr = scene.expression;

    // Happy / Birthday / Sunrise / Returned light
    if (loc === 'birthday_feast' || loc === 'sea_shore_sunrise' || music === 'birthday' || music === 'sunrise' || expr === 'happy') {
      return 'bg-amber-500/25 border-amber-400/40 shadow-[inset_0_0_120px_rgba(245,158,11,0.45)]';
    }
    // Nature / Forest / Orik
    if (loc === 'whispering_forest' || music === 'forest' || scene.speaker === 'orik') {
      return 'bg-emerald-900/35 border-emerald-500/40 shadow-[inset_0_0_120px_rgba(16,185,129,0.35)]';
    }
    // Glass / Kiln / Vivienne warm amber hearth
    if (loc === 'crossroads_kiln' || scene.speaker === 'artisan') {
      return 'bg-orange-950/40 border-amber-600/40 shadow-[inset_0_0_120px_rgba(234,88,12,0.4)]';
    }
    // Magic Mirror / Bottle Path / Mystical
    if (loc === 'magic_mirror' || loc === 'bottle_path' || music === 'bottle') {
      return 'bg-purple-950/40 border-purple-400/40 shadow-[inset_0_0_120px_rgba(168,85,247,0.4)]';
    }
    // Abyss / Void / Sorrow / Burdened
    if (loc === 'velvet_abyss' || music === 'abyss' || expr === 'burdened' || expr === 'overwhelmed') {
      return 'bg-slate-950/80 border-indigo-900/50 shadow-[inset_0_0_140px_rgba(30,27,75,0.7)]';
    }
    // Sea / Coast / Lezar
    if (loc === 'sea_shore_dusk' || music === 'sea') {
      return 'bg-cyan-950/35 border-cyan-500/40 shadow-[inset_0_0_120px_rgba(6,182,212,0.35)]';
    }
    // Twilight Cottage / Default
    return 'bg-indigo-950/35 border-amber-500/30 shadow-[inset_0_0_120px_rgba(99,102,241,0.3)]';
  };

  // Setup client-side protection against DevTools shortcuts & right click inspection
  useEffect(() => {
    const cleanup = setupSecurityGuard((msg) => {
      setSecurityNotice(msg);
      setTimeout(() => setSecurityNotice(null), 2500);
    });
    return cleanup;
  }, []);

  const handleUnlockBday = () => {
    setIsBdayUnlocked(true);
    try {
      localStorage.setItem(BDAY_AUTH_KEY, 'true');
    } catch {}
  };

  // Check saved state, cozy mode & unlock audio on user gesture
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHasSaveData(true);
        const parsed = JSON.parse(saved);
        if (parsed.currentSceneId && STORY_DATA[parsed.currentSceneId]) {
          const s = STORY_DATA[parsed.currentSceneId];
          setSavePreview({
            sceneId: s.id,
            location: s.location || 'cottage_twilight',
            chapterTitle: s.chapterTitle,
            chapterSubtitle: s.chapterSubtitle,
            speaker: s.speaker,
            speakerName: s.speakerName,
            collectedCount: (parsed.collectedLights || []).length,
          });
        }
      }

      const savedCozy = localStorage.getItem(COZY_MODE_KEY);
      if (savedCozy === 'minimal' || savedCozy === 'balanced' || savedCozy === 'lush') {
        setCozyMode(savedCozy);
      }

      const cleared = localStorage.getItem(CLEARED_KEY);
      if (cleared === 'true') {
        setIsCozyModeUnlocked(true);
      }
    } catch {
      // ignore
    }

    const unlockAudio = () => {
      audioSynth.init();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Unlock Cozy Mode and update playCount on story completion
  const hasRecordedCompletionRef = useRef(false);
  useEffect(() => {
    if (isShowingStorybookEnding || isShowingCredits || currentSceneId === 'epilogue_screen') {
      try {
        localStorage.setItem(CLEARED_KEY, 'true');
        setIsCozyModeUnlocked(true);
        if (!hasRecordedCompletionRef.current) {
          hasRecordedCompletionRef.current = true;
          setPlayCount((prev) => {
            const next = prev + 1;
            try {
              localStorage.setItem(PLAY_COUNT_KEY, next.toString());
            } catch {}
            return next;
          });
        }
      } catch {
        // ignore
      }
    }
  }, [isShowingStorybookEnding, isShowingCredits, currentSceneId]);

  const handleCycleCozyMode = () => {
    setCozyMode((prev) => {
      let next: CozyModeIntensity;
      if (prev === 'balanced') next = 'lush';
      else if (prev === 'lush') next = 'minimal';
      else next = 'balanced';

      try {
        localStorage.setItem(COZY_MODE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Sync music, location ambience, weather audio and sound effects on scene change
  useEffect(() => {
    if (inTitleScreen || isShowingStorybookOpening) {
      audioSynth.stopLocationAmbience();
      audioSynth.stopWeatherAmbience();
      audioSynth.playMusicTheme('title');
      return;
    }

    if (currentScene?.music) {
      audioSynth.playMusicTheme(currentScene.music);
    }
    if (currentScene?.location) {
      audioSynth.playLocationAmbience(currentScene.location);
    }
    if (currentScene?.weather) {
      audioSynth.playWeatherAmbience(currentScene.weather, currentScene.location);
    } else {
      audioSynth.playWeatherAmbience('clear');
    }
    if (currentScene?.sfx) {
      audioSynth.playSoundEffect(currentScene.sfx);
    }

    // Trigger chapter title card if chapter start (skip prologue_1 because it has its own cinematic sequence)
    if (currentScene?.isChapterStart && currentScene?.chapterTitle && prologuePhase === 'none' && currentScene.id !== 'prologue_1') {
      setShowChapterCard(true);
      const timer = window.setTimeout(() => {
        setShowChapterCard(false);
      }, 2600);
      return () => window.clearTimeout(timer);
    }
  }, [currentSceneId, inTitleScreen, isShowingStorybookOpening, currentScene, prologuePhase]);

  // Log dialogue history & auto-save with toast notification
  useEffect(() => {
    if (inTitleScreen || isShowingStorybookOpening || !currentScene?.text) return;
    const text = currentScene.text[language] || currentScene.text.en || '';
    const speakerName = currentScene.speakerName
      ? currentScene.speakerName[language]
      : currentScene.speaker !== 'narrator'
      ? currentScene.speaker
      : language === 'en'
      ? 'Chronicle'
      : 'Chronique';

    setDialogueHistory((prev) => {
      // Avoid duplicate consecutive logging
      if (prev.length > 0 && prev[prev.length - 1].id === currentScene.id) {
        return prev;
      }
      return [...prev, { speaker: speakerName, text, id: currentScene.id }];
    });

    // Auto save with visual toast feedback
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          currentSceneId: currentScene.id,
          language,
          collectedLights,
        })
      );
      setHasSaveData(true);

      // Trigger subtle non-intrusive auto-save toast
      setShowAutoSaveToast(true);
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = window.setTimeout(() => {
        setShowAutoSaveToast(false);
      }, 2200);
    } catch {
      // ignore
    }
  }, [currentSceneId, language, inTitleScreen, isShowingStorybookOpening, currentScene, collectedLights]);

  // Auto-play mechanism with relaxed reading cadence
  useEffect(() => {
    if (!isAutoPlay || inTitleScreen || isShowingStorybookOpening || currentScene.choices || isEnding || prologuePhase !== 'none') {
      if (autoPlayTimerRef.current) {
        window.clearTimeout(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      return;
    }

    // Adaptive relaxed pacing based on dialogue length
    const currentText = currentScene.text[language] || currentScene.text.en || '';
    const readingDelay = Math.min(Math.max(3800 + currentText.length * 35, 4800), 7500);

    autoPlayTimerRef.current = window.setTimeout(() => {
      if (currentScene.nextSceneId && STORY_DATA[currentScene.nextSceneId]) {
        advanceScene();
      }
    }, readingDelay);

    return () => {
      if (autoPlayTimerRef.current) {
        window.clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [isAutoPlay, currentSceneId, inTitleScreen, isShowingStorybookOpening, currentScene, isEnding, language, prologuePhase]);

  const advanceScene = useCallback(() => {
    audioSynth.playSoundEffect('click');
    if (currentScene.nextSceneId && STORY_DATA[currentScene.nextSceneId]) {
      const nextScene = STORY_DATA[currentScene.nextSceneId];
      const isMajorLocationChange = nextScene.location !== currentScene.location || nextScene.isChapterStart;

      setSceneHistory((prev) => [...prev, currentSceneId]);

      if (isMajorLocationChange) {
        audioSynth.fadeOutLocationAmbience(0.6);
        audioSynth.fadeOutWeatherAmbience(0.6);
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentSceneId(currentScene.nextSceneId!);
          setTimeout(() => {
            setIsTransitioning(false);
          }, 350);
        }, 180);
      } else {
        // Smooth direct line advance without jarring full-screen overlay
        setCurrentSceneId(currentScene.nextSceneId);
      }
    } else if (currentScene.nextSceneId === 'epilogue_screen') {
      setSceneHistory((prev) => [...prev, currentSceneId]);
      setIsEpilogueEndingTransition(true);
      audioSynth.playSoundEffect('starlight');
      setTimeout(() => {
        setIsEpilogueEndingTransition(false);
        setIsShowingStorybookEnding(true);
        setCurrentSceneId('epilogue_screen');
      }, 1600);
    }
  }, [currentScene, currentSceneId]);

  const handlePreviousScene = useCallback(() => {
    if (sceneHistory.length === 0) return;
    audioSynth.playSoundEffect('click');
    const lastId = sceneHistory[sceneHistory.length - 1];
    setSceneHistory((prev) => prev.slice(0, -1));
    if (STORY_DATA[lastId]) {
      setCurrentSceneId(lastId);
    }
  }, [sceneHistory]);

  const handleSelectChoice = (choice: ChoiceOption) => {
    audioSynth.playSoundEffect('choice');

    // Trigger Super Witch magical wand/lantern spell animation when making choices (excluding the bottle scene)
    if (currentSceneId !== 'chapter4_choice' && choice.id !== 'ch4_bottle_keep') {
      setShowWandChoiceBurst(true);
      setTimeout(() => setShowWandChoiceBurst(false), 1400);
    }

    setSceneHistory((prev) => [...prev, currentSceneId]);

    if (choice.lightReward) {
      setActiveLightReward(choice.lightReward);
      setCollectedLights((prev) => {
        if (prev.some((item) => item.id === choice.lightReward!.id)) return prev;
        return [...prev, choice.lightReward!];
      });
    }

    if (choice.nextSceneId && STORY_DATA[choice.nextSceneId]) {
      const nextScene = STORY_DATA[choice.nextSceneId];
      const isMajorLocationChange = nextScene.location !== currentScene.location || nextScene.isChapterStart;

      if (isMajorLocationChange) {
        audioSynth.fadeOutLocationAmbience(0.6);
        audioSynth.fadeOutWeatherAmbience(0.6);
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentSceneId(choice.nextSceneId!);
          setTimeout(() => {
            setIsTransitioning(false);
          }, 350);
        }, 200);
      } else {
        setCurrentSceneId(choice.nextSceneId);
      }
    }
  };

  const handleStartGame = () => {
    hasRecordedCompletionRef.current = false;
    audioSynth.init();
    audioSynth.playSoundEffect('page_turn');
    setInTitleScreen(false);
    setIsShowingCredits(false);
    setIsShowingStorybookOpening(true);
    setCurrentSceneId('prologue_1');
    setDialogueHistory([]);
    setCollectedLights([]);
    setSceneHistory([]);
  };

  const handleCompleteStorybookOpening = () => {
    setIsShowingStorybookOpening(false);
    setIsShowingCredits(false);
    setCurrentSceneId('prologue_1');
    setSceneHistory([]);

    // Deliberate atmospheric opening flow:
    // 1. Opening dissolve (soft page-turn & sparkles)
    // 2. PROLOGUE chapter card (0.8-1s breathing room)
    // 3. Environment reveal (cottage night settling)
    // 4. First narration appears
    setProloguePhase('opening_dissolve');
    audioSynth.playSoundEffect('magic_sparkle');

    setTimeout(() => {
      setProloguePhase('prologue_card');
      audioSynth.playSoundEffect('soft_bell');

      setTimeout(() => {
        setProloguePhase('environment_reveal');

        setTimeout(() => {
          setProloguePhase('none');
        }, 900);
      }, 1300);
    }, 850);
  };

  const handleContinueGame = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentSceneId && STORY_DATA[parsed.currentSceneId]) {
          audioSynth.init();
          audioSynth.playSoundEffect('magic_surge');
          setCurrentSceneId(parsed.currentSceneId);
          if (parsed.language) setLanguage(parsed.language);
          if (parsed.collectedLights) setCollectedLights(parsed.collectedLights);
          setInTitleScreen(false);
          setIsShowingCredits(false);
          setIsShowingStorybookOpening(false);
          setProloguePhase('none');
          setSceneHistory([]);
          return;
        }
      }
    } catch {
      // ignore
    }
    handleStartGame();
  };

  const handleRestart = () => {
    audioSynth.playSoundEffect('magic_surge');
    setCurrentSceneId('prologue_1');
    setCollectedLights([]);
    setDialogueHistory([]);
    setSceneHistory([]);
    setIsShowingCredits(false);
    setIsShowingStorybookEnding(false);
    setIsShowingStorybookOpening(false);
    setProloguePhase('none');
    setInTitleScreen(false);
  };

  const handleReturnToTitle = () => {
    audioSynth.playSoundEffect('click');
    setIsShowingCredits(false);
    setIsShowingStorybookOpening(false);
    setIsShowingStorybookEnding(false);
    setProloguePhase('none');
    setInTitleScreen(true);
  };

  const handleToggleLanguage = () => {
    audioSynth.playSoundEffect('click');
    setLanguage((prev) => (prev === 'en' ? 'fr' : 'en'));
  };

  const handleToggleAudio = () => {
    setIsMuted((prev) => {
      const next = !prev;
      audioSynth.setMuted(next);
      return next;
    });
  };

  const handleToggleAutoPlay = () => {
    audioSynth.playSoundEffect('click');
    setIsAutoPlay((prev) => !prev);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inTitleScreen || isLogOpen || isShowingStorybookOpening || isShowingStorybookEnding) return;

      if (prologuePhase !== 'none') {
        if (e.code === 'Space' || e.code === 'Enter' || e.key === 'ArrowRight') {
          e.preventDefault();
          setProloguePhase('none');
        }
        return;
      }

      if (e.code === 'Space' || e.code === 'Enter' || e.key === 'ArrowRight') {
        if (!currentScene.choices && currentScene.nextSceneId) {
          e.preventDefault();
          advanceScene();
        }
      } else if (e.key === 'ArrowLeft') {
        if (sceneHistory.length > 0) {
          e.preventDefault();
          handlePreviousScene();
        }
      } else if (e.key === 'l' || e.key === 'L') {
        setIsLogOpen((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleAudio();
      } else if (e.key === 'a' || e.key === 'A') {
        handleToggleAutoPlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    inTitleScreen,
    isLogOpen,
    isShowingStorybookOpening,
    isShowingStorybookEnding,
    currentScene,
    advanceScene,
    handlePreviousScene,
    sceneHistory.length,
    prologuePhase,
  ]);

  // Dynamic Screen Shake on dramatic impacts (e.g. Dark Lord encounter / thunder / heartbeat)
  const isDramaticShake = currentScene.shake === 'dramatic';
  const isGentleShake = currentScene.shake === 'gentle';
  const shakeClass = isDramaticShake
    ? 'animate-stage-shake-dramatic'
    : isGentleShake
    ? 'animate-stage-shake-gentle'
    : '';

  // Dynamic Character Camera Zoom for cinematic storytelling
  const zoomMode = currentScene.zoom || 'normal';
  const zoomTransformClass =
    zoomMode === 'close_up' || zoomMode === 'close'
      ? 'scale-115 sm:scale-125 -translate-y-4 sm:-translate-y-6'
      : zoomMode === 'extreme_close' || zoomMode === 'cinematic'
      ? 'scale-130 sm:scale-140 -translate-y-8 sm:-translate-y-10'
      : zoomMode === 'wide'
      ? 'scale-90 translate-y-2'
      : zoomMode === 'medium'
      ? 'scale-110 -translate-y-2'
      : 'scale-100 translate-y-0';

  // Subtle Portrait Cross-Dissolve Tracking when speaker changes within the same scene location
  const previousSpeakerRef = useRef<CharacterId | null>(null);
  const previousLocationRef = useRef<SceneLocation | null>(null);
  const [isPortraitCrossDissolving, setIsPortraitCrossDissolving] = useState(false);

  useEffect(() => {
    if (
      previousSpeakerRef.current &&
      previousSpeakerRef.current !== currentScene.speaker &&
      previousLocationRef.current === currentScene.location
    ) {
      setIsPortraitCrossDissolving(true);
      const timer = window.setTimeout(() => {
        setIsPortraitCrossDissolving(false);
      }, 500);
      previousSpeakerRef.current = currentScene.speaker;
      previousLocationRef.current = currentScene.location;
      return () => window.clearTimeout(timer);
    }
    previousSpeakerRef.current = currentScene.speaker;
    previousLocationRef.current = currentScene.location;
  }, [currentScene.speaker, currentScene.location]);

  // Magical Soft-Bloom Atmosphere Filter for pivotal story moments (Epilogue, Sun return, Mirror)
  const isEpilogue = currentScene.location === 'birthday_feast' || currentSceneId === 'epilogue_screen';
  const isSunReturn = currentScene.location === 'sea_shore_sunrise' || currentSceneId === 'chapter7_3' || currentSceneId === 'chapter8_1';
  const isMysticScene = currentScene.location === 'magic_mirror' || currentScene.location === 'bottle_path';
  const bloomClass = isEpilogue
    ? 'bloom-atmosphere-epilogue'
    : isSunReturn
    ? 'bloom-atmosphere-gold'
    : isMysticScene
    ? 'bloom-atmosphere-mystic'
    : '';

  // Soft Golden Radial Glow Filter for heartwarming emotional scenes (e.g. Orik gratitude, Vivienne rekindled hearth, Lezar companionship, Mélo birthday)
  const isHeartwarmingScene = [
    'prologue_3',
    'chapter1_res1',
    'chapter1_res2',
    'chapter1_5',
    'chapter2_3',
    'chapter2_4',
    'chapter3_3',
    'chapter3_res1',
    'chapter3_res2',
    'chapter4_3',
    'chapter4_4',
    'chapter6_5',
    'chapter6_6',
    'chapter7_3',
    'chapter7_4',
    'chapter8_1',
    'epilogue_15',
    'epilogue_16',
    'epilogue_17',
    'epilogue_18',
    'epilogue_19',
    'epilogue_20',
    'epilogue_21',
  ].includes(currentSceneId) || currentScene.expression === 'grateful' || currentScene.expression === 'inspired' || currentScene.expression === 'comforting';

  // Super Witch choice action animation state
  const [showWandChoiceBurst, setShowWandChoiceBurst] = useState(false);

  const handleLockBday = () => {
    setIsBdayUnlocked(false);
    try {
      localStorage.removeItem(BDAY_AUTH_KEY);
    } catch {}
  };

  // Birthday Passcode Protection Gate ("Something special is waiting...")
  if (!isBdayUnlocked) {
    return (
      <main className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col justify-center items-center select-none font-sans">
        <BirthdayLockScreen
          onUnlock={handleUnlockBday}
          language={language}
          onToggleLanguage={handleToggleLanguage}
        />
        {/* Client-Side Code Protection Toast */}
        {securityNotice && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-fade-in">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/95 backdrop-blur-md border border-amber-500/50 text-amber-200 text-xs font-serif shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(245,158,11,0.3)]">
              <span className="text-amber-400">✨</span>
              <span className="tracking-wide">{securityNotice}</span>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className={`relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col justify-between select-none font-sans ${viewMode === 'phone' ? 'items-center justify-center py-2' : ''} ${shakeClass}`}>
      {/* Subtle Auto-Save Toast Notification */}
      <AutoSaveToast
        isVisible={showAutoSaveToast && !inTitleScreen && !isShowingStorybookOpening && !isShowingStorybookEnding}
        language={language}
      />

      {/* Client-Side Code Protection Toast */}
      {securityNotice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-fade-in">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/95 backdrop-blur-md border border-amber-500/50 text-amber-200 text-xs font-serif shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(245,158,11,0.3)]">
            <span className="text-amber-400">✨</span>
            <span className="tracking-wide">{securityNotice}</span>
          </div>
        </div>
      )}

      {/* Phone Mode Bezel Container if Phone mode selected */}
      <div className={`relative overflow-hidden transition-all duration-500 ${
        viewMode === 'phone'
          ? 'w-full max-w-[430px] h-[94vh] rounded-[40px] border-[6px] border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.9)] ring-1 ring-amber-500/30 flex flex-col justify-between'
          : 'w-full h-full flex flex-col justify-between'
      }`}>
        {/* Background World Visualizer */}
        <ScenicBackground
          location={currentScene.location || 'cottage_twilight'}
          language={language}
          cozyMode={cozyMode}
        />

        {/* Soft-Bloom Filter Overlay for Key Magical Story Moments */}
        {bloomClass && !inTitleScreen && (
          <div className={`absolute inset-0 z-10 pointer-events-none transition-all duration-1000 ${bloomClass}`} />
        )}

        {/* Soft Golden Radial Gradient Glow Filter for Heartwarming Scenes */}
        {isHeartwarmingScene && !inTitleScreen && !isShowingStorybookOpening && !isShowingStorybookEnding && (
          <div className="absolute inset-0 z-12 pointer-events-none transition-all duration-1000 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.18)_0%,rgba(245,158,11,0.08)_50%,transparent_80%)] animate-warm-glow-pulse" />
        )}

        {/* Dynamic Weather-Based Screen Overlay System (Dust Motes, Rain Ripples, Sunlight Glints, Wind Leaves, Stardust & Floating Light Motes) */}
        {!inTitleScreen && !isShowingStorybookOpening && !isShowingStorybookEnding && (
          <WeatherOverlay
            weather={currentScene.weather}
            location={currentScene.location}
            language={language}
            collectedLightsCount={collectedLights.length}
            isHeartwarming={isHeartwarmingScene}
          />
        )}

        {/* Ethereal Golden Magic Wand Cursor Trail System */}
        {!isShowingStorybookOpening && !isShowingStorybookEnding && (
          <MagicTrail enabled={true} />
        )}

        {/* Ambient Firefly Overlay for Forest and Evening Scenes */}
        {!isShowingStorybookOpening && !isShowingStorybookEnding && (
          <AmbientFireflies
            location={inTitleScreen ? 'cottage_twilight' : currentScene.location}
            weather={currentScene.weather}
          />
        )}

        {/* Atmospheric & Environmental Transitions FX */}
        {!inTitleScreen && !isShowingStorybookOpening && !isShowingStorybookEnding && (
          <EnvironmentalFX
            location={currentScene.location || 'cottage_twilight'}
            sceneId={currentSceneId}
            isTransitioning={isTransitioning}
            activeLightReward={activeLightReward}
            language={language}
          />
        )}

        {/* Screen-Wide Mood-Based Color Tint Transition Overlay */}
        {isTransitioning && (
          <div
            className={`fixed inset-0 z-40 pointer-events-none transition-all duration-500 backdrop-blur-xs animate-fade-in flex items-center justify-center ${getSceneMoodTint(currentScene)}`}
          >
            <div className="w-20 h-20 rounded-full bg-white/10 animate-ping opacity-60" />
          </div>
        )}

        {/* Prologue Opening Dissolve & Chapter Transition Sequence */}
        {prologuePhase === 'opening_dissolve' && (
          <div
            onClick={() => setProloguePhase('none')}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md animate-fade-in text-center px-6 cursor-pointer"
          >
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-amber-500/25 flex items-center justify-center animate-ping" />
              <div className="absolute inset-0 flex items-center justify-center text-4xl">✨</div>
            </div>
            <p className="text-amber-200/90 font-serif text-lg sm:text-xl tracking-widest uppercase animate-pulse mb-2">
              {language === 'en' ? 'Turning the Page...' : 'La Page se Tourne...'}
            </p>
            <p className="text-amber-400/80 font-serif text-sm italic">
              {language === 'en' ? 'Into the quiet world of twilight.' : 'Vers le monde silencieux du crépuscule.'}
            </p>
          </div>
        )}

        {/* Prologue Chapter Banner Card with Breathing Room */}
        {prologuePhase === 'prologue_card' && (
          <div
            onClick={() => setProloguePhase('none')}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in text-center px-4 cursor-pointer"
          >
            <div className="p-8 sm:p-12 border-y-2 border-amber-500/50 bg-slate-950/90 w-full max-w-2xl shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.3)]">
              <h3 className="text-amber-400 font-serif text-sm sm:text-base tracking-[0.4em] uppercase mb-3 animate-fade-in">
                {language === 'en' ? 'PROLOGUE' : 'PROLOGUE'}
              </h3>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-amber-50 tracking-wide mb-2">
                {language === 'en' ? 'The Day Without Sun' : 'Le Jour sans Soleil'}
              </h2>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-4" />
            </div>
          </div>
        )}

        {/* Environment Reveal Stage: Environment settles before narration */}
        {prologuePhase === 'environment_reveal' && (
          <div
            onClick={() => setProloguePhase('none')}
            className="fixed inset-0 z-40 bg-slate-950/30 transition-opacity duration-1000 pointer-events-auto cursor-pointer"
          />
        )}

        {/* Epilogue Ending Twilight Fade-Away Animation */}
        {isEpilogueEndingTransition && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md animate-fade-in pointer-events-none text-center px-6 transition-opacity duration-1000">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center animate-ping" />
              <div className="absolute inset-0 flex items-center justify-center text-4xl">🌟</div>
            </div>
            <p className="text-amber-200/90 font-serif text-lg sm:text-xl tracking-widest uppercase animate-pulse mb-2">
              {language === 'en' ? 'And so the sky found its keepers...' : 'Et ainsi le ciel trouva ses gardiens...'}
            </p>
            <p className="text-amber-400/80 font-serif text-sm italic">
              {language === 'en' ? 'A memory forever etched in light.' : 'Un souvenir gravé à jamais dans la lumière.'}
            </p>
          </div>
        )}

        {/* Chapter Title Transition Banner Card for Mid-Game Chapters */}
        {showChapterCard && currentScene.chapterTitle && prologuePhase === 'none' && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 backdrop-blur-sm pointer-events-none animate-fade-in">
            <div className="text-center p-8 border-y border-amber-500/40 bg-slate-950/80 w-full max-w-2xl">
              <h3 className="text-amber-400 font-serif text-sm sm:text-base tracking-[0.3em] uppercase mb-2">
                {currentScene.chapterTitle[language]}
              </h3>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-amber-50 tracking-wide">
                {currentScene.chapterSubtitle ? currentScene.chapterSubtitle[language] : ''}
              </h2>
            </div>
          </div>
        )}

        {/* VIEWPORT ROUTING: Title Screen vs Credits vs Storybook Opening vs Visual Novel Stage vs Storybook Ending / Gallery */}
        {inTitleScreen ? (
          <TitleScreen
            onStartGame={handleStartGame}
            onContinueGame={hasSaveData ? handleContinueGame : undefined}
            onShowCredits={() => setIsShowingCredits(true)}
            onOpenMemories={() => setIsMemoriesOpen(true)}
            playCount={playCount}
            hasSaveData={hasSaveData}
            language={language}
            onToggleLanguage={handleToggleLanguage}
            isMuted={isMuted}
            onToggleAudio={handleToggleAudio}
            viewMode={viewMode}
            onSetViewMode={setViewMode}
            savePreview={savePreview}
            cozyMode={cozyMode}
            onCycleCozyMode={handleCycleCozyMode}
            isCozyModeUnlocked={isCozyModeUnlocked}
            onLockBday={handleLockBday}
          />
        ) : isShowingCredits ? (
          <CreditsRoll
            language={language}
            onToggleLanguage={handleToggleLanguage}
            isMuted={isMuted}
            onToggleAudio={handleToggleAudio}
            onViewMemories={() => {
              setIsShowingCredits(false);
              setIsShowingStorybookEnding(false);
              setCurrentSceneId('epilogue_screen');
            }}
            onRestart={() => {
              setIsShowingCredits(false);
              handleRestart();
            }}
            onReturnToTitle={() => {
              setIsShowingCredits(false);
              handleReturnToTitle();
            }}
          />
        ) : isShowingStorybookOpening ? (
          <StorybookExperience
            mode="opening"
            language={language}
            onToggleLanguage={handleToggleLanguage}
            isMuted={isMuted}
            onToggleAudio={handleToggleAudio}
            onComplete={handleCompleteStorybookOpening}
            onReturnToTitle={handleReturnToTitle}
          />
        ) : isShowingStorybookEnding ? (
          <StorybookExperience
            mode="ending"
            language={language}
            onToggleLanguage={handleToggleLanguage}
            isMuted={isMuted}
            onToggleAudio={handleToggleAudio}
            onComplete={() => {
              setIsShowingStorybookEnding(false);
            }}
            onShowCredits={() => {
              setIsShowingStorybookEnding(false);
              setIsShowingCredits(true);
            }}
            onReturnToTitle={handleReturnToTitle}
            onRestartStory={handleRestart}
          />
        ) : isEnding ? (
          <div className="relative z-30 w-full h-full flex items-center justify-center p-4 overflow-y-auto">
            <EndingGalleryModal
              collectedLights={
                collectedLights.length > 0
                  ? collectedLights
                  : Object.values(ALL_COLLECTIBLE_LIGHTS)
              }
              language={language}
              onRestart={handleRestart}
              onReturnToTitle={handleReturnToTitle}
              onOpenMemories={() => setIsMemoriesOpen(true)}
              playCount={playCount}
            />
          </div>
        ) : (
          <div className="relative z-20 w-full h-full flex flex-col justify-between max-w-6xl mx-auto pt-3 sm:pt-5">
            {/* Top Stage Header (Chapter Indicator & Persistent Corner Light Meter) */}
            <header className="px-4 sm:px-6 flex items-center justify-between pointer-events-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/75 backdrop-blur-md border border-amber-500/30 text-amber-200/90 text-xs font-serif shadow-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>
                  {currentScene.chapterTitle
                    ? currentScene.chapterTitle[language]
                    : language === 'en'
                    ? 'The Witch Who Carried the Sun'
                    : 'La Sorcière qui Portait le Soleil'}
                </span>
              </div>

              {/* Persistent Light Meter Component */}
              <LightMeter
                currentSceneId={currentSceneId}
                collectedLights={collectedLights.map((l) => l.id)}
                language={language}
              />
            </header>

            {/* Character Stage Arena with Dynamic Camera Zoom & Seamless Character Cross-Dissolve */}
            <div className={`flex-1 flex items-end justify-center px-4 sm:px-12 gap-2 sm:gap-6 min-h-0 overflow-hidden transition-all duration-700 ease-out origin-bottom relative ${zoomTransformClass}`}>
              {/* Super Witch Choice Wand & Lantern Spell Burst FX */}
              {showWandChoiceBurst && (
                <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center animate-choice-wand-cast">
                  <div className="relative flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-amber-400/20 blur-xl animate-ping" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl filter drop-shadow-[0_0_20px_#fbbf24]">
                      ✨
                    </div>
                    <div className="absolute -top-6 text-amber-200 text-xs font-serif italic tracking-widest uppercase bg-slate-900/80 px-3 py-1 rounded-full border border-amber-400/60 shadow-lg">
                      {language === 'en' ? 'Magic Channeling...' : 'Canalisation Magique...'}
                    </div>
                  </div>
                </div>
              )}

              {/* Secondary Companion (e.g. Lezar / Companion) */}
              {currentScene.secondaryCharacter && (
                <CharacterPortrait
                  key={`secondary-${currentScene.secondaryCharacter.id}-${currentScene.secondaryCharacter.expression}`}
                  characterId={currentScene.secondaryCharacter.id}
                  expression={currentScene.secondaryCharacter.expression}
                  isSecondary={true}
                  showSwwPin={hasSwwPin}
                  isSpeaking={false}
                  className={isPortraitCrossDissolving ? 'animate-portrait-cross-dissolve' : ''}
                />
              )}

              {/* Main Active Speaker with subtle cross-dissolve */}
              {currentScene.speaker !== 'narrator' && (
                <CharacterPortrait
                  key={`main-${currentScene.speaker}-${currentScene.expression}`}
                  characterId={currentScene.speaker}
                  expression={currentScene.expression}
                  showSwwPin={hasSwwPin}
                  isSpeaking={prologuePhase === 'none'}
                  className="animate-portrait-cross-dissolve"
                />
              )}
            </div>

            {/* Interactive Player Choices */}
            {currentScene.choices && currentScene.choices.length > 0 && prologuePhase === 'none' && (
              <ChoiceOverlay
                choices={currentScene.choices}
                language={language}
                onSelectChoice={handleSelectChoice}
              />
            )}

            {/* Dialogue & Chronicle Panel */}
            {prologuePhase !== 'prologue_card' && prologuePhase !== 'opening_dissolve' && (
              <div className={`transition-opacity duration-700 ${prologuePhase === 'environment_reveal' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <DialogueBox
                  speaker={currentScene.speaker}
                  speakerName={currentScene.speakerName}
                  expression={currentScene.expression}
                  text={currentScene.text}
                  language={language}
                  onAdvance={advanceScene}
                  onPrevious={handlePreviousScene}
                  canGoBack={sceneHistory.length > 0}
                  onOpenLog={() => setIsLogOpen(true)}
                  onToggleAudio={handleToggleAudio}
                  isMuted={isMuted}
                  onToggleLanguage={handleToggleLanguage}
                  onToggleAutoPlay={handleToggleAutoPlay}
                  isAutoPlay={isAutoPlay}
                  canAdvance={!currentScene.choices && !!currentScene.nextSceneId}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Achievement Unlocked Banner Notification */}
      <AchievementBanner
        lightReward={activeLightReward}
        language={language}
        onClose={() => setActiveLightReward(null)}
      />

      {/* History Log Modal */}
      <LogModal
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        history={dialogueHistory}
        language={language}
      />

      {/* Memories Scrapbook Gallery Modal */}
      <MemoriesGalleryModal
        isOpen={isMemoriesOpen}
        onClose={() => setIsMemoriesOpen(false)}
        language={language}
        collectedLights={
          collectedLights.length > 0
            ? collectedLights
            : Object.values(ALL_COLLECTIBLE_LIGHTS)
        }
        playCount={playCount}
        onUnlockAllForDev={() => {
          setPlayCount(7);
          try {
            localStorage.setItem(PLAY_COUNT_KEY, '7');
          } catch {}
        }}
      />
    </main>
  );
}


