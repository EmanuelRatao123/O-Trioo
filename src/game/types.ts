export type CharacterId = 'rat' | 'duck' | 'eagle';

export type UniverseMode = 'animal' | 'human';

export type GameScreenState = 'loading' | 'title' | 'playing' | 'paused';

export type ActiveModal = 'none' | 'universe' | 'characters' | 'map' | 'inventory' | 'settings';

export type GraphicsPreset = 'low' | 'medium' | 'high' | 'ultra' | 'extreme' | 'custom';

export type SchedulePhaseId =
  | 'arrival'
  | 'morning_classes'
  | 'recess'
  | 'lunch'
  | 'afternoon_classes'
  | 'dismissal'
  | 'after_school';

export interface SchedulePhaseInfo {
  id: SchedulePhaseId;
  label: string;
  description: string;
  startHour: number;
  endHour: number;
  skyTint: string;
  bellChime: boolean;
}

export interface CharacterSpec {
  id: CharacterId;
  name: string;
  shortName: string;
  species: string;
  humanName: string;
  humanDesc: string;
  tagline: string;
  abilityName: string;
  abilityDesc: string;
  passiveDesc: string;
  accentHex: string;
  speed: number;
  sprintMultiplier: number;
  jumpForce: number;
  gravityScale: number;
  canClimb: boolean;
  canHideSmall: boolean;
  canGlide: boolean;
  abilityCooldown: number;
  height: number;
  radius: number;
}

export type AnimalSpecies =
  | 'dog'
  | 'cat'
  | 'rabbit'
  | 'fox'
  | 'wolf'
  | 'bear'
  | 'monkey'
  | 'capybara'
  | 'lion'
  | 'tiger'
  | 'owl'
  | 'parrot'
  | 'turtle'
  | 'horse'
  | 'pig'
  | 'cow';

export type PropKind =
  | 'soccer_ball'
  | 'basketball'
  | 'cafeteria_tray'
  | 'trash_can'
  | 'chair'
  | 'desk'
  | 'fire_extinguisher'
  | 'fire_alarm'
  | 'beaker'
  | 'computer'
  | 'book'
  | 'speaker'
  | 'plant_pot'
  | 'traffic_cone'
  | 'janitor_cart'
  | 'megaphone'
  | 'trophy'
  | 'bicycle'
  | 'locker'
  | 'water_fountain'
  | 'hose'
  | 'chalkboard'
  | 'radio'
  | 'master_key'
  | 'door'
  | 'secret_hatch';

export type ActionVerb =
  | 'throw'
  | 'push'
  | 'quack_blast'
  | 'sneak_climb'
  | 'sky_swoop'
  | 'trigger_alarm'
  | 'mix_chemicals'
  | 'score_goal'
  | 'hide_inside'
  | 'pull_chair'
  | 'ring_bell'
  | 'spill_tray'
  | 'blast_speaker'
  | 'open_passage'
  | 'taunt_npc'
  | 'distract_teacher'
  | 'rummage_locker'
  | 'swap_sign';

export type NpcRole =
  | 'student'
  | 'teacher'
  | 'principal'
  | 'cafeteria_cook'
  | 'janitor'
  | 'hall_monitor';

export type NpcPersonality =
  | 'nerd'
  | 'atleta'
  | 'bagunceiro'
  | 'rigido'
  | 'distraido'
  | 'brava'
  | 'simpatica'
  | 'desconfiado'
  | 'monitor'
  | 'artista'
  | 'musico'
  | 'fofoqueiro';

export type NpcEmotion = 'calmo' | 'curioso' | 'rindo' | 'assustado' | 'bravo' | 'atordoado';

export type ChainReactionOutcome =
  | 'corridor_crowd'
  | 'tag_chase'
  | 'food_fight'
  | 'false_alarm'
  | 'rooftop_escape'
  | 'pitch_invasion'
  | 'principal_commotion'
  | 'foam_eruption'
  | 'obstacle_frenzy'
  | 'cheering_circle';

export interface EmergentEventRecord {
  id: number;
  comboHash: string;
  title: string;
  description: string;
  chaosPoints: number;
  zoneName: string;
  timestamp: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  kind: PropKind;
  quantity: number;
  chaosBonus: number;
}

export interface GraphicsConfig {
  preset: GraphicsPreset;
  shadowResolution: 0 | 512 | 1024 | 2048;
  shadowDistance: number;
  textureQuality: 'low' | 'medium' | 'high';
  geometryQuality: 'low' | 'medium' | 'high';
  renderScale: number; // 0.5 .. 1.5
  antialias: boolean;
  ambientOcclusion: boolean;
  viewDistance: number; // 110 .. 280
  foliageDensity: number; // 0.35 .. 1.0
  npcSimDistance: number; // 24 .. 85
  particleDensity: number; // 0.35 .. 1.5
  postProcessing: boolean;
}

export interface GameSettings {
  soundEnabled: boolean;
  ambienceVolume: number;
  sfxVolume: number;
  cameraSensitivity: number;
  invertCameraY: boolean;
  timeScale: number;
  mobileControls: 'auto' | 'on' | 'off';
  joystickSize: number; // 0.8 .. 1.35
  hudScale: number; // 0.85 .. 1.2
  showPerformanceOverlay: boolean;
  graphics: GraphicsConfig;
}

export interface DeviceCapabilities {
  isMobile: boolean;
  isLowEndMobile: boolean;
  isSoftwareGl: boolean;
  maxTextureSize: number;
  supportsExtreme: boolean;
  recommendedPreset: GraphicsPreset;
  hardwareSummary: string;
}

export interface PerformanceMetrics {
  fps: number;
  frameTimeMs: number;
  renderWidth: number;
  renderHeight: number;
  activeNpcsAnimated: number;
  totalNpcs: number;
  drawCalls: number;
  preset: GraphicsPreset;
  warning: string | null;
}

export interface ZoneDef {
  id: string;
  name: string;
  category: 'academic' | 'sports' | 'common' | 'secret' | 'outdoor';
  xMin: number;
  xMax: number;
  zMin: number;
  zMax: number;
  yMin: number;
  yMax: number;
  teleportPos: [number, number, number];
  mapColor: string;
}

export interface BoxCollider {
  id: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  climbable?: boolean;
  isDoor?: boolean;
  open?: boolean;
  tag?: string;
}

export interface FloorSurface {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  y: number;
  rampAxis?: 'x' | 'z';
  yStart?: number;
  yEnd?: number;
}

export interface HudSnapshot {
  screen: GameScreenState;
  universe: UniverseMode;
  characterId: CharacterId;
  stamina: number;
  abilityCooldownRemaining: number;
  abilityCooldownMax: number;
  isHiding: boolean;
  isGliding: boolean;
  isClimbing: boolean;
  heldItemName: string | null;
  nearbyPrompt: string | null;
  schoolTimeMinutes: number;
  schoolTimeFormatted: string;
  schedulePhase: SchedulePhaseInfo;
  currentZoneName: string;
  chaosScore: number;
  comboMultiplier: number;
  uniqueCombosTriggered: number;
  totalPossibleCombos: number;
  discoveredSecrets: string[];
  recentEvents: EmergentEventRecord[];
  inventory: InventoryItem[];
  teacherAlertLevel: number;
  goalsScored: number;
  pranksPulled: number;
  npcsStartled: number;
  activeAnnouncement: string | null;
  playerPos: { x: number; y: number; z: number };
  perf: PerformanceMetrics;
}
