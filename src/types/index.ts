export type Language = 'en' | 'fr';
export type ViewMode = 'pc' | 'phone';
export type CozyModeIntensity = 'minimal' | 'balanced' | 'lush';

export interface SavedGamePreview {
  sceneId: string;
  location: SceneLocation;
  chapterTitle?: DialogueText;
  chapterSubtitle?: DialogueText;
  speaker?: CharacterId;
  speakerName?: DialogueText;
  collectedCount: number;
  timestamp?: number;
}

export type CharacterId =
  | 'narrator'
  | 'witch'
  | 'human_witch'
  | 'lezar'
  | 'clown'
  | 'orik'
  | 'artisan'
  | 'hypo'
  | 'everyone';

export type WitchExpression =
  | 'neutral'
  | 'gentle'
  | 'thoughtful'
  | 'burdened'
  | 'overwhelmed'
  | 'determined'
  | 'relieved'
  | 'peaceful'
  | 'surprised'
  | 'happy';

export type LezarExpression =
  | 'calm'
  | 'attentive'
  | 'purring'
  | 'sensing'
  | 'comforting'
  | 'proud';

export type ClownExpression =
  | 'abyss_horror'
  | 'abyss_theatrical'
  | 'abyss_mad'
  | 'abyss_soft'
  | 'abyss_surprised'
  | 'gentleman_theatrical'
  | 'gentleman_soft'
  | 'gentleman_surprised'
  | 'gentleman_normal'
  | 'theatrical'
  | 'smirk'
  | 'dramatic'
  | 'surprised'
  | 'soft'
  | 'absurd'
  | 'holding_cake'
  | 'waving'
  | 'relic_smile';

export type OrikExpression = 'shivering' | 'grateful' | 'peaceful' | 'happy';
export type ArtisanExpression = 'weary' | 'inspired' | 'warm' | 'celebrating';

export type CharacterExpression =
  | WitchExpression
  | LezarExpression
  | ClownExpression
  | OrikExpression
  | ArtisanExpression;

export type SceneLocation =
  | 'cottage_twilight'
  | 'whispering_forest'
  | 'crossroads_kiln'
  | 'windy_road'
  | 'bottle_path'
  | 'velvet_abyss'
  | 'sea_shore_dusk'
  | 'sea_shore_sunrise'
  | 'magic_mirror'
  | 'birthday_feast';

export type SoundEffectType =
  | 'click'
  | 'soft_bell'
  | 'purr'
  | 'lezar_meow'
  | 'wind_breeze'
  | 'ocean_waves'
  | 'rain_drizzle'
  | 'thunder'
  | 'magic_sparkle'
  | 'ember_glow'
  | 'footstep'
  | 'clown_jingle'
  | 'magic_surge'
  | 'sunrise_chime'
  | 'choice'
  | 'bottle_tink'
  | 'party_horn'
  | 'cheer'
  | 'starlight'
  | 'heartbeat'
  | 'page_turn'
  | 'book_close'
  | 'dramatic_impact'
  | 'crystal_resonate'
  | 'soft_rustle'
  | 'confetti_pop'
  | 'gift_unwrap'
  | 'glass_clink'
  | 'flame_ignite'
  | 'bird_chirp'
  | 'glass_shimmer'
  | 'mirror_transform'
  | 'celebration_chimes'
  | 'candle_flicker'
  | 'magic_whoosh'
  | 'door_creak'
  | 'abyss_whisper'
  | 'orik_chirp'
  | 'vivienne_laugh'
  | 'hypo_squeak'
  | 'wendy_giggle'
  | 'clown_musical'
  | 'marmot_squeak'
  | 'marmot_yawn'
  | 'rain_roof'
  | 'wind_whistle'
  | 'harp_arpeggio'
  | 'door_knock'
  | 'star_fall'
  | 'tree_rustle'
  | 'flower_bloom'
  | 'sun_sparkle'
  | 'memory_chime'
  | 'vivienne_cry';

export type MusicTheme =
  | 'title'
  | 'cottage'
  | 'forest'
  | 'crossroads'
  | 'road'
  | 'bottle'
  | 'abyss'
  | 'sea'
  | 'sunrise'
  | 'birthday'
  | 'credits';

export interface DialogueText {
  en: string;
  fr: string;
}

export interface ChoiceOption {
  id: string;
  text: DialogueText;
  nextSceneId: string;
  lightReward?: {
    id: string;
    name: DialogueText;
    description: DialogueText;
    color: string;
    icon: string;
  };
  narrativeFlag?: string;
}

export type WeatherType =
  | 'dust_motes'
  | 'rain_ripples'
  | 'sunlight_glints'
  | 'wind_leaves'
  | 'stardust_twilight'
  | 'clear';

export type CameraZoom =
  | 'normal'
  | 'default'
  | 'medium'
  | 'close'
  | 'close_up'
  | 'extreme_close'
  | 'cinematic'
  | 'wide';

export interface DialogueLine {
  id: string;
  speaker: CharacterId;
  speakerName?: DialogueText;
  text: DialogueText;
  expression?: CharacterExpression;
  secondaryCharacter?: {
    id: CharacterId;
    expression: CharacterExpression;
  };
  location?: SceneLocation;
  music?: MusicTheme;
  sfx?: SoundEffectType;
  shake?: 'dramatic' | 'gentle' | 'rumble';
  weather?: WeatherType;
  zoom?: CameraZoom;
  choices?: ChoiceOption[];
  nextSceneId?: string;
  chapterTitle?: DialogueText;
  chapterSubtitle?: DialogueText;
  isChapterStart?: boolean;
  bottleGlow?: boolean;
}

export interface LightItem {
  id: string;
  name: DialogueText;
  description: DialogueText;
  color: string;
  secondaryColor: string;
  icon: string;
  giver: DialogueText;
}

export interface GameState {
  currentSceneId: string;
  language: Language;
  history: string[];
  dialogueHistory: {
    speaker: string;
    text: string;
    id: string;
  }[];
  flags: Record<string, boolean | string>;
  collectedLights: LightItem[];
  volume: number;
  isMuted: boolean;
  autoPlaySpeed: number;
  isAutoPlay: boolean;
  textSpeed: number;
  hasCompletedGame: boolean;
}
