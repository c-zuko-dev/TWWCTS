import { CharacterId, MusicTheme, SceneLocation, SoundEffectType, WeatherType } from '../types';

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private currentTheme: MusicTheme | null = null;
  private musicInterval: number | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private cachedNoiseBuffer: AudioBuffer | null = null;
  private isInitialized: boolean = false;

  // Master Volume Ducking Engine state (monitors dialogue and ducks ambient environmental levels)
  private isDialogueSpeaking: boolean = false;
  private duckingTimeout: number | null = null;
  private baseAmbienceGain: number = 0.56;
  private duckedAmbienceGain: number = 0.28;
  private baseMusicGain: number = 0.32;
  private duckedMusicGain: number = 0.26;

  // Environmental Ambience Engine state
  private currentAmbienceLocation: SceneLocation | null = null;
  private ambienceInterval: number | null = null;
  private activeAmbienceSources: Array<{ stop?: () => void; disconnect?: () => void }> = [];

  // Weather Environmental Layer Engine state
  private currentWeather: WeatherType | null = null;
  private weatherInterval: number | null = null;
  private activeWeatherSources: Array<{ stop?: () => void; disconnect?: () => void }> = [];

  // Sequential credits progression step
  private creditsStepIndex: number = 0;

  // Typewriter Voice throttling
  private lastTypewriterTime: number = 0;

  public init() {
    try {
      if (typeof window === 'undefined') return;

      if (!this.ctx) {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

        if (!AudioCtxClass) {
          return;
        }

        this.ctx = new AudioCtxClass();

        // Master Limiter & Warmth Conditioning Stage (prevents clipping, softens transients)
        const masterCompressor = this.ctx.createDynamicsCompressor();
        masterCompressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
        masterCompressor.knee.setValueAtTime(24, this.ctx.currentTime); // Gentle soft-knee
        masterCompressor.ratio.setValueAtTime(3.5, this.ctx.currentTime);
        masterCompressor.attack.setValueAtTime(0.003, this.ctx.currentTime); // Fast transparent peak handling
        masterCompressor.release.setValueAtTime(0.22, this.ctx.currentTime);

        // Analog Storybook Warmth Filter (removes harsh digital high-frequency aliasing)
        const masterWarmthFilter = this.ctx.createBiquadFilter();
        masterWarmthFilter.type = 'lowpass';
        masterWarmthFilter.frequency.setValueAtTime(9600, this.ctx.currentTime);
        masterWarmthFilter.Q.setValueAtTime(0.7, this.ctx.currentTime); // Butterworth gentle slope

        this.masterGain = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.ambienceGain = this.ctx.createGain();
        this.voiceGain = this.ctx.createGain();

        this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
        this.musicGain.gain.value = 0.28;
        this.sfxGain.gain.value = 0.40;
        this.ambienceGain.gain.value = 0.46;
        this.voiceGain.gain.value = 0.085;

        // Route individual buses into the master compressor & warmth filter
        this.musicGain.connect(masterCompressor);
        this.sfxGain.connect(masterCompressor);
        this.ambienceGain.connect(masterCompressor);
        this.voiceGain.connect(masterCompressor);

        masterCompressor.connect(masterWarmthFilter);
        masterWarmthFilter.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        this.isInitialized = true;
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {
          // Browser autoplay policy might reject until user interaction; ignore silently.
        });
      }
    } catch (e) {
      console.warn('AudioContext init non-fatal note:', e);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.05);
      }
      if (muted) {
        this.stopLocationAmbience();
        this.stopWeatherAmbience();
      } else {
        if (this.currentAmbienceLocation) {
          const loc = this.currentAmbienceLocation;
          this.currentAmbienceLocation = null;
          this.playLocationAmbience(loc);
        }
        if (this.currentWeather) {
          const w = this.currentWeather;
          this.currentWeather = null;
          this.playWeatherAmbience(w, this.currentAmbienceLocation || undefined);
        }
      }
    } catch {
      // ignore
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    try {
      if (this.masterGain && this.ctx && !this.isMuted) {
        this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
      }
    } catch {
      // ignore
    }
  }

  public fadeOutMusic(durationSeconds: number = 4) {
    try {
      if (this.musicInterval) {
        window.clearInterval(this.musicInterval);
        this.musicInterval = null;
      }
      this.currentTheme = null;
      if (this.ctx && this.musicGain && !this.isMuted) {
        const t = this.ctx.currentTime;
        const currentGain = Math.max(0.001, this.musicGain.gain.value);
        this.musicGain.gain.setValueAtTime(currentGain, t);
        this.musicGain.gain.exponentialRampToValueAtTime(0.0001, t + durationSeconds);
        setTimeout(() => {
          if (this.ctx && this.musicGain) {
            this.musicGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
          }
        }, durationSeconds * 1000 + 100);
      }
    } catch (e) {
      console.warn('Audio fadeOutMusic error:', e);
    }
  }

  public stopMusic() {
    if (this.musicInterval) {
      window.clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.currentTheme = null;
  }

  /**
   * Master Volume Ducking Controller:
   * Dynamically monitors dialogue lines. Lowers environmental ambience and background music slightly
   * while characters are actively speaking/typing, and gracefully restores it to full warmth when speech concludes.
   */
  public setDialogueSpeaking(speaking: boolean) {
    this.isDialogueSpeaking = speaking;
    if (speaking) {
      if (this.duckingTimeout) {
        window.clearTimeout(this.duckingTimeout);
        this.duckingTimeout = null;
      }
      this.applyDuckingLevels(true, 0.14);
    } else {
      if (this.duckingTimeout) {
        window.clearTimeout(this.duckingTimeout);
      }
      this.duckingTimeout = window.setTimeout(() => {
        if (!this.isDialogueSpeaking) {
          this.applyDuckingLevels(false, 0.65);
        }
        this.duckingTimeout = null;
      }, 350);
    }
  }

  private triggerVoiceDucking() {
    this.applyDuckingLevels(true, 0.1);
    if (this.duckingTimeout) {
      window.clearTimeout(this.duckingTimeout);
    }
    this.duckingTimeout = window.setTimeout(() => {
      if (!this.isDialogueSpeaking) {
        this.applyDuckingLevels(false, 0.7);
      }
      this.duckingTimeout = null;
    }, 550);
  }

  private applyDuckingLevels(ducked: boolean, transitionTime: number = 0.3) {
    try {
      if (!this.ctx || this.isMuted) return;
      const t = this.ctx.currentTime;
      if (this.ambienceGain) {
        const targetAmbience = ducked ? this.duckedAmbienceGain : this.baseAmbienceGain;
        this.ambienceGain.gain.setTargetAtTime(targetAmbience, t, transitionTime * 0.4);
      }
      if (this.musicGain && this.currentTheme) {
        const targetMusic = ducked ? this.duckedMusicGain : this.baseMusicGain;
        this.musicGain.gain.setTargetAtTime(targetMusic, t, transitionTime * 0.5);
      }
    } catch {
      // ignore non-fatal audio ducking ramp error
    }
  }

  /**
   * Typewriter character voice sound effect.
   * Plays soft, distinct pitch & timbre for each character speaking.
   * Supports 'echo' reverb reflections when reminiscing or in misty/nostalgic scenes (forest/abyss memories).
   */
  public playTypewriterVoice(speaker: CharacterId, char?: string, isEcho: boolean = false) {
    try {
      this.init();
      if (!this.ctx || !this.voiceGain || this.isMuted) return;

      // Automatically trigger subtle ambience ducking during dialogue typewriter playback
      this.triggerVoiceDucking();

      // Throttle: don't play more often than every 48ms
      const now = performance.now();
      if (now - this.lastTypewriterTime < 48) return;

      // Skip whitespace and silent punctuation
      if (char && /[\s\n.,!?;:—…'"“”’]/.test(char)) return;

      this.lastTypewriterTime = now;
      const t = this.ctx.currentTime;

      // Speaker Timbre Configs
      interface VoiceProfile {
        type: OscillatorType;
        baseFreq: number;
        freqVariation: number;
        duration: number;
        gainMax: number;
        filterType?: BiquadFilterType;
        filterFreq?: number;
      }

      const profiles: Record<CharacterId, VoiceProfile> = {
        witch: {
          type: 'sine',
          baseFreq: 587.33, // D5 warm gentle chime
          freqVariation: 35,
          duration: 0.038,
          gainMax: 0.07,
        },
        human_witch: {
          type: 'sine',
          baseFreq: 659.25, // E5 radiant light tone
          freqVariation: 40,
          duration: 0.036,
          gainMax: 0.075,
        },
        lezar: {
          type: 'triangle',
          baseFreq: 330, // E4 warm cute purr-chirp
          freqVariation: 25,
          duration: 0.032,
          gainMax: 0.065,
          filterType: 'lowpass',
          filterFreq: 800,
        },
        clown: {
          type: 'sine',
          baseFreq: 783.99, // G5 theatrical music-box blip
          freqVariation: 65,
          duration: 0.034,
          gainMax: 0.07,
        },
        orik: {
          type: 'sine',
          baseFreq: 1046.5, // C6 tiny delicate crystal fairy pip
          freqVariation: 55,
          duration: 0.028,
          gainMax: 0.06,
        },
        artisan: {
          type: 'triangle',
          baseFreq: 280, // Rich warm earthen woodblock / kiln resonance
          freqVariation: 20,
          duration: 0.035,
          gainMax: 0.08,
          filterType: 'lowpass',
          filterFreq: 600,
        },
        hypo: {
          type: 'sine',
          baseFreq: 392, // G4 gentle rhythmic tone
          freqVariation: 25,
          duration: 0.032,
          gainMax: 0.07,
        },
        everyone: {
          type: 'sine',
          baseFreq: 523.25, // C5 harmonious blend
          freqVariation: 30,
          duration: 0.035,
          gainMax: 0.065,
        },
        narrator: {
          type: 'sine',
          baseFreq: 440, // A4 vintage soft parchment tap
          freqVariation: 25,
          duration: 0.03,
          gainMax: 0.06,
        },
      };

      const prof = profiles[speaker] || profiles.narrator;
      const freqShift = (Math.random() * 2 - 1) * prof.freqVariation;
      const targetFreq = Math.max(120, prof.baseFreq + freqShift);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = prof.type;
      osc.frequency.setValueAtTime(targetFreq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(prof.gainMax, t + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + prof.duration);

      let lastNode: AudioNode = osc;

      if (prof.filterType && prof.filterFreq) {
        const filter = this.ctx.createBiquadFilter();
        filter.type = prof.filterType;
        filter.frequency.setValueAtTime(prof.filterFreq, t);
        lastNode.connect(filter);
        lastNode = filter;
      }

      lastNode.connect(gain);
      gain.connect(this.voiceGain);

      // Nostalgic Memory Reverb & Cavernous Echo Effect in Forest / Abyss / Flashbacks
      if (isEcho) {
        // Tap 1: Soft melancholic primary reflection
        const delay1 = this.ctx.createDelay();
        delay1.delayTime.setValueAtTime(0.14 + (Math.random() * 0.03 - 0.015), t);

        const delayFilter = this.ctx.createBiquadFilter();
        delayFilter.type = 'lowpass';
        delayFilter.frequency.setValueAtTime(1100, t); // Damped warm cavern air

        const delayGain1 = this.ctx.createGain();
        delayGain1.gain.setValueAtTime(0.001, t);
        delayGain1.gain.linearRampToValueAtTime(prof.gainMax * 0.45, t + 0.14);
        delayGain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

        // Tap 2: Distant starlight reflection
        const delay2 = this.ctx.createDelay();
        delay2.delayTime.setValueAtTime(0.26, t);

        const delayGain2 = this.ctx.createGain();
        delayGain2.gain.setValueAtTime(0.001, t);
        delayGain2.gain.linearRampToValueAtTime(prof.gainMax * 0.22, t + 0.26);
        delayGain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);

        lastNode.connect(delay1);
        delay1.connect(delayFilter);
        delayFilter.connect(delayGain1);
        delayGain1.connect(this.voiceGain);

        delayFilter.connect(delay2);
        delay2.connect(delayGain2);
        delayGain2.connect(this.voiceGain);
      }

      osc.start(t);
      osc.stop(t + (isEcho ? 0.7 : prof.duration + 0.01));
    } catch {
      // ignore typing blip error
    }
  }

  /**
   * Super Witch Soft Sigh of Relief Sound Effect.
   * Procedurally synthesizes a gentle, randomized warm breath of relief when transitioning
   * from burdened to calm after solving a scene or overcoming heavy emotional trials.
   */
  public playSoftSigh() {
    try {
      this.init();
      if (!this.ctx || !this.voiceGain || this.isMuted) return;

      const t = this.ctx.currentTime;
      const duration = 1.35 + Math.random() * 0.45; // 1.35s - 1.8s organic duration
      const basePitch = 270 + (Math.random() * 2 - 1) * 25; // ~245-295Hz gentle breath formant

      // 1. Warm Pink/White Noise Breath Formant
      const noiseBuffer = this.createWarmNoiseBuffer();
      if (noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(740 + Math.random() * 60, t);
        // Exhalation frequency gently glides downwards like a deep breath out
        noiseFilter.frequency.exponentialRampToValueAtTime(360, t + duration * 0.85);
        noiseFilter.Q.setValueAtTime(2.2, t);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.001, t);
        noiseGain.gain.linearRampToValueAtTime(0.12 + Math.random() * 0.03, t + 0.24);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.voiceGain);

        noise.start(t);
        noise.stop(t + duration + 0.05);
      }

      // 2. Soft Whispered Sine Undertone (Subtle Vocal Cord Relaxation)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const oscFilter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(basePitch, t);
      osc.frequency.exponentialRampToValueAtTime(basePitch * 0.58, t + duration * 0.9);

      oscFilter.type = 'lowpass';
      oscFilter.frequency.setValueAtTime(520, t);
      oscFilter.frequency.exponentialRampToValueAtTime(220, t + duration);

      oscGain.gain.setValueAtTime(0.0001, t);
      oscGain.gain.linearRampToValueAtTime(0.042, t + 0.28);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t + duration * 0.95);

      osc.connect(oscFilter);
      oscFilter.connect(oscGain);
      oscGain.connect(this.voiceGain);

      osc.start(t);
      osc.stop(t + duration + 0.05);

      // 3. Delicate Starlight Sparkle Tailwind (Subtle shimmer of peaceful relief)
      setTimeout(() => {
        if (!this.ctx || !this.sfxGain || this.isMuted) return;
        const t2 = this.ctx.currentTime;
        const chime = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(1046.5 + Math.random() * 120, t2); // C6 gentle sparkle
        chimeGain.gain.setValueAtTime(0.001, t2);
        chimeGain.gain.linearRampToValueAtTime(0.025, t2 + 0.02);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.6);
        chime.connect(chimeGain);
        chimeGain.connect(this.sfxGain);
        chime.start(t2);
        chime.stop(t2 + 0.65);
      }, (duration * 0.45) * 1000);
    } catch {
      // ignore sigh sfx error
    }
  }

  /**
   * Procedural Environmental Ambience System.
   * Plays soft, continuous background atmosphere layered underneath BGM.
   */
  public playLocationAmbience(location: SceneLocation | null) {
    try {
      if (this.currentAmbienceLocation === location) return;
      this.stopLocationAmbience();
      this.currentAmbienceLocation = location;

      if (!location || this.isMuted) return;
      this.init();
      if (!this.ctx || !this.ambienceGain) return;

      const t = this.ctx.currentTime;

      switch (location) {
        case 'whispering_forest': {
          // Lush looping forest breeze + rustling canopy + periodic bird & leaf rustle
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(380, t);

            // Gentle continuous LFO filter sweep for breeze breathing
            const lfo = this.ctx.createOscillator();
            lfo.frequency.setValueAtTime(0.22, t);
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.setValueAtTime(140, t);
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.22, t + 1.5);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ambienceGain);

            noise.start(t);
            lfo.start(t);

            this.activeAmbienceSources.push({
              stop: () => {
                try {
                  noise.stop();
                  lfo.stop();
                } catch {}
              },
              disconnect: () => {
                noise.disconnect();
                filter.disconnect();
                gain.disconnect();
                lfo.disconnect();
              },
            });
          }

          // Periodic gentle birds & rustles
          this.ambienceInterval = window.setInterval(() => {
            if (this.isMuted || !this.ctx || this.currentAmbienceLocation !== 'whispering_forest') return;
            if (Math.random() < 0.6) {
              this.playSoundEffect('bird_chirp');
            } else {
              this.playSoundEffect('soft_rustle');
            }
          }, 5500);
          break;
        }

        case 'sea_shore_dusk':
        case 'sea_shore_sunrise': {
          // Rich rhythmic ocean waves + soft coastal wind
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(360, t);
            filter.Q.setValueAtTime(1.1, t);

            // Wave cycle modulation LFO (every 5 seconds)
            const lfo = this.ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(0.18, t); // ~5.5 second wave period

            const lfoFilterGain = this.ctx.createGain();
            lfoFilterGain.gain.setValueAtTime(260, t);
            lfo.connect(lfoFilterGain);
            lfoFilterGain.connect(filter.frequency);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.28, t + 2);

            const lfoVol = this.ctx.createOscillator();
            lfoVol.frequency.setValueAtTime(0.18, t);
            const lfoVolGain = this.ctx.createGain();
            lfoVolGain.gain.setValueAtTime(0.12, t);
            lfoVol.connect(lfoVolGain);
            lfoVolGain.connect(gain.gain);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ambienceGain);

            noise.start(t);
            lfo.start(t);
            lfoVol.start(t);

            this.activeAmbienceSources.push({
              stop: () => {
                try {
                  noise.stop();
                  lfo.stop();
                  lfoVol.stop();
                } catch {}
              },
              disconnect: () => {
                noise.disconnect();
                filter.disconnect();
                gain.disconnect();
                lfo.disconnect();
                lfoVol.disconnect();
              },
            });
          }

          if (location === 'sea_shore_sunrise') {
            this.ambienceInterval = window.setInterval(() => {
              if (this.isMuted || !this.ctx || this.currentAmbienceLocation !== 'sea_shore_sunrise') return;
              if (Math.random() < 0.45) {
                this.playSoundEffect('bird_chirp');
              }
            }, 7000);
          }
          break;
        }

        case 'velvet_abyss': {
          // Low atmospheric rumble + faint eerie wind + cosmic void hum
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain1 = this.ctx.createGain();
          const gain2 = this.ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(44, t); // Low sub-bass rumble

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(65.4, t); // Low C2 mystery drone

          gain1.gain.setValueAtTime(0.001, t);
          gain1.gain.linearRampToValueAtTime(0.24, t + 2);

          gain2.gain.setValueAtTime(0.001, t);
          gain2.gain.linearRampToValueAtTime(0.16, t + 2);

          osc1.connect(gain1);
          gain1.connect(this.ambienceGain);

          osc2.connect(gain2);
          gain2.connect(this.ambienceGain);

          osc1.start(t);
          osc2.start(t);

          // Deep hollow abyss wind
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.loop = true;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(180, t);
            filter.Q.setValueAtTime(2.2, t);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.001, t);
            noiseGain.gain.linearRampToValueAtTime(0.18, t + 2);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.ambienceGain);
            noise.start(t);

            this.activeAmbienceSources.push({
              stop: () => {
                try {
                  noise.stop();
                } catch {}
              },
              disconnect: () => {
                noise.disconnect();
                filter.disconnect();
                noiseGain.disconnect();
              },
            });
          }

          this.activeAmbienceSources.push({
            stop: () => {
              try {
                osc1.stop();
                osc2.stop();
              } catch {}
            },
            disconnect: () => {
              osc1.disconnect();
              osc2.disconnect();
              gain1.disconnect();
              gain2.disconnect();
            },
          });

          // Occasional magical resonance tone in abyss
          this.ambienceInterval = window.setInterval(() => {
            if (this.isMuted || !this.ctx || this.currentAmbienceLocation !== 'velvet_abyss') return;
            this.playSoundEffect('starlight');
          }, 7000);
          break;
        }

        case 'cottage_twilight': {
          // Gentle crackling fireplace + soft warm evening ambience
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(420, t);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.18, t + 1.5);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ambienceGain);
            noise.start(t);

            this.activeAmbienceSources.push({
              stop: () => {
                try {
                  noise.stop();
                } catch {}
              },
              disconnect: () => {
                noise.disconnect();
                filter.disconnect();
                gain.disconnect();
              },
            });
          }

          // Gentle fireplace micro-crackles
          this.ambienceInterval = window.setInterval(() => {
            if (this.isMuted || !this.ctx || this.currentAmbienceLocation !== 'cottage_twilight') return;
            this.playSoundEffect('ember_glow');
          }, 4000);
          break;
        }

        case 'crossroads_kiln': {
          // Warm kiln roaring hum and crackling embers
          const osc = this.ctx.createOscillator();
          const oscGain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(92, t);

          oscGain.gain.setValueAtTime(0.001, t);
          oscGain.gain.linearRampToValueAtTime(0.22, t + 1.5);

          osc.connect(oscGain);
          oscGain.connect(this.ambienceGain);
          osc.start(t);

          this.activeAmbienceSources.push({
            stop: () => {
              try {
                osc.stop();
              } catch {}
            },
            disconnect: () => {
              osc.disconnect();
              oscGain.disconnect();
            },
          });

          this.ambienceInterval = window.setInterval(() => {
            if (this.isMuted || !this.ctx || this.currentAmbienceLocation !== 'crossroads_kiln') return;
            this.playSoundEffect('ember_glow');
          }, 3800);
          break;
        }

        case 'windy_road': {
          // Cold sweeping mountain wind
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(520, t);
            filter.Q.setValueAtTime(1.6, t);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.24, t + 2);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ambienceGain);
            noise.start(t);

            this.activeAmbienceSources.push({
              stop: () => {
                try {
                  noise.stop();
                } catch {}
              },
              disconnect: () => {
                noise.disconnect();
                filter.disconnect();
                gain.disconnect();
              },
            });
          }
          break;
        }

        case 'bottle_path': {
          // Soft twilight wind + delicate harmonic glass resonance
          const osc = this.ctx.createOscillator();
          const oscGain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, t); // C5 harmonic glass pad

          oscGain.gain.setValueAtTime(0.001, t);
          oscGain.gain.linearRampToValueAtTime(0.12, t + 2);

          osc.connect(oscGain);
          oscGain.connect(this.ambienceGain);
          osc.start(t);

          this.activeAmbienceSources.push({
            stop: () => {
              try {
                osc.stop();
              } catch {}
            },
            disconnect: () => {
              osc.disconnect();
              oscGain.disconnect();
            },
          });
          break;
        }

        case 'magic_mirror': {
          // Soft, gentle ethereal glass drone (quiet & soothing, never loud or piercing)
          [329.63, 440].forEach((f) => {
            if (!this.ctx || !this.ambienceGain) return;
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, t);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450, t);

            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.015, t + 2);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ambienceGain);
            osc.start(t);

            this.activeAmbienceSources.push({
              stop: () => {
                try {
                  osc.stop();
                } catch {}
              },
              disconnect: () => {
                osc.disconnect();
                filter.disconnect();
                gain.disconnect();
              },
            });
          });
          break;
        }

        case 'birthday_feast': {
          // Warm festive room atmosphere with gentle fireplace warmth & subtle celebrations
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(360, t);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.16, t + 1.5);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ambienceGain);
            noise.start(t);

            this.activeAmbienceSources.push({
              stop: () => {
                try {
                  noise.stop();
                } catch {}
              },
              disconnect: () => {
                noise.disconnect();
                filter.disconnect();
                gain.disconnect();
              },
            });
          }

          this.ambienceInterval = window.setInterval(() => {
            if (this.isMuted || !this.ctx || this.currentAmbienceLocation !== 'birthday_feast') return;
            if (Math.random() < 0.5) {
              this.playSoundEffect('candle_flicker');
            }
          }, 5000);
          break;
        }
      }
    } catch (e) {
      console.warn('Audio playLocationAmbience error:', e);
    }
  }

  public stopLocationAmbience() {
    try {
      if (this.ambienceInterval) {
        window.clearInterval(this.ambienceInterval);
        this.ambienceInterval = null;
      }
      this.activeAmbienceSources.forEach((src) => {
        try {
          if (src.stop) src.stop();
          if (src.disconnect) src.disconnect();
        } catch {}
      });
      this.activeAmbienceSources = [];
      this.currentAmbienceLocation = null;
    } catch (e) {
      console.warn('Audio stopLocationAmbience error:', e);
    }
  }

  /**
   * Dynamic Weather-specific Environmental Audio Layer System.
   * Generates continuous procedural weather effects (rain on cottage roof, whistling gusts, etc.)
   * layered seamlessly beneath BGM and location ambience with smooth crossfades.
   */
  public playWeatherAmbience(weather?: WeatherType, location?: SceneLocation) {
    try {
      const targetWeather = weather || 'clear';
      if (this.currentWeather === targetWeather && this.activeWeatherSources.length > 0) return;
      
      // Smoothly crossfade out existing weather sources
      this.fadeOutWeatherAmbience(1.2);
      this.currentWeather = targetWeather;

      if (!weather || weather === 'clear' || this.isMuted) return;
      this.init();
      if (!this.ctx || !this.ambienceGain) return;

      const t = this.ctx.currentTime;

      switch (weather) {
        case 'rain_ripples': {
          // 1. Procedural continuous soothing rain bed (filtered noise)
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            const isCottage = location === 'cottage_twilight' || location === 'crossroads_kiln';
            filter.type = isCottage ? 'bandpass' : 'lowpass';
            filter.frequency.setValueAtTime(isCottage ? 680 : 980, t);
            if (isCottage) filter.Q.setValueAtTime(1.6, t);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(isCottage ? 0.15 : 0.2, t + 1.5);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ambienceGain);
            noise.start(t);

            this.activeWeatherSources.push({
              stop: () => {
                try {
                  gain.gain.setValueAtTime(gain.gain.value, this.ctx!.currentTime);
                  gain.gain.linearRampToValueAtTime(0.001, this.ctx!.currentTime + 0.8);
                  setTimeout(() => {
                    try { noise.stop(); } catch {}
                  }, 850);
                } catch {
                  try { noise.stop(); } catch {}
                }
              },
              disconnect: () => {
                setTimeout(() => {
                  try {
                    noise.disconnect();
                    filter.disconnect();
                    gain.disconnect();
                  } catch {}
                }, 900);
              },
            });
          }

          // 2. Procedural raindrop oscillator generator for tactile patters
          const raindropOscLoop = window.setInterval(() => {
            if (this.isMuted || !this.ctx || !this.ambienceGain || this.currentWeather !== 'rain_ripples') return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const dropGain = this.ctx.createGain();
            const dropFilter = this.ctx.createBiquadFilter();
            
            // Randomize droplet pitch and filter
            const baseFreq = 750 + Math.random() * 450;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(180 + Math.random() * 80, now + 0.045);

            dropFilter.type = 'bandpass';
            dropFilter.frequency.setValueAtTime(baseFreq * 0.9, now);
            dropFilter.Q.setValueAtTime(3.0, now);

            dropGain.gain.setValueAtTime(0.001, now);
            dropGain.gain.linearRampToValueAtTime(0.035 + Math.random() * 0.025, now + 0.006);
            dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

            osc.connect(dropFilter);
            dropFilter.connect(dropGain);
            dropGain.connect(this.ambienceGain);

            osc.start(now);
            osc.stop(now + 0.06);
          }, 420);

          this.weatherInterval = raindropOscLoop;
          break;
        }

        case 'wind_leaves': {
          // 1. Procedural whistling wind gusts + sweeping noise
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(450, t);
            filter.Q.setValueAtTime(2.4, t);

            // Sweeping gust modulation LFO
            const lfo = this.ctx.createOscillator();
            lfo.frequency.setValueAtTime(0.11, t);
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.setValueAtTime(340, t);
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.16, t + 1.8);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ambienceGain);

            noise.start(t);
            lfo.start(t);

            this.activeWeatherSources.push({
              stop: () => {
                try {
                  gain.gain.setValueAtTime(gain.gain.value, this.ctx!.currentTime);
                  gain.gain.linearRampToValueAtTime(0.001, this.ctx!.currentTime + 0.9);
                  setTimeout(() => {
                    try {
                      noise.stop();
                      lfo.stop();
                    } catch {}
                  }, 950);
                } catch {
                  try { noise.stop(); lfo.stop(); } catch {}
                }
              },
              disconnect: () => {
                setTimeout(() => {
                  try {
                    noise.disconnect();
                    filter.disconnect();
                    gain.disconnect();
                    lfo.disconnect();
                  } catch {}
                }, 1000);
              },
            });
          }

          // 2. Procedural wind whistle harmonic oscillator
          const windOsc = this.ctx.createOscillator();
          const windFilter = this.ctx.createBiquadFilter();
          const windGain = this.ctx.createGain();
          const windLfo = this.ctx.createOscillator();
          const windLfoGain = this.ctx.createGain();

          windOsc.type = 'sine';
          windOsc.frequency.setValueAtTime(210, t);

          windLfo.frequency.setValueAtTime(0.18, t);
          windLfoGain.gain.setValueAtTime(45, t);
          windLfo.connect(windLfoGain);
          windLfoGain.connect(windOsc.frequency);

          windFilter.type = 'bandpass';
          windFilter.frequency.setValueAtTime(220, t);
          windFilter.Q.setValueAtTime(4.0, t);

          windGain.gain.setValueAtTime(0.001, t);
          windGain.gain.linearRampToValueAtTime(0.025, t + 2.0);

          windOsc.connect(windFilter);
          windFilter.connect(windGain);
          windGain.connect(this.ambienceGain);

          windOsc.start(t);
          windLfo.start(t);

          this.activeWeatherSources.push({
            stop: () => {
              try {
                windGain.gain.setValueAtTime(windGain.gain.value, this.ctx!.currentTime);
                windGain.gain.linearRampToValueAtTime(0.001, this.ctx!.currentTime + 0.9);
                setTimeout(() => {
                  try {
                    windOsc.stop();
                    windLfo.stop();
                  } catch {}
                }, 950);
              } catch {
                try { windOsc.stop(); windLfo.stop(); } catch {}
              }
            },
            disconnect: () => {
              setTimeout(() => {
                try {
                  windOsc.disconnect();
                  windFilter.disconnect();
                  windGain.disconnect();
                  windLfo.disconnect();
                } catch {}
              }, 1000);
            },
          });

          // Periodic wind gusts
          this.weatherInterval = window.setInterval(() => {
            if (this.isMuted || !this.ctx || this.currentWeather !== 'wind_leaves') return;
            if (Math.random() < 0.55) {
              this.playSoundEffect('wind_whistle');
            } else {
              this.playSoundEffect('soft_rustle');
            }
          }, 4800);
          break;
        }

        case 'sunlight_glints': {
          // Warm shimmering golden air & delicate light shimmer
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, t); // C5 golden shimmer

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.015, t + 2);

          osc.connect(gain);
          gain.connect(this.ambienceGain);
          osc.start(t);

          this.activeWeatherSources.push({
            stop: () => {
              try {
                gain.gain.setValueAtTime(gain.gain.value, this.ctx!.currentTime);
                gain.gain.linearRampToValueAtTime(0.001, this.ctx!.currentTime + 0.8);
                setTimeout(() => {
                  try { osc.stop(); } catch {}
                }, 850);
              } catch {
                try { osc.stop(); } catch {}
              }
            },
            disconnect: () => {
              setTimeout(() => {
                try {
                  osc.disconnect();
                  gain.disconnect();
                } catch {}
              }, 900);
            },
          });
          break;
        }

        case 'stardust_twilight': {
          // Delicate celestial twinkle tone
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(659.25, t); // E5 gentle stardust harmonic

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.012, t + 2);

          osc.connect(gain);
          gain.connect(this.ambienceGain);
          osc.start(t);

          this.activeWeatherSources.push({
            stop: () => {
              try {
                gain.gain.setValueAtTime(gain.gain.value, this.ctx!.currentTime);
                gain.gain.linearRampToValueAtTime(0.001, this.ctx!.currentTime + 0.8);
                setTimeout(() => {
                  try { osc.stop(); } catch {}
                }, 850);
              } catch {
                try { osc.stop(); } catch {}
              }
            },
            disconnect: () => {
              setTimeout(() => {
                try {
                  osc.disconnect();
                  gain.disconnect();
                } catch {}
              }, 900);
            },
          });
          break;
        }
      }
    } catch (e) {
      console.warn('Audio playWeatherAmbience error:', e);
    }
  }

  public stopWeatherAmbience() {
    try {
      if (this.weatherInterval) {
        window.clearInterval(this.weatherInterval);
        this.weatherInterval = null;
      }
      this.activeWeatherSources.forEach((src) => {
        try {
          if (src.stop) src.stop();
          if (src.disconnect) src.disconnect();
        } catch {}
      });
      this.activeWeatherSources = [];
      this.currentWeather = null;
    } catch (e) {
      console.warn('Audio stopWeatherAmbience error:', e);
    }
  }

  /**
   * Interactive Weather Micro-Synthesizer:
   * Provides ultra-responsive, tactile acoustic feedback when the user clicks or touches
   * individual weather phenomena (raindrops, sun motes, stardust, wind leaves).
   */
  public playWeatherPing(type: 'raindrop' | 'sun_mote' | 'wind_leaf' | 'stardust') {
    try {
      this.init();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;
      const t = this.ctx.currentTime;

      switch (type) {
        case 'raindrop': {
          // Acoustic Water Droplet "Plink-Plop" Ping
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          const baseFreq = 880 + Math.random() * 320;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq, t);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, t + 0.08);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(baseFreq * 0.9, t);
          filter.Q.setValueAtTime(4.5, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.24, t + 0.005);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.sfxGain);

          osc.start(t);
          osc.stop(t + 0.13);

          // Secondary micro-splash bubble
          setTimeout(() => {
            if (!this.ctx || !this.sfxGain || this.isMuted) return;
            const t2 = this.ctx.currentTime;
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1400 + Math.random() * 400, t2);
            osc2.frequency.exponentialRampToValueAtTime(400, t2 + 0.04);
            gain2.gain.setValueAtTime(0.08, t2);
            gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.045);
            osc2.connect(gain2);
            gain2.connect(this.sfxGain);
            osc2.start(t2);
            osc2.stop(t2 + 0.05);
          }, 35);
          break;
        }

        case 'sun_mote': {
          // Warm Golden Radiant Twinkle & Shimmer
          const freqs = [659.25, 783.99, 1046.5]; // E5, G5, C6 golden chord
          freqs.forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + idx * 0.025);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.08, t + idx * 0.025 + 0.18);

            gain.gain.setValueAtTime(0.001, t + idx * 0.025);
            gain.gain.linearRampToValueAtTime(0.14 - idx * 0.03, t + idx * 0.025 + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.025 + 0.38);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(t + idx * 0.025);
            osc.stop(t + idx * 0.025 + 0.4);
          });
          break;
        }

        case 'wind_leaf': {
          // Airy Leaf Swirl & Gentle Whoosh
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(600, t);
            filter.frequency.exponentialRampToValueAtTime(1400, t + 0.12);
            filter.frequency.exponentialRampToValueAtTime(450, t + 0.3);
            filter.Q.setValueAtTime(3.0, t);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.18, t + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);

            noise.start(t);
            noise.stop(t + 0.33);
          }

          // Gentle wooden chime undertone
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, t);
          osc.frequency.exponentialRampToValueAtTime(523.25, t + 0.2);
          gain.gain.setValueAtTime(0.06, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.24);
          break;
        }

        case 'stardust': {
          // Celestial Crystal Bell Shimmer
          const freqs = [1046.5, 1318.51, 1567.98]; // C6, E6, G6
          freqs.forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + idx * 0.03);

            gain.gain.setValueAtTime(0.001, t + idx * 0.03);
            gain.gain.linearRampToValueAtTime(0.12, t + idx * 0.03 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.03 + 0.45);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(t + idx * 0.03);
            osc.stop(t + idx * 0.03 + 0.46);
          });
          break;
        }
      }
    } catch {
      // ignore
    }
  }

  public playGoldenChime() {
    try {
      this.init();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const t = this.ctx.currentTime;
      // Ascending pentatonic golden bell arpeggio with ethereal harmonics
      const freqs = [587.33, 739.99, 880.0, 1108.73, 1318.51]; // D5, F#5, A5, C#6, E6
      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteTime = t + idx * 0.055;
        
        // Fundamental bell oscillator
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        // Warm harmonic overtone for chime sparkle
        const overtone = this.ctx.createOscillator();
        const overtoneGain = this.ctx.createGain();
        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(freq * 2.75, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.18 - idx * 0.02, noteTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.95);

        overtoneGain.gain.setValueAtTime(0.001, noteTime);
        overtoneGain.gain.linearRampToValueAtTime(0.06, noteTime + 0.01);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.45);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        overtone.connect(overtoneGain);
        overtoneGain.connect(this.sfxGain);

        osc.start(noteTime);
        osc.stop(noteTime + 1.0);
        overtone.start(noteTime);
        overtone.stop(noteTime + 0.5);
      });
    } catch {
      // non-fatal audio catch
    }
  }

  /**
   * Custom Multi-Layered Sound Effect for the LightMeter fill-up.
   * Blends a soft golden chime with a subtle, resonant musical harp swell
   * and deep emotional pad to signify the emotional weight of collecting light.
   */
  public playLightMeterFillHarpSwell() {
    try {
      this.init();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const t = this.ctx.currentTime;

      // Layer 1: Sub Warmth (Gentle low pad on D3 for emotional gravity)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      const subFilter = this.ctx.createBiquadFilter();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(146.83, t); // D3
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(320, t);

      subGain.gain.setValueAtTime(0.001, t);
      subGain.gain.linearRampToValueAtTime(0.22, t + 0.18);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);

      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(this.sfxGain);
      subOsc.start(t);
      subOsc.stop(t + 2.5);

      // Layer 2: Plucked Harp Swell Arpeggio (D major 9 / Lydian warmth: D4, F#4, A4, C#5, D5, F#5, A5)
      const harpNotes = [
        { freq: 293.66, delay: 0.0 },   // D4
        { freq: 369.99, delay: 0.05 },  // F#4
        { freq: 440.00, delay: 0.10 },  // A4
        { freq: 554.37, delay: 0.15 },  // C#5
        { freq: 587.33, delay: 0.20 },  // D5
        { freq: 739.99, delay: 0.25 },  // F#5
        { freq: 880.00, delay: 0.30 },  // A5
        { freq: 1174.66, delay: 0.36 }, // D6 (apex)
      ];

      harpNotes.forEach(({ freq, delay }) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteTime = t + delay;

        // Plucked acoustic body (sine with slight triangle overtone)
        const osc = this.ctx.createOscillator();
        const oscTri = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        oscTri.type = 'triangle';
        oscTri.frequency.setValueAtTime(freq * 2, noteTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, noteTime);
        filter.frequency.exponentialRampToValueAtTime(600, noteTime + 1.2);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.6);

        osc.connect(filter);
        oscTri.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(noteTime);
        oscTri.start(noteTime);
        osc.stop(noteTime + 1.7);
        oscTri.stop(noteTime + 1.7);
      });

      // Layer 3: Shimmering Golden Bell Chimes on the Apex
      const chimeNotes = [
        { freq: 1174.66, delay: 0.38 }, // D6
        { freq: 1479.98, delay: 0.44 }, // F#6
        { freq: 1760.00, delay: 0.50 }, // A6
        { freq: 2349.32, delay: 0.56 }, // D7
      ];

      chimeNotes.forEach(({ freq, delay }) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteTime = t + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.12, noteTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.4);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(noteTime);
        osc.stop(noteTime + 1.5);
      });
    } catch {
      // non-fatal audio catch
    }
  }

  /**
   * Real Synthesized Deep Heartbeat Sound.
   * Produces an authentic, resonant double-thump (lub-dub) with visceral sub-bass.
   */
  public playHeartbeat(intensity: number = 1.0) {
    try {
      this.init();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const t = this.ctx.currentTime;
      const vol = Math.min(Math.max(intensity, 0.4), 1.6);

      // Thump 1: "Lub" (Deeper, broader)
      const osc1 = this.ctx.createOscillator();
      const sub1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const filter1 = this.ctx.createBiquadFilter();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(62, t);
      osc1.frequency.exponentialRampToValueAtTime(38, t + 0.14);

      sub1.type = 'triangle';
      sub1.frequency.setValueAtTime(46, t);
      sub1.frequency.exponentialRampToValueAtTime(32, t + 0.14);

      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(110, t);

      gain1.gain.setValueAtTime(0.001, t);
      gain1.gain.linearRampToValueAtTime(0.48 * vol, t + 0.016);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

      osc1.connect(filter1);
      sub1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(this.sfxGain);

      osc1.start(t);
      sub1.start(t);
      osc1.stop(t + 0.2);
      sub1.stop(t + 0.2);

      // Thump 2: "Dub" (Slightly softer, ~160ms later)
      const t2 = t + 0.16;
      const osc2 = this.ctx.createOscillator();
      const sub2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      const filter2 = this.ctx.createBiquadFilter();

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(54, t2);
      osc2.frequency.exponentialRampToValueAtTime(34, t2 + 0.16);

      sub2.type = 'triangle';
      sub2.frequency.setValueAtTime(40, t2);
      sub2.frequency.exponentialRampToValueAtTime(28, t2 + 0.16);

      filter2.type = 'lowpass';
      filter2.frequency.setValueAtTime(95, t2);

      gain2.gain.setValueAtTime(0.001, t2);
      gain2.gain.linearRampToValueAtTime(0.38 * vol, t2 + 0.014);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.2);

      osc2.connect(filter2);
      sub2.connect(filter2);
      filter2.connect(gain2);
      gain2.connect(this.sfxGain);

      osc2.start(t2);
      sub2.start(t2);
      osc2.stop(t2 + 0.22);
      sub2.stop(t2 + 0.22);
    } catch {
      // ignore
    }
  }

  /**
   * Mélo Clown Whimsical Musical Note Flourish.
   * Plays a charming music-box note melody with playful bell timbre.
   */
  public playClownMusicalNote() {
    try {
      this.init();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const t = this.ctx.currentTime;
      // Cheerful music box staccato run
      const notes = [
        { freq: 783.99, delay: 0.0 },   // G5
        { freq: 1046.50, delay: 0.07 }, // C6
        { freq: 1318.51, delay: 0.14 }, // E6
        { freq: 1567.98, delay: 0.21 }, // G6
        { freq: 2093.00, delay: 0.28 }, // C7
      ];

      notes.forEach(({ freq, delay }) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteTime = t + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        // Subtle vibrato
        const vib = this.ctx.createOscillator();
        const vibGain = this.ctx.createGain();
        vib.frequency.setValueAtTime(6.5, noteTime);
        vibGain.gain.setValueAtTime(14, noteTime);
        vib.connect(vibGain);
        vibGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.7);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        vib.start(noteTime);
        osc.start(noteTime);
        vib.stop(noteTime + 0.72);
        osc.stop(noteTime + 0.72);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Super Witch Sun Lantern Radiant Glow Sound.
   * Radiant chord swell with sparkling celestial harmonics.
   */
  public playLanternGlow() {
    try {
      this.init();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const t = this.ctx.currentTime;
      // D major / Lydian radiant sun chord
      const freqs = [293.66, 440, 587.33, 739.99, 1174.66, 1760];
      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.15 - idx * 0.015, t + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 1.85);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Storybook Golden Magic Ink Writing Sound.
   * Whispering parchment texture and warm golden sparkle glissando.
   */
  public playMagicInkWriting() {
    try {
      this.init();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const t = this.ctx.currentTime;

      // 1. Soft whispering parchment brush friction
      const noiseBuffer = this.createWarmNoiseBuffer();
      if (noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, t);
        filter.frequency.linearRampToValueAtTime(1800, t + 0.4);
        filter.frequency.linearRampToValueAtTime(1200, t + 1.2);
        filter.Q.setValueAtTime(2.2, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.06, t + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(t);
        noise.stop(t + 1.45);
      }

      // 2. Delicate crystalline golden ink chimes (stardust melody)
      const chimes = [
        { freq: 880.0, delay: 0.05 },   // A5
        { freq: 1108.73, delay: 0.18 }, // C#6
        { freq: 1318.51, delay: 0.32 }, // E6
        { freq: 1661.22, delay: 0.46 }, // G#6
        { freq: 2217.46, delay: 0.62 }, // C#7
      ];

      chimes.forEach(({ freq, delay }) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteTime = t + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.08, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.85);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(noteTime);
        osc.stop(noteTime + 0.9);
      });
    } catch {
      // ignore
    }
  }

  private lastHoverSoundTime: Record<string, number> = {};

  /**
   * Scenic Background Interactive Hover Zone Sound.
   * Throttled per zone type so it plays smoothly as the mouse discovers scenic secrets.
   */
  public playHoverAmbience(type: 'leaves' | 'waves' | 'wind' | 'chime' | 'hearth' | 'crystal' | 'snow') {
    try {
      this.init();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = performance.now();
      const lastTime = this.lastHoverSoundTime[type] || 0;
      if (now - lastTime < 1600) return; // 1.6s cooldown per zone type
      this.lastHoverSoundTime[type] = now;

      const t = this.ctx.currentTime;

      switch (type) {
        case 'leaves': {
          // Soft rustle of ancient leaves
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(950, t);
            filter.Q.setValueAtTime(1.8, t);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.11, t + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            noise.start(t);
            noise.stop(t + 0.75);
          }
          break;
        }

        case 'waves': {
          // Distant ocean wave roll
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(240, t);
            filter.frequency.linearRampToValueAtTime(520, t + 0.4);
            filter.frequency.exponentialRampToValueAtTime(180, t + 1.2);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.14, t + 0.4);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            noise.start(t);
            noise.stop(t + 1.35);
          }
          break;
        }

        case 'wind': {
          // Gentle airy breeze whistle
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, t);
          osc.frequency.linearRampToValueAtTime(460, t + 0.35);
          osc.frequency.linearRampToValueAtTime(280, t + 0.9);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.09, t + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);

          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 1.0);
          break;
        }

        case 'chime':
        case 'crystal': {
          // Delicate crystal resonance
          const freqs = type === 'crystal' ? [659.25, 987.77, 1318.51] : [880, 1174.66, 1760];
          freqs.forEach((f, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, t + idx * 0.05);

            gain.gain.setValueAtTime(0.001, t + idx * 0.05);
            gain.gain.linearRampToValueAtTime(0.1, t + idx * 0.05 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.05 + 0.9);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + idx * 0.05);
            osc.stop(t + idx * 0.05 + 0.95);
          });
          break;
        }

        case 'hearth': {
          // Warm crackle
          [0, 0.08, 0.18].forEach((delay) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, t + delay);
            osc.frequency.exponentialRampToValueAtTime(140, t + delay + 0.04);

            gain.gain.setValueAtTime(0.08, t + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.05);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + delay);
            osc.stop(t + delay + 0.06);
          });
          break;
        }

        case 'snow': {
          // Delicate frozen powder whisper
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, t);
          osc.frequency.exponentialRampToValueAtTime(1800, t + 0.15);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.06, t + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.4);
          break;
        }
      }
    } catch {
      // ignore
    }
  }

  public playSoundEffect(type: SoundEffectType) {
    try {
      this.init();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const t = this.ctx.currentTime;

      switch (type) {
        case 'click': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, t);
          osc.frequency.exponentialRampToValueAtTime(260, t + 0.04);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.05);
          break;
        }

        case 'soft_bell': {
          [659.25, 1318.51].forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.2 - idx * 0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 1.25);
          });
          break;
        }

        case 'purr': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const lfo = this.ctx.createOscillator();
          const lfoGain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(140, t);
          lfo.frequency.setValueAtTime(26, t);
          lfoGain.gain.setValueAtTime(0.12, t);

          gain.gain.setValueAtTime(0.01, t);
          gain.gain.linearRampToValueAtTime(0.2, t + 0.15);
          gain.gain.linearRampToValueAtTime(0.01, t + 0.7);

          lfo.connect(lfoGain);
          lfoGain.connect(gain.gain);
          osc.connect(gain);
          gain.connect(this.sfxGain);

          lfo.start(t);
          osc.start(t);
          lfo.stop(t + 0.72);
          osc.stop(t + 0.72);
          break;
        }

        case 'lezar_meow': {
          // Authentic feline vocal synthesis: Dual-tone harmonic body + vocal tract formant filter sweep + feline pitch vibrato + soft throat onset
          const oscFund = this.ctx.createOscillator();
          const oscHarm = this.ctx.createOscillator();
          const oscSub = this.ctx.createOscillator();

          const fundGain = this.ctx.createGain();
          const harmGain = this.ctx.createGain();
          const subGain = this.ctx.createGain();

          const formantFilter = this.ctx.createBiquadFilter();
          const mainGain = this.ctx.createGain();

          // Cat meow pitch contour: "m-EE-oww"
          // Starts around 480 Hz, sweeps smoothly up to 880 Hz, lingers with sweet vibrato, then drops gently to 430 Hz
          oscFund.type = 'triangle';
          oscHarm.type = 'sawtooth';
          oscSub.type = 'sine';

          // Frequencies
          oscFund.frequency.setValueAtTime(460, t);
          oscFund.frequency.exponentialRampToValueAtTime(840, t + 0.14);
          oscFund.frequency.setValueAtTime(840, t + 0.28);
          oscFund.frequency.exponentialRampToValueAtTime(420, t + 0.62);

          oscHarm.frequency.setValueAtTime(920, t);
          oscHarm.frequency.exponentialRampToValueAtTime(1680, t + 0.14);
          oscHarm.frequency.setValueAtTime(1680, t + 0.28);
          oscHarm.frequency.exponentialRampToValueAtTime(840, t + 0.62);

          oscSub.frequency.setValueAtTime(230, t);
          oscSub.frequency.exponentialRampToValueAtTime(420, t + 0.14);
          oscSub.frequency.exponentialRampToValueAtTime(210, t + 0.62);

          // Feline pitch vibrato (~5.6 Hz) during the vocal sustain
          const vibrato = this.ctx.createOscillator();
          const vibratoGain = this.ctx.createGain();
          vibrato.frequency.setValueAtTime(5.6, t);
          vibratoGain.gain.setValueAtTime(0, t);
          vibratoGain.gain.linearRampToValueAtTime(14, t + 0.16);
          vibratoGain.gain.linearRampToValueAtTime(0, t + 0.58);
          vibrato.connect(vibratoGain);
          vibratoGain.connect(oscFund.frequency);
          vibratoGain.connect(oscHarm.frequency);

          // Vocal tract formant filter: dynamic bandpass sweeping from 'm' (580Hz) -> 'ee' (2200Hz) -> 'ow' (680Hz)
          formantFilter.type = 'bandpass';
          formantFilter.Q.setValueAtTime(3.8, t);
          formantFilter.frequency.setValueAtTime(580, t);
          formantFilter.frequency.exponentialRampToValueAtTime(2200, t + 0.16);
          formantFilter.frequency.setValueAtTime(2100, t + 0.32);
          formantFilter.frequency.exponentialRampToValueAtTime(680, t + 0.64);

          fundGain.gain.setValueAtTime(0.35, t);
          harmGain.gain.setValueAtTime(0.08, t);
          subGain.gain.setValueAtTime(0.15, t);

          oscFund.connect(fundGain);
          oscHarm.connect(harmGain);
          oscSub.connect(subGain);

          fundGain.connect(formantFilter);
          harmGain.connect(formantFilter);
          subGain.connect(formantFilter);

          // Amplitude envelope: soft onset ("m-"), strong open throat ("-ee-"), gentle trailing decay ("-oww")
          mainGain.gain.setValueAtTime(0.001, t);
          mainGain.gain.linearRampToValueAtTime(0.32, t + 0.14);
          mainGain.gain.setValueAtTime(0.30, t + 0.32);
          mainGain.gain.exponentialRampToValueAtTime(0.001, t + 0.68);

          formantFilter.connect(mainGain);
          mainGain.connect(this.sfxGain);

          // Subtle throat breath onset trill
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(1800, t);
            noiseFilter.Q.setValueAtTime(2.0, t);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.05, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.sfxGain);

            noise.start(t);
            noise.stop(t + 0.09);
          }

          oscFund.start(t);
          oscHarm.start(t);
          oscSub.start(t);
          vibrato.start(t);

          oscFund.stop(t + 0.7);
          oscHarm.stop(t + 0.7);
          oscSub.stop(t + 0.7);
          vibrato.stop(t + 0.7);
          break;
        }

        case 'abyss_whisper': {
          // Hollow void whisper & eerie dark resonance for abyss interactions
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const oscGain = this.ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(68, t);
          osc1.frequency.exponentialRampToValueAtTime(32, t + 0.8);

          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(136, t);
          osc2.frequency.exponentialRampToValueAtTime(64, t + 0.8);

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(220, t);

          oscGain.gain.setValueAtTime(0.01, t);
          oscGain.gain.linearRampToValueAtTime(0.38, t + 0.12);
          oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(oscGain);
          oscGain.connect(this.sfxGain);

          osc1.start(t);
          osc2.start(t);
          osc1.stop(t + 0.88);
          osc2.stop(t + 0.88);
          break;
        }

        case 'wind_breeze': {
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(320, t);
            filter.frequency.linearRampToValueAtTime(580, t + 0.8);
            filter.frequency.linearRampToValueAtTime(260, t + 1.8);
            filter.Q.setValueAtTime(1.5, t);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.01, t);
            gain.gain.linearRampToValueAtTime(0.18, t + 0.7);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.9);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            noise.start(t);
            noise.stop(t + 1.95);
          }
          break;
        }

        case 'ocean_waves': {
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(160, t);
            filter.frequency.linearRampToValueAtTime(650, t + 1.2);
            filter.frequency.exponentialRampToValueAtTime(180, t + 2.8);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.02, t);
            gain.gain.linearRampToValueAtTime(0.24, t + 1.2);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 2.9);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            noise.start(t);
            noise.stop(t + 3.0);
          }
          break;
        }

        case 'rain_drizzle': {
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1100, t);
            filter.Q.setValueAtTime(0.8, t);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.01, t);
            gain.gain.linearRampToValueAtTime(0.12, t + 0.4);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            noise.start(t);
            noise.stop(t + 1.65);
          }
          break;
        }

        case 'thunder': {
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(160, t);
            filter.frequency.exponentialRampToValueAtTime(60, t + 1.8);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.01, t);
            gain.gain.linearRampToValueAtTime(0.35, t + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 2.1);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            noise.start(t);
            noise.stop(t + 2.15);
          }
          break;
        }

        case 'magic_sparkle': {
          [880, 1174.66, 1396.91, 1760, 2093].forEach((f, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, t + idx * 0.06);
            gain.gain.setValueAtTime(0.16, t + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.7);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + idx * 0.06);
            osc.stop(t + idx * 0.06 + 0.75);
          });
          break;
        }

        case 'ember_glow': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220, t);
          osc.frequency.exponentialRampToValueAtTime(330, t + 0.25);
          gain.gain.setValueAtTime(0.01, t);
          gain.gain.linearRampToValueAtTime(0.12, t + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.42);
          break;
        }

        case 'footstep': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(140, t);
          osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);
          gain.gain.setValueAtTime(0.14, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.095);
          break;
        }

        case 'clown_jingle': {
          [987.77, 1318.51, 1567.98, 1975.53].forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + idx * 0.04);
            gain.gain.setValueAtTime(0.15, t + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.6);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + idx * 0.04);
            osc.stop(t + idx * 0.04 + 0.65);
          });
          break;
        }

        case 'magic_surge': {
          [261.63, 329.63, 392, 523.25, 659.25, 783.99].forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + idx * 0.08);
            gain.gain.setValueAtTime(0.18, t + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 1.4);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + idx * 0.08);
            osc.stop(t + idx * 0.08 + 1.45);
          });
          break;
        }

        case 'sunrise_chime': {
          [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, t + i * 0.12);
            gain.gain.setValueAtTime(0.2, t + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 1.8);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + i * 0.12);
            osc.stop(t + i * 0.12 + 1.9);
          });
          break;
        }

        case 'choice': {
          [440, 554.37, 659.25].forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + idx * 0.05);
            gain.gain.setValueAtTime(0.14, t + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.4);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + idx * 0.05);
            osc.stop(t + idx * 0.05 + 0.45);
          });
          break;
        }

        case 'bottle_tink': {
          [1760, 2637].forEach((f, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, t + idx * 0.03);
            gain.gain.setValueAtTime(0.18, t + idx * 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.03 + 0.8);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + idx * 0.03);
            osc.stop(t + idx * 0.03 + 0.85);
          });
          break;
        }

        case 'party_horn': {
          [349.23, 440, 523.25, 698.46].forEach((f, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, t + idx * 0.04);
            gain.gain.setValueAtTime(0.12, t + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.9);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + idx * 0.04);
            osc.stop(t + idx * 0.04 + 0.95);
          });
          break;
        }

        case 'cheer': {
          [261.63, 329.63, 392, 523.25].forEach((f, i) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, t + i * 0.05);
            gain.gain.setValueAtTime(0.18, t + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 1.2);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + i * 0.05);
            osc.stop(t + i * 0.05 + 1.25);
          });
          break;
        }

        case 'starlight': {
          [1046.5, 1318.51, 1567.98, 2093].forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + idx * 0.07);
            gain.gain.setValueAtTime(0.15, t + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 1.1);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + idx * 0.07);
            osc.stop(t + idx * 0.07 + 1.15);
          });
          break;
        }

        case 'heartbeat': {
          [0, 0.22].forEach((offset) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(75, t + offset);
            osc.frequency.exponentialRampToValueAtTime(45, t + offset + 0.12);
            gain.gain.setValueAtTime(0.28, t + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.14);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + offset);
            osc.stop(t + offset + 0.15);
          });
          break;
        }

        case 'page_turn': {
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1600, t);
            filter.frequency.linearRampToValueAtTime(600, t + 0.25);
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.01, t);
            gain.gain.linearRampToValueAtTime(0.18, t + 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            noise.start(t);
            noise.stop(t + 0.3);
          }
          break;
        }

        case 'book_close': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(120, t);
          osc.frequency.exponentialRampToValueAtTime(40, t + 0.18);
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.22);
          break;
        }

        case 'dramatic_impact': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(90, t);
          osc.frequency.exponentialRampToValueAtTime(35, t + 0.4);
          gain.gain.setValueAtTime(0.38, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.65);
          break;
        }

        case 'crystal_resonate': {
          [880, 1318.51, 1760, 2637.02].forEach((freq, i) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + i * 0.05);
            gain.gain.setValueAtTime(0.2, t + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 1.8);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + i * 0.05);
            osc.stop(t + i * 0.05 + 1.85);
          });
          break;
        }

        case 'soft_rustle': {
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1400, t);
            filter.frequency.linearRampToValueAtTime(900, t + 0.4);
            filter.Q.setValueAtTime(1.2, t);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.01, t);
            gain.gain.linearRampToValueAtTime(0.16, t + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            noise.start(t);
            noise.stop(t + 0.52);
          }
          break;
        }

        case 'confetti_pop': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, t);
          osc.frequency.exponentialRampToValueAtTime(900, t + 0.08);
          gain.gain.setValueAtTime(0.25, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.12);

          [1046.5, 1318.51, 1567.98].forEach((f, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const p = this.ctx.createOscillator();
            const pg = this.ctx.createGain();
            p.type = 'triangle';
            p.frequency.setValueAtTime(f, t + 0.06 + idx * 0.04);
            pg.gain.setValueAtTime(0.14, t + 0.06 + idx * 0.04);
            pg.gain.exponentialRampToValueAtTime(0.001, t + 0.06 + idx * 0.04 + 0.4);
            p.connect(pg);
            pg.connect(this.sfxGain);
            p.start(t + 0.06 + idx * 0.04);
            p.stop(t + 0.06 + idx * 0.04 + 0.42);
          });
          break;
        }

        case 'gift_unwrap': {
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1800, t);
            filter.frequency.linearRampToValueAtTime(700, t + 0.3);
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.02, t);
            gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            noise.start(t);
            noise.stop(t + 0.38);
          }
          [523.25, 783.99, 1046.5].forEach((f, i) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, t + 0.15 + i * 0.06);
            g.gain.setValueAtTime(0.15, t + 0.15 + i * 0.06);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.15 + i * 0.06 + 0.6);
            osc.connect(g);
            g.connect(this.sfxGain);
            osc.start(t + 0.15 + i * 0.06);
            osc.stop(t + 0.15 + i * 0.06 + 0.65);
          });
          break;
        }

        case 'glass_clink': {
          [2093, 3135.96].forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + idx * 0.02);
            gain.gain.setValueAtTime(0.25, t + idx * 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.02 + 1.1);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + idx * 0.02);
            osc.stop(t + idx * 0.02 + 1.15);
          });
          break;
        }

        case 'flame_ignite': {
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(250, t);
            filter.frequency.linearRampToValueAtTime(600, t + 0.15);
            filter.frequency.exponentialRampToValueAtTime(180, t + 0.6);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.01, t);
            gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            noise.start(t);
            noise.stop(t + 0.72);
          }
          break;
        }

        case 'bird_chirp': {
          const chirps = [
            { start: 0.0, f1: 2600, f2: 3400, f3: 3100, dur: 0.09 },
            { start: 0.12, f1: 3000, f2: 3900, f3: 3400, dur: 0.11 },
            { start: 0.27, f1: 2800, f2: 3600, f3: 3200, dur: 0.08 },
          ];

          chirps.forEach((c) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';

            const startTime = t + c.start;
            osc.frequency.setValueAtTime(c.f1, startTime);
            osc.frequency.linearRampToValueAtTime(c.f2, startTime + c.dur * 0.5);
            osc.frequency.exponentialRampToValueAtTime(c.f3, startTime + c.dur);

            gain.gain.setValueAtTime(0.001, startTime);
            gain.gain.linearRampToValueAtTime(0.08, startTime + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + c.dur);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(startTime);
            osc.stop(startTime + c.dur + 0.02);
          });
          break;
        }

        case 'glass_shimmer': {
          // Delicate glass chime shimmer with glistening harmonic decay (soft and gentle)
          [1760, 2093, 2637.02, 3135.96, 3520].forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const startTime = t + idx * 0.04;
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.06, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.4);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(startTime);
            osc.stop(startTime + 1.45);
          });
          break;
        }

        case 'mirror_transform': {
          // Glass shimmer followed by soft magical transition surge chord
          [1760, 2637, 3520].forEach((f, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const startTime = t + idx * 0.03;
            osc.frequency.setValueAtTime(f, startTime);
            gain.gain.setValueAtTime(0.05, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.9);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(startTime);
            osc.stop(startTime + 0.95);
          });

          // Celestial transformation chord
          [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const startTime = t + 0.2 + idx * 0.06;
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.07, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 2.2);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(startTime);
            osc.stop(startTime + 2.25);
          });
          break;
        }

        case 'celebration_chimes': {
          // Joyful celebratory bells & melody cascade
          [587.33, 739.99, 880, 1174.66, 1479.98, 1760].forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const startTime = t + idx * 0.08;
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.18, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.3);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(startTime);
            osc.stop(startTime + 1.35);
          });
          break;
        }

        case 'candle_flicker': {
          // Gentle flame crackle and warm subtle spark
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, t);
          osc.frequency.exponentialRampToValueAtTime(480, t + 0.15);
          gain.gain.setValueAtTime(0.01, t);
          gain.gain.linearRampToValueAtTime(0.08, t + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.32);
          break;
        }

        case 'magic_whoosh': {
          // Soft magical whoosh / breeze with sparkling tail
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(400, t);
            filter.frequency.linearRampToValueAtTime(1200, t + 0.35);
            filter.frequency.linearRampToValueAtTime(300, t + 0.8);
            filter.Q.setValueAtTime(1.8, t);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.01, t);
            gain.gain.linearRampToValueAtTime(0.2, t + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            noise.start(t);
            noise.stop(t + 0.88);
          }

          [1318.51, 1567.98, 2093].forEach((f, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sine';
            const startTime = t + 0.25 + idx * 0.05;
            osc.frequency.setValueAtTime(f, startTime);
            g.gain.setValueAtTime(0.12, startTime);
            g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7);
            osc.connect(g);
            g.connect(this.sfxGain);
            osc.start(startTime);
            osc.stop(startTime + 0.75);
          });
          break;
        }

        case 'door_creak': {
          // Cozy wooden cottage door swing
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, t);
          osc.frequency.linearRampToValueAtTime(180, t + 0.25);
          osc.frequency.linearRampToValueAtTime(120, t + 0.5);

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(350, t);

          gain.gain.setValueAtTime(0.01, t);
          gain.gain.linearRampToValueAtTime(0.12, t + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.58);
          break;
        }

        case 'orik_chirp': {
          // Cute delicate forest sprite chirp & cheerful sparkle
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1046.5, t); // C6
          osc.frequency.exponentialRampToValueAtTime(1567.98, t + 0.08); // G6
          osc.frequency.exponentialRampToValueAtTime(2093, t + 0.16); // C7
          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.15, t + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.35);

          // Subtle secondary crystal chime
          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(1760, t + 0.06);
          gain2.gain.setValueAtTime(0.08, t + 0.06);
          gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
          osc2.connect(gain2);
          gain2.connect(this.sfxGain);
          osc2.start(t + 0.06);
          osc2.stop(t + 0.5);
          break;
        }

        case 'memory_chime': {
          // Gentle, ethereal memory chime when opening the memories gallery
          const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6 celestial cascade
          chord.forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = t + idx * 0.055;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.001, start);
            gain.gain.linearRampToValueAtTime(0.12 - idx * 0.015, start + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 1.6);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(start);
            osc.stop(start + 1.65);
          });
          break;
        }

        case 'vivienne_cry': {
          // Delicate, mournful artisan glassmaker sob / tearful sniffling whimpers
          const sobTones = [
            [392, 349.23], // G4 -> F4
            [370, 329.63], // F#4 -> E4
          ];
          sobTones.forEach(([startF, endF], idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = t + idx * 0.16;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(startF, start);
            osc.frequency.exponentialRampToValueAtTime(endF, start + 0.12);
            gain.gain.setValueAtTime(0.001, start);
            gain.gain.linearRampToValueAtTime(0.12, start + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(start);
            osc.stop(start + 0.3);
          });
          break;
        }

        case 'vivienne_laugh': {
          // Hearty, cheerful artisan glassmaker chuckle / laugh
          const notes = [440, 523.25, 659.25, 523.25];
          notes.forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = t + idx * 0.09;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);
            osc.frequency.linearRampToValueAtTime(freq * 1.08, start + 0.04);
            gain.gain.setValueAtTime(0.001, start);
            gain.gain.linearRampToValueAtTime(0.14, start + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(start);
            osc.stop(start + 0.2);
          });
          break;
        }

        case 'hypo_squeak': {
          // Playful baby hippo chortle & gentle water bloop
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, t);
          osc.frequency.exponentialRampToValueAtTime(580, t + 0.08);
          osc.frequency.exponentialRampToValueAtTime(420, t + 0.22);
          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.18, t + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.38);

          // Water bubble pop
          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(600, t + 0.12);
          osc2.frequency.exponentialRampToValueAtTime(900, t + 0.18);
          gain2.gain.setValueAtTime(0.001, t + 0.12);
          gain2.gain.linearRampToValueAtTime(0.1, t + 0.14);
          gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          osc2.connect(gain2);
          gain2.connect(this.sfxGain);
          osc2.start(t + 0.12);
          osc2.stop(t + 0.32);
          break;
        }

        case 'wendy_giggle': {
          // Sweet gentle "tee-hee" witch giggle (two soft bell lilts)
          const gigglePitches = [
            [659.25, 783.99], // E5 -> G5
            [880, 1046.5], // A5 -> C6
          ];
          gigglePitches.forEach(([f1, f2], idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = t + idx * 0.14;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f1, start);
            osc.frequency.exponentialRampToValueAtTime(f2, start + 0.06);
            gain.gain.setValueAtTime(0.001, start);
            gain.gain.linearRampToValueAtTime(0.12, start + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(start);
            osc.stop(start + 0.25);
          });
          break;
        }

        case 'clown_musical': {
          // Whimsical, joyful theatrical music-box flourish
          const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5 to G6
          arpeggio.forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = t + idx * 0.065;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.001, start);
            gain.gain.linearRampToValueAtTime(0.14 - idx * 0.015, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(start);
            osc.stop(start + 0.5);
          });
          break;
        }

        case 'marmot_squeak': {
          // Cute marmot chirp
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, t);
          osc.frequency.exponentialRampToValueAtTime(1320, t + 0.06);
          osc.frequency.exponentialRampToValueAtTime(980, t + 0.14);
          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.12, t + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.26);
          break;
        }

        case 'marmot_yawn': {
          // Sleepy little marmot yawn
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(580, t);
          osc.frequency.linearRampToValueAtTime(680, t + 0.25);
          osc.frequency.exponentialRampToValueAtTime(280, t + 0.7);
          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.1, t + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.8);
          break;
        }

        case 'rain_roof': {
          // Soft raindrops on cottage shingles
          [0, 0.08, 0.17, 0.29].forEach((offset, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = t + offset + (Math.random() * 0.03);
            osc.type = 'sine';
            const f = 480 + idx * 80 + (Math.random() * 40);
            osc.frequency.setValueAtTime(f, start);
            osc.frequency.exponentialRampToValueAtTime(f * 0.5, start + 0.03);
            gain.gain.setValueAtTime(0.001, start);
            gain.gain.linearRampToValueAtTime(0.04, start + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.05);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(start);
            osc.stop(start + 0.06);
          });
          break;
        }

        case 'wind_whistle': {
          // Light whistling breeze gust
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, t);
          osc.frequency.linearRampToValueAtTime(740, t + 0.6);
          osc.frequency.linearRampToValueAtTime(420, t + 1.4);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(600, t);
          filter.Q.setValueAtTime(3.5, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.08, t + 0.5);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 1.55);
          break;
        }

        case 'harp_arpeggio': {
          // Soft, enchanting celestial harp arpeggio
          const harpNotes = [261.63, 329.63, 392.0, 493.88, 587.33, 659.25, 783.99, 1046.5];
          harpNotes.forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const startTime = t + idx * 0.075;

            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(freq * 3.2, startTime);
            filter.frequency.exponentialRampToValueAtTime(freq * 1.2, startTime + 1.2);
            filter.Q.setValueAtTime(2.0, startTime);

            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.linearRampToValueAtTime(0.14 / (1 + idx * 0.08), startTime + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.0);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(startTime);
            osc.stop(startTime + 2.05);

            // Shimmering second harmonic
            const harmOsc = this.ctx.createOscillator();
            const harmGain = this.ctx.createGain();
            harmOsc.type = 'sine';
            harmOsc.frequency.setValueAtTime(freq * 2, startTime);
            harmGain.gain.setValueAtTime(0.0001, startTime);
            harmGain.gain.linearRampToValueAtTime(0.035, startTime + 0.008);
            harmGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.0);
            harmOsc.connect(harmGain);
            harmGain.connect(this.sfxGain);
            harmOsc.start(startTime);
            harmOsc.stop(startTime + 1.05);
          });
          break;
        }

        case 'door_knock': {
          // Warm wooden door knock (two rhythmic taps)
          [0, 0.16].forEach((offset) => {
            if (!this.ctx || !this.sfxGain) return;
            const startTime = t + offset;
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(160, startTime);
            osc.frequency.exponentialRampToValueAtTime(80, startTime + 0.06);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450, startTime);
            filter.Q.setValueAtTime(3.5, startTime);

            gain.gain.setValueAtTime(0.001, startTime);
            gain.gain.linearRampToValueAtTime(0.24, startTime + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.08);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(startTime);
            osc.stop(startTime + 0.09);
          });
          break;
        }

        case 'star_fall': {
          // Shimmering falling star glissando & celestial twinkle
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1864.66, t);
          osc.frequency.exponentialRampToValueAtTime(880, t + 0.55);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.12, t + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);

          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.7);

          [2093, 2637, 3135.96, 3520].forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const starT = t + 0.08 + idx * 0.09;
            const sparkOsc = this.ctx.createOscillator();
            const sparkGain = this.ctx.createGain();
            sparkOsc.type = 'sine';
            sparkOsc.frequency.setValueAtTime(freq, starT);
            sparkGain.gain.setValueAtTime(0.001, starT);
            sparkGain.gain.linearRampToValueAtTime(0.08, starT + 0.01);
            sparkGain.gain.exponentialRampToValueAtTime(0.0001, starT + 0.4);
            sparkOsc.connect(sparkGain);
            sparkGain.connect(this.sfxGain);
            sparkOsc.start(starT);
            sparkOsc.stop(starT + 0.42);
          });
          break;
        }

        case 'tree_rustle': {
          // Soft leafy breeze sweep with subtle branches sway
          const noiseBuffer = this.createWarmNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(420, t);
            filter.frequency.linearRampToValueAtTime(680, t + 0.25);
            filter.frequency.linearRampToValueAtTime(320, t + 0.7);
            filter.Q.setValueAtTime(2.2, t);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.14, t + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            noise.start(t);
            noise.stop(t + 0.8);
          }
          break;
        }

        case 'flower_bloom': {
          // Delicate blossoming chime with soft ascending pop
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const bloomT = t + idx * 0.055;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, bloomT);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.04, bloomT + 0.15);

            gain.gain.setValueAtTime(0.001, bloomT);
            gain.gain.linearRampToValueAtTime(0.12, bloomT + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, bloomT + 0.6);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(bloomT);
            osc.stop(bloomT + 0.65);
          });
          break;
        }

        case 'sun_sparkle': {
          // Radiant golden solar chime & warm harmonic resonance
          [587.33, 1174.66, 1760, 2349.32].forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const sunT = t + idx * 0.04;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, sunT);

            gain.gain.setValueAtTime(0.001, sunT);
            gain.gain.linearRampToValueAtTime(0.16 / (1 + idx * 0.2), sunT + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, sunT + 1.2);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(sunT);
            osc.stop(sunT + 1.25);
          });
          break;
        }
      }
    } catch (e) {
      console.warn('Audio SFX error:', e);
    }
  }

  public playCreditsPianoTheme() {
    this.fadeOutMusic(1.8);
    this.fadeOutLocationAmbience(1.5);
    this.fadeOutWeatherAmbience(1.5);
    setTimeout(() => {
      this.playMusicTheme('credits');
    }, 1200);
  }

  public fadeOutLocationAmbience(durationSeconds: number = 1.5) {
    try {
      if (this.ambienceInterval) {
        window.clearInterval(this.ambienceInterval);
        this.ambienceInterval = null;
      }
      const sourcesToFade = [...this.activeAmbienceSources];
      this.activeAmbienceSources = [];
      this.currentAmbienceLocation = null;

      if (this.ctx && this.ambienceGain && !this.isMuted) {
        const t = this.ctx.currentTime;
        const currentGain = Math.max(0.001, this.ambienceGain.gain.value);
        this.ambienceGain.gain.setValueAtTime(currentGain, t);
        this.ambienceGain.gain.exponentialRampToValueAtTime(0.0001, t + durationSeconds);
        setTimeout(() => {
          sourcesToFade.forEach((src) => {
            try {
              if (src.stop) src.stop();
              if (src.disconnect) src.disconnect();
            } catch {}
          });
          if (this.ctx && this.ambienceGain) {
            this.ambienceGain.gain.setValueAtTime(0.56, this.ctx.currentTime);
          }
        }, durationSeconds * 1000 + 100);
      } else {
        sourcesToFade.forEach((src) => {
          try {
            if (src.stop) src.stop();
            if (src.disconnect) src.disconnect();
          } catch {}
        });
      }
    } catch (e) {
      console.warn('Audio fadeOutLocationAmbience error:', e);
    }
  }

  public fadeOutWeatherAmbience(durationSeconds: number = 1.5) {
    try {
      if (this.weatherInterval) {
        window.clearInterval(this.weatherInterval);
        this.weatherInterval = null;
      }
      const sourcesToFade = [...this.activeWeatherSources];
      this.activeWeatherSources = [];
      this.currentWeather = null;

      if (this.ctx && this.ambienceGain && !this.isMuted) {
        const t = this.ctx.currentTime;
        const currentGain = Math.max(0.001, this.ambienceGain.gain.value);
        this.ambienceGain.gain.setValueAtTime(currentGain, t);
        this.ambienceGain.gain.exponentialRampToValueAtTime(0.0001, t + durationSeconds);
        setTimeout(() => {
          sourcesToFade.forEach((src) => {
            try {
              if (src.stop) src.stop();
              if (src.disconnect) src.disconnect();
            } catch {}
          });
          if (this.ctx && this.ambienceGain) {
            this.ambienceGain.gain.setValueAtTime(0.56, this.ctx.currentTime);
          }
        }, durationSeconds * 1000 + 100);
      } else {
        sourcesToFade.forEach((src) => {
          try {
            if (src.stop) src.stop();
            if (src.disconnect) src.disconnect();
          } catch {}
        });
      }
    } catch (e) {
      console.warn('Audio fadeOutWeatherAmbience error:', e);
    }
  }

  public playMusicTheme(theme: MusicTheme) {
    try {
      if (this.currentTheme === theme) return;
      this.currentTheme = theme;
      this.init();

      if (this.musicInterval) {
        window.clearInterval(this.musicInterval);
        this.musicInterval = null;
      }

      this.creditsStepIndex = 0;
      this.playThemeStep(theme);
      this.musicInterval = window.setInterval(() => {
        this.playThemeStep(theme);
      }, 4800);
    } catch (e) {
      console.warn('Audio music theme error:', e);
    }
  }

  private playThemeStep(theme: MusicTheme) {
    try {
      if (!this.ctx || !this.musicGain || this.isMuted) return;

      const t = this.ctx.currentTime;

      // Special emotional cinematic soundtrack for credits
      if (theme === 'credits') {
        const emotionalProgression = [
          // 1. C major (Warm homecoming)
          { chord: [261.63, 329.63, 392, 523.25], arpeggio: [523.25, 659.25, 783.99, 1046.5] },
          // 2. G/B (Gentle longing)
          { chord: [246.94, 293.66, 392, 493.88], arpeggio: [493.88, 587.33, 783.99, 987.77] },
          // 3. Am7 (Tender gratitude)
          { chord: [220, 261.63, 329.63, 440], arpeggio: [440, 523.25, 659.25, 880] },
          // 4. Em/G (Nostalgic quiet)
          { chord: [196, 246.94, 329.63, 392], arpeggio: [392, 493.88, 659.25, 783.99] },
          // 5. Fmaj7 (Soaring hope)
          { chord: [174.61, 220, 261.63, 329.63, 440], arpeggio: [349.23, 440, 523.25, 659.25] },
          // 6. C/E (Warm embrace)
          { chord: [164.81, 261.63, 329.63, 392], arpeggio: [329.63, 392, 523.25, 659.25] },
          // 7. Dm7 (Gentle farewell)
          { chord: [146.83, 220, 261.63, 349.23], arpeggio: [293.66, 349.23, 440, 587.33] },
          // 8. G7sus4 -> G7 (Rising resolve)
          { chord: [196, 261.63, 293.66, 392], arpeggio: [392, 493.88, 587.33, 783.99] },
        ];

        const step = emotionalProgression[this.creditsStepIndex % emotionalProgression.length];
        this.creditsStepIndex++;

        // Warm emotional pad layer
        step.chord.forEach((freq, idx) => {
          if (!this.ctx || !this.musicGain) return;
          try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + idx * 0.12);
            gain.gain.setValueAtTime(0.001, t + idx * 0.12);
            gain.gain.linearRampToValueAtTime(0.08, t + idx * 0.12 + 1.2);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 4.4);
            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start(t + idx * 0.12);
            osc.stop(t + idx * 0.12 + 4.6);
          } catch {}
        });

        // Tender celesta / piano arpeggio
        step.arpeggio.forEach((freq, idx) => {
          if (!this.ctx || !this.musicGain) return;
          try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = t + 0.6 + idx * 0.7;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.001, start);
            gain.gain.linearRampToValueAtTime(0.09, start + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 1.8);
            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start(start);
            osc.stop(start + 2.0);
          } catch {}
        });

        return;
      }

      const notesMap: Record<MusicTheme, number[][]> = {
        title: [
          [220, 277.18, 329.63, 440],
          [174.61, 220, 261.63, 349.23],
          [196, 246.94, 293.66, 392],
          [220, 261.63, 329.63, 440],
        ],
        cottage: [
          [261.63, 329.63, 392, 523.25],
          [220, 261.63, 329.63, 440],
          [174.61, 220, 261.63, 349.23],
          [196, 246.94, 293.66, 392],
        ],
        forest: [
          [164.81, 196, 246.94, 329.63],
          [146.83, 174.61, 220, 293.66],
          [130.81, 164.81, 196, 261.63],
          [146.83, 196, 246.94, 293.66],
        ],
        crossroads: [
          [220, 261.63, 329.63, 440],
          [246.94, 293.66, 369.99, 493.88],
          [196, 246.94, 293.66, 392],
          [174.61, 220, 261.63, 349.23],
        ],
        road: [
          [196, 233.08, 293.66, 392],
          [174.61, 220, 261.63, 349.23],
          [146.83, 185.0, 220, 293.66],
          [164.81, 196, 246.94, 329.63],
        ],
        bottle: [
          [261.63, 392, 523.25, 659.25],
          [220, 329.63, 440, 587.33],
          [174.61, 261.63, 349.23, 523.25],
          [196, 293.66, 392, 587.33],
        ],
        abyss: [
          [138.59, 164.81, 207.65, 277.18],
          [146.83, 174.61, 220, 293.66],
          [130.81, 155.56, 196, 261.63],
          [123.47, 146.83, 185.0, 246.94],
        ],
        sea: [
          [174.61, 220, 261.63, 349.23],
          [196, 246.94, 293.66, 392],
          [220, 261.63, 329.63, 440],
          [164.81, 207.65, 246.94, 329.63],
        ],
        sunrise: [
          [261.63, 329.63, 392, 523.25],
          [293.66, 369.99, 440, 587.33],
          [329.63, 415.3, 493.88, 659.25],
          [392, 493.88, 587.33, 783.99],
        ],
        birthday: [
          [261.63, 329.63, 392, 523.25],
          [220, 277.18, 349.23, 440],
          [196, 246.94, 293.66, 392],
          [261.63, 329.63, 392, 523.25],
        ],
        credits: [
          [261.63, 329.63, 392, 523.25],
          [220, 261.63, 329.63, 440],
          [174.61, 220, 261.63, 349.23],
          [196, 246.94, 293.66, 392],
          [261.63, 329.63, 392, 587.33],
        ],
      };

      const chords = notesMap[theme] || notesMap.cottage;
      const chord = chords[Math.floor(Math.random() * chords.length)];

      chord.forEach((freq, idx) => {
        if (!this.ctx || !this.musicGain) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = theme === 'abyss' ? 'sawtooth' : theme === 'sunrise' ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, t + idx * 0.15);

          gain.gain.setValueAtTime(0.001, t + idx * 0.15);
          gain.gain.linearRampToValueAtTime(0.1, t + idx * 0.15 + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.15 + 4.2);

          osc.connect(gain);
          gain.connect(this.musicGain);

          osc.start(t + idx * 0.15);
          osc.stop(t + idx * 0.15 + 4.4);
        } catch {
          // Ignore individual oscillator errors
        }
      });
    } catch (e) {
      console.warn('Audio theme step error:', e);
    }
  }

  private createWarmNoiseBuffer(): AudioBuffer | null {
    try {
      if (!this.ctx) return null;
      if (this.cachedNoiseBuffer) return this.cachedNoiseBuffer;

      // 3-second seamless stereo warm acoustic noise buffer
      const bufferSize = this.ctx.sampleRate * 3;
      const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
      
      for (let channel = 0; channel < 2; channel++) {
        const output = buffer.getChannelData(channel);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Paul Kellet's refined pink filter algorithm with brownian lowpass roll-off
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          b6 = white * 0.115926;
          
          // Cross-fade window at edges to eliminate any seam click
          const fadeSamples = Math.floor(this.ctx.sampleRate * 0.05);
          let env = 1.0;
          if (i < fadeSamples) env = i / fadeSamples;
          else if (i > bufferSize - fadeSamples) env = (bufferSize - i) / fadeSamples;
          
          output[i] = pink * 0.11 * env;
        }
      }

      this.cachedNoiseBuffer = buffer;
      return buffer;
    } catch {
      return null;
    }
  }
}

export const audioSynth = new AudioSynthesizer();
